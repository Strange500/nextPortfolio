import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const base = process.env.PORTFOLIO_URL || 'http://localhost:3100',
  output = process.env.REVIEW_DIR || '/tmp/portfolio-steps'
await mkdir(output, { recursive: true })
const wait = ms => new Promise(r => setTimeout(r, ms)),
  errors = [],
  evidence = []
try {
  const page = await browser.newPage()
  page.on('pageerror', e => errors.push(e.message))
  const settled = () =>
    page.waitForFunction(
      () =>
        document.querySelector('.narrative')?.dataset.transitioning === 'false'
    )
  const go = async id => {
    await page.evaluate(
      id =>
        window.dispatchEvent(new CustomEvent('portfolio-step', { detail: id })),
      id
    )
    await settled()
    await wait(80)
  }
  for (const [width, height] of [
    [1440, 1000],
    [2560, 720],
    [3440, 1440],
    [390, 844]
  ]) {
    await page.setViewport({ width, height })
    await page.goto(`${base}/fr`, { waitUntil: 'networkidle0' })
    await page.waitForSelector('[data-wasm="ready"]')
    await settled()
    for (const id of [
      'intro',
      'rust',
      'nix',
      'testing',
      'bitcoin',
      'missions',
      'contact'
    ]) {
      await go(id)
      const m = await page.evaluate(id => {
        const el = document.getElementById(id),
          r = el.getBoundingClientRect()
        return {
          id,
          y: r.y,
          height: r.height,
          client: el.clientHeight,
          scroll: el.scrollHeight,
          overflow: document.documentElement.scrollWidth > innerWidth,
          cubes: document.querySelectorAll('[data-persistent-cube]').length
        }
      }, id)
      assert.ok(Math.abs(m.y) < 2, JSON.stringify(m))
      assert.equal(m.height, height)
      assert.equal(m.overflow, false)
      assert.equal(m.cubes, 1)
      assert.ok(
        m.scroll <= m.client + 2,
        `Default chapter should fit: ${JSON.stringify(m)}`
      )
      evidence.push({ width, height, ...m })
      await page.screenshot({ path: `${output}/${width}-${height}-${id}.png` })
    }
  }
  await page.setViewport({ width: 1440, height: 1000 })
  await go('intro')
  await page.mouse.move(20, 500)
  await page.mouse.wheel({ deltaY: 30 })
  await wait(100)
  assert.ok(
    await page.evaluate(() => scrollY < 2),
    'Sub-threshold wheel stays locked'
  )
  await page.mouse.wheel({ deltaY: 80 })
  for (let i = 0; i < 28; i++) {
    await wait(50)
    await page.mouse.wheel({ deltaY: 30 })
  }
  await settled()
  await wait(100)
  assert.equal(await page.$eval('.narrative', e => e.dataset.step), 'rust')
  const y = await page.evaluate(() => scrollY)
  await wait(250)
  assert.equal(await page.evaluate(() => scrollY), y, 'Stable after transition')
  await wait(250)
  await page.mouse.wheel({ deltaY: -120 })
  await settled()
  assert.equal(await page.$eval('.narrative', e => e.dataset.step), 'intro')
  await page.keyboard.press('PageDown')
  await settled()
  assert.equal(await page.$eval('.narrative', e => e.dataset.step), 'rust')
  await page.click('[data-facet-link="contact"]')
  await settled()
  assert.equal(await page.$eval('.narrative', e => e.dataset.step), 'contact')
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' }
  ])
  await go('nix')
  assert.ok(
    await page.$eval('#nix', e => Math.abs(e.getBoundingClientRect().top) < 2)
  )
  await page.setViewport({ width: 1920, height: 1080 })
  await page.waitForFunction(
    () =>
      Math.abs(document.getElementById('nix').getBoundingClientRect().top) < 2
  )
  await settled()
  assert.ok(
    await page.$eval('#nix', e => Math.abs(e.getBoundingClientRect().top) < 2)
  )
  await page.setViewport({ width: 1440, height: 600 })
  await wait(100)
  await settled()
  await go('rust')
  await page.click('#rust .chapter-details > summary')
  const outer = await page.evaluate(() => scrollY)
  await page.mouse.move(1100, 500)
  await wait(250)
  await page.mouse.wheel({ deltaY: 300 })
  await wait(150)
  assert.equal(
    await page.evaluate(() => scrollY),
    outer,
    'Expanded details never move the outer screen'
  )
  assert.ok(await page.$eval('#rust .chapter-details', e => e.open))
  assert.ok(
    await page.$eval('#rust', e => e.scrollTop > 0),
    'Expanded content scrolls inside its chapter'
  )
  const touch = await browser.newPage()
  await touch.setViewport({
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true
  })
  await touch.goto(`${base}/fr#intro`, { waitUntil: 'networkidle0' })
  await touch.waitForSelector('[data-stepped="true"]')
  await touch.waitForFunction(
    () =>
      document.querySelector('.narrative')?.dataset.transitioning === 'false'
  )
  assert.equal(await touch.$eval('.narrative', e => e.dataset.step), 'intro')
  const client = await touch.createCDPSession()
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 30, y: 650 }]
  })
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: 30, y: 400 }]
  })
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: []
  })
  await touch.waitForFunction(
    () =>
      document.querySelector('.narrative')?.dataset.transitioning === 'false'
  )
  assert.equal(
    await touch.$eval('.narrative', e => e.dataset.step),
    'rust',
    'Swipe advances one chapter'
  )
  await touch.goto(`${base}/en#contact`, { waitUntil: 'networkidle0' })
  await touch.waitForFunction(
    () =>
      document.querySelector('.narrative')?.dataset.transitioning === 'false'
  )
  assert.equal(
    await touch.$eval('.narrative', e => e.dataset.step),
    'contact',
    'Direct links restore the chapter'
  )
  assert.ok(
    await touch.$eval(
      '#contact',
      e => Math.abs(e.getBoundingClientRect().top) < 2
    ),
    'Direct link is aligned to the screen'
  )
  assert.deepEqual(errors, [])
  await writeFile(
    `${output}/evidence.json`,
    JSON.stringify({ result: 'PASS', evidence, errors }, null, 2)
  )
  console.log(JSON.stringify({ result: 'PASS', evidence, errors }))
} finally {
  await browser.close()
}
