import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'

const base = process.env.PORTFOLIO_URL || 'http://localhost:3100'
const output = process.env.REVIEW_DIR || '/tmp/portfolio-design-review'
await mkdir(output, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const errors = [],
  evidence = []
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
try {
  const page = await browser.newPage()
  page.on('pageerror', error => errors.push(error.message))
  const jump = async id => {
    await page.evaluate(
      id =>
        scrollTo({
          top:
            id === 'intro'
              ? 0
              : document.getElementById(id).getBoundingClientRect().top +
                scrollY,
          behavior: 'instant'
        }),
      id
    )
    await delay(150)
  }
  for (const lang of ['fr', 'en']) {
    await page.setViewport({ width: 1440, height: 1000 })
    await page.goto(`${base}/${lang}`, { waitUntil: 'networkidle0' })
    await page.waitForSelector('[data-wasm="ready"]')
    assert.match(
      await page.$eval('.hero-copy .eyebrow', e => e.textContent),
      /BENJAMIN ROGET/
    )
    assert.equal(
      await page.$eval('[data-language-switch]', e => e.textContent.trim()),
      lang === 'fr' ? 'EN' : 'FR'
    )
    assert.equal(
      await page.$eval('[data-theme-toggle]', e => getComputedStyle(e).display),
      'none'
    )
    assert.equal(await page.$eval('main', e => e.lang), lang)
    const type = await page.evaluate(() =>
      Object.fromEntries(
        ['.section-intro', '.proof-item p', '.source-note', '.text-link'].map(
          selector => [
            selector,
            parseFloat(
              getComputedStyle(document.querySelector(selector)).fontSize
            )
          ]
        )
      )
    )
    assert.ok(
      type['.section-intro'] >= 16 &&
        type['.proof-item p'] >= 14 &&
        type['.source-note'] >= 12 &&
        type['.text-link'] >= 13,
      'Useful text must remain readable'
    )
    await jump('missions')
    assert.equal(await page.$$eval('details.mission[open]', e => e.length), 0)
    await page.$eval('details.mission summary', e => e.focus())
    await page.keyboard.press('Enter')
    assert.equal(await page.$$eval('details.mission[open]', e => e.length), 1)
    assert.ok(
      await page.$eval(
        'details.mission[open] .mission-main',
        e => e.getBoundingClientRect().height > 100
      )
    )
    await page.screenshot({ path: `${output}/${lang}-mission-open.png` })
    await page.$eval('details.mission:nth-of-type(2) summary', e => e.focus())
    await page.keyboard.press('Enter')
    assert.equal(
      await page.$$eval('details.mission[open]', e => e.length),
      1,
      'Native grouped disclosures keep the work scannable'
    )
    await page.$$eval('details.mission', nodes =>
      nodes.forEach(e => (e.open = false))
    )
    await jump('contact')
    await page.click('.resume-trigger')
    await page.waitForSelector('.resume-menu')
    const menu = await page.$eval('.resume-menu', e => {
      const r = e.getBoundingClientRect(),
        css = getComputedStyle(e)
      return {
        x: r.x,
        right: r.right,
        bottom: r.bottom,
        width: innerWidth,
        height: innerHeight,
        background: css.backgroundColor,
        color: css.color
      }
    })
    assert.ok(
      menu.x >= 0 && menu.right <= menu.width && menu.bottom <= menu.height
    )
    assert.equal(menu.background, 'rgb(29, 40, 33)')
    assert.equal(
      await page.$$eval('.resume-menu [role="menuitem"]', e => e.length),
      2
    )
    await delay(180)
    await page.screenshot({ path: `${output}/${lang}-contact-menu.png` })
    await page.keyboard.press('Escape')
    await page.waitForFunction(
      () => document.querySelector('.resume-trigger') === document.activeElement
    )
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      await page.setViewport({ width, height: 900 })
      for (const id of [
        'intro',
        'rust',
        'nix',
        'testing',
        'missions',
        'contact'
      ]) {
        await jump(id)
        const bounds = await page.evaluate(() => {
          const nav = document
            .querySelector('.scene-nav')
            .getBoundingClientRect()
          const links = [...document.querySelectorAll('.scene-nav a')].map(
            e => {
              const r = e.getBoundingClientRect()
              return { x: r.x, right: r.right, height: r.height }
            }
          )
          const metrics = [
            ...document.querySelectorAll('.proof-item strong')
          ].map(e => ({ width: e.scrollWidth, available: e.clientWidth }))
          return {
            width: innerWidth,
            overflow: document.documentElement.scrollWidth > innerWidth,
            nav: { top: nav.top, bottom: nav.bottom, height: nav.height },
            links,
            metrics
          }
        })
        if (id === 'testing')
          assert.deepEqual(
            await page.$$eval('[data-counter]', nodes =>
              nodes.map(e => e.textContent.trim())
            ),
            ['50–70', '≈70%', '4h → <10m', '≈40'],
            'Published values remain stable when entering the proof section'
          )
        assert.equal(
          bounds.overflow,
          false,
          `${lang}/${width}/${id} horizontal overflow`
        )
        assert.ok(
          bounds.links.every(
            r => r.x >= 0 && r.right <= width && r.height >= 44
          ),
          'All hidden-face navigation links stay in the viewport'
        )
        assert.ok(
          bounds.metrics.every(r => r.width <= r.available + 1),
          `Proof metrics fit their column at ${width}`
        )
        if (width < 900)
          assert.ok(
            bounds.nav.height <= 64,
            'Mobile navigation leaves room to read'
          )
        if (id === 'rust' && width < 900)
          assert.ok(
            await page.$eval(
              '#rust h2',
              e => e.getBoundingClientRect().top >= 220
            ),
            'Reading title clears the pinned mobile scene'
          )
        if (id === 'contact' && width === 390) {
          await page.click('.resume-trigger')
          await page.waitForSelector('.resume-menu')
          await delay(180)
          assert.ok(
            await page.$eval('.resume-menu', e => {
              const r = e.getBoundingClientRect()
              return (
                r.x >= 0 &&
                r.right <= innerWidth &&
                r.y >= 0 &&
                r.bottom <= innerHeight
              )
            }),
            'Mobile CV menu stays within the viewport'
          )
          await page.screenshot({
            path: `${output}/${lang}-mobile-cv-menu.png`
          })
          await page.keyboard.press('Escape')
          await page.waitForFunction(
            () =>
              document.querySelector('.resume-trigger') ===
              document.activeElement
          )
        }
        if ([320, 390, 1440].includes(width))
          await page.screenshot({
            path: `${output}/${lang}-${width}-${id}.png`
          })
      }
      evidence.push({ lang, width, readable: true, navAccessible: true })
    }
  }
  await page.setViewport({ width: 390, height: 844 })
  await page.goto(`${base}/fr`, { waitUntil: 'networkidle0' })
  await page.click('[data-language-switch]')
  await page.waitForFunction(
    () => location.pathname === '/en' && document.documentElement.lang === 'en'
  )
  await page.waitForFunction(() => document.title.includes('Software'))
  for (const path of ['/resume.pdf', '/resume-fr.pdf']) {
    const response = await fetch(`${base}${path}`, { method: 'HEAD' })
    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type'), /application\/pdf/)
  }
  assert.deepEqual(errors, [])
  await writeFile(
    `${output}/design-evidence.json`,
    JSON.stringify({ result: 'PASS', evidence, errors }, null, 2)
  )
  console.log(JSON.stringify({ result: 'PASS', output, errors }))
} finally {
  await browser.close()
}
