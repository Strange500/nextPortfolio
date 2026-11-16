import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const output = process.env.REVIEW_DIR || '/tmp/portfolio-visual-review'
const base = process.env.PORTFOLIO_URL || 'http://localhost:3100'
await mkdir(output, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const consoleErrors = []
const errors = [],
  evidence = [],
  wasm = []
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
try {
  const page = await browser.newPage()
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('response', response => {
    if (response.url().includes('.wasm'))
      wasm.push({
        status: response.status(),
        url: response.url(),
        type: response.headers()['content-type']
      })
  })
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 })
  await page.goto(`${base}/fr`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('[data-wasm="ready"]')
  const fullMotionFrameIntervalsMs = await page.evaluate(async () => {
    const samples = []
    let last = performance.now()
    for (let i = 0; i < 90; i++) {
      await new Promise(requestAnimationFrame)
      const now = performance.now()
      samples.push(now - last)
      last = now
    }
    samples.sort((a, b) => a - b)
    return { median: samples[45], p95: samples[85] }
  })
  evidence.push({ fullMotionFrameIntervalsMs })
  const anchors = await page.evaluate(() =>
    Object.fromEntries(
      ['intro', 'rust', 'nix', 'testing', 'bitcoin', 'contact'].map(id => [
        id,
        id === 'intro'
          ? 0
          : document.getElementById(id).getBoundingClientRect().top + scrollY
      ])
    )
  )
  const scroll = async y => {
    await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y)
    await delay(120)
  }
  const capture = async name => {
    evidence.push(
      await page.evaluate(name => {
        const stage = document.querySelector('[data-persistent-cube]')
        const canvas = stage.querySelector('canvas')
        const r = stage.getBoundingClientRect()
        return {
          name,
          scrollY,
          x: r.x,
          width: r.width,
          backing: canvas.width,
          dpr: devicePixelRatio,
          introOpacity: getComputedStyle(document.querySelector('.hero-copy'))
            .opacity,
          rustOpacity: getComputedStyle(document.getElementById('rust')).opacity
        }
      }, name)
    )
    await page.screenshot({ path: `${output}/${name}.png` })
  }
  for (const [name, p] of [
    ['intro', 0],
    ['approach', 0.2],
    ['close-up', 0.4],
    ['retreat', 0.65],
    ['rust-entry', 0.85],
    ['rust', 1]
  ]) {
    await scroll(anchors.rust * p)
    await capture(name)
  }
  assert.equal(evidence.find(e => e.name === 'close-up').introOpacity, '0')
  assert.equal(evidence.find(e => e.name === 'close-up').rustOpacity, '0')
  for (const id of ['nix', 'testing', 'bitcoin', 'contact']) {
    const index = Object.keys(anchors).indexOf(id)
    const previous = Object.values(anchors)[index - 1]
    await scroll(Math.max(previous + 450, anchors[id] - 750) + 375)
    await capture(`${id}-transition`)
    await scroll(anchors[id])
    if (id === 'testing') await delay(1200)
    await capture(id)
  }
  await scroll(
    await page.$eval('#missions', e => e.getBoundingClientRect().top + scrollY)
  )
  await capture('missions')
  // Capture a traversal, including reverse travel, with the same native scroll
  // positions that drive both the renderer and clickable face polygons.
  await scroll(0)
  if (process.env.RECORD_VIDEO === '1') {
    const recorder = await page.screencast({
      fps: 15,
      scale: 0.75,
      path: `${output}/scroll-journey.webm`,
      ffmpegPath:
        process.env.FFMPEG_PATH ||
        fileURLToPath(new URL('./ffmpeg-preview.sh', import.meta.url))
    })
    const travel = async target =>
      page.evaluate(async target => {
        const startY = scrollY,
          start = performance.now()
        await new Promise(resolve => {
          function frame(time) {
            const p = Math.min(1, (time - start) / 1400)
            scrollTo({
              top: startY + (target - startY) * p,
              behavior: 'instant'
            })
            if (p < 1) requestAnimationFrame(frame)
            else resolve()
          }
          requestAnimationFrame(frame)
        })
      }, target)
    await delay(700)
    for (const target of Object.values(anchors).slice(1)) {
      await travel(target)
      await delay(700)
    }
    await travel(anchors.rust)
    await delay(500)
    await travel(0)
    await recorder.stop()
  }
  await scroll(0)
  await page.click('.scene-nav a[href="#contact"]')
  await delay(80)
  await page.mouse.wheel({ deltaY: -200 })
  await delay(500)
  const interruptedY = await page.evaluate(() => scrollY)
  await delay(250)
  const settledY = await page.evaluate(() => scrollY)
  assert.ok(
    settledY < anchors.contact - 500,
    'Manual wheel interrupts long navigation'
  )
  assert.ok(
    Math.abs(settledY - interruptedY) < 2,
    `Interrupted navigation stays stopped: ${JSON.stringify({ interruptedY, settledY })}`
  )
  evidence.push({
    manualInterruption: { interruptedY, settledY, target: anchors.contact }
  })
  await page.setViewport({ width: 1920, height: 1080 })
  await scroll(0)
  await capture('wide-intro')
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  })
  for (const id of Object.keys(anchors)) {
    await page.$eval(`.scene-nav a[href="#${id}"]`, e => e.click())
    await delay(1300)
    await capture(`mobile-${id}`)
  }
  await page.click('.scene-nav a[href="#rust"]')
  await delay(1300)
  const tap = await page.$eval('[data-cube-face][data-section="rust"]', e => {
    const points = [...e.querySelector('polygon').points]
    const center = new DOMPoint(
      points.reduce((sum, p) => sum + p.x, 0) / 4,
      points.reduce((sum, p) => sum + p.y, 0) / 4
    ).matrixTransform(e.getScreenCTM())
    return { x: center.x, y: center.y, visible: !e.hasAttribute('hidden') }
  })
  assert.ok(tap.visible)
  await page.touchscreen.tap(tap.x, tap.y)
  await delay(200)
  assert.equal(
    await page.$eval('.scene-nav [aria-current]', e => e.getAttribute('href')),
    '#rust'
  )
  evidence.push({ mobileFaceTap: tap })
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' }
  ])
  await page.click('.scene-nav a[href="#rust"]')
  await delay(150)
  await capture('mobile-reduced-rust')
  const frames = await page.evaluate(async () => {
    const samples = []
    let last = performance.now()
    for (let i = 0; i < 90; i++) {
      await new Promise(requestAnimationFrame)
      const now = performance.now()
      samples.push(now - last)
      last = now
    }
    samples.sort((a, b) => a - b)
    return { median: samples[45], p95: samples[85] }
  })
  evidence.push({ reducedMotionFrameIntervalsMs: frames })
  assert.deepEqual(errors, [])
  assert.deepEqual(consoleErrors, [])
  assert.ok(
    wasm.some(r => r.status === 200 && r.type.includes('application/wasm'))
  )
  await writeFile(
    `${output}/visual-evidence.json`,
    JSON.stringify(
      {
        result: 'PASS',
        recording: { fps: 15, scale: 0.75 },
        evidence,
        errors,
        consoleErrors,
        wasm
      },
      null,
      2
    )
  )
  console.log(JSON.stringify({ result: 'PASS', output, errors }))
} finally {
  await browser.close()
}
