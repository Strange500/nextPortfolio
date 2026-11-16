import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const base = process.env.PORTFOLIO_URL || 'http://localhost:3100'
const output =
  process.env.REVIEW_DIR || `${process.env.TMPDIR}/portfolio-scroll-review`
await mkdir(output, { recursive: true })
const errors = [],
  evidence = []
try {
  const page = await browser.newPage()
  page.on('pageerror', e => errors.push(e.message))
  await page.setViewport({ width: 1440, height: 1000 })
  await page.goto(`${base}/en`, { waitUntil: 'networkidle0' })
  assert.equal(
    await page.$$eval('[data-persistent-cube]', e => e.length),
    1,
    'One persistent Rust/WASM cube from arrival'
  )
  await page.waitForSelector('[data-wasm="ready"]')
  await page.evaluate(() => {
    window.originalCube = document.querySelector(
      '[data-persistent-cube] canvas'
    )
  })
  const state = () =>
    page.evaluate(() => {
      const e = document.querySelector('[data-persistent-cube]'),
        r = e.getBoundingClientRect()
      return {
        x: r.x,
        y: r.y,
        width: r.width,
        transform: e.style.transform,
        active: document
          .querySelector('.scene-nav [aria-current]')
          ?.getAttribute('href'),
        same: window.originalCube === e.querySelector('canvas'),
        count: document.querySelectorAll('[data-persistent-cube] canvas')
          .length,
        rotation: e.dataset.rotation
      }
    })
  const scroll = async y => {
    await page.evaluate(
      y => window.scrollTo({ top: y, behavior: 'instant' }),
      y
    )
    // Allow the illustration's 85 ms damping to settle before comparing poses.
    await new Promise(r => setTimeout(r, 650))
  }
  const rustY = await page.$eval(
    '#rust',
    e => e.getBoundingClientRect().top + scrollY
  )
  const initial = await state()
  await scroll(rustY * 0.45)
  const mid = await state()
  await scroll(rustY)
  const rust = await state()
  assert.ok(
    mid.x < initial.x && rust.x < mid.x,
    'First transition moves continuously left'
  )
  assert.ok(
    mid.width > initial.width && rust.width >= mid.width,
    'First transition zooms progressively'
  )
  assert.equal(rust.active, '#rust')
  await scroll(rustY * 0.45)
  const reverse = await state()
  assert.ok(
    Math.abs(reverse.x - mid.x) < 2,
    'Reverse scroll returns to same position'
  )
  evidence.push({ initial, mid, rust, reverse })
  await scroll(rustY)
  const plateau = await state()
  await scroll(rustY + 180)
  assert.ok(
    Math.abs((await state()).x - plateau.x) < 2,
    'Reading plateau keeps cube position stable'
  )
  await page.click('.scene-nav button')
  await new Promise(r => setTimeout(r, 100))
  const stopped = await state()
  await new Promise(r => setTimeout(r, 400))
  assert.equal(
    (await state()).rotation,
    stopped.rotation,
    'Pause freezes autonomous orientation'
  )
  await page.click('.scene-nav button')
  for (const lang of ['en', 'fr']) {
    console.log('language', lang)
    await page.goto(`${base}/${lang}`, { waitUntil: 'networkidle0' })
    await page.waitForSelector('[data-wasm="ready"]')
    await page.evaluate(() => {
      window.originalCube = document.querySelector(
        '[data-persistent-cube] canvas'
      )
    })
    for (const id of [
      'intro',
      'rust',
      'nix',
      'testing',
      'bitcoin',
      'contact',
      'bitcoin',
      'nix',
      'rust'
    ]) {
      await page.click(`.scene-nav a[href="#${id}"]`)
      await page.waitForFunction(
        id =>
          document
            .querySelector('.scene-nav [aria-current]')
            ?.getAttribute('href') === `#${id}`,
        {},
        id
      )
      await new Promise(r => setTimeout(r, 1000))
      const s = await state()
      assert.ok(s.same)
      assert.equal(s.count, 1)
      evidence.push({ lang, id, ...s })
    }
    await page.screenshot({ path: `${output}/${lang}-rust.png` })
    await page.$eval('.scene-nav a[href="#nix"]', e => e.focus())
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () =>
        document
          .querySelector('.scene-nav [aria-current]')
          ?.getAttribute('href') === '#nix'
    )
    await new Promise(r => setTimeout(r, 1200))
    evidence.push({ lang, keyboard: true, ...(await state()) })
    const face = await page.$eval('[data-cube-face]:not([hidden])', e => {
      const b = e.getBoundingClientRect()
      return {
        id: e.dataset.section,
        x: b.x + b.width / 2,
        y: b.y + b.height / 2
      }
    })
    await page.mouse.move(face.x, face.y)
    await page.waitForSelector(
      '[data-persistent-cube][data-hover]:not([data-hover=""])'
    )
    await page.mouse.click(face.x, face.y)
    await page.waitForFunction(
      id =>
        document
          .querySelector('.scene-nav [aria-current]')
          ?.getAttribute('href') === `#${id}`,
      {},
      face.id
    )
    await new Promise(r => setTimeout(r, 1000))
    await page.mouse.move(0, 0)
    await page.mouse.wheel({ deltaY: 180 })
    await new Promise(r => setTimeout(r, 300))
    assert.ok(
      (await state()).same,
      'Face click then manual scroll retains same cube'
    )
    for (const name of [
      'Server',
      'Cube',
      'pi',
      'Clovis',
      'Septimius',
      'Clotaire',
      'installer'
    ]) {
      await page.$eval(`[data-machine="${name}"]`, e => e.click())
      assert.equal(
        await page.$eval('#machine-detail h4', e => e.textContent),
        name
      )
    }
    for (const width of [390, 768, 1440]) {
      await page.setViewport({ width, height: 900 })
      for (const id of ['intro', 'nix', 'testing', 'contact']) {
        await page.click(`.scene-nav a[href="#${id}"]`)
        await new Promise(r => setTimeout(r, 1500))
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth
          ),
          `No overflow ${lang}/${width}/${id}`
        )
        await page.screenshot({ path: `${output}/${lang}-${width}-${id}.png` })
      }
    }
  }
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' }
  ])
  await page.goto(`${base}/en`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('[data-wasm="ready"]')
  const still = await page.$eval('[data-persistent-cube] canvas', e =>
    e.toDataURL()
  )
  await new Promise(r => setTimeout(r, 400))
  assert.equal(
    await page.$eval('[data-persistent-cube] canvas', e => e.toDataURL()),
    still,
    'Reduced-motion raster is frozen'
  )
  await page.click('.scene-nav a[href="#testing"]')
  await page.waitForFunction(
    () =>
      document
        .querySelector('.scene-nav [aria-current]')
        ?.getAttribute('href') === '#testing'
  )
  assert.equal(
    await page.$eval('.scene-nav [aria-current]', e => e.getAttribute('href')),
    '#testing'
  )
  await page.emulateMediaFeatures([])
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(`${base}/en`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('[data-wasm="ready"]')
  for (const target of [
    'intro',
    'rust',
    'nix',
    'testing',
    'bitcoin',
    'contact'
  ]) {
    console.log('face', target)
    await page.click(`.scene-nav a[href="#${target}"]`)
    await new Promise(r => setTimeout(r, 1500))
    const face = await page.$eval(
      `[data-cube-face][data-section="${target}"]`,
      e => {
        if (e.hasAttribute('hidden')) return null
        const points = [...e.querySelector('polygon').points]
        const matrix = e.getScreenCTM()
        const center = new DOMPoint(
          points.reduce((n, p) => n + p.x, 0) / 4,
          points.reduce((n, p) => n + p.y, 0) / 4
        ).matrixTransform(matrix)
        return { x: center.x, y: center.y }
      }
    )
    assert.ok(face, `Target face ${target} is visible at its reading pose`)
    await page.mouse.move(face.x, face.y)
    await page.waitForFunction(
      id =>
        document.querySelector('[data-persistent-cube]').dataset.hover === id,
      {},
      target
    )
    const orientation = await state()
    await new Promise(r => setTimeout(r, 250))
    assert.equal(
      (await state()).rotation,
      orientation.rotation,
      'Hover stops autonomous rotation'
    )
    await page.mouse.click(face.x, face.y)
    evidence.push({ target, faceClick: true })
    await page.mouse.move(0, 0)
  }
  await page.setViewport({ width: 844, height: 390 })
  await page.click('.scene-nav a[href="#nix"]')
  await new Promise(r => setTimeout(r, 1500))
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    ),
    'Landscape resize has no overflow'
  )
  await page.screenshot({ path: `${output}/en-landscape.png` })
  await page.setViewport({ width: 1440, height: 900 })
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await page.click('.scene-nav a[href="#testing"]')
  await new Promise(r => setTimeout(r, 1500))
  await page.screenshot({ path: `${output}/en-dark-testing.png` })
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' }
  ])
  await page.screenshot({ path: `${output}/en-reduced-motion.png` })
  const failed = await browser.newPage()
  await failed.setRequestInterception(true)
  failed.on('request', r =>
    r.url().includes('.wasm') ? r.abort() : r.continue()
  )
  await failed.goto(`${base}/fr`, { waitUntil: 'networkidle0' })
  await failed.waitForSelector('[data-wasm="failed"]')
  assert.ok(await failed.$('#testing-title'))
  assert.ok(await failed.$('a[href="mailto:benjamin.rogetpro@gmail.com"]'))
  assert.deepEqual(errors, [])
  await writeFile(
    `${output}/evidence.json`,
    JSON.stringify(
      {
        result: 'PASS',
        evidence,
        errors,
        wasmFailureFallback: true,
        reducedMotion: true
      },
      null,
      2
    )
  )
  console.log(
    JSON.stringify({
      result: 'PASS',
      output,
      errors,
      checkpoints: evidence.length
    })
  )
} finally {
  await browser.close()
}
