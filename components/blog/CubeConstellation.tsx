'use client'
import { useEffect, useRef } from 'react'

const points = Array.from({ length: 8 }, (_, i) => [
  i & 1 ? 1 : -1,
  i & 2 ? 1 : -1,
  i & 4 ? 1 : -1
])
const edges = points.flatMap((_, i) =>
  [1, 2, 4].filter(bit => (i & bit) === 0).map(bit => [i, i | bit])
)
const stars = [
  [0.16, 0.28, 27],
  [0.38, 0.13, 12],
  [0.64, 0.22, 45],
  [0.87, 0.12, 17],
  [0.31, 0.66, 53],
  [0.65, 0.74, 16],
  [0.92, 0.59, 33],
  [0.08, 0.85, 11],
  [0.49, 0.43, 15]
]
const readingStars = [
  [0.06, 0.22, 18],
  [0.94, 0.15, 12],
  [0.07, 0.65, 30],
  [0.94, 0.62, 20],
  [0.05, 0.9, 12]
]
export default function CubeConstellation({ reading }: { reading: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!,
      ctx = canvas.getContext('2d')!
    const reduced = matchMedia('(prefers-reduced-motion: reduce)'),
      mobile = matchMedia('(max-width: 700px)')
    let frame = 0,
      last = 0,
      phase = 0,
      width = 0,
      height = 0,
      color = '',
      strokeAlpha = 0.65,
      lineWidth = 0.8,
      visible = true,
      drawn = 0
    const paint = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      const nodes = (
        reading ? readingStars : mobile.matches ? stars.slice(0, 4) : stars
      ).map(([u, v, size], i) => {
        // Reserve the entire article column for text, not moving decoration.
        const x = u * width
        const y = v * height,
          scale = (mobile.matches ? 0.65 : 1) * size
        const a = 0.36 + phase * 0.7 + i * 0.61,
          b = 0.54 + phase + i * 0.47
        const projected = points.map(([x, y, z]) => {
          const X = x * Math.cos(b) + z * Math.sin(b),
            Z = -x * Math.sin(b) + z * Math.cos(b)
          return [X * scale, (y * Math.cos(a) - Z * Math.sin(a)) * scale]
        })
        ctx.globalAlpha = strokeAlpha
        ctx.beginPath()
        for (const [a, b] of edges) {
          ctx.moveTo(x + projected[a][0], y + projected[a][1])
          ctx.lineTo(x + projected[b][0], y + projected[b][1])
        }
        ctx.stroke()
        return { x, y }
      })
      if (!reading) {
        ctx.globalAlpha = strokeAlpha * 0.24
        ctx.beginPath()
        for (const [a, b] of [
          [0, 1],
          [1, 2],
          [2, 3],
          [4, 5],
          [5, 6]
        ]) {
          if (!nodes[a] || !nodes[b]) continue
          ctx.moveTo(nodes[a].x, nodes[a].y)
          ctx.lineTo(nodes[b].x, nodes[b].y)
        }
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      canvas.dataset.frames = String(++drawn)
    }
    const palette = () => {
      color = getComputedStyle(document.documentElement)
        .getPropertyValue('--portfolio-muted')
        .trim()
      const style = getComputedStyle(canvas)
      strokeAlpha =
        parseFloat(style.getPropertyValue('--constellation-alpha')) || 0.65
      lineWidth =
        parseFloat(style.getPropertyValue('--constellation-line-width')) || 0.8
    }
    const size = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      const dpr = Math.min(
        devicePixelRatio || 1,
        2,
        4096 / Math.max(width, 1),
        2160 / Math.max(height, 1)
      )
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      palette()
      paint()
    }
    const tick = (now: number) => {
      frame = 0
      if (document.hidden || !visible || reduced.matches) {
        last = 0
        return
      }
      frame = requestAnimationFrame(tick)
      if (now - last < 1000 / 24) return
      if (last)
        phase += Math.min((now - last) / 1000, 0.1) * (reading ? 0.06 : 0.16)
      last = now
      paint()
    }
    const resume = () => {
      cancelAnimationFrame(frame)
      last = 0
      canvas.dataset.motion = reduced.matches
        ? 'reduced'
        : document.hidden || !visible
          ? 'paused'
          : 'rotating'
      size()
      if (!reduced.matches && !document.hidden && visible)
        frame = requestAnimationFrame(tick)
    }
    const resize = new ResizeObserver(resume)
    resize.observe(canvas)
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      resume()
    })
    observer.observe(canvas)
    const theme = new MutationObserver(() => {
      palette()
      paint()
    })
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    reduced.addEventListener('change', resume)
    mobile.addEventListener('change', resume)
    document.addEventListener('visibilitychange', resume)
    resume()
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      observer.disconnect()
      theme.disconnect()
      reduced.removeEventListener('change', resume)
      mobile.removeEventListener('change', resume)
      document.removeEventListener('visibilitychange', resume)
    }
  }, [reading])
  return (
    <canvas
      ref={ref}
      data-cube-constellation
      className={
        reading ? 'blog-constellation is-reading' : 'blog-constellation'
      }
      aria-hidden='true'
    />
  )
}
