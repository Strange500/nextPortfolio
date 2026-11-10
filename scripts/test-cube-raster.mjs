import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const cubeModule = new URL(
  process.env.CUBE_MODULE || '../wasm-cube/cube.js',
  import.meta.url
)
const { default: init, Cube } = await import(cubeModule.href)
const { memory } = await init({
  module_or_path: await readFile(new URL('cube_bg.wasm', cubeModule))
})
const cube = new Cube(120, 60)
cube.set_zoom(1500)
cube.set_rotation_speed(0, 0, 0)
let holes = 0,
  affected = 0
for (let frame = 0; frame < 180; frame++) {
  cube.set_rotation(frame * 0.037, frame * 0.021, frame * 0.013)
  cube.next_frame()
  const chars = new Uint8Array(memory.buffer, cube.chars_ptr(), 7200)
  let frameHoles = 0
  for (let y = 0; y < 60; y++) {
    const row = chars.subarray(y * 120, (y + 1) * 120)
    const first = row.findIndex(c => c !== 32)
    const last = row.findLastIndex(c => c !== 32)
    for (let x = first; x < last; x++) if (row[x] === 32) frameHoles++
  }
  if (frameHoles) affected++
  holes += frameHoles
}
// Check row-major texture mapping in all four quadrants (static/video use the
// same update_face_fast API). Freeze rotation to make the probes deterministic.
cube.set_rotation(0, 0, 0)
const texture = new Uint8Array(10000)
const colors = new Uint32Array(10000)
const palette = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]
for (let y = 0; y < 100; y++) {
  for (let x = 0; x < 100; x++) {
    const quadrant = (y >= 50 ? 2 : 0) + (x >= 50 ? 1 : 0)
    texture[y * 100 + x] = 65 + quadrant
    colors[y * 100 + x] = palette[quadrant]
  }
}
cube.update_face_fast(5, texture, colors)
cube.next_frame()
const charFrame = new Uint8Array(memory.buffer, cube.chars_ptr(), 7200)
const colorFrame = new Uint32Array(memory.buffer, cube.colors_ptr(), 7200)
for (const [quadrant, x, y] of [
  [0, 45, 22],
  [1, 75, 22],
  [2, 45, 38],
  [3, 75, 38]
]) {
  assert.equal(
    charFrame[y * 120 + x],
    65 + quadrant,
    'Texture coordinates must not be transposed'
  )
  assert.equal(
    colorFrame[y * 120 + x],
    palette[quadrant],
    'Every texture quadrant must receive its color'
  )
}
const stillFrame = charFrame.slice()
cube.next_frame()
assert.deepEqual(
  new Uint8Array(memory.buffer, cube.chars_ptr(), 7200),
  stillFrame,
  'A frozen cube must render identically'
)
texture.fill(88)
colors.fill(0xabcdef)
cube.update_face_fast(5, texture, colors)
cube.next_frame()
assert.equal(
  new Uint8Array(memory.buffer, cube.chars_ptr(), 7200)[30 * 120 + 60],
  88,
  'Animated texture updates must reach the current frame'
)
cube.free()
console.log(
  '100x100 texture mapping, colors, frozen frames and live updates: OK'
)
console.log(JSON.stringify({ frames: 180, affected, holes }))
assert.equal(
  holes,
  0,
  'A solid convex cube must not have empty cells inside a scanline'
)
