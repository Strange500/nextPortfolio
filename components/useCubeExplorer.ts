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
import {
  between,
  coast,
  fromEuler,
  fromVector,
  multiply,
  rotationVector,
  slerp,
  toEuler,
  trackball,
  type Quaternion
} from '@/lib/cube-orientation'

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
    orientation: null as Quaternion | null,
    velocity: [0, 0, 0],
    labelPositions: new Map<number, { x: number; y: number }>(),
    readingTime: 0,
    lastSwap: 0,
    next: 6,
    profile: '',
    assigned: [0, 1, 2, 3, 4, 5],
    seen: Array(6).fill(false),
    textured: false,
    manualPause: false,
    hover: null as number | null,
    labels: [] as number[],
    drag: null as null | {
      id: number
      x: number
      y: number
      point: number[]
      cx: number
      cy: number
      radius: number
      time: number
      face: number
      moved: boolean
      mobileTouch: boolean
      wasPaused: boolean
    }
  })
  const invalidate = () =>
    window.dispatchEvent(new Event('cube-explorer-change'))
  const patch = (value: Partial<UI>) => {
    state.current.ui = { ...state.current.ui, ...value }
    setUI(state.current.ui)
    invalidate()
  }
  const stopCoast = () => {
    state.current.velocity = [0, 0, 0]
  }
  const pause = () => {
    stopCoast()
    state.current.manualPause = !state.current.ui.pause
    patch({ pause: state.current.manualPause })
  }
  const hover = (face: number | null) => {
    state.current.hover = face
    invalidate()
  }
  const open = (name: string) => {
    stopCoast()
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
        .getElementById(
          innerWidth < 900 ? 'mobile-cube-catalog' : 'cube-explore-trigger'
        )
        ?.focus({ preventScroll: true })
    )
  }
  const catalog = () => {
    stopCoast()
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
    const mobileTouch = e.pointerType === 'touch' && innerWidth < 900
    if (!mobileTouch) e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect(),
      radius = Math.max(40, rect.width * 0.44),
      cx = rect.x + rect.width / 2,
      cy = rect.y + rect.height / 2
    stopCoast()
    state.current.drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      point: trackball(e.clientX, e.clientY, cx, cy, radius),
      cx,
      cy,
      radius,
      time: performance.now(),
      face,
      moved: false,
      mobileTouch,
      wasPaused: state.current.ui.pause
    }
    patch({ pause: true })
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const pointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = state.current.drag
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.x,
      dy = e.clientY - d.y
    // Vertical touch intent belongs to native page scrolling. The browser
    // cancels this pointer when pan-y starts; a horizontal gesture rotates.
    if (d.mobileTouch && !d.moved && Math.abs(dy) > Math.abs(dx)) return
    if (Math.hypot(dx, dy) > 6) d.moved = true
    if (d.moved) {
      const now = performance.now(),
        elapsed = Math.max(0.008, (now - d.time) / 1000)
      const point = trackball(e.clientX, e.clientY, d.cx, d.cy, d.radius)
      const delta = between(d.point, point)
      state.current.orientation = multiply(
        delta,
        state.current.orientation || fromEuler([0.32, 2.6, -0.08])
      )
      const speed = rotationVector(delta).map(v => v / elapsed),
        blend = 1 - Math.exp(-elapsed * 22)
      state.current.velocity = state.current.velocity.map(
        (v, i) => v + (speed[i] - v) * blend
      )
      const magnitude = Math.hypot(...state.current.velocity)
      if (magnitude > 7)
        state.current.velocity = state.current.velocity.map(
          v => (v * 7) / magnitude
        )
      d.point = point
      d.time = now
      stage.current?.setAttribute('data-dragging', 'true')
      invalidate()
    }
  }
  const pointerEnd = (e: PointerEvent<SVGSVGElement>, cancel = false) => {
    const d = state.current.drag
    if (!d || d.id !== e.pointerId) return
    if (
      cancel ||
      !d.moved ||
      performance.now() - d.time > 100 ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      stopCoast()
    state.current.drag = null
    if (cancel && d.mobileTouch && !d.moved) patch({ pause: d.wasPaused })
    stage.current?.setAttribute('data-dragging', 'false')
    hover(null)
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId)
    if (!cancel && !d.moved) open(state.current.ui.names[d.face])
  }
  const keyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (!interactive()) return
    const directions: Record<string, number[]> = {
      ArrowLeft: [0, 0.22, 0],
      ArrowRight: [0, -0.22, 0],
      ArrowUp: [-0.2, 0, 0],
      ArrowDown: [0.2, 0, 0]
    }
    if (directions[e.key]) {
      e.preventDefault()
      e.stopPropagation()
      stopCoast()
      state.current.orientation = multiply(
        fromVector(directions[e.key]),
        state.current.orientation || fromEuler([0.32, 2.6, -0.08])
      )
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
    if (!s.orientation)
      s.orientation = fromEuler(from === 0 ? a : [0.32, 2.6, -0.08])
    if (reduced || !stable || from !== 0 || s.ui.selected || s.ui.catalog)
      stopCoast()
    if (stable && from === 0 && !s.drag && Math.hypot(...s.velocity) > 0.015) {
      const next = coast(s.orientation, s.velocity, dt)
      s.orientation = next.rotation
      s.velocity = next.velocity
    } else if (Math.hypot(...s.velocity) <= 0.015) stopCoast()
    stage.current?.setAttribute(
      'data-orientation',
      s.orientation.map(v => v.toFixed(7)).join(',')
    )
    stage.current?.setAttribute(
      'data-angular-speed',
      String(Math.hypot(...s.velocity))
    )
    if (stable && !reduced && !s.ui.pause && s.hover === null && !s.drag) {
      const offset = s.offsets[from]
      if (from === 0) {
        s.introTime += dt
        s.orientation = multiply(
          fromVector([
            Math.cos(s.introTime * 0.31) * 0.65 * 0.31 * dt,
            0.42 * dt,
            Math.cos(s.introTime * 0.23) * 0.28 * 0.23 * dt
          ]),
          s.orientation
        )
      } else {
        s.readingTime += dt
        offset[0] += Math.cos(s.readingTime * 0.2) * 0.1 * 0.2 * dt
        offset[1] += 0.14 * dt
        offset[2] += Math.cos(s.readingTime * 0.17) * 0.05 * 0.17 * dt
      }
    }
    const start =
      from === 0
        ? s.orientation
        : fromEuler(a.map((n, i) => n + s.offsets[from][i]))
    const end =
      to === 0
        ? s.orientation
        : fromEuler(b.map((n, i) => n + s.offsets[to][i]))
    return toEuler(slerp(start, end, progress))
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
      s.profile = target
      // Hover/drag/card pauses belong to their chapter; only the explicit
      // Pause control survives navigation.
      const hitLayer =
        root.current?.querySelector<SVGSVGElement>('.cube-hit-layer')
      const pointerId = s.drag?.id
      s.drag = null
      if (pointerId !== undefined && hitLayer?.hasPointerCapture(pointerId))
        hitLayer.releasePointerCapture(pointerId)
      s.hover = null
      stopCoast()
      stage.current?.setAttribute('data-dragging', 'false')
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
        pause: s.manualPause,
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
    logicalSize: number,
    dt: number
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
        s.labelPositions.delete(face)
        continue
      }
      const points = faces[face].points,
        cx = points.reduce((sum, p) => sum + p[0], 0) / 4,
        ccy = points.reduce((sum, p) => sum + p[1], 0) / 4,
        anchorX = x - size / 2 + (cx / logicalSize) * size,
        anchorY = cy - size / 2 + (ccy / logicalSize) * size
      // Each label travels with its face, upright and outside the projected
      // silhouette. The nearest edge keeps leaders short and unambiguous.
      const projected = faces
        .flatMap(f => (f.visible ? f.points : []))
        .map(p => [
          x - size / 2 + (p[0] / logicalSize) * size,
          cy - size / 2 + (p[1] / logicalSize) * size
        ])
      const right = x > vw / 2,
        height = mobile ? 30 : 64
      const edge = right
        ? Math.max(...projected.map(p => p[0]))
        : Math.min(...projected.map(p => p[0]))
      const width = mobile
        ? 210
        : Math.max(128, Math.min(176, right ? vw - edge - 42 : edge - 42))
      const faceOffset = Math.max(12, Math.min(36, 22 + (anchorX - x) * 0.12))
      const desiredX = mobile
        ? landscape
          ? 20
          : Math.max(
              16,
              Math.min(
                vw - width - 16,
                (vw - width) / 2 + (anchorX - vw / 2) * 0.35
              )
            )
        : Math.max(
            20,
            Math.min(
              vw - width - 20,
              right ? edge + faceOffset : edge - width - faceOffset
            )
          )
      let desiredY = mobile
        ? landscape
          ? vh - 122 + Math.max(-10, Math.min(10, (anchorY - cy) * 0.2))
          : Math.max(164, Math.min(184, 174 + (anchorY - cy) * 0.2))
        : Math.max(80, Math.min(vh - 164, anchorY - height / 2))
      // Split colliding callouts around their own face centres, consistently by
      // depth-independent face index so labels cannot exchange slots mid-turn.
      if (!mobile && s.labels.length === 2) {
        const other = s.labels.find(f => f !== face)!,
          otherY =
            cy -
            size / 2 +
            (faces[other].points.reduce((sum, p) => sum + p[1], 0) /
              4 /
              logicalSize) *
              size
        if (Math.abs(anchorY - otherY) < height + 14) {
          const upper = anchorY === otherY ? face < other : anchorY < otherY
          desiredY = Math.max(
            80,
            Math.min(
              vh - 164,
              (anchorY + otherY) / 2 -
                height / 2 +
                ((upper ? -1 : 1) * (height + 14)) / 2
            )
          )
        }
      }
      const previous = s.labelPositions.get(face),
        follow = 1 - Math.exp(-12 * dt)
      const position = previous
        ? {
            x: previous.x + (desiredX - previous.x) * follow,
            y: previous.y + (desiredY - previous.y) * follow
          }
        : { x: desiredX, y: desiredY }
      s.labelPositions.set(face, position)
      const { x: left, y: top } = position
      el.style.transform = `translate3d(${left}px,${top}px,0)`
      el.style.width = `${width}px`
      el.style.opacity = String(smooth((-depths[face] - 0.12) / 0.25))
      line.setAttribute('x1', String(anchorX))
      line.setAttribute('y1', String(anchorY))
      line.setAttribute(
        'x2',
        String(mobile ? left + width / 2 : right ? left : left + width)
      )
      line.setAttribute(
        'y2',
        String(
          mobile ? top : Math.max(top + 8, Math.min(top + height - 8, anchorY))
        )
      )
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
