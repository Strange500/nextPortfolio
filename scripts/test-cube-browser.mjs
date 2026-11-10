// Real Chromium smoke test. Set CHROME_PATH to an installed Chrome/Chromium.
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'

assert.ok(
  process.env.CHROME_PATH,
  'Set CHROME_PATH to a real Chrome/Chromium executable'
)
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
try {
  const page = await browser.newPage()
  // The portfolio intentionally hides the cube below its lg breakpoint.
  await page.setViewport({ width: 1440, height: 1200 })
  if (process.env.CUBE_THEME === 'dark') {
    await page.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: 'dark' }
    ])
  }
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.evaluateOnNewDocument(() => {
    // Put the video on an initial face, exercising its texture upload too.
    Math.random = () => 0
    const state = (window.__cubeProbe = {
      frames: [],
      textures: [],
      videoFrames: 0
    })
    const proto = CanvasRenderingContext2D.prototype
    const originalClear = proto.clearRect
    const originalFill = proto.fillText
    const originalRead = proto.getImageData
    const originalDraw = proto.drawImage
    let cells = new Set()
    proto.clearRect = function (...args) {
      if (this.canvas.matches('canvas.cursor-grab')) {
        if (cells.size) {
          let holes = 0
          for (let y = 0; y < 60; y++) {
            const xs = [...cells]
              .filter(index => Math.floor(index / 120) === y)
              .map(index => index % 120)
            if (!xs.length) continue
            for (let x = Math.min(...xs); x < Math.max(...xs); x++) {
              if (!cells.has(y * 120 + x)) holes++
            }
          }
          state.frames.push({ cells: cells.size, holes })
        }
        cells = new Set()
      }
      return originalClear.apply(this, args)
    }
    proto.fillText = function (text, x, y, ...args) {
      if (this.canvas.matches('canvas.cursor-grab'))
        cells.add((y / 16) * 120 + x / 8)
      return originalFill.call(this, text, x, y, ...args)
    }
    proto.getImageData = function (...args) {
      // Texture canvases are detached; exclude the unrelated background canvas.
      if (!this.canvas.isConnected) state.textures.push(args.slice(2, 4))
      return originalRead.apply(this, args)
    }
    proto.drawImage = function (source, ...args) {
      if (source instanceof HTMLVideoElement) state.videoFrames++
      return originalDraw.call(this, source, ...args)
    }
  })
  await page.goto(process.env.CUBE_URL || 'http://127.0.0.1:3100/en', {
    waitUntil: 'networkidle0'
  })
  await page.waitForFunction(
    () =>
      window.__cubeProbe.frames.length >= 180 &&
      window.__cubeProbe.videoFrames > 0,
    { timeout: 60000 }
  )
  const canvas = await page.$('canvas.cursor-grab')
  assert.ok(canvas, 'Cube canvas is present')
  await canvas.scrollIntoView()
  if (process.env.CUBE_SCREENSHOTS) {
    await mkdir(process.env.CUBE_SCREENSHOTS, { recursive: true })
    for (let i = 0; i < 8; i++) {
      await canvas.screenshot({
        path: `${process.env.CUBE_SCREENSHOTS}/cube-${i}.png`
      })
      await new Promise(resolve => setTimeout(resolve, 180))
    }
  }
  // Exercise pointer rotation, release/inertia, and the 2s logo cycling timer.
  const box = await canvas.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    box.x + box.width / 2 + 80,
    box.y + box.height / 2 + 40,
    { steps: 20 }
  )
  await page.mouse.up()
  await new Promise(resolve => setTimeout(resolve, 5000))
  const probe = await page.evaluate(() => window.__cubeProbe)
  const result = {
    browser: await browser.version(),
    theme: await page.evaluate(() =>
      document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    ),
    frames: probe.frames.length,
    holes: probe.frames.reduce((sum, frame) => sum + frame.holes, 0),
    minCells: Math.min(...probe.frames.map(frame => frame.cells)),
    videoFrames: probe.videoFrames,
    textureSizes: [...new Set(probe.textures.map(size => size.join('x')))],
    errors
  }
  console.log(JSON.stringify(result, null, 2))
  assert.ok(result.frames >= 180)
  assert.equal(
    result.holes,
    0,
    'No disappearing cells inside the rendered cube'
  )
  assert.ok(result.minCells > 100, 'No blank frame')
  assert.ok(result.videoFrames > 0, 'Video path exercised')
  assert.deepEqual(
    result.textureSizes,
    ['100x100'],
    'Static and video textures match WASM'
  )
  assert.deepEqual(errors, [], 'No browser errors')
} finally {
  await browser.close()
}
