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
const poses = [
  { x: 0.74, size: 0.39, rotation: [0.18, 2.78, -0.06] },
  { x: 0.24, size: 0.49, rotation: [-1.25, 0.22, -0.08] },
  { x: 0.76, size: 0.43, rotation: [0.22, -1.22, 0.08] },
  { x: 0.24, size: 0.47, rotation: [0.18, 1.24, -0.08] },
  { x: 0.76, size: 0.4, rotation: [0.22, 0.28, 0.08] },
  { x: 0.25, size: 0.37, rotation: [1.25, 0.22, -0.06] }
]
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
    window.addEventListener('scroll', invalidate, { passive: true })
    window.addEventListener('resize', invalidate)
    media.addEventListener('change', invalidate)
    surface.dataset.scene = 'ready'

    const update = (time: number) => {
      if (disposed) return
      frame = requestAnimationFrame(update)
      if (document.hidden || time - lastTime < 33) return
      const dt = Math.min((time - lastTime) / 1000, 0.05)
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
          i === 1 ? 0 : Math.max(anchors[i - 1], anchors[i] - vh * 0.95)
        p = clamp((y - start) / (anchors[i] - start))
        p = p * p * (3 - 2 * p)
        break
      }
      if (reduced) {
        from = index
        to = index
        p = 0
      }
      const a = poses[from],
        b = poses[to]
      const size = mobile
        ? Math.min(240, vw * 0.6)
        : Math.min(760, vw * mix(a.size, b.size, p))
      const landscape = mobile && vh < 550 && vw >= 650
      const x = landscape
        ? vw * 0.2
        : mobile
          ? vw * 0.5 + Math.sin(p * Math.PI) * 12
          : vw * mix(a.x, b.x, p)
      const cy = landscape ? vh * 0.44 : mobile ? 142 : vh * 0.49
      stage.current!.style.width = `${size}px`
      stage.current!.style.height = `${size}px`
      stage.current!.style.transform = `translate3d(${x - size / 2}px, ${cy - size / 2}px, 0)`
      if (!reduced && !paused.current && !hovered.current) phase += dt * 0.55
      const drift = reduced ? 0 : Math.sin(phase) * 0.035
      const angles = a.rotation.map(
        (n, i) => mix(n, b.rotation[i], p) + (i < 2 ? drift : 0)
      )
      stage.current!.dataset.rotation = angles.map(n => n.toFixed(4)).join(',')
      stage.current!.dataset.active = id
      root.current!.dataset.motion = reduced ? 'reduced' : 'full'
      // Keep all HTML in native document order. Fade only the entry/exit edges;
      // tall content remains fully readable throughout its native scroll interval.
      nodes.forEach(node => {
        const rect = node.getBoundingClientRect()
        const entry = clamp((vh * 0.9 - rect.top) / (vh * 0.45))
        const exit = clamp((rect.bottom - vh * 0.12) / (vh * 0.3))
        node.style.setProperty(
          '--scene-opacity',
          String(reduced ? 1 : Math.min(entry, exit))
        )
      })
      if (!cube || !memory || !canvas.current) return
      if (reduced && !dirty) return
      dirty = false
      cube.set_rotation(...(angles as [number, number, number]))
      cube.set_rotation_speed(0, 0, 0)
      cube.next_frame()
      const chars = new Uint8Array(memory.buffer, cube.chars_ptr(), 120 * 60)
      const colors = new Uint32Array(memory.buffer, cube.colors_ptr(), 120 * 60)
      const ctx = canvas.current.getContext('2d')!
      ctx.clearRect(0, 0, 960, 960)
      ctx.font = 'bold 16px monospace'
      ctx.textBaseline = 'top'
      const ink = getComputedStyle(surface).getPropertyValue('--ink').trim()
      for (let row = 0; row < 60; row++)
        for (let col = 0; col < 120; col++) {
          const n = row * 120 + col,
            ch = chars[n]
          if (ch === 32) continue
          ctx.fillStyle =
            colors[n] === 0x123456
              ? ink
              : `#${colors[n].toString(16).padStart(6, '0')}`
          ctx.fillText(
            ch === 255 ? '█' : ch === 254 ? '▒' : String.fromCharCode(ch),
            col * 8,
            row * 16
          )
        }
      // Exact same XYZ matrix, camera distance, zoom and 8×16 character cells
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
            (60 + (2100 / (z + 100)) * x * 2) * 8,
            (30 + (2100 / (z + 100)) * y) * 16
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
        const labelWidth = mobile ? 360 : 230
        const labelHeight = mobile ? 80 : 52
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
        memory = instance.memory
        cube = new wasm.Cube(120, 60)
        cube.set_zoom(2100)
        cube.set_rotation_speed(0, 0, 0)
        // Preserve the engine's six distinctive ASCII materials. One restrained
        // terminal palette; labels are HTML/SVG, not unrelated rotating logos.
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
      window.removeEventListener('scroll', invalidate)
      window.removeEventListener('resize', invalidate)
      media.removeEventListener('change', invalidate)
      delete surface.dataset.scene
      nodes.forEach(node => node.style.removeProperty('--scene-opacity'))
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
    window.scrollTo({
      top,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth'
    })
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
          viewBox='0 0 960 960'
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
