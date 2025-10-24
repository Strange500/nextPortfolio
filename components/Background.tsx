'use client'

import { useEffect, useRef } from 'react'
import { Circle, Quadtree } from '@timohausmann/quadtree-ts'
import { useTheme } from 'next-themes'

// Constants
const MAX_OBJECTS = 10
const MAX_LEVELS = 3
const MAX_DISTANCE = 30
const MAX_DISTANCE_SQUARED = MAX_DISTANCE * MAX_DISTANCE
const RADIUS = 3
const BASE_SPEED = 0.3
const SPEED_DECAY = 0.01
const WAVE_STRENGTH_MULTIPLIER = 3
const ATTRACT_STRENGTH_MULTIPLIER = 2
const WAVE_RADIUS_MULTIPLIER = 10
const ATTRACT_RADIUS_MULTIPLIER = 20
const TARGET_FPS = 60
const FPS_ADJUST_INTERVAL = 500
const THROTTLE_DELAY = 50
const LIGHT_COLORS = ['#0F0F0F', '#2D2E2E', '#716969']
const DARK_COLORS = ['#9f9f9f', '#565c5c', '#222121']

/**
 * Point class representing an animated dot in the canvas
 */
class Point extends Circle {
  deg: number
  color: string
  speed: number

  constructor(x: number, y: number, deg: number, color: string) {
    super({ x, y, r: RADIUS })
    this.deg = deg
    this.color = color
    this.speed = BASE_SPEED
  }

  /**
   * Update point position with smooth speed decay
   */
  update(canvasWidth: number, canvasHeight: number) {
    // Smooth speed interpolation towards base speed
    this.speed += (BASE_SPEED - this.speed) * SPEED_DECAY

    // Apply movement
    this.x += Math.cos(this.deg) * this.speed
    this.y += Math.sin(this.deg) * this.speed

    // Bounce off edges with slight randomness
    if (this.x < 0 || this.x > canvasWidth) {
      this.deg = Math.PI - this.deg + (Math.random() * 0.25 - 0.125)
    }
    if (this.y < 0 || this.y > canvasHeight) {
      this.deg = -this.deg + (Math.random() * 0.25 - 0.125)
    }
  }

  /**
   * Render the point on canvas
   */
  render(context: CanvasRenderingContext2D) {
    context.beginPath()
    context.arc(this.x, this.y, RADIUS, 0, 2 * Math.PI)
    context.fillStyle = this.color
    context.fill()
  }

  /**
   * Calculate squared distance to another point (faster than distanceTo)
   */
  distanceSquaredTo(other: Point): number {
    return (this.x - other.x) ** 2 + (this.y - other.y) ** 2
  }
}

/**
 * Generate a random point within canvas bounds
 */
function createRandomPoint(maxWidth: number, maxHeight: number, colors: string[]): Point {
  const x = Math.random() * maxWidth
  const y = Math.random() * maxHeight
  const deg = Math.random() * 2 * Math.PI
  const color = colors[Math.floor(Math.random() * colors.length)]
  return new Point(x, y, deg, color)
}

/**
 * Initialize canvas dimensions and point collection
 */
function initializeCanvas(
  canvas: HTMLCanvasElement,
  points: Point[],
  quadtree: Quadtree<Point>,
  colors: string[]
): { quadtree: Quadtree<Point>; numPoints: number } {
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
  const numPoints = Math.floor(canvas.width)

  const newQuadtree = new Quadtree<Point>({
    width: canvas.width,
    height: canvas.height,
    maxObjects: MAX_OBJECTS,
    maxLevels: MAX_LEVELS
  })

  points.length = 0
  for (let i = 0; i < numPoints; i++) {
    const point = createRandomPoint(canvas.width, canvas.height, colors)
    newQuadtree.insert(point)
    points.push(point)
  }

  return { quadtree: newQuadtree, numPoints }
}

/**
 * Apply wave effect radiating from a point
 */
function applyWaveEffect(mousePoint: Point, quadtree: Quadtree<Point>) {
  const waveRadius = MAX_DISTANCE_SQUARED * WAVE_RADIUS_MULTIPLIER

  quadtree.retrieve(mousePoint).forEach(point => {
    const dx = point.x - mousePoint.x
    const dy = point.y - mousePoint.y
    const distanceSquared = point.distanceSquaredTo(mousePoint)

    if (distanceSquared > waveRadius) return

    const angle = Math.atan2(dy, dx)
    const strength = (1 - distanceSquared / waveRadius) ** 2

    // Apply impulse with slight randomness
    point.speed += WAVE_STRENGTH_MULTIPLIER * strength
    point.deg = angle + (Math.random() - 0.5) * 0.2
  })
}

/**
 * Apply attraction effect towards a point
 */
function applyAttractionEffect(mousePoint: Point, quadtree: Quadtree<Point>) {
  const attractRadius = MAX_DISTANCE_SQUARED * ATTRACT_RADIUS_MULTIPLIER

  quadtree.retrieve(mousePoint).forEach(point => {
    const dx = mousePoint.x - point.x
    const dy = mousePoint.y - point.y
    const distanceSquared = point.distanceSquaredTo(mousePoint)

    if (distanceSquared > attractRadius) return

    const angle = Math.atan2(dy, dx)
    const strength = (1 - distanceSquared / attractRadius) ** 2

    // Apply impulse with slight randomness
    point.speed += ATTRACT_STRENGTH_MULTIPLIER * strength
    point.deg = angle + (Math.random() - 0.5) * 0.2
  })
}

