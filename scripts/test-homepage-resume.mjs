import assert from 'node:assert/strict'
import { mkdir, readFile, stat, rm } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'
const base = process.env.PORTFOLIO_URL || 'http://localhost:3100',
  output = process.env.REVIEW_DIR || '/tmp/portfolio-hero-resume'
await mkdir(`${output}/downloads`, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const wait = ms => new Promise(r => setTimeout(r, ms)),
  errors = []
try {
  const p = await browser.newPage()
  p.on('pageerror', e => errors.push(e.message))
  const session = await p.createCDPSession()
  await session.send('Browser.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: `${output}/downloads`
  })
  for (const [lang, width, height] of [
    ['fr', 1440, 1000],
    ['en', 390, 844]
  ]) {
    await p.setViewport({ width, height })
    await p.goto(`${base}/${lang}`, { waitUntil: 'networkidle0' })
    await p.waitForSelector('[data-wasm="ready"]')
    const trigger = '#intro [data-resume-download]'
    const r = await p.$eval(trigger, e => {
      const r = e.getBoundingClientRect()
      return { x: r.x, y: r.y, bottom: r.bottom, right: r.right }
    })
    assert.ok(
      r.y >= 0 && r.bottom <= height - 80 && r.x >= 0 && r.right <= width,
      'Download button is in the first viewport above navigation'
    )
    for (const choice of ['fr', 'en']) {
      await p.click(trigger)
      await p.waitForSelector('.resume-menu')
      const links = await p.$$eval('.resume-menu a', es =>
        es.map(e => ({
          lang: e.lang,
          href: e.getAttribute('href'),
          download: e.download,
          target: e.target
        }))
      )
      assert.equal(links[0].lang, lang, 'Current language comes first')
      const link = links.find(l => l.lang === choice)
      assert.ok(link.download.endsWith(`-${choice}.pdf`))
      assert.equal(link.target, '')
      const path = `${output}/downloads/${link.download}`
      await rm(path, { force: true })
      await p.click(`.resume-menu a[lang="${choice}"]`)
      let complete = false
      for (let i = 0; i < 40; i++) {
        try {
          complete = (await stat(path)).size > 1000
        } catch {}
        if (complete) break
        await wait(100)
      }
      assert.ok(complete, 'Native PDF download completes')
      assert.equal((await readFile(path)).subarray(0, 5).toString(), '%PDF-')
      await p.waitForSelector('.resume-menu', { hidden: true })
      assert.equal(
        await p.$eval('.narrative', e => e.dataset.step),
        'intro',
        'Download does not navigate the scene'
      )
    }
    await p.screenshot({ path: `${output}/${lang}-hero.png` })
    await p.click(trigger)
    await p.waitForSelector('.resume-menu')
    await p.keyboard.press('Escape')
    await p.waitForFunction(() =>
      document.activeElement.matches('#intro [data-resume-download]')
    )
  }
  assert.deepEqual(errors, [])
  console.log(
    'PASS: homepage CV action visible on desktop/mobile, FR/EN ordering, both native PDF downloads, Escape focus and stable intro'
  )
} finally {
  await browser.close()
}
