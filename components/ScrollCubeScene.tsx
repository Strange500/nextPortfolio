'use client'

import { useEffect, useRef, useState } from 'react'
import type { Cube } from 'ascii-cube'

const sections = ['intro', 'rust', 'nix', 'testing', 'bitcoin', 'contact']
// Face indices and projection match ascii-cube-rs at the flake.lock revision:
// +Y, -Y, -X, +X, +Z, -Z; camera at Z=-100, Euler XYZ (Rx * Ry * Rz).
const faceSections = ['rust', 'contact', 'nix', 'testing', 'intro', 'bitcoin']
const normals = [
  [0, 1, 0],
  [0, -1, 0],
  [-1, 0, 0],
  [1, 0, 0],
  [0, 0, 1],
  [0, 0, -1]
]
// A stable material grid avoids density popping during scroll. The pinned Rust
// sampler adapts to this resolution (see raster and texture regression).
const columns = 200,
  rows = 100,
  zoom = 3300
const logicalSize = 1600
const poses = [
  { x: 0.74, size: 0.44, rotation: [0.32, 2.6, -0.08] },
  { x: 0.25, size: 0.46, rotation: [-1.08, 0.38, -0.12] },
  { x: 0.75, size: 0.4, rotation: [0.32, -1.08, 0.12] },
  { x: 0.73, size: 0.47, rotation: [0.38, 1.12, -0.12] },
  { x: 0.25, size: 0.39, rotation: [0.3, 0.4, 0.12] },
  { x: 0.25, size: 0.37, rotation: [1.25, 0.22, -0.06] }
]
const smooth = (p: number) => {
  const t = clamp(p)
  return t * t * (3 - 2 * t)
}
const clamp = (n: number) => Math.max(0, Math.min(1, n))
const mix = (a: number, b: number, p: number) => a + (b - a) * p
function rotate(v: number[], angles: number[]) {
  const [a, b, c] = angles
  const [x, y, z] = v
  const rx = x * Math.cos(c) - y * Math.sin(c)
  const ry = x * Math.sin(c) + y * Math.cos(c)
  const sx = rx * Math.cos(b) + z * Math.sin(b)
  const sz = -rx * Math.sin(b) + z * Math.cos(b)
  return [
    sx,
    ry * Math.cos(a) - sz * Math.sin(a),
    ry * Math.sin(a) + sz * Math.cos(a)
  ]
}
function corners(face: number) {
  return [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1]
  ].map(([u, v]) =>
    face < 2
      ? [u, face === 0 ? 1 : -1, v]
      : face < 4
        ? [face === 2 ? -1 : 1, u, v]
        : [u, v, face === 4 ? 1 : -1]
  )
}