/**
 * Render connections between nearby points
 */
function renderConnections(
  points: Point[],
  quadtree: Quadtree<Point>,
  context: CanvasRenderingContext2D
) {
  const drawnConnections = new Set<string>()

  points.forEach(point => {
    const neighbors = quadtree.retrieve(
      new Circle({ x: point.x, y: point.y, r: MAX_DISTANCE })
    )

    neighbors.forEach(neighbor => {
      if (neighbor === point) return

      const distSquared = point.distanceSquaredTo(neighbor)
      if (distSquared > MAX_DISTANCE_SQUARED) return

      // Create consistent connection ID to avoid duplicates
      const connectionId =
        point.x < neighbor.x || (point.x === neighbor.x && point.y < neighbor.y)
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
    })
  })
}

/**
 * Update points and rebuild quadtree
 */
function updatePoints(
  points: Point[],
  quadtree: Quadtree<Point>,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
): Quadtree<Point> {
  quadtree.clear()

  points.forEach(point => {
    point.update(canvas.width, canvas.height)
    point.render(context)
    quadtree.insert(point)
  })

  return quadtree
}

/**
 * Update colors based on theme
 */
function updateColors(theme: string | undefined, colors: string[], mousePoint: Point) {
  if (theme === 'light') {
    colors[0] = LIGHT_COLORS[0]
    colors[1] = LIGHT_COLORS[1]
    colors[2] = LIGHT_COLORS[2]
    mousePoint.color = 'blue'
  } else {
    colors[0] = DARK_COLORS[0]
    colors[1] = DARK_COLORS[1]
    colors[2] = DARK_COLORS[2]
    mousePoint.color = 'red'
  }
}

/**
 * Custom hook for canvas animation
 */
const useCanvasAnimation = () => {
  const { theme } = useTheme()
  const stopRef = useRef(false)

  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    if (!canvas) return

    const context = canvas.getContext('2d') as CanvasRenderingContext2D
    if (!context) return

    // Initialize state
    const colors = [...LIGHT_COLORS]
    const points: Point[] = []
    const mousePoint = new Point(-100, -100, 0, 'blue')
    const mouseState = { left: false, right: false }
    const fpsTracker = { times: [] as number[], current: 0 }
    let lastInteractionTime = 0
    let quadtree = new Quadtree<Point>({
      width: canvas.width,
      height: canvas.height,
      maxObjects: MAX_OBJECTS,
      maxLevels: MAX_LEVELS
    })

    // Initialize canvas
    canvas.width = canvas.clientWidth + 100
    canvas.height = canvas.clientHeight + 100
    const initResult = initializeCanvas(canvas, points, quadtree, colors)
    quadtree = initResult.quadtree

    // Canvas resize handler
    const handleResize = () => {
      const result = initializeCanvas(canvas, points, quadtree, colors)
      quadtree = result.quadtree
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(canvas)

    // Mouse event handlers
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) mouseState.left = true
      if (e.button === 2) mouseState.right = true
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) mouseState.left = false
      if (e.button === 2) mouseState.right = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mousePoint.x = e.clientX - rect.left
      mousePoint.y = e.clientY - rect.top
    }

    const handleContextMenu = (e: Event) => e.preventDefault()

    // Register event listeners
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('contextmenu', handleContextMenu)

    // FPS-based point adjustment
    const fpsInterval = setInterval(() => {
      const diff = TARGET_FPS - fpsTracker.current
      const intensity = Math.min(Math.abs(diff) / 5, 4)
      const count = Math.round(20 * intensity)

      if (fpsTracker.current < TARGET_FPS - 1) {
        // Remove points to improve FPS
        for (let i = 0; i < count; i++) {
          const p = points.pop()
          if (p) quadtree.remove(p, true)
        }
      } else if (fpsTracker.current > TARGET_FPS + 1) {
        // Add points when FPS is high
        for (let i = 0; i < count; i++) {
          const p = createRandomPoint(canvas.width, canvas.height, colors)
          points.push(p)
          quadtree.insert(p)
        }
      }
    }, FPS_ADJUST_INTERVAL)

    // Animation loop
    const animate = (timestamp: number) => {
      if (stopRef.current) return

      // Update theme colors
      updateColors(theme, colors, mousePoint)

      // Track FPS
      const now = performance.now()
      while (fpsTracker.times.length > 0 && fpsTracker.times[0] <= now - 1000) {
        fpsTracker.times.shift()
      }
      fpsTracker.times.push(now)
      fpsTracker.current = fpsTracker.times.length

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height)

      // Update and render points
      quadtree = updatePoints(points, quadtree, canvas, context)

      // Apply mouse interactions (throttled)
      if (timestamp - lastInteractionTime > THROTTLE_DELAY) {
        if (mouseState.right) {
          applyAttractionEffect(mousePoint, quadtree)
        } else if (mouseState.left) {
          applyWaveEffect(mousePoint, quadtree)
        }
        lastInteractionTime = timestamp
      }

      // Render connections
      quadtree.insert(mousePoint)
      renderConnections(points, quadtree, context)
      quadtree.remove(mousePoint)

      requestAnimationFrame(animate)
    }

    // Start animation
    stopRef.current = false
    animate(0)

    // Cleanup
    return () => {
      stopRef.current = true
      resizeObserver.disconnect()
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('contextmenu', handleContextMenu)
      clearInterval(fpsInterval)
    }
  }, [theme])
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