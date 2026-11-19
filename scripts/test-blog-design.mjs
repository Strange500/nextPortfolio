import assert from 'node:assert/strict'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import matter from 'gray-matter'
import puppeteer from 'puppeteer-core'
const base = process.env.PORTFOLIO_URL || 'http://localhost:3100',
  output = process.env.REVIEW_DIR || '/tmp/blog-review'
await mkdir(output, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const wait = ms => new Promise(r => setTimeout(r, ms)),
  errors = [],
  evidence = []
try {
  const p = await browser.newPage()
  p.on('pageerror', e => errors.push(e.message))
  await p.setCacheEnabled(false)
  const fits = async () =>
    assert.ok(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1
      ),
      'No page-wide horizontal overflow'
    )
  for (const lang of ['fr', 'en']) {
    const files = (await readdir(`data/posts/${lang}`)).filter(f =>
      f.endsWith('.mdx')
    )
    const posts = await Promise.all(
      files.map(async file => ({
        slug: file.replace('.mdx', ''),
        ...matter(await readFile(`data/posts/${lang}/${file}`, 'utf8')).data
      }))
    )
    for (const scheme of ['dark', 'light']) {
      await p.setViewport({ width: 1440, height: 1000 })
      await p.emulateMediaFeatures([
        { name: 'prefers-color-scheme', value: scheme }
      ])
      assert.equal(
        (
          await p.goto(`${base}/${lang}/blog`, { waitUntil: 'networkidle0' })
        ).status(),
        200
      )
      await p.waitForSelector('[data-cube-constellation][data-frames]')
      assert.equal(await p.$$eval('h1', es => es.length), 1)
      assert.equal(
        await p.$$eval(
          '.blog-feature-link,.blog-post-row > div > a',
          es => es.length
        ),
        posts.length
      )
      const latest = [...posts].sort((a, b) => b.date.localeCompare(a.date))[0]
      assert.ok(
        (await p.$eval('.blog-feature-link', e => e.href)).endsWith(latest.slug)
      )
      assert.ok(
        await p.$eval('.blog-skip', e => e.getBoundingClientRect().bottom <= 0),
        'Skip link stays offscreen until focused'
      )
      assert.equal(
        await p.$eval('.blog-header', e => e.getBoundingClientRect().y),
        0,
        'Background never occupies document flow'
      )
      await fits()
      await p.screenshot({ path: `${output}/${lang}-${scheme}-index.png` })
      const start = await p.$eval('[data-cube-constellation]', e =>
        Number(e.dataset.frames)
      )
      await wait(400)
      assert.ok(
        await p.$eval(
          '[data-cube-constellation]',
          (e, n) => Number(e.dataset.frames) > n,
          start
        ),
        'Constellation rotates'
      )
      await p.evaluate(() => scrollTo(0, 1000))
      await wait(300)
      const paused = await p.$eval(
        '[data-cube-constellation]',
        e => e.dataset.frames
      )
      await wait(250)
      assert.equal(
        await p.$eval('[data-cube-constellation]', e => e.dataset.frames),
        paused,
        'Offscreen animation stops'
      )
      for (const post of posts) {
        assert.equal(
          (
            await p.goto(`${base}/${lang}/blog/${post.slug}`, {
              waitUntil: 'networkidle0'
            })
          ).status(),
          200
        )
        assert.equal(await p.$eval('h1', e => e.textContent), post.title)
        assert.equal(
          await p.$$eval('h1', es => es.length),
          1,
          'One document title'
        )
        const outline = await p.$$eval(
          '.blog-toc a[href^="#"]:not(.blog-toc-top)',
          es =>
            es.map(e => ({
              id: decodeURIComponent(e.hash.slice(1)),
              text: e.textContent
            }))
        )
        assert.ok(outline.length > 2, 'Compiled article outline exists')
        assert.ok(
          await p.evaluate(
            outline =>
              outline.every(
                h => document.getElementById(h.id)?.textContent === h.text
              ),
            outline
          ),
          'Every outline link matches an actual heading'
        )
        assert.equal(new Set(outline.map(h => h.id)).size, outline.length)
        assert.equal(
          await p.$eval(
            '[data-cube-constellation]',
            e => getComputedStyle(e).position
          ),
          'fixed'
        )
        assert.equal(
          await p.$eval('.blog-header', e => e.getBoundingClientRect().y),
          0
        )
        await fits()
        if (post.slug === 'nixos-2026-reproducible') {
          assert.ok(
            await p.$('.blog-prose table'),
            'GFM tables render semantically'
          )
          await p.waitForSelector('.blog-diagram-preview svg', {
            timeout: 30000
          })
          assert.equal(await p.$('[data-diagram-fallback]'), null)
          await p.click('.blog-diagram button')
          await p.waitForSelector('[role="dialog"]')
          await p.keyboard.press('Escape')
          await p.waitForSelector('[role="dialog"]', { hidden: true })
          await p.evaluate(() => scrollTo(0, 0))
          await p.screenshot({
            path: `${output}/${lang}-${scheme}-article.png`
          })
        }
        evidence.push({
          lang,
          scheme,
          slug: post.slug,
          headings: outline.length
        })
      }
    }
  }
  await p.setViewport({
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true
  })
  for (const scheme of ['light', 'dark']) {
    await p.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: scheme }
    ])
    await p.goto(`${base}/fr/blog`, { waitUntil: 'networkidle0' })
    await fits()
    await p.screenshot({ path: `${output}/mobile-${scheme}-index.png` })
    await p.goto(`${base}/fr/blog/nixos-2026-reproducible`, {
      waitUntil: 'networkidle0'
    })
    await fits()
    assert.equal(
      await p.$eval('.blog-toc', e => getComputedStyle(e).display),
      'none'
    )
    assert.equal(
      await p.$eval(
        '[data-cube-constellation]',
        e => getComputedStyle(e).display
      ),
      'none',
      'No moving article decoration on mobile'
    )
    await p.click('.blog-mobile-toc summary')
    const first = await p.$eval('.blog-mobile-toc a', e =>
      e.getAttribute('href')
    )
    await p.click('.blog-mobile-toc a')
    assert.equal(await p.evaluate(() => location.hash), first)
    await p.evaluate(() => scrollTo(0, 0))
    await p.screenshot({ path: `${output}/mobile-${scheme}-article.png` })
  }
  for (const [width, height] of [
    [2560, 1080],
    [5120, 1440],
    [844, 390]
  ]) {
    await p.setViewport({ width, height, deviceScaleFactor: 2 })
    await p.goto(`${base}/en/blog/nixos-2026-reproducible`, {
      waitUntil: 'networkidle0'
    })
    await fits()
    assert.ok(
      await p.$eval(
        '[data-cube-constellation]',
        e => e.width <= 4096 && e.height <= 2160
      ),
      'Decorative canvas backing is bounded'
    )
    assert.ok(
      await p.$eval(
        '.blog-reading-column',
        e => e.getBoundingClientRect().width <= 780
      ),
      'Ultrawide preserves reading measure'
    )
  }
  await p.setViewport({ width: 1440, height: 1000 })
  await p.goto(`${base}/en/blog`, { waitUntil: 'networkidle0' })
  await p.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' },
    { name: 'prefers-color-scheme', value: 'dark' }
  ])
  await wait(300)
  const frozen = await p.$eval(
    '[data-cube-constellation]',
    e => e.dataset.frames
  )
  await wait(300)
  assert.equal(
    await p.$eval('[data-cube-constellation]', e => e.dataset.frames),
    frozen,
    'Reduced motion is static'
  )
  await p.keyboard.press('Tab')
  assert.ok(
    await p.evaluate(() => document.activeElement.matches('.blog-skip'))
  )
  await p.keyboard.press('Enter')
  assert.equal(await p.evaluate(() => document.activeElement.id), 'blog-main')
  await p.click('[data-theme-toggle]')
  await p.waitForSelector('[data-theme-choice="light"]')
  await p.click('[data-theme-choice="light"]')
  await p.waitForFunction(() =>
    document.documentElement.classList.contains('light')
  )
  await p.goto(`${base}/fr/blog/ascii-cube-journey`, {
    waitUntil: 'networkidle0'
  })
  await p.click('[data-language-switch]')
  await p.waitForFunction(
    () => location.pathname === '/en/blog/ascii-cube-journey'
  )
  await p.click('.blog-brand')
  await p.waitForSelector('[data-wasm="ready"]')
  assert.equal(
    await p.$('[data-cube-constellation]'),
    null,
    'Homepage retains its own persistent WASM cube'
  )
  assert.deepEqual(errors, [])
  await writeFile(
    `${output}/evidence.json`,
    JSON.stringify({ result: 'PASS', evidence, errors }, null, 2)
  )
  console.log(
    JSON.stringify({ result: 'PASS', articles: evidence.length, errors })
  )
} finally {
  await browser.close()
}
