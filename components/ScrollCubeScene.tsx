'use client'

import { useEffect, useRef, useState } from 'react'
import type { Cube } from 'ascii-cube'
import { Pause, Play } from 'lucide-react'

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
const columns = 240,
  rows = 120,
  zoom = 3300
const logicalSize = columns * 8
const poses = [
  { x: 0.74, size: 0.32, rotation: [0.32, 2.6, -0.08] },
  { x: 0.25, size: 0.34, rotation: [-1.08, 0.38, -0.12] },
  { x: 0.75, size: 0.31, rotation: [0.32, -1.08, 0.12] },
  { x: 0.73, size: 0.34, rotation: [0.38, 1.12, -0.12] },
  { x: 0.25, size: 0.3, rotation: [0.3, 0.4, 0.12] },
  { x: 0.25, size: 0.29, rotation: [1.25, 0.22, -0.06] }
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
    let rustShift = 0
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const nodes = sections.map(id => document.getElementById(id)!)
    const surface = document.querySelector<HTMLElement>('.narrative')!
    const compositionMax =
      parseFloat(
        getComputedStyle(surface).getPropertyValue('--composition-max')
      ) || 1600
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
        i === 0
          ? 0
          : node.getBoundingClientRect().top + y - (i === 1 ? rustShift : 0)
      )
      // Finish the first move before the Rust title enters the reading area.
      const introEnd =
        surface.dataset.stepped || mobile
          ? anchors[1]
          : Math.max(1, anchors[1] - vh * 0.7)
      root.current!.dataset.introEnd = String(introEnd)
      let index = y >= introEnd * 0.9 ? 1 : 0
      for (let i = 2; i < anchors.length; i++)
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
            : surface.dataset.stepped
              ? anchors[i] - vh
              : Math.min(
                  anchors[i] - 1,
                  Math.max(anchors[i - 1] + vh * 0.45, anchors[i] - vh * 0.75)
                )
        p = clamp((y - start) / ((i === 1 ? introEnd : anchors[i]) - start))
        break
      }
      if (reduced) {
        from = index
        to = index
        p = 0
      }
      const a = poses[from],
        b = poses[to],
        progress = smooth(p)
      const flyby =
        !mobile && !reduced && from === 0 && to === 1 && p > 0 && p < 1
      const displayed = {
        x: mix(a.x, b.x, progress),
        size: mix(a.size, b.size, progress),
        rotation: a.rotation.map((n, i) => mix(n, b.rotation[i], progress))
      }
      stage.current!.dataset.flyby = String(flyby)
      surface.dataset.introOccluded = String(flyby && p >= 0.5)
      document.body.style.setProperty('--intro-shift', `${flyby ? y : 0}px`)
      // Keep the compositions stationary; fade between them around the moving cube.
      rustShift = flyby ? y - anchors[1] : 0
      nodes[0].dataset.sceneShift = String(flyby ? y : 0)
      nodes[1].dataset.sceneShift = String(rustShift)
      nodes[0].style.transform = flyby ? `translateY(${y}px)` : ''
      nodes[1].style.transform = flyby ? `translateY(${rustShift}px)` : ''
      nodes[0].style.visibility = flyby && p >= 0.5 ? 'hidden' : ''
      nodes[1].style.visibility = flyby && p < 0.5 ? 'hidden' : ''
      nodes[1].style.opacity = String(flyby ? smooth((p - 0.84) / 0.16) : 1)

      if (flyby) {
        // Translate and rotate throughout the zoom reversal: never park at the peak.
        displayed.x = mix(a.x, b.x, p)
      }
      // Scroll is the pose clock: no delayed interpolation after it stops.
      const introOpacity = flyby ? 1 - smooth((p - 0.08) / 0.32) : 1
      surface.style.setProperty('--intro-opacity', String(introOpacity))
      document.body.style.setProperty(
        '--intro-ui-opacity',
        String(introOpacity)
      )
      const compositionWidth = Math.min(vw, compositionMax)
      const compositionLeft = (vw - compositionWidth) / 2
      const safeTop = Math.min(96, vh * 0.15)
      const safeBottom = vh - Math.min(128, vh * 0.2)
      const traversal =
        !mobile &&
        from > 0 &&
        from !== to &&
        Math.abs(poses[from].x - poses[to].x) > 0.2
          ? Math.sin(Math.PI * p)
          : 0
      stage.current!.dataset.travelling = String(traversal > 0.02)
      const readingSize = mobile
        ? Math.min(190, vw * 0.46) *
          (reduced ? 1 : 1 + Math.sin(p * Math.PI) * 0.08)
        : Math.min(
            1000,
            safeBottom - safeTop,
            compositionWidth * displayed.size
          ) *
          (1 - traversal * 0.65)
      // A restrained lift in scale; the entire cube stays inside the scene.
      const size = flyby
        ? mix(
            readingSize,
            Math.min(640, safeBottom - safeTop, compositionWidth * 0.4),
            Math.sin(Math.PI * p) ** 2
          )
        : readingSize
      const landscape = mobile && vh < 550 && vw >= 650
      const targetX = landscape
        ? vw * 0.2
        : mobile
          ? vw * 0.5 + Math.sin(p * Math.PI) * 12
          : compositionLeft + compositionWidth * displayed.x
      const x = Math.max(size / 2 + 16, Math.min(vw - size / 2 - 16, targetX))
      const targetY = landscape
        ? vh * 0.44
        : mobile
          ? mix(156, 100, clamp(y / 160))
          : vh * (0.49 - traversal * 0.25)
      const cy = mobile
        ? targetY
        : Math.max(safeTop + size / 2, Math.min(safeBottom - size / 2, targetY))
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
      // Rasterize the visible viewport, even when the cube flies far beyond it.
      // This keeps macro glyphs sharp without allocating a giant offscreen canvas.
      const pixelRatio = Math.min(
        devicePixelRatio || 1,
        2,
        4096 / vw,
        2160 / vh
      )
      const backingWidth = Math.ceil(vw * pixelRatio)
      const backingHeight = Math.ceil(vh * pixelRatio)
      if (
        canvas.current.width !== backingWidth ||
        canvas.current.height !== backingHeight
      ) {
        canvas.current.width = backingWidth
        canvas.current.height = backingHeight
      }
      Object.assign(canvas.current.style, {
        width: `${vw}px`,
        height: `${vh}px`,
        left: `${size / 2 - x}px`,
        top: `${size / 2 - cy}px`
      })
      ctx.resetTransform()
      ctx.clearRect(0, 0, backingWidth, backingHeight)
      ctx.setTransform(
        (pixelRatio * size) / logicalSize,
        0,
        0,
        (pixelRatio * size) / logicalSize,
        pixelRatio * (x - size / 2),
        pixelRatio * (cy - size / 2)
      )
      const projectedFaces = normals.map((normal, face) => ({
        visible: rotate(normal, angles)[2] < -0.015,
        points: corners(face).map(v => {
          const [x, y, z] = rotate(v, angles)
          return [
            (columns / 2 + (zoom / (z + 100)) * x * 2) * 8,
            (rows / 2 + (zoom / (z + 100)) * y) * 16
          ]
        })
      }))
      // A cube is opaque between glyphs too. Its actual projected silhouette
      // occludes the outgoing HTML, rather than crossfading or masking the viewport.
      ctx.fillStyle = getComputedStyle(surface)
        .getPropertyValue('--paper')
        .trim()
      ctx.beginPath()
      for (const { visible, points } of projectedFaces) {
        if (!visible) continue
        points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
        ctx.closePath()
      }
      ctx.fill()

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
        const { visible, points } = projectedFaces[face]
        group.toggleAttribute('hidden', !visible)
        group.style.display = visible ? '' : 'none'
        if (!visible) return
        group
          .querySelector('polygon')!
          .setAttribute('points', points.map(p => p.join(',')).join(' '))
        const text = group.querySelector('text')!
        const cx = points.reduce((n, p) => n + p[0], 0) / 4
        const cy = points.reduce((n, p) => n + p[1], 0) / 4
        text.setAttribute('x', String(cx))
        text.setAttribute('y', String(cy))
        const plate = group.querySelector('rect')!
        const labelWidth = mobile ? 744 : 360
        const labelHeight = mobile ? 180 : 86
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
      for (const node of nodes.slice(0, 2)) {
        node.style.removeProperty('transform')
        node.style.removeProperty('visibility')
        delete node.dataset.sceneShift
      }

      delete surface.dataset.scene
      delete surface.dataset.introOccluded
      document.body.style.removeProperty('--intro-shift')
      document.body.style.removeProperty('--intro-ui-opacity')
    }
  }, [])

  function enter(section: string) {
    hovered.current = section
    setHover(section)
  }
  function navigate(id: string) {
    if (document.querySelector('.narrative[data-stepped]')) {
      window.dispatchEvent(new CustomEvent('portfolio-step', { detail: id }))
      return
    }
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
      <div className='scene-viewport'>
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
            viewBox={`0 0 ${logicalSize} ${logicalSize}`}
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
            aria-label={labels[i]}
            aria-current={current === id ? 'step' : undefined}
            onClick={e => {
              e.preventDefault()
              navigate(id)
            }}
          >
            <span className='scene-index'>0{i}</span>
            <span className={id === 'rust' ? 'scene-label-wide' : undefined}>
              {labels[i]}
            </span>
            {id === 'rust' && <span className='scene-label-short'>Rust</span>}
          </a>
        ))}
        <button
          aria-pressed={pause}
          aria-label={
            pause
              ? fr
                ? 'Reprendre la rotation du cube'
                : 'Resume cube rotation'
              : fr
                ? 'Suspendre la rotation du cube'
                : 'Pause cube rotation'
          }
          title={
            pause
              ? fr
                ? 'Reprendre la rotation'
                : 'Resume rotation'
              : fr
                ? 'Suspendre la rotation'
                : 'Pause rotation'
          }
          onClick={() => {
            paused.current = !pause
            setPause(!pause)
          }}
        >
          {pause ? (
            <Play size={16} aria-hidden='true' />
          ) : (
            <Pause size={16} aria-hidden='true' />
          )}
        </button>
      </nav>
    </div>
  )
}