export default function ScrollCubeScene({ lang }: { lang: 'en' | 'fr' }) {
  const fr = lang === 'fr'
  const labels = [
    fr ? 'Accueil' : 'Intro',
    'Rust / WASM',
    'NixOS',
    fr ? 'Tests' : 'Testing',
    'Bitcoin',
    'Contact'
  ]
  const root = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const paused = useRef(false)
  const hovered = useRef('')
  const navigating = useRef(false)
  const [pause, setPause] = useState(false)
  const [status, setStatus] = useState('loading')
  const [current, setCurrent] = useState('intro')
  const [hover, setHover] = useState('')

  useEffect(() => {
    let disposed = false,
      frame = 0
    let cube: Cube | undefined
    let memory: WebAssembly.Memory
    let previous = '',
      lastTime = 0,
      phase = 0
    let lastRaster = 0
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const nodes = sections.map(id => document.getElementById(id)!)
    const surface = document.querySelector<HTMLElement>('.narrative')!
    let dirty = true
    const invalidate = () => {
      dirty = true
    }
    const themeObserver = new MutationObserver(invalidate)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    const stopNavigation = () => {
      if (!navigating.current) return
      navigating.current = false
      window.scrollTo({ top: scrollY, behavior: 'instant' })
    }
    const endNavigation = () => {
      navigating.current = false
    }
    const scrollKey = (event: KeyboardEvent) => {
      if (
        [
          'ArrowUp',
          'ArrowDown',
          'PageUp',
          'PageDown',
          'Home',
          'End',
          ' '
        ].includes(event.key)
      )
        stopNavigation()
    }
    window.addEventListener('wheel', stopNavigation, { passive: true })
    window.addEventListener('touchstart', stopNavigation, { passive: true })
    window.addEventListener('pointerdown', stopNavigation, { passive: true })
    window.addEventListener('keydown', scrollKey)
    window.addEventListener('scrollend', endNavigation)
    window.addEventListener('scroll', invalidate, { passive: true })
    window.addEventListener('resize', invalidate)
    media.addEventListener('change', invalidate)
    surface.dataset.scene = 'ready'

    const update = (time: number) => {
      if (disposed) return
      frame = requestAnimationFrame(update)
      if (document.hidden) return
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60
      lastTime = time
      const reduced = media.matches
      if (reduced && !dirty) return
      const mobile = innerWidth < 900
      const y = scrollY,
        vh = innerHeight,
        vw = innerWidth
      const anchors = nodes.map((node, i) =>
        i === 0 ? 0 : node.getBoundingClientRect().top + y
      )
      let index = 0
      for (let i = 1; i < anchors.length; i++)
        if (y >= anchors[i] - vh * 0.15) index = i
      const id = sections[index]
      if (previous !== id) {
        previous = id
        setCurrent(id)
      }
      let from = 0,
        to = 0,
        p = 0
      for (let i = 1; i < anchors.length; i++) {
        if (y >= anchors[i]) {
          from = i
          to = i
          continue
        }
        from = i - 1
        to = i
        const start =
          i === 1
            ? 0
            : Math.min(
                anchors[i] - 1,
                Math.max(anchors[i - 1] + vh * 0.45, anchors[i] - vh * 0.75)
              )
        p = clamp((y - start) / (anchors[i] - start))
        break
      }
      if (reduced) {
        from = index
        to = index
        p = 0
      }
      let a = poses[from],
        b = poses[to],
        progress = smooth(p)
      if (from === 0 && to === 1 && !reduced) {
        // Approach, a brief close-up, then retreat to the reading composition.
        const close = { x: 0.5, size: 0.78, rotation: [-0.42, 2.16, 0.14] }
        if (p < 0.34) {
          b = close
          progress = smooth(p / 0.34)
        } else if (p < 0.48) {
          a = close
          b = close
          progress = 0
        } else {
          a = close
          progress = smooth((p - 0.48) / 0.42)
        }
      }
      const displayed = {
        x: mix(a.x, b.x, progress),
        size: mix(a.size, b.size, progress),
        rotation: a.rotation.map((n, i) => mix(n, b.rotation[i], progress))
      }
      // Scroll is the pose clock: no delayed interpolation after it stops.
      const firstProgress = clamp(y / anchors[1])
      surface.style.setProperty(
        '--intro-opacity',
        String(reduced ? 1 : 1 - smooth(firstProgress / 0.3))
      )
      nodes[1].style.opacity = String(
        reduced ? 1 : smooth((firstProgress - 0.67) / 0.17)
      )
      const size = mobile
        ? Math.min(260, vw * 0.64) *
          (reduced ? 1 : 1 + Math.sin(p * Math.PI) * 0.08)
        : Math.min(vh * 1.12, vw * displayed.size)
      const landscape = mobile && vh < 550 && vw >= 650
      const x = landscape
        ? vw * 0.2
        : mobile
          ? vw * 0.5 + Math.sin(p * Math.PI) * 12
          : vw * displayed.x
      const cy = landscape
        ? vh * 0.44
        : mobile
          ? 132
          : vh * (from === 0 && to === 1 ? mix(0.47, 0.49, p) : 0.49)
      stage.current!.style.width = `${size}px`
      stage.current!.style.height = `${size}px`
      stage.current!.style.transform = `translate3d(${x - size / 2}px, ${cy - size / 2}px, 0)`
      if (!reduced && !paused.current && !hovered.current) phase += dt * 0.55
      const drift = reduced ? 0 : Math.sin(phase) * 0.035
      const angles = displayed.rotation.map((n, i) => n + (i < 2 ? drift : 0))
      stage.current!.dataset.active = id
      root.current!.dataset.motion = reduced ? 'reduced' : 'full'
      if (!cube || !memory || !canvas.current) return
      // Transform follows every display frame. Raster and hit geometry stay
      // together; idle drift is capped at 30fps, scroll invalidations draw promptly.
      if (time - lastRaster < 33 && !dirty) return
      lastRaster = time
      dirty = false
      stage.current!.dataset.rotation = angles.map(n => n.toFixed(4)).join(',')
      cube.set_rotation(...(angles as [number, number, number]))
      cube.set_rotation_speed(0, 0, 0)
      cube.next_frame()
      const chars = new Uint8Array(
        memory.buffer,
        cube.chars_ptr(),
        columns * rows
      )
      const colors = new Uint32Array(
        memory.buffer,
        cube.colors_ptr(),
        columns * rows
      )
      const ctx = canvas.current.getContext('2d')!
      // Backing pixels follow the actual CSS size and DPR, independent of the
      // stable ASCII grid. Glyph advances fit their cells without horizontal bleed.
      const backing = Math.ceil(size * Math.min(devicePixelRatio || 1, 2))
      if (canvas.current.width !== backing) {
        canvas.current.width = backing
        canvas.current.height = backing
      }
      ctx.setTransform(backing / logicalSize, 0, 0, backing / logicalSize, 0, 0)
      ctx.clearRect(0, 0, logicalSize, logicalSize)
      // Fit the native monospace advance to the projected 8px cell exactly.
      // Plain monospace avoids programming ligatures joining ASCII materials.
      ctx.font = '13px monospace'
      ctx.font = `${(13 * 8) / ctx.measureText('M').width}px monospace`
      ctx.fontKerning = 'none'
      ctx.textBaseline = 'top'
      const palette = getComputedStyle(surface)
      const ink = palette.getPropertyValue('--cube-ink').trim()
      ctx.fillStyle = ink
      const faceLight = normals.map(normal => {
        const n = rotate(normal, angles)
        return 0.53 + Math.max(0, -n[0] * 0.32 - n[1] * 0.5 - n[2] * 0.8) * 0.47
      })
      // Batch contiguous material runs rather than shaping thousands of glyphs
      // individually. The Rust buffers remain the complete source of each row.
      for (let row = 0; row < rows; row++) {
        let col = 0
        while (col < columns) {
          const index = row * columns + col
          if (chars[index] === 32) {
            col++
            continue
          }
          const color = colors[index],
            start = col
          let run = ''
          while (
            col < columns &&
            chars[row * columns + col] !== 32 &&
            colors[row * columns + col] === color
          ) {
            const ch = chars[row * columns + col++]
            run += ch === 255 ? '█' : ch === 254 ? '▒' : String.fromCharCode(ch)
          }
          ctx.globalAlpha = faceLight[color - 0x100001] ?? 1
          ctx.fillText(run, start * 8, row * 16)
        }
      }
      ctx.globalAlpha = 1
      // Same XYZ matrix, camera distance, zoom and 8×16 character cells
      // as Rust. No rectangular proxy hitboxes and no independent CSS rotation.
      faceSections.forEach((section, face) => {
        const group = root.current!.querySelector<SVGGElement>(
          `[data-cube-face="${face}"]`
        )!
        const visible = rotate(normals[face], angles)[2] < -0.015
        group.toggleAttribute('hidden', !visible)
        group.style.display = visible ? '' : 'none'
        if (!visible) return
        const points = corners(face).map(v => {
          const [x, y, z] = rotate(v, angles)
          return [
            (columns / 2 + (zoom / (z + 100)) * x * 2) * 8,
            (rows / 2 + (zoom / (z + 100)) * y) * 16
          ]
        })
        group
          .querySelector('polygon')!
          .setAttribute('points', points.map(p => p.join(',')).join(' '))
        const text = group.querySelector('text')!
        const cx = points.reduce((n, p) => n + p[0], 0) / 4
        const cy = points.reduce((n, p) => n + p[1], 0) / 4
        text.setAttribute('x', String(cx))
        text.setAttribute('y', String(cy))
        const plate = group.querySelector('rect')!
        const labelWidth = mobile ? 420 : 230
        const labelHeight = mobile ? 96 : 60
        plate.setAttribute('width', String(labelWidth))
        plate.setAttribute('height', String(labelHeight))
        plate.setAttribute('x', String(cx - labelWidth / 2))
        plate.setAttribute('y', String(cy - labelHeight / 2))
        group.dataset.current = String(section === id)
      })
    }
    frame = requestAnimationFrame(update)
    async function load() {
      try {
        const wasm = await import('ascii-cube')
        const instance = await wasm.default()
        if (disposed) return
        await document.fonts.ready
        if (disposed) return
        memory = instance.memory
        cube = new wasm.Cube(columns, rows)
        cube.set_zoom(zoom)
        for (let face = 0; face < 6; face++)
          cube.set_face_color(face, `#${(0x100001 + face).toString(16)}`)
        cube.set_rotation_speed(0, 0, 0)
        // Rust still supplies every material glyph and depth sample.
        dirty = true
        setStatus('ready')
      } catch {
        if (!disposed) setStatus('failed')
      }
    }
    load()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      cube?.free()
      themeObserver.disconnect()
      window.removeEventListener('wheel', stopNavigation)
      window.removeEventListener('touchstart', stopNavigation)
      window.removeEventListener('pointerdown', stopNavigation)
      window.removeEventListener('keydown', scrollKey)
      window.removeEventListener('scrollend', endNavigation)
      navigating.current = false
      window.removeEventListener('scroll', invalidate)
      window.removeEventListener('resize', invalidate)
      media.removeEventListener('change', invalidate)
      surface.style.removeProperty('--intro-opacity')
      nodes[1].style.removeProperty('opacity')
      delete surface.dataset.scene
    }
  }, [])

  function enter(section: string) {
    hovered.current = section
    setHover(section)
  }
  function navigate(id: string) {
    const node = document.getElementById(id)
    if (!node) return
    const top = id === 'intro' ? 0 : node.getBoundingClientRect().top + scrollY
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    navigating.current = !reduced
    window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' })
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <div className='scroll-scene' ref={root}>
      <div className='scene-mobile-mask' aria-hidden='true' />
      <div
        ref={stage}
        className='scene-cube'
        data-persistent-cube
        data-wasm={status}
        data-hover={hover}
      >
        <canvas
          ref={canvas}
          width={960}
          height={960}
          aria-label={
            fr
              ? 'Cube ASCII calculé en Rust / WASM'
              : 'ASCII cube computed in Rust / WASM'
          }
          role='img'
        />
        <svg
          viewBox='0 0 1600 1600'
          className='cube-hit-layer'
          aria-hidden='true'
          onPointerLeave={() => enter('')}
        >
          {faceSections.map((id, face) => (
            <g
              key={id}
              style={{ display: 'none' }}
              data-cube-face={face}
              data-section={id}
              onPointerEnter={() => enter(id)}
              onClick={() => navigate(id)}
            >
              <polygon />
              <rect width='230' height='52' rx='4' />
              <text textAnchor='middle' dominantBaseline='middle'>
                {labels[sections.indexOf(id)]}
              </text>
            </g>
          ))}
        </svg>
        <p className='cube-caption mono' aria-live='polite'>
          {status === 'failed' ? (
            fr ? (
              'WASM indisponible · navigation ci-dessous'
            ) : (
              'WASM unavailable · use navigation below'
            )
          ) : hover ? (
            `↗ ${labels[sections.indexOf(hover)]}`
          ) : (
            <>
              {labels[sections.indexOf(current)]} ·{' '}
              <span className='cube-desktop-hint'>
                {fr ? 'survoler une face' : 'hover a face'}
              </span>
              <span className='cube-touch-hint'>
                {fr ? 'toucher une face' : 'tap a face'}
              </span>
            </>
          )}
        </p>
      </div>
      <nav
        className='scene-nav mono'
        aria-label={fr ? 'Parcours du cube' : 'Cube journey'}
      >
        {sections.map((id, i) => (
          <a
            key={id}
            href={`#${id}`}
            data-facet-link={id}
            aria-current={current === id ? 'step' : undefined}
            onClick={e => {
              e.preventDefault()
              navigate(id)
            }}
          >
            <span>0{i}</span>
            {labels[i]}
          </a>
        ))}
        <button
          aria-pressed={pause}
          onClick={() => {
            paused.current = !pause
            setPause(!pause)
          }}
        >
          {pause ? (fr ? 'Reprendre' : 'Resume') : 'Pause'}
        </button>
      </nav>
    </div>
  )
}
