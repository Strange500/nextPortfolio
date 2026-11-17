import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'

const output =
  process.env.REVIEW_DIR || `${process.env.TMPDIR}/portfolio-comfort`
await mkdir(output, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const evidence = []
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.setViewport({ width: 1440, height: 900 })
  await page.evaluateOnNewDocument(() => {
    window.cubeInks = new Set()
    window.cubeLights = new Set()
    const draw = CanvasRenderingContext2D.prototype.fillText
    CanvasRenderingContext2D.prototype.fillText = function (...args) {
      window.cubeInks.add(this.fillStyle)
      if (this.canvas.closest('[data-persistent-cube]'))
        window.cubeLights.add(Math.round(this.globalAlpha * 100))
      return draw.apply(this, args)
    }
  })
  await page.goto(
    `${process.env.PORTFOLIO_URL || 'http://localhost:3100'}/en`,
    { waitUntil: 'networkidle0' }
  )
  await page.waitForSelector('[data-wasm="ready"]')
  for (const dark of [false, true]) {
    await page.evaluate(dark => {
      document.documentElement.classList.toggle('dark', dark)
      // Lighting is applied at draw time, independently of the theme ink.
    }, dark)
    await new Promise(r => setTimeout(r, 250))
    const palette = await page.evaluate(() => {
      const surface = document.querySelector('.narrative')
      const css = getComputedStyle(surface)
      const normalize = value => {
        const ctx = document.createElement('canvas').getContext('2d')
        ctx.fillStyle = value
        return ctx.fillStyle
      }
      return {
        actual: [...window.cubeInks],
        lights: [...window.cubeLights],
        allowed: ['--cube-ink'].map(token => {
          const color = css.getPropertyValue(token).trim()
          if (!color) throw new Error(`Missing palette token ${token}`)
          return normalize(color)
        })
      }
    })
    assert.ok(palette.actual.length > 0)
    assert.ok(
      palette.actual.every(c => palette.allowed.includes(c)) &&
        palette.lights.length >= 3,
      `Faces have distinct lighting; citron is reserved for interaction: ${JSON.stringify(palette)}`
    )
    await page.screenshot({
      path: `${output}/${dark ? 'dark' : 'light'}-intro.png`
    })
    evidence.push({ dark, palette })
  }
  await page.evaluate(() => document.documentElement.classList.remove('dark'))
  await page.mouse.move(10, 10)
  // Native wheel must not be prevented or cause an automatic section snap.
  await page.evaluate(() => {
    window.wheels = []
    window.addEventListener(
      'wheel',
      event => {
        queueMicrotask(() => window.wheels.push(event.defaultPrevented))
      },
      { passive: true }
    )
  })
  const before = await page.evaluate(() => scrollY)
  await page.mouse.wheel({ deltaY: 240 })
  await new Promise(r => setTimeout(r, 500))
  const native = await page.evaluate(() => ({
    y: scrollY,
    wheels: window.wheels
  }))
  assert.ok(
    Math.abs(native.y - before - 240) < 3,
    'Wheel retains native distance'
  )
  assert.deepEqual(native.wheels, [false])
  const stableY = native.y
  await new Promise(r => setTimeout(r, 300))
  assert.equal(
    await page.evaluate(() => scrollY),
    stableY,
    'No delayed scroll snap'
  )
  // An instant scroll must update the pose within two paint frames, then stop.
  // Native wheel input supplies its own intermediate scroll positions.
  const samples = await page.evaluate(async () => {
    const stage = document.querySelector('[data-persistent-cube]')
    const rust =
      document.getElementById('rust').getBoundingClientRect().top + scrollY
    const xs = [stage.getBoundingClientRect().x]
    window.scrollTo({ top: rust, behavior: 'instant' })
    for (let i = 0; i < 36; i++) {
      await new Promise(requestAnimationFrame)
      xs.push(stage.getBoundingClientRect().x)
    }
    return { xs, y: scrollY, rust }
  })
  assert.ok(Math.abs(samples.y - samples.rust) < 1)
  const total = Math.abs(samples.xs.at(-1) - samples.xs[0])
  const steps = samples.xs.slice(1).map((x, i) => Math.abs(x - samples.xs[i]))
  assert.ok(total > 100)
  assert.ok(
    Math.abs(samples.xs[2] - samples.xs.at(-1)) < 1,
    'Pose follows the native scroll within two frames'
  )
  assert.ok(
    steps.slice(2).every(s => s < 1),
    'No position inertia after scroll stops'
  )
  // Reading content is fully visible by the time its title enters the viewport.
  await page.evaluate(() => scrollBy({ top: -150, behavior: 'instant' }))
  await new Promise(r => setTimeout(r, 300))
  assert.equal(await page.$eval('#rust', e => getComputedStyle(e).opacity), '1')
  await page.screenshot({ path: `${output}/light-rust-entry.png` })
  evidence.push({
    native,
    poseSamples: samples,
    maxPoseStep: Math.max(...steps),
    textOpacity: 1
  })
  assert.deepEqual(errors, [])
  await writeFile(
    `${output}/comfort-evidence.json`,
    JSON.stringify({ result: 'PASS', evidence, errors }, null, 2)
  )
  console.log(JSON.stringify({ result: 'PASS', output, errors }))
} finally {
  await browser.close()
}
