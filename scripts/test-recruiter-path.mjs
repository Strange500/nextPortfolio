import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'
const base = process.env.PORTFOLIO_URL || 'http://localhost:3100',
  output = process.env.REVIEW_DIR || '/tmp/portfolio-recruiter'
await mkdir(output, { recursive: true })
const b = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const errors = [],
  wait = ms => new Promise(r => setTimeout(r, ms))
try {
  const p = await b.newPage()
  p.on('pageerror', e => errors.push(e.message))
  for (const lang of ['fr', 'en']) {
    for (const [width, height] of [
      [1440, 1000],
      [1440, 600],
      [390, 844],
      [320, 568]
    ]) {
      await p.setViewport({
        width,
        height,
        isMobile: width < 900,
        hasTouch: width < 900
      })
      await p.goto(`${base}/${lang}`, { waitUntil: 'networkidle0' })
      await p.waitForSelector('[data-wasm="ready"]')
      await p.evaluate(() => document.fonts.ready)
      const firstScreen = await p.evaluate(() => {
        const rect = s => {
          const r = document.querySelector(s).getBoundingClientRect()
          return { top: r.top, bottom: r.bottom, left: r.left, right: r.right }
        }
        return {
          availability: rect('.hero-availability'),
          cv: rect('#intro [data-resume-download]'),
          overflow: document.documentElement.scrollWidth > innerWidth
        }
      })
      assert.equal(firstScreen.overflow, false)
      for (const r of [firstScreen.availability, firstScreen.cv])
        assert.ok(
          r.top >= 0 && r.bottom <= height && r.left >= 0 && r.right <= width,
          JSON.stringify({ lang, width, height, firstScreen })
        )
      if (width >= 900)
        assert.ok(
          (await p.$eval(
            '.hero-case-study',
            e => e.getBoundingClientRect().bottom
          )) <=
            height - 84,
          'Featured case stays above the desktop navigation'
        )
      await p.screenshot({
        path: `${output}/${lang}-${width}-${height}-intro.png`
      })
      await p.click('.hero-actions .solid-link')
      if (width >= 900)
        await p.waitForFunction(
          () =>
            document.querySelector('.narrative').dataset.transitioning ===
            'false'
        )
      else await wait(1000)
      assert.ok(
        await p.$eval(
          '#testing',
          e => Math.abs(e.getBoundingClientRect().top) < 110
        ),
        'Primary CTA reaches the professional experience'
      )
      assert.equal(
        await p.$eval('#testing .chapter-details', e => e.open),
        false
      )
      if (width < 900)
        await p.$eval('.experience-results', e =>
          e.scrollIntoView({ behavior: 'instant', block: 'center' })
        )
      const proof = await p.$eval(
        '.experience-results',
        e => e.getBoundingClientRect().top
      )
      assert.ok(
        proof >= 0 && proof < height,
        'Results are visible without expanding technical details'
      )
      await p.screenshot({
        path: `${output}/${lang}-${width}-${height}-experience.png`
      })
      await Promise.all([
        p.waitForNavigation({ waitUntil: 'networkidle0' }),
        p.click('.experience-overview .text-link')
      ])
      assert.equal(
        new URL(p.url()).pathname,
        `/${lang}/blog/automated-testing-framework`
      )
      assert.equal(
        await p.$eval(
          '.blog-article-header time:last-of-type',
          e => e.dateTime
        ),
        '2026-11-20'
      )
      assert.ok(await p.$('.blog-prose table'))
      await p.waitForFunction(
        () =>
          document.querySelectorAll('.blog-diagram-preview svg').length === 2
      )
      assert.equal(await p.$('[data-diagram-fallback]'), null)
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      )
      await p.screenshot({
        path: `${output}/${lang}-${width}-${height}-article.png`
      })
      await p.goto(`${base}/${lang}#contact`, { waitUntil: 'networkidle0' })
      if (width >= 900)
        await p.waitForFunction(
          () =>
            document.querySelector('.narrative').dataset.transitioning ===
            'false'
        )
      const linkedin = await p.$eval(
        '#contact a[href*="linkedin.com"]',
        e => e.getBoundingClientRect().width
      )
      assert.ok(linkedin > 44)
    }
  }
  assert.deepEqual(errors, [])
  console.log(
    'PASS: recruitment information and CV in first viewport, direct experience CTA, visible results, FR/EN article route and update date, contact, desktop/mobile geometry'
  )
} finally {
  await b.close()
}
