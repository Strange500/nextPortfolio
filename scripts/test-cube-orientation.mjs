import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
const source = await readFile(
  new URL('../lib/cube-orientation.ts', import.meta.url),
  'utf8'
)
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022
  }
})
const {
  fromEuler,
  toEuler,
  multiply,
  fromVector,
  slerp,
  coast,
  between,
  trackball,
  rotationVector
} = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
)
const distance = (a, b) =>
  2 * Math.acos(Math.min(1, Math.abs(a.reduce((s, v, i) => s + v * b[i], 0))))
// Exercise the actual XYZ boundary convention, including both gimbal poles.
for (let i = 0; i < 1200; i++) {
  const angles = [
    Math.sin(i) * 8,
    i < 600 ? ((i % 2 ? -1 : 1) * Math.PI) / 2 : Math.cos(i) * 8,
    Math.cos(i * 0.7) * 8
  ]
  const q = fromEuler(angles)
  assert.ok(distance(q, fromEuler(toEuler(q))) < 0.0001, `XYZ boundary ${i}`)
}
let q = fromEuler([0, Math.PI / 2, 0])
for (let i = 0; i < 1000; i++) {
  const delta = fromVector([0.015, 0.02, 0.005]),
    next = multiply(delta, q)
  assert.ok(Math.abs(Math.hypot(...next) - 1) < 1e-12)
  assert.ok(
    distance(next, q) > 0.02,
    'All axes remain usable through the poles'
  )
  q = next
}
const start = fromEuler([0.2, 1.4, -0.3]),
  v = [1, -2, 0.4]
const run = hz => {
  let rotation = start,
    velocity = v
  for (let i = 0; i < hz; i++)
    ({ rotation, velocity } = coast(rotation, velocity, 1 / hz))
  return { rotation, velocity }
}
const a = run(30),
  b = run(120)
assert.ok(
  distance(a.rotation, b.rotation) < 1e-6,
  'Frame-independent inertial travel'
)
assert.ok(
  Math.hypot(...a.velocity) < 0.02,
  'Inertia decays instead of spinning indefinitely'
)
assert.ok(
  distance(start, coast(start, v, 1 / 60).rotation) > 0,
  'Release continues moving'
)
const point = trackball(20, 40, 0, 0, 100)
assert.ok(distance(between(point, point), [0, 0, 0, 1]) < 1e-6)
const delta = between(trackball(0, 0, 0, 0, 100), trackball(45, -35, 0, 0, 100))
assert.ok(delta.every(Number.isFinite))
assert.ok(
  distance(
    slerp(
      start,
      start.map(v => -v),
      0.5
    ),
    start
  ) < 1e-6,
  'Quaternion antipodes take the shortest path'
)
console.log(
  'PASS: 1200 XYZ round trips including gimbal poles, 1000 free rotations, frame-independent damping, trackball and quaternion interpolation'
)

// Camera at negative Z: the facing surface must move with the screen gesture.
const frontX = ([x, y, z, w]) => -2 * (x * z + w * y)
for (const sign of [-1, 1]) {
  const drag = between(
    trackball(0, 0, 0, 0, 100),
    trackball(sign * 40, 0, 0, 0, 100)
  )
  assert.ok(frontX(drag) * sign > 0, 'Horizontal drag follows the pointer')
  const release = coast(drag, rotationVector(drag), 0.05).rotation
  assert.ok(
    (frontX(release) - frontX(drag)) * sign > 0,
    'Inertia continues in the release direction'
  )
}
console.log('PASS: left/right screen direction and matching inertia')
