import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'
const output = process.env.REVIEW_DIR || '/tmp/portfolio-intro-timing'
await mkdir(output, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.setViewport({ width: 1440, height: 1000 })
  await page.goto(
    `${process.env.PORTFOLIO_URL || 'http://localhost:3100'}/fr`,
    { waitUntil: 'networkidle0' }
  )
  await page.waitForSelector('[data-wasm="ready"]')
  const run = async (id, captures = false) => {
    await page.evaluate(id => {
      const start = performance.now()
      window.introSamples = []
      window.dispatchEvent(new CustomEvent('portfolio-step', { detail: id }))
      const sample = () => {
        const r = document
          .querySelector('[data-persistent-cube]')
          .getBoundingClientRect()
        window.introSamples.push({
          time: performance.now() - start,
          width: r.width,
          x: r.x,
          y: r.y
        })
        if (
          document.querySelector('.narrative').dataset.transitioning === 'true'
        )
          requestAnimationFrame(sample)
      }
      requestAnimationFrame(sample)
    }, id)
    if (captures) {
      for (const [name, delay] of [
        ['approach', 500],
        ['close-up', 550],
        ['retreat', 900],
        ['reading', 1000]
      ]) {
        await new Promise(r => setTimeout(r, delay))
        await page.screenshot({ path: `${output}/${name}.png` })
      }
    }
    await page.waitForFunction(
      () =>
        document.querySelector('.narrative').dataset.transitioning === 'false'
    )
    return page.evaluate(() => window.introSamples)
  }
  const forward = await run('rust', true)
  const reverse = await run('intro')
  const reports = [forward, reverse].map(samples => {
    const max = Math.max(...samples.map(s => s.width))
    const peak = samples.filter(
      s => s.width >= max * 0.995 && Math.abs(s.x + s.width / 2 - 720) < 3
    )
    const duration = samples.at(-1).time
    const hold = peak.at(-1).time - peak[0].time
    assert.ok(
      duration >= 2500 && duration < 5500,
      `First transition duration: ${duration}`
    )
    assert.ok(hold >= 500, `Close-up is readable for at least 500ms: ${hold}`)
    assert.ok(max > Math.min(samples[0].width, samples.at(-1).width) * 1.5)
    return { duration, hold, max }
  })
  await run('rust')
  const ordinary = await run('nix')
  assert.ok(
    ordinary.at(-1).time < 2000,
    'Later transitions retain their shorter rhythm'
  )
  await run('rust')
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' }
  ])
  const reduced = await run('intro')
  assert.ok(reduced.at(-1).time < 300, 'Reduced motion skips the animation')
  assert.deepEqual(errors, [])
  const result = {
    result: 'PASS',
    reports,
    ordinary: ordinary.at(-1).time,
    reduced: reduced.at(-1).time,
    errors
  }
  await writeFile(`${output}/evidence.json`, JSON.stringify(result, null, 2))
  console.log(JSON.stringify(result))
} finally {
  await browser.close()
}
