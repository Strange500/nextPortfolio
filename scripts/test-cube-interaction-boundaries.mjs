import assert from 'node:assert/strict'
import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const wait = ms => new Promise(r => setTimeout(r, ms)),
  base = process.env.PORTFOLIO_URL || 'http://localhost:3100'
try {
  const p = await browser.newPage(),
    errors = []
  p.on('pageerror', e => errors.push(e.message))
  await p.setViewport({ width: 1440, height: 1000 })
  await p.goto(`${base}/fr`, { waitUntil: 'networkidle0' })
  await p.waitForSelector('[data-wasm="ready"]')
  const settled = () =>
    p.waitForFunction(
      () =>
        document.querySelector('.narrative').dataset.transitioning === 'false'
    )
  const go = async id => {
    await p.evaluate(
      id =>
        window.dispatchEvent(new CustomEvent('portfolio-step', { detail: id })),
      id
    )
    await settled()
    await wait(120)
  }
  const rotation = () =>
    p.$eval('[data-persistent-cube]', e => e.dataset.rotation)
  const moving = async () => {
    const a = await rotation()
    await wait(650)
    assert.notEqual(
      await rotation(),
      a,
      'Reading cube resumes its gentle rotation'
    )
  }
  const paused = () =>
    p.$eval('.scene-nav button', e => e.getAttribute('aria-pressed'))
  const hit = () =>
    p.evaluate(() => {
      const g = [
          ...document.querySelectorAll('[data-cube-face]:not([hidden])')
        ].sort(
          (a, b) =>
            b.getBoundingClientRect().width * b.getBoundingClientRect().height -
            a.getBoundingClientRect().width * a.getBoundingClientRect().height
        )[0],
        poly = g.querySelector('polygon'),
        pts = [...poly.points],
        q = new DOMPoint(
          pts.reduce((s, p) => s + p.x, 0) / 4,
          pts.reduce((s, p) => s + p.y, 0) / 4
        ).matrixTransform(poly.getScreenCTM())
      return { x: q.x, y: q.y }
    })
  await settled()
  await p.evaluate(() => {
    window.boundaryTransitions = []
    new MutationObserver(records => {
      for (const r of records)
        window.boundaryTransitions.push(r.target.dataset.transitioning)
    }).observe(document.querySelector('.narrative'), {
      attributes: true,
      attributeFilter: ['data-transitioning']
    })
  })
  await p.mouse.move(30, 500)
  await p.mouse.wheel({ deltaY: -250 })
  await wait(350)
  assert.deepEqual(
    await p.evaluate(() => window.boundaryTransitions),
    [],
    'Upward wheel at intro must not start a transition'
  )
  assert.equal(await p.evaluate(() => scrollY), 0)
  assert.equal(
    await p.$eval(
      '[data-persistent-cube]',
      e => e.dataset.technologyFallbackCount
    ),
    '0'
  )
  // Keep the cursor on the manipulated face, then navigate without a pointerleave.
  let h = await hit()
  await p.mouse.move(h.x, h.y)
  await p.mouse.down()
  await p.mouse.move(h.x + 65, h.y + 20, { steps: 12 })
  await p.mouse.up()
  assert.equal(
    await paused(),
    'true',
    'Manipulation temporarily pauses the intro'
  )
  // Browser scrollY rounds to an integer while chapter anchors can be fractional.
  await p.evaluate(
    () =>
      (document.getElementById('intro').style.height = `${innerHeight + 0.5}px`)
  )
  await go('rust')
  assert.equal(await paused(), 'false')
  await moving()
  await p.click('.scene-nav button')
  await go('nix')
  assert.equal(await paused(), 'true', 'Explicit Pause survives navigation')
  const frozen = await rotation()
  await wait(650)
  assert.equal(await rotation(), frozen)
  await p.click('.scene-nav button')
  await moving()
  await go('intro')
  h = await hit()
  await p.mouse.click(h.x, h.y)
  await p.waitForSelector('[data-cube-panel]')
  await go('rust')
  await p.waitForSelector('[data-cube-panel]', { hidden: true })
  assert.equal(await paused(), 'false')
  await moving()
  await go('contact')
  await p.evaluate(() => {
    window.boundaryTransitions = []
  })
  await p.mouse.move(30, 500)
  await p.mouse.wheel({ deltaY: 250 })
  await wait(350)
  assert.deepEqual(
    await p.evaluate(() => window.boundaryTransitions),
    [],
    'Downward wheel at contact must not start a transition'
  )
  // Same release behavior for a real touch gesture.
  await p.setViewport({
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true
  })
  await go('intro')
  h = await hit()
  const client = await p.createCDPSession()
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: h.x, y: h.y }]
  })
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: h.x + 40, y: h.y + 15 }]
  })
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: []
  })
  await go('rust')
  assert.equal(await paused(), 'false')
  await moving()
  assert.deepEqual(errors, [])
  console.log(
    'PASS: no boundary animations, drag/card/touch pauses released on navigation, explicit Pause retained, fractional reading anchors keep rotating'
  )
} finally {
  await browser.close()
}
