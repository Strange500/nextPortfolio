import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const base = process.env.PORTFOLIO_URL || 'http://localhost:3100',
  output = process.env.REVIEW_DIR || '/tmp/portfolio-editorial'
await mkdir(output, { recursive: true })
const errors = [],
  wait = ms => new Promise(r => setTimeout(r, ms))
try {
  const p = await b.newPage()
  p.on('pageerror', e => errors.push(e.message))
  for (const lang of ['fr', 'en']) {
    await p.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: lang === 'fr' ? 'light' : 'dark' }
    ])
    for (const [width, height] of [
      [1440, 1000],
      [1024, 768],
      [390, 844]
    ]) {
      await p.setViewport({
        width,
        height,
        isMobile: width < 900,
        hasTouch: width < 900
      })
      await p.goto(`${base}/${lang}`, { waitUntil: 'networkidle0' })
      await p.waitForSelector('[data-wasm="ready"]')
      const ids = await p.$$eval('.scene-nav a', es => es.map(e => e.hash))
      assert.deepEqual(ids, [
        '#intro',
        '#rust',
        '#testing',
        '#nix',
        '#bitcoin',
        '#missions',
        '#contact'
      ])
      const documentOrder = await p.$$eval('.facet-section', es =>
        es.map(e => e.id)
      )
      assert.deepEqual(documentOrder, ['rust', 'testing', 'nix', 'bitcoin'])
      if (width >= 900) {
        const nav = await p.$eval('.scene-nav', e => {
          const r = e.getBoundingClientRect()
          return { left: r.left, right: r.right }
        })
        assert.ok(nav.left >= 0 && nav.right <= width)
        const link = '.scene-nav a[href="#missions"]'
        await p.$eval(link, e => e.focus())
        await p.keyboard.press('Enter')
        await p.waitForFunction(
          () =>
            document.querySelector('.narrative').dataset.transitioning ===
            'false'
        )
        await p.waitForFunction(
          () =>
            document
              .querySelector('.scene-nav [aria-current]')
              ?.getAttribute('href') === '#missions'
        )
        assert.equal(
          await p.$$eval('.scene-nav [aria-current]', es => es.length),
          1
        )
      } else {
        await p.click('[data-mobile-menu]')
        await p.click('.mobile-portfolio-links a[href="#missions"]')
        await wait(1200)
      }
      assert.ok(
        await p.$eval(
          '#missions',
          e => Math.abs(e.getBoundingClientRect().top) < 110
        )
      )
      assert.equal(await p.$$eval('#missions details', es => es.length), 2)
      if (width >= 900)
        await p.waitForFunction(
          () =>
            document.querySelector('[data-persistent-cube]').dataset.context ===
            'missions'
        )
      await p.click('#missions summary')
      const targets = await p.$$eval('#missions .mission-main a', es =>
        es.map(e => e.href)
      )
      assert.deepEqual(targets, [
        'https://github.com/Strange500/RayTracer',
        'https://github.com/Strange500/QGChat'
      ])
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      )
      await p.screenshot({ path: `${output}/${lang}-${width}-projects.png` })
      await p.goto(`${base}/${lang}/blog`, { waitUntil: 'networkidle0' })
      assert.equal(
        await p.$$eval(
          '.blog-feature-link,.blog-post-row > div > a',
          es => es.length
        ),
        3
      )
      const slugs = await p.$$eval(
        '.blog-feature-link,.blog-post-row > div > a',
        es => es.map(e => new URL(e.href).pathname)
      )
      for (const path of slugs) {
        await p.goto(`${base}${path}`, { waitUntil: 'networkidle0' })
        await p.waitForFunction(
          () =>
            document.querySelectorAll('.blog-diagram-placeholder').length === 0
        )
        assert.equal(await p.$('[data-diagram-fallback]'), null)
        assert.equal(await p.$$eval('h1', es => es.length), 1)
        assert.ok(
          await p.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth
          )
        )
        const dates = await p.$$eval('.blog-article-header time', es =>
          es.map(e => e.dateTime)
        )
        assert.equal(dates.at(-1), '2026-11-20')
        await p.screenshot({
          path: `${output}/${lang}-${width}-${path.split('/').at(-1)}.png`
        })
      }
    }
  }
  assert.deepEqual(errors, [])
  console.log(
    'PASS: seven chapter links, reading order, keyboard and touch access to Projects, active state, public source links, FR/EN article diagrams and responsive geometry'
  )
} finally {
  await b.close()
}
