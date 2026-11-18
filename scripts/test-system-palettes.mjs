import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'
const base = process.env.PORTFOLIO_URL || 'http://localhost:3100',
  output = process.env.REVIEW_DIR || '/tmp/portfolio-palettes'
await mkdir(output, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const colors = {
  light: {
    paper: 'rgb(241, 238, 231)',
    ink: 'rgb(32, 36, 43)',
    accent: 'rgb(47, 83, 215)'
  },
  dark: {
    paper: 'rgb(12, 20, 32)',
    ink: 'rgb(234, 240, 245)',
    accent: 'rgb(120, 198, 224)'
  }
}
const wait = ms => new Promise(r => setTimeout(r, ms)),
  errors = [],
  evidence = []
const luminance = c =>
  c
    .match(/[\d.]+/g)
    .slice(0, 3)
    .map(Number)
    .map(v => v / 255)
    .map(v => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0)
const contrast = (a, b) => {
  const x = luminance(a),
    y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
try {
  const p = await browser.newPage()
  p.on('pageerror', e => errors.push(e.message))
  await p.setViewport({ width: 1440, height: 1000 })
  await p.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'light' }
  ])
  await p.goto(`${base}/fr`, { waitUntil: 'networkidle0' })
  await p.waitForSelector('[data-wasm="ready"]')
  await p.click('.scene-nav button')
  await p.evaluate(
    () =>
      (window.paletteCube = document.querySelector('[data-persistent-cube]'))
  )
  for (const scheme of ['light', 'dark', 'light']) {
    await p.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: scheme },
      { name: 'prefers-reduced-motion', value: 'reduce' }
    ])
    await p.waitForFunction(
      s => document.documentElement.classList.contains(s),
      {},
      scheme
    )
    await wait(100)
    const result = await p.evaluate(() => {
      const s = getComputedStyle(document.querySelector('.narrative')),
        color = token => {
          const el = document.createElement('span')
          el.style.color = s.getPropertyValue(token)
          document.body.append(el)
          const c = getComputedStyle(el).color
          el.remove()
          return c
        }
      const canvas = document.querySelector('[data-persistent-cube] canvas')
      return {
        paper: getComputedStyle(document.body).backgroundColor,
        ink: s.color,
        accent: color('--acid'),
        muted: color('--muted'),
        onAccent: color('--on-accent'),
        cubeInk: color('--cube-ink'),
        canvasInk: canvas.getContext('2d').fillStyle,
        persistent:
          window.paletteCube ===
          document.querySelector('[data-persistent-cube]')
      }
    })
    assert.equal(result.paper, colors[scheme].paper)
    assert.equal(result.ink, colors[scheme].ink)
    assert.equal(result.accent, colors[scheme].accent)
    assert.ok(result.persistent, 'System changes retain the persistent cube')
    for (const [fg, bg] of [
      [result.ink, result.paper],
      [result.muted, result.paper],
      [result.onAccent, result.accent],
      [result.accent, result.paper]
    ])
      assert.ok(contrast(fg, bg) >= 4.5, `${scheme}: ${fg} on ${bg}`)
    assert.equal(
      result.canvasInk,
      result.cubeInk
        .match(/\d+/g)
        .slice(0, 3)
        .map(v => Number(v).toString(16).padStart(2, '0'))
        .join('')
        .replace(/^/, '#'),
      'WASM canvas redraw uses the current theme ink even with reduced motion'
    )
    await p.screenshot({ path: `${output}/${scheme}-intro.png` })
    evidence.push({ scheme, ...result })
  }
  for (const scheme of ['light', 'dark']) {
    await p.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: scheme },
      { name: 'prefers-reduced-motion', value: 'reduce' }
    ])
    await p.waitForFunction(
      s => document.documentElement.classList.contains(s),
      {},
      scheme
    )
    await p.click('[data-facet-link="rust"]')
    await p.waitForFunction(
      () =>
        document.querySelector('.narrative').dataset.transitioning === 'false'
    )
    await p.click('#rust .chapter-details summary')
    await p.screenshot({ path: `${output}/${scheme}-rust.png` })
    await p.click('#rust .chapter-details summary')
    await p.click('[data-facet-link="contact"]')
    await p.waitForFunction(
      () =>
        document.querySelector('.narrative').dataset.transitioning === 'false'
    )
    await p.click('.resume-trigger')
    await p.waitForSelector('.resume-menu')
    assert.equal(
      await p.$eval('.resume-menu', e => getComputedStyle(e).color),
      colors[scheme].ink,
      'Portalled résumé menu follows the palette'
    )
    await p.screenshot({ path: `${output}/${scheme}-contact-menu.png` })
    await p.keyboard.press('Escape')
    await p.setViewport({ width: 390, height: 844 })
    await p.click('[data-facet-link="intro"]')
    await p.waitForFunction(
      () =>
        document.querySelector('.narrative').dataset.transitioning === 'false'
    )
    await p.screenshot({ path: `${output}/${scheme}-mobile.png` })
    assert.ok(
      await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    )
    await p.setViewport({ width: 1440, height: 1000 })
  }
  await p.setViewport({ width: 1440, height: 1000 })
  for (const scheme of ['light', 'dark']) {
    await p.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: scheme },
      { name: 'prefers-reduced-motion', value: 'no-preference' }
    ])
    await p.click('[data-facet-link="intro"]')
    await p.waitForFunction(
      () =>
        document.querySelector('.narrative').dataset.transitioning === 'false'
    )
    await p.waitForFunction(
      s => document.documentElement.classList.contains(s),
      {},
      scheme
    )
    await wait(100)
    await p.screenshot({ path: `${output}/${scheme}-intro-standard.png` })
  }
  // The stylesheet must choose the OS palette before client-side hydration too.
  const nojs = await browser.newPage()
  await nojs.setJavaScriptEnabled(false)
  for (const scheme of ['light', 'dark']) {
    await nojs.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: scheme }
    ])
    await nojs.goto(`${base}/fr`, { waitUntil: 'networkidle0' })
    assert.equal(
      await nojs.evaluate(
        () => getComputedStyle(document.body).backgroundColor
      ),
      colors[scheme].paper,
      'First paint / no-JS system fallback'
    )
  }
  assert.deepEqual(errors, [])
  await writeFile(
    `${output}/evidence.json`,
    JSON.stringify({ result: 'PASS', evidence, errors }, null, 2)
  )
  console.log(
    'PASS: system detection, live theme changes, persistent WASM recoloring, contrast, mobile, portalled menus and no-JS first paint'
  )
} finally {
  await browser.close()
}
