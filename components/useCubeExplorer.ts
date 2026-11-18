'use client'
import {
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent,
  type RefObject
} from 'react'
import type { Cube } from 'ascii-cube'
import { faceTechnology, type CubeTechnology } from '@/lib/cube-technologies'
import { contextTechnologies } from '@/data/cube-context'

const smooth = (p: number) => {
  const t = Math.max(0, Math.min(1, p))
  return t * t * (3 - 2 * t)
}
type UI = {
  context: string
  names: string[]
  pause: boolean
  selected: { name: string; context: string } | null
  catalog: boolean
}
type Face = { visible: boolean; points: number[][] }
export function useCubeExplorer(
  root: RefObject<HTMLDivElement | null>,
  stage: RefObject<HTMLDivElement | null>
) {
  const [ui, setUI] = useState<UI>({
    context: 'intro',
    names: [],
    pause: false,
    selected: null,
    catalog: false
  })
  const state = useRef({
    ui,
    offsets: Array.from({ length: 6 }, () => [0, 0, 0]),
    introTime: 0,
    readingTime: 0,
    lastSwap: 0,
    next: 6,
    profile: '',
    assigned: [0, 1, 2, 3, 4, 5],
    seen: Array(6).fill(false),
    textured: false,
    interactionHold: false,
    hover: null as number | null,
    labels: [] as number[],
    drag: null as null | {
      id: number
      x: number
      y: number
      rotation: number[]
      face: number
      moved: boolean
    }
  })
  const invalidate = () =>
    window.dispatchEvent(new Event('cube-explorer-change'))
  const patch = (value: Partial<UI>) => {
    state.current.ui = { ...state.current.ui, ...value }
    setUI(state.current.ui)
    invalidate()
  }
  const pause = () => {
    state.current.interactionHold = false
    patch({ pause: !state.current.ui.pause })
  }
  const hover = (face: number | null) => {
    state.current.hover = face
    invalidate()
  }
  const open = (name: string) => {
    state.current.interactionHold = true
    if (name)
      patch({
        selected: { name, context: state.current.profile || 'intro' },
        catalog: false,
        pause: true
      })
  }
  const close = () => {
    patch({ selected: null, catalog: false })
    requestAnimationFrame(() =>
      document
        .getElementById('cube-explore-trigger')
        ?.focus({ preventScroll: true })
    )
  }
  const catalog = () => {
    state.current.interactionHold = true
    return patch({
      catalog: !state.current.ui.catalog,
      selected: null,
      pause: true
    })
  }
  const interactive = () =>
    state.current.profile === 'intro' &&
    document.querySelector<HTMLElement>('.narrative')?.dataset.transitioning !==
      'true'
  const pointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (!interactive() || e.button !== 0 || !e.isPrimary) return
    const face = Number(
      (e.target as Element)
        .closest('[data-cube-face]')
        ?.getAttribute('data-cube-face')
    )
    if (
      !Number.isInteger(face) ||
      !(e.target as Element).closest('[data-cube-face]')
    )
      return
    e.preventDefault()
    state.current.drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      rotation: [...state.current.offsets[0]],
      face,
      moved: false
    }
    state.current.interactionHold = true
    patch({ pause: true })
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const pointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = state.current.drag
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.x,
      dy = e.clientY - d.y
    if (Math.hypot(dx, dy) > 6) d.moved = true
    if (d.moved) {
      state.current.offsets[0] = [
        Math.max(-1.6, Math.min(1.6, d.rotation[0] + dy * 0.008)),
        d.rotation[1] + dx * 0.009,
        d.rotation[2]
      ]
      stage.current?.setAttribute('data-dragging', 'true')
      invalidate()
    }
  }
  const pointerEnd = (e: PointerEvent<SVGSVGElement>, cancel = false) => {
    const d = state.current.drag
    if (!d || d.id !== e.pointerId) return
    state.current.drag = null
    stage.current?.setAttribute('data-dragging', 'false')
    hover(null)
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId)
    if (!cancel && !d.moved) open(state.current.ui.names[d.face])
  }
  const keyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (!interactive()) return
    const directions: Record<string, number[]> = {
      ArrowLeft: [0, -0.22, 0],
      ArrowRight: [0, 0.22, 0],
      ArrowUp: [-0.2, 0, 0],
      ArrowDown: [0.2, 0, 0]
    }
    if (directions[e.key]) {
      e.preventDefault()
      e.stopPropagation()
      state.current.offsets[0] = state.current.offsets[0].map(
        (v, i) => v + directions[e.key][i]
      )
      state.current.interactionHold = true
      patch({ pause: true })
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      open(
        state.current.ui.names[Number(stage.current?.dataset.frontFace || 0)]
      )
    }
  }
  const motion = (
    from: number,
    to: number,
    progress: number,
    a: number[],
    b: number[],
    dt: number,
    reduced: boolean,
    stable: boolean
  ) => {
    const s = state.current
    if (stable && !reduced && !s.ui.pause && s.hover === null && !s.drag) {
      const offset = s.offsets[from]
      if (from === 0) {
        s.introTime += dt
        offset[0] += Math.cos(s.introTime * 0.31) * 0.65 * 0.31 * dt
        offset[1] += 0.42 * dt
        offset[2] += Math.cos(s.introTime * 0.23) * 0.28 * 0.23 * dt
      } else {
        s.readingTime += dt
        offset[0] += Math.cos(s.readingTime * 0.2) * 0.1 * 0.2 * dt
        offset[1] += 0.14 * dt
        offset[2] += Math.cos(s.readingTime * 0.17) * 0.05 * 0.17 * dt
      }
    }
    return a.map((n, i) => {
      const end = b[i] + s.offsets[to][i],
        delta = n + s.offsets[from][i] - end
      return end + Math.atan2(Math.sin(delta), Math.cos(delta)) * (1 - progress)
    })
  }
  const textures = (
    cube: Cube,
    logos: CubeTechnology[],
    context: string,
    transitioning: boolean,
    progress: number,
    depths: number[],
    idle: boolean
  ) => {
    const s = state.current
    const target =
      !transitioning || progress >= 0.5 ? context : s.profile || context
    const weight = transitioning
      ? progress < 0.5
        ? 1 - smooth(progress / 0.2)
        : smooth((progress - 0.75) / 0.25)
      : 1
    const upload = (face: number) => {
      const logo = logos[s.assigned[face]],
        t = faceTechnology(logo, face)
      cube.update_face_fast(face, t.characters, t.colors)
      const g = root.current?.querySelector<SVGGElement>(
        `[data-cube-face="${face}"]`
      )
      if (g) g.dataset.technology = logo.name
    }
    if (s.profile !== target || !s.profile) {
      const pool = (contextTechnologies[target] || [])
        .map(name => logos.findIndex(l => l.name === name))
        .filter(i => i >= 0)
      const releaseInteraction = !!s.profile && s.interactionHold
      s.profile = target
      s.interactionHold = false
      s.labels = []
      s.seen.fill(false)
      if (pool.length) {
        const preferred =
          target === 'intro'
            ? ['Rust', 'Git', 'NixOS', 'Spring Boot', 'React', 'TypeScript']
            : []
        s.assigned = s.assigned.map((_, face) => {
          const preferredIndex = logos.findIndex(
            l => l.name === preferred[face]
          )
          return preferredIndex >= 0 ? preferredIndex : pool[face % pool.length]
        })
        s.assigned.forEach((_, face) => upload(face))
        s.textured = true
      } else {
        for (let face = 0; face < 6; face++)
          cube.set_face_color(face, `#${(0x100001 + face).toString(16)}`)
        s.textured = false
      }
      patch({
        context: target,
        pause: releaseInteraction ? false : s.ui.pause,
        names: pool.length ? s.assigned.map(i => logos[i].name) : [],
        selected: null,
        catalog: false
      })
    }
    if (
      target === 'intro' &&
      idle &&
      s.textured &&
      !s.ui.pause &&
      s.hover === null
    ) {
      for (let face = 0; face < 6; face++) {
        if (depths[face] < -0.1) s.seen[face] = true
        if (
          depths[face] > 0.18 &&
          s.seen[face] &&
          s.introTime - s.lastSwap > 0.8 &&
          logos.length > 6
        ) {
          while (s.assigned.includes(s.next % logos.length)) s.next++
          s.assigned[face] = s.next++ % logos.length
          upload(face)
          patch({ names: s.assigned.map(i => logos[i].name) })
          s.seen[face] = false
          s.lastSwap = s.introTime
        }
      }
    }
    return {
      weight: s.textured ? weight : 0,
      textured: s.textured,
      context: target,
      hover: s.hover
    }
  }
  const layout = (
    faces: Face[],
    depths: number[],
    vw: number,
    vh: number,
    size: number,
    x: number,
    cy: number,
    mobile: boolean,
    landscape: boolean,
    transitioning: boolean,
    logicalSize: number
  ) => {
    const s = state.current,
      names = s.ui.names,
      max = mobile ? 1 : 2
    const eligible = (face: number) =>
      faces[face].visible && depths[face] < -0.12 && !!names[face]
    if (s.profile === 'intro')
      s.labels =
        s.hover !== null && eligible(s.hover) && !mobile ? [s.hover] : []
    else {
      s.labels = s.labels.filter(eligible)
      const unique = new Set<string>()
      s.labels = s.labels.filter(face => {
        if (unique.has(names[face])) return false
        unique.add(names[face])
        return true
      })
      const candidates = depths
        .map((depth, face) => ({ face, depth }))
        .filter(e => e.depth < -0.3 && eligible(e.face))
        .sort((a, b) => a.depth - b.depth)
      for (const { face } of candidates)
        if (s.labels.length < max && !unique.has(names[face])) {
          s.labels.push(face)
          unique.add(names[face])
        }
      s.labels = s.labels.slice(0, max)
    }
    stage.current?.setAttribute(
      'data-front-face',
      String(depths.indexOf(Math.min(...depths)))
    )
    for (let face = 0; face < 6; face++) {
      const el = root.current?.querySelector<HTMLElement>(
          `[data-face-callout="${face}"]`
        ),
        line = root.current?.querySelector<SVGLineElement>(
          `[data-face-wire="${face}"]`
        )
      if (!el || !line) continue
      const slot = s.labels.indexOf(face),
        visible =
          slot >= 0 &&
          !transitioning &&
          !s.ui.selected &&
          !s.ui.catalog &&
          s.textured
      el.dataset.visible = String(visible)
      el.setAttribute('aria-hidden', String(!visible))
      el.querySelector('button')!.tabIndex = visible ? 0 : -1
      line.style.opacity = visible
        ? String(smooth((-depths[face] - 0.12) / 0.25) * 0.45)
        : '0'
      if (!visible) {
        el.style.opacity = '0'
        continue
      }
      const width = mobile ? 210 : 190
      const left = mobile
        ? landscape
          ? 20
          : (vw - width) / 2
        : x > vw / 2
          ? Math.min(vw - width - 24, x + size / 2 - 64)
          : Math.max(24, x - size / 2 - 126)
      const top = mobile
        ? landscape
          ? vh - 122
          : 184
        : slot === 0
          ? Math.max(80, cy - size / 2 - 76)
          : Math.min(vh - 164, cy + size / 2 + 10)
      el.style.transform = `translate3d(${left}px,${top}px,0)`
      el.style.width = `${width}px`
      el.style.opacity = String(smooth((-depths[face] - 0.12) / 0.25))
      const points = faces[face].points,
        cx = points.reduce((sum, p) => sum + p[0], 0) / 4,
        ccy = points.reduce((sum, p) => sum + p[1], 0) / 4
      line.setAttribute('x1', String(x - size / 2 + (cx / logicalSize) * size))
      line.setAttribute(
        'y1',
        String(cy - size / 2 + (ccy / logicalSize) * size)
      )
      line.setAttribute(
        'x2',
        String(mobile ? left + width / 2 : x > vw / 2 ? left : left + width)
      )
      line.setAttribute('y2', String(mobile ? top : top + 30))
    }
  }
  return {
    ui,
    pause,
    hover,
    open,
    close,
    catalog,
    pointerDown,
    pointerMove,
    pointerEnd,
    keyDown,
    motion,
    textures,
    layout
  }
}
export type CubeExplorer = ReturnType<typeof useCubeExplorer>
