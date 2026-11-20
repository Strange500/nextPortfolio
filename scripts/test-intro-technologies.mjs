import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const output = process.env.REVIEW_DIR || '/tmp/portfolio-technologies',
  base = process.env.PORTFOLIO_URL || 'http://localhost:3100'
await mkdir(output, { recursive: true })
const wait = ms => new Promise(r => setTimeout(r, ms))
const errors = []
try {
  const p = await browser.newPage()
  p.on('pageerror', e => errors.push(e.message))
  await p.setViewport({ width: 1440, height: 1000 })
  await p.goto(`${base}/fr`, { waitUntil: 'networkidle0' })
  await p.waitForSelector('[data-wasm="ready"][data-technology-mode="true"]')
  assert.equal(
    await p.$eval('[data-persistent-cube]', e =>
      Number(e.dataset.technologyCount)
    ),
    22
  )
  assert.equal(
    await p.$$eval('[data-cube-face][data-section]', es => es.length),
    0
  )
  const rotation = () =>
    p.$eval('[data-persistent-cube]', e => e.dataset.rotation)
  const a = await rotation()
  await wait(1200)
  assert.notEqual(a, await rotation(), 'Intro rotates')
  const hit = () =>
    p.evaluate(() => {
      const g = [
        ...document.querySelectorAll('[data-cube-face]:not([hidden])')
      ].sort(
        (a, b) =>
          b.getBoundingClientRect().width * b.getBoundingClientRect().height -
          a.getBoundingClientRect().width * a.getBoundingClientRect().height
      )[0]
      const poly = g.querySelector('polygon'),
        pts = [...poly.points]
      const q = new DOMPoint(
        pts.reduce((s, p) => s + p.x, 0) / 4,
        pts.reduce((s, p) => s + p.y, 0) / 4
      ).matrixTransform(poly.getScreenCTM())
      return { x: q.x, y: q.y }
    })
  let h = await hit()
  await p.mouse.move(h.x, h.y)
  await p.mouse.down()
  const before = await rotation()
  await p.mouse.move(h.x + 65, h.y + 25, { steps: 12 })
  await p.mouse.up()
  await wait(150)
  assert.notEqual(before, await rotation(), 'Drag rotates real cube')
  assert.equal(await p.$('[data-cube-panel]'), null, 'Drag does not open card')
  assert.equal(await p.$eval('.narrative', e => e.dataset.step), 'intro')
  h = await hit()
  await p.mouse.click(h.x, h.y)
  await p.waitForSelector('[data-cube-panel]')
  assert.equal(
    await p.$eval('.narrative', e => e.dataset.step),
    'intro',
    'Face click does not navigate'
  )
  await p.keyboard.press('Escape')
  await p.waitForSelector('[data-cube-panel]', { hidden: true })
  await p.click('#cube-explore-trigger')
  assert.equal(
    await p.$$eval('.cube-technology-list button', es => es.length),
    22
  )
  await p.screenshot({ path: `${output}/intro-catalog.png` })
  await p.keyboard.press('Escape')
  for (const [section, pool] of [
    ['rust', ['Rust', 'WebAssembly', 'NextJS', 'React']],
    ['nix', ['NixOS', 'Nix', 'Home Manager', 'Linux']],
    ['testing', ['Java EE', 'Spring Boot', 'Angular', 'Selenium', 'Maven']],
    ['bitcoin', ['Rust', 'Bitcoin', 'Nix']],
    ['contact', []]
  ]) {
    await p.click(`[data-facet-link="${section}"]`)
    await p.waitForFunction(
      id =>
        document.querySelector('.narrative').dataset.step === id &&
        document.querySelector('.narrative').dataset.transitioning === 'false',
      {},
      section
    )
    await wait(150)
    const result = await p.evaluate(() => ({
      context: document.querySelector('[data-persistent-cube]').dataset.context,
      names: [...document.querySelectorAll('[data-cube-face]')].map(
        e => e.dataset.technology
      ),
      labels: [
        ...document.querySelectorAll('[data-face-callout][data-visible="true"]')
      ].length
    }))
    assert.equal(result.context, section)
    if (pool.length)
      assert.ok(
        result.names.every(n => pool.includes(n)),
        JSON.stringify(result)
      )
    assert.ok(result.labels <= 2)
    assert.ok(
      await p.$$eval('[data-face-callout][data-visible="false"]', es =>
        es.every(e => getComputedStyle(e).opacity === '0')
      ),
      'Hidden legends leave no stale labels'
    )
    if (section === 'rust') {
      const sample = () =>
        p.$$eval('[data-face-callout][data-visible="true"]', es =>
          es.map(e => ({
            face: e.dataset.faceCallout,
            y: e.getBoundingClientRect().y
          }))
        )
      const first = await sample()
      await wait(800)
      const second = await sample()
      assert.ok(
        first.some(a =>
          second.some(b => a.face === b.face && Math.abs(a.y - b.y) > 0.1)
        ),
        'Legend positions follow rotating faces'
      )
    }
    if (!pool.length) assert.equal(result.labels, 0)
    await p.screenshot({ path: `${output}/${section}.png` })
  }
  await p.click('[data-facet-link="intro"]')
  await p.waitForFunction(
    () => document.querySelector('.narrative').dataset.transitioning === 'false'
  )
  await p.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' }
  ])
  await wait(150)
  const frozen = await rotation()
  await wait(600)
  assert.equal(await rotation(), frozen)
  await p.$eval('.cube-hit-layer', e => e.focus())
  await p.keyboard.press('ArrowRight')
  await wait(100)
  assert.notEqual(
    await rotation(),
    frozen,
    'Keyboard rotates with reduced motion'
  )
  assert.equal(await p.$eval('.narrative', e => e.dataset.step), 'intro')
  assert.equal(await p.$$eval('[data-persistent-cube]', es => es.length), 1)
  // Native touch and mobile layout have their own suite.
  assert.deepEqual(errors, [])
  await writeFile(
    `${output}/evidence.json`,
    JSON.stringify({ result: 'PASS', errors }, null, 2)
  )
  console.log(
    'PASS: contextual pools, dragging, face inspection, catalog, keyboard, reduced motion, persistent WASM'
  )
} finally {
  await browser.close()
}
