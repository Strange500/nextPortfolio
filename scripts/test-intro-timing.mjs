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
  const page = await browser.newPage(),
    errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.setViewport({ width: 1440, height: 1000 })
  await page.goto(
    `${process.env.PORTFOLIO_URL || 'http://localhost:3100'}/fr`,
    { waitUntil: 'networkidle0' }
  )
  await page.waitForSelector('[data-wasm="ready"]')
  const run = async (id, capture = false) => {
    await page.evaluate(id => {
      const start = performance.now()
      window.introSamples = []
      window.introCoverage = null
      window.dispatchEvent(new CustomEvent('portfolio-step', { detail: id }))
      const sample = () => {
        const cube = document.querySelector('[data-persistent-cube]'),
          r = cube.getBoundingClientRect(),
          time = performance.now() - start
        window.introSamples.push({
          time,
          width: r.width,
          center: r.x + r.width / 2
        })
        if (time > 1150 && time < 1350 && !window.introCoverage) {
          const canvas = cube.querySelector('canvas'),
            ctx = canvas.getContext('2d')
          window.introCoverage = [0.01, 0.25, 0.5, 0.75, 0.99].flatMap(x =>
            [0.01, 0.5, 0.99].map(
              y =>
                ctx.getImageData(
                  Math.floor(x * canvas.width),
                  Math.floor(y * canvas.height),
                  1,
                  1
                ).data[3]
            )
          )
        }
        if (
          document.querySelector('.narrative').dataset.transitioning === 'true'
        )
          requestAnimationFrame(sample)
      }
      requestAnimationFrame(sample)
    }, id)
    if (capture)
      for (const [name, delay] of [
        ['approach', 450],
        ['crossing', 650],
        ['reveal', 650],
        ['reading', 950]
      ]) {
        await new Promise(r => setTimeout(r, delay))
        await page.screenshot({ path: `${output}/${name}.png` })
      }
    await page.waitForFunction(
      () =>
        document.querySelector('.narrative').dataset.transitioning === 'false'
    )
    return page.evaluate(() => ({
      samples: window.introSamples,
      coverage: window.introCoverage
    }))
  }
  const forward = await run('rust', true),
    reverse = await run('intro')
  const reports = [forward, reverse].map(({ samples, coverage }) => {
    const duration = samples.at(-1).time
    assert.ok(
      duration >= 2200 && duration < 4500,
      `Continuous passage duration: ${duration}`
    )
    assert.equal(coverage?.length, 15)
    assert.ok(
      coverage.filter(alpha => alpha === 255).length < 10,
      'The transition leaves the surrounding scene visible'
    )
    for (const t of [650, 900, 1150, 1400, 1650]) {
      const chunk = samples.filter(s => s.time >= t && s.time < t + 250)
      const centers = chunk.map(s => s.center)
      assert.ok(
        Math.max(...centers) - Math.min(...centers) > 10,
        `No parked close-up in ${t}ms window`
      )
    }
    assert.ok(
      Math.max(...samples.map(s => s.width)) <= 641,
      'Zoom stays modest and never fills the screen'
    )
    return {
      duration,
      coverage,
      maximumStage: Math.max(...samples.map(s => s.width))
    }
  })
  await run('rust')
  const ordinary = await run('nix')
  assert.ok(ordinary.samples.at(-1).time < 2000)
  await run('rust')
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' }
  ])
  const reduced = await run('intro')
  assert.ok(reduced.samples.at(-1).time < 300)
  assert.deepEqual(errors, [])
  const result = {
    result: 'PASS',
    reports,
    ordinary: ordinary.samples.at(-1).time,
    reduced: reduced.samples.at(-1).time,
    errors
  }
  await writeFile(`${output}/evidence.json`, JSON.stringify(result, null, 2))
  console.log(JSON.stringify(result))
} finally {
  await browser.close()
}
