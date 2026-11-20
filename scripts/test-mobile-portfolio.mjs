import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'
const output = process.env.REVIEW_DIR || '/tmp/portfolio-mobile'
await mkdir(output, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const wait = ms => new Promise(r => setTimeout(r, ms)),
  errors = []
try {
  const p = await browser.newPage()
  p.on('pageerror', e => errors.push(e.message))
  for (const [width, height] of [
    [320, 568],
    [360, 640],
    [390, 844],
    [430, 932],
    [844, 390]
  ]) {
    await p.setViewport({ width, height, isMobile: true, hasTouch: true })
    await p.goto(`${process.env.PORTFOLIO_URL || 'http://localhost:3100'}/fr`, {
      waitUntil: 'networkidle0'
    })
    await p.waitForSelector('[data-wasm="ready"]')
    assert.equal(await p.$eval('.narrative', e => e.dataset.stepped), undefined)
    assert.equal(
      await p.$eval('.scene-nav', e => getComputedStyle(e).display),
      'none'
    )
    assert.ok(
      await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    )
    assert.ok(
      await p.$eval(
        '[data-mobile-cube-slot]',
        e => e.getBoundingClientRect().width <= 140
      )
    )
    await p.screenshot({ path: `${output}/${width}-intro.png` })
    // Default browser scrolling must retain intermediate positions, with no snapping.
    await p.evaluate(() => window.scrollTo({ top: 123, behavior: 'instant' }))
    await wait(300)
    assert.equal(await p.evaluate(() => scrollY), 123)
    const client = await p.createCDPSession()
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: width - 20, y: height - 60 }]
    })
    for (let i = 1; i <= 6; i++) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: width - 20, y: height - 60 - i * 20 }]
      })
      await wait(30)
    }
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    })
    await wait(350)
    assert.ok(
      await p.evaluate(() => scrollY > 123),
      'Native touch scroll advances the document'
    )
    await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await p.click('[data-mobile-menu]')
    await p.click('.mobile-portfolio-links a[href="#nix"]')
    await wait(1200)
    assert.ok(
      await p.$eval('#nix', e => Math.abs(e.getBoundingClientRect().top) < 110),
      JSON.stringify(
        await p.$eval('#nix', e => ({
          top: e.getBoundingClientRect().top,
          y: scrollY,
          hash: location.hash
        }))
      )
    )
    assert.equal(
      await p.$eval('.scene-cube', e => getComputedStyle(e).visibility),
      'hidden'
    )
    await p.screenshot({ path: `${output}/${width}-reading.png` })
    await p.evaluate(() =>
      document.getElementById('contact').scrollIntoView({ behavior: 'instant' })
    )
    await p.screenshot({ path: `${output}/${width}-contact.png` })
    assert.ok(
      await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    )
    await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await p.click('#mobile-cube-catalog')
    await p.waitForSelector('[data-cube-panel]')
    await p.keyboard.press('Escape')
    await p.waitForFunction(
      () => document.activeElement.id === 'mobile-cube-catalog'
    )
    if (width === 390) {
      for (const id of ['rust', 'testing', 'bitcoin', 'missions']) {
        await p.evaluate(
          id =>
            document.getElementById(id).scrollIntoView({ behavior: 'instant' }),
          id
        )
        await wait(80)
        await p.screenshot({ path: `${output}/390-${id}.png` })
      }
      await p.evaluate(() => {
        document.querySelector('#nix .chapter-details').open = true
        document.getElementById('nix').scrollIntoView({ behavior: 'instant' })
      })
      await p.screenshot({ path: `${output}/390-nix-expanded.png` })
      assert.ok(
        await p.$eval('#nix', e => e.scrollHeight <= e.clientHeight + 2),
        'Expanded chapter remains in native flow'
      )

      const rotation = () =>
        p.$eval('[data-persistent-cube]', e => e.dataset.rotation)
      const hit = () =>
        p.evaluate(() => {
          const faces = [
            ...document.querySelectorAll('[data-cube-face]:not([hidden])')
          ]
          const g = faces.sort(
            (a, b) =>
              b.getBoundingClientRect().width *
                b.getBoundingClientRect().height -
              a.getBoundingClientRect().width * a.getBoundingClientRect().height
          )[0]
          const poly = g.querySelector('polygon'),
            pts = [...poly.points]
          const point = new DOMPoint(
            pts.reduce((s, p) => s + p.x, 0) / 4,
            pts.reduce((s, p) => s + p.y, 0) / 4
          ).matrixTransform(poly.getScreenCTM())
          return { x: point.x, y: point.y }
        })
      await p.evaluate(() =>
        window.scrollTo({
          top:
            document
              .querySelector('[data-mobile-cube-slot]')
              .getBoundingClientRect().top +
            scrollY -
            300,
          behavior: 'instant'
        })
      )
      await wait(150)
      let h = await hit(),
        before = await rotation(),
        startY = await p.evaluate(() => scrollY)
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [h]
      })
      for (let i = 1; i <= 6; i++) {
        await client.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: h.x + i * 7, y: h.y }]
        })
        if (i < 6) await wait(20)
      }
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: []
      })
      assert.equal(
        await p.evaluate(() => scrollY),
        startY,
        'Horizontal cube gesture does not scroll'
      )
      assert.notEqual(await rotation(), before, 'Touch rotates the real cube')
      before = await rotation()
      await wait(120)
      assert.notEqual(
        await rotation(),
        before,
        'Rotation retains inertia after release'
      )
      await p.click('#mobile-cube-pause')
      assert.equal(
        await p.$eval('#mobile-cube-pause', e =>
          e.getAttribute('aria-pressed')
        ),
        'false'
      )
      h = await hit()
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [h]
      })
      for (let i = 1; i <= 6; i++) {
        await client.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: h.x, y: h.y - i * 20 }]
        })
        await wait(30)
      }
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: []
      })
      await wait(200)
      assert.ok(
        await p.evaluate(y => scrollY > y, startY),
        'Vertical gesture starting on cube scrolls naturally'
      )
      assert.equal(
        await p.$eval('#mobile-cube-pause', e =>
          e.getAttribute('aria-pressed')
        ),
        'false',
        'Native pan restores automatic rotation'
      )
    }
    await client.detach()
  }
  await p.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' },
    { name: 'prefers-color-scheme', value: 'dark' }
  ])
  await p.reload({ waitUntil: 'networkidle0' })
  await p.waitForSelector('[data-wasm="ready"]')
  await p.screenshot({ path: `${output}/dark-reduced.png` })
  // Switching the breakpoint keeps the same renderer and restores desktop navigation.
  await p.evaluate(
    () =>
      (window.originalCube = document.querySelector('[data-persistent-cube]'))
  )
  await p.setViewport({
    width: 1440,
    height: 1000,
    isMobile: true,
    hasTouch: true
  })
  await p.waitForSelector('[data-stepped="true"]')
  assert.ok(
    await p.evaluate(
      () =>
        window.originalCube === document.querySelector('[data-persistent-cube]')
    )
  )
  await p.setViewport({
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true
  })
  await p.waitForFunction(() => !document.querySelector('[data-stepped]'))
  assert.deepEqual(errors, [])
  console.log(
    'PASS: native touch scrolling, intermediate positions, five mobile viewports, anchor menu, inline cube controls, themes, reduced motion and persistent renderer on resize'
  )
} finally {
  await browser.close()
}
