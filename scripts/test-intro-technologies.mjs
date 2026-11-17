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
const distance = (a, b) =>
  a.reduce(
    (s, n, i) =>
      s + Math.abs(Math.atan2(Math.sin(n - b[i]), Math.cos(n - b[i]))),
    0
  )
try {
  const p = await browser.newPage(),
    errors = []
  p.on('pageerror', e => errors.push(e.message))
  await p.setViewport({ width: 1440, height: 1000 })
  await p.goto(`${base}/fr`, { waitUntil: 'networkidle0' })
  await p.waitForSelector('[data-wasm="ready"][data-technology-mode="true"]')
  assert.equal(
    await p.$eval('[data-persistent-cube]', e =>
      Number(e.dataset.technologyCount)
    ),
    17,
    'All existing logo assets decode'
  )
  await p.evaluate(() => {
    window.techChanges = []
    new MutationObserver(records => {
      for (const { target, attributeName } of records)
        if (attributeName === 'data-technology')
          window.techChanges.push({
            name: target.dataset.technology,
            hidden:
              target.hasAttribute('hidden') ||
              getComputedStyle(target).display === 'none'
          })
    }).observe(document.querySelector('.cube-hit-layer'), {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-technology']
    })
  })
  const rotation = () =>
    p.$eval('[data-persistent-cube]', e =>
      e.dataset.rotation.split(',').map(Number)
    )
  const a = await rotation()
  await wait(2000)
  assert.ok(
    distance(a, await rotation()) > 0.4,
    'Intro has a substantial rotation'
  )
  for (let i = 0; i < 4; i++) {
    await wait(4500)
    await p.screenshot({ path: `${output}/intro-${i}.png` })
  }
  const changes = await p.evaluate(() => window.techChanges)
  assert.ok(changes.length >= 3, JSON.stringify(changes))
  assert.ok(
    changes.every(c => c.hidden),
    'Logos only change while the face is hidden'
  )
  const hit = await p.evaluate(() => {
    const area = e => {
      const pts = [...e.querySelector('polygon').points]
      return Math.abs(
        pts.reduce((sum, point, i) => {
          const next = pts[(i + 1) % pts.length]
          return sum + point.x * next.y - next.x * point.y
        }, 0)
      )
    }
    const g = [...document.querySelectorAll('[data-cube-face]:not([hidden])')]
        .filter(e => e.dataset.section !== 'intro')
        .sort((a, b) => area(b) - area(a))[0],
      poly = g.querySelector('polygon'),
      point = new DOMPoint(
        [...poly.points].reduce((s, p) => s + p.x, 0) / 4,
        [...poly.points].reduce((s, p) => s + p.y, 0) / 4
      ).matrixTransform(poly.getScreenCTM())
    return { x: point.x, y: point.y, section: g.dataset.section }
  })
  await p.mouse.move(hit.x, hit.y)
  await wait(100)
  const frozen = await rotation()
  await wait(1200)
  assert.ok(
    distance(frozen, await rotation()) < 0.005,
    'Hover freezes the showcase'
  )
  assert.ok(
    (await p.$eval('.cube-caption', e => e.textContent)).includes('Aller à'),
    'Hover announces the navigation destination'
  )
  await p.mouse.click(hit.x, hit.y)
  await p.waitForFunction(
    id =>
      document.querySelector('.narrative').dataset.step === id &&
      document.querySelector('.narrative').dataset.transitioning === 'false',
    {},
    hit.section
  )
  await p.mouse.move(20, 100)
  await wait(100)
  assert.equal(
    await p.$eval('[data-persistent-cube]', e => e.dataset.technologyMode),
    'false'
  )
  const calm = await rotation()
  await wait(1500)
  assert.ok(
    distance(calm, await rotation()) < 0.15,
    'Sections retain calm motion'
  )
  assert.equal(await p.$$eval('[data-persistent-cube]', es => es.length), 1)
  await p.click('[data-facet-link="intro"]')
  await p.waitForFunction(
    () => document.querySelector('.narrative').dataset.transitioning === 'false'
  )
  await wait(100)
  assert.equal(
    await p.$eval('[data-persistent-cube]', e => e.dataset.technologyMode),
    'true'
  )
  await p.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' }
  ])
  await wait(100)
  const reduced = await rotation()
  await wait(1000)
  assert.ok(distance(reduced, await rotation()) < 0.005)
  assert.ok(
    await p.$eval(
      '#portfolio-technologies',
      e =>
        e.getBoundingClientRect().height > 20 &&
        getComputedStyle(e).position === 'static'
    ),
    'Reduced motion exposes the HTML stack list'
  )
  await p.screenshot({ path: `${output}/reduced.png` })
  await p.emulateMediaFeatures([])
  await p.setViewport({ width: 390, height: 844 })
  await p.goto(`${base}/en`, { waitUntil: 'networkidle0' })
  await p.waitForSelector('[data-wasm="ready"][data-technology-mode="true"]')
  await p.screenshot({ path: `${output}/mobile.png` })
  assert.ok(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  )
  assert.deepEqual(errors, [])
  const result = { result: 'PASS', changes, errors }
  await writeFile(`${output}/evidence.json`, JSON.stringify(result, null, 2))
  console.log(JSON.stringify(result))
} finally {
  await browser.close()
}
