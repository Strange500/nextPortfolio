import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const base = process.env.PORTFOLIO_URL || 'http://localhost:3100',
  output = process.env.REVIEW_DIR || '/tmp/portfolio-first-scroll'
await mkdir(output, { recursive: true })
try {
  const p = await browser.newPage(),
    errors = []
  p.on('pageerror', e => errors.push(e.message))
  await p.setViewport({ width: 1440, height: 1000 })
  await p.goto(`${base}/fr`, { waitUntil: 'networkidle0' })
  await p.waitForSelector('[data-wasm="ready"]')
  await p.evaluate(() => document.fonts.ready)
  const reports = []
  for (const destination of ['rust', 'intro']) {
    await p.evaluate(id => {
      window.firstScrollFrames = []
      window.dispatchEvent(new CustomEvent('portfolio-step', { detail: id }))
      const sample = now => {
        const surface = document.querySelector('.narrative'),
          hero = document.querySelector('.hero-copy'),
          rust = document.getElementById('rust'),
          header = document.querySelector('.portfolio-nav')
        window.firstScrollFrames.push({
          now,
          y: scrollY,
          hero: hero.getBoundingClientRect().top,
          heroOpacity: Number(getComputedStyle(hero).opacity),
          heroVisible:
            getComputedStyle(document.getElementById('intro')).visibility !==
            'hidden',
          rust: rust.querySelector('h2').getBoundingClientRect().top,
          rustOpacity: Number(getComputedStyle(rust).opacity),
          rustVisible: getComputedStyle(rust).visibility !== 'hidden',
          header: header.getBoundingClientRect().top,
          headerOpacity: Number(getComputedStyle(header).opacity),
          headerVisible: getComputedStyle(header).visibility !== 'hidden'
        })
        if (surface.dataset.transitioning === 'true')
          requestAnimationFrame(sample)
      }
      requestAnimationFrame(sample)
    }, destination)
    await p.waitForFunction(
      () =>
        document.querySelector('.narrative').dataset.transitioning === 'false'
    )
    const frames = await p.evaluate(() => window.firstScrollFrames)
    const report = { destination, frames: frames.length }
    for (const name of ['hero', 'rust', 'header']) {
      const visible = frames.filter(
        f =>
          f[name + 'Visible'] &&
          f[name + 'Opacity'] > 0.08 &&
          f[name] >= -1 &&
          f[name] < 1000
      )
      assert.ok(
        visible.length > 3,
        `${destination}: enough visible ${name} frames`
      )
      const drift =
        Math.max(...visible.map(f => f[name])) -
        Math.min(...visible.map(f => f[name]))
      assert.ok(
        drift <= 1,
        `${destination} ${name} drifted ${drift}px; scroll and compensation must paint together`
      )
      report[name + 'Drift'] = drift
    }
    reports.push(report)
  }
  assert.deepEqual(errors, [])
  await writeFile(
    `${output}/evidence.json`,
    JSON.stringify({ result: 'PASS', reports, errors }, null, 2)
  )
  console.log(JSON.stringify({ result: 'PASS', reports, errors }))
} finally {
  await browser.close()
}
