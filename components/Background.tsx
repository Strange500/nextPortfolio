'use client'

import { useEffect } from 'react'
import { Circle, Quadtree } from '@timohausmann/quadtree-ts'
import { useTheme } from 'next-themes'

const MAX_OBJECTS = 10
const MAX_LEVELS = 3
const MAX_DISTANCE = 30
const MAX_DISTANCE_SQUARED = MAX_DISTANCE * MAX_DISTANCE
const RADIUS = 3
const COLORS = ['#0F0F0F', '#2D2E2E', '#716969']

const useCanvasAnimation = () => {
  const { theme } = useTheme()

  useEffect(() => {
    const canvasResizeObserver = new ResizeObserver(resampleCanvas)

    function resampleCanvas() {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      NUM_POINTS = Math.floor(canvas.width)
      quadtree = new Quadtree<Point>({
        width: canvas.width,
        height: canvas.height,
        maxObjects: MAX_OBJECTS,
        maxLevels: MAX_LEVELS
      })
      points.length = 0
      for (let i = 0; i < NUM_POINTS; i++) {
        const point = genRandomPoint(canvas.width, canvas.height)
        quadtree.insert(point)
        points.push(point)
      }
    }

    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    const context = canvas.getContext('2d') as CanvasRenderingContext2D
    canvas.width = canvas.clientWidth + 100
    canvas.height = canvas.clientHeight + 100
    let NUM_POINTS = Math.floor(canvas.width)
    // make speed relative to canvas size
    const speed = 0.3

    canvasResizeObserver.observe(canvas)

    let quadtree = new Quadtree<Point>({
      width: canvas.width ,
      height: canvas.height ,
      maxObjects: MAX_OBJECTS,
      maxLevels: MAX_LEVELS
    })

    class Point extends Circle {
      deg: number
      color: string
      speed: number

      constructor(x: number, y: number, deg: number, color: string) {
        super({ x, y, r: RADIUS })
        this.deg = deg
        this.color = color
        this.speed = speed
      }

      update(canvasWidth: number, canvasHeight: number) { 
        // reduce speed gradually back to normal using logarithmic decay
        // Assuming these properties exist:
        // this.x, this.y, this.speed, this.deg
        // speed = target speed (e.g. 0 when no input)

        const targetSpeed = speed; // your intended target (could be 0)
        this.speed += (targetSpeed - this.speed) * 0.01; // smooth interpolation (inertia)

        // Apply movement
        this.x += Math.cos(this.deg) * this.speed;
        this.y += Math.sin(this.deg) * this.speed;

        if (this.x < 0 || this.x > canvasWidth) {
          this.deg = Math.PI - this.deg + (Math.random() * 0.25 - 0.125) // Small random change
        }
        if (this.y < 0 || this.y > canvasHeight) {
          this.deg = -this.deg + (Math.random() * 0.25 - 0.125) // Small random change
        }
      }

      render(context: CanvasRenderingContext2D) {
        context.beginPath()
        context.arc(this.x, this.y, RADIUS, 0, 2 * Math.PI)
        context.fillStyle = this.color
        context.fill()
      }

      distanceTo(other: Point): number {
        return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2)
      }

      distanceSquaredTo(other: Point): number {
        return (this.x - other.x) ** 2 + (this.y - other.y) ** 2
      }
    }

    function genRandomPoint(maxWidth: number, maxHeight: number): Point {
      const x = Math.random() * maxWidth
      const y = Math.random() * maxHeight
      const deg = Math.random() * 2 * Math.PI // Use radians for degrees
      return new Point(
        x,
        y,
        deg,
        COLORS[Math.floor(Math.random() * COLORS.length)]
      )
    }

    // Generate a collection of points
    const points = Array.from({ length: NUM_POINTS }, () => {
      const point = genRandomPoint(canvas.width, canvas.height)
      quadtree.insert(point)
      return point
    })

    
    

    let rightMouseDown = false
    let leftMouseDown = false

    document.addEventListener('contextmenu', (e) => e.preventDefault())

    document.addEventListener('mousedown', (e) => {
      if (e.button === 2) rightMouseDown = true
      if (e.button === 0) leftMouseDown = true
    })

    document.addEventListener('mouseup', (e) => {
      if (e.button === 2) rightMouseDown = false
      if (e.button === 0) leftMouseDown = false
    })

    const handleMouseMove = (e: MouseEvent) => {
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    // animation loop with throttling control
    let lastTime = 0
    const throttleDelay = 50 // in ms (~20fps)


    function genWave() {
      if (!canvas) return

      const waveRadius = MAX_DISTANCE_SQUARED * 10

      quadtree.retrieve(mousePoint).forEach(point => {
        const dx = point.x - mousePoint.x
        const dy = point.y - mousePoint.y
        const distance = point.distanceSquaredTo(mousePoint)

        if (distance > waveRadius) return

        const angle = Math.atan2(dy, dx)

        // Wave strength fades with distance
        const strength = (1 - distance / waveRadius) ** 2

        // Small impulse instead of massive speed jump
        point.speed += 3 * strength

        // Add randomness to direction for realism
        const randomOffset = (Math.random() - 0.5) * 0.2
        point.deg = angle + randomOffset
      })
    }

    function attractToMouse() {
      if (!canvas) return

      const attractRadius = MAX_DISTANCE_SQUARED * 20

      quadtree.retrieve(mousePoint).forEach(point => {
        const dx = mousePoint.x - point.x
        const dy = mousePoint.y - point.y
        const distance = point.distanceSquaredTo(mousePoint)

        if (distance > attractRadius) return

        const angle = Math.atan2(dy, dx)

        // Attraction strength fades with distance
        const strength = (1 - distance / attractRadius) ** 2

        // Small impulse towards mouse
        point.speed += 2 * strength

        // Add randomness to direction for realism
        const randomOffset = (Math.random() - 0.5) * 0.2
        point.deg = angle + randomOffset
      })
    }


    const mousePoint: Point = new Point(-100, -100, 0, 'red')
    function setMousePos(param: { x: number; y: number }) {
      mousePoint.x = param.x
      mousePoint.y = param.y
    }

    const times: number[] = []
    let fps: number = 0

    const TARGET_FPS = 60
    const interval = setInterval(() => {
      const diff = TARGET_FPS - fps // positive if fps < 60, negative if fps > 60

      // Use a proportional factor (clamped to avoid extremes)
      const intensity = Math.min(Math.abs(diff) / 5, 4) // e.g., 0–4 scaling
      const baseChange = 20 // base number of points to add/remove
      const count = Math.round(baseChange * intensity)

      if (fps < TARGET_FPS - 1) {
        // FPS is low → remove points
        for (let i = 0; i < count; i++) {
          const p = points.pop()
          if (p) quadtree.remove(p, true)
        }
      } else if (fps > TARGET_FPS + 1) {
        // FPS is high → add points
        for (let i = 0; i < count; i++) {
          const p = genRandomPoint(canvas.width, canvas.height)
          points.push(p)
          quadtree.insert(p)
        }
      }
    }, 500)



    let stop = false

    const animate = (timestamp: number) => {
      if (stop) {
        return
      }
      if (theme === 'light') {
        COLORS[0] = '#0F0F0F'
        COLORS[1] = '#2D2E2E'
        COLORS[2] = '#716969'
        mousePoint.color = 'blue'
      } else {
        COLORS[0] = '#9f9f9f'
        COLORS[1] = '#565c5c'
        COLORS[2] = '#222121'
        mousePoint.color = 'red'
      }
      const now = performance.now()
      while (times.length > 0 && times[0] <= now - 1000) {
        times.shift()
      }
      times.push(now)
      fps = times.length

      context.clearRect(0, 0, canvas.width, canvas.height)

      // Update all points and rebuild quadtree once
      quadtree.clear()
      points.forEach(point => {
        point.update(canvas.width, canvas.height)
        point.render(context)
        quadtree.insert(point)
      })

      if (timestamp - lastTime > throttleDelay) {
        if (rightMouseDown) {
          attractToMouse()
        } else if (leftMouseDown) {
          genWave()
        }
        lastTime = timestamp
      }

      // Draw connections - use Set outside loop to track all drawn connections
      const drawnConnections = new Set<string>()
      quadtree.insert(mousePoint)
      
      points.forEach(point => {
        const neighbors = quadtree.retrieve(
          new Circle({
            x: point.x,
            y: point.y,
            r: MAX_DISTANCE
          })
        )
        neighbors.forEach(neighbor => {
          if (neighbor !== point) {
            // Use squared distance to avoid expensive Math.sqrt
            const distSquared = point.distanceSquaredTo(neighbor)
            if (distSquared <= MAX_DISTANCE_SQUARED) {
              // Create consistent connection ID using sorted coordinates
              const connectionId = point.x < neighbor.x || (point.x === neighbor.x && point.y < neighbor.y)
                ? `${point.x},${point.y}-${neighbor.x},${neighbor.y}`
                : `${neighbor.x},${neighbor.y}-${point.x},${point.y}`

              if (!drawnConnections.has(connectionId)) {
                context.beginPath()
                context.moveTo(point.x, point.y)
                context.lineTo(neighbor.x, neighbor.y)
                context.strokeStyle = neighbor.color
                context.stroke()
                drawnConnections.add(connectionId)
              }
            }
          }
        })
      })
      quadtree.remove(mousePoint)

      requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      clearInterval(interval)
      stop = true
    }
  })
}

const BG = () => {
  useCanvasAnimation()
  return (
    <canvas
      id={'canvas'}
      className='fixed right-0 top-0 z-[-1] h-[110vh] w-[110vw]'
    ></canvas>
  )
}

export default BG