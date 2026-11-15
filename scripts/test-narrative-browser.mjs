import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const base = process.env.PORTFOLIO_URL || 'http://localhost:3100'
const output =
  process.env.REVIEW_DIR ||
  '/opt/data/profiles/developer/cache/scratch/portfolio-review'
await mkdir(output, { recursive: true })
const errors = []
try {
  const page = await browser.newPage()
  page.on('pageerror', e => errors.push(e.message))
  for (const lang of ['en', 'fr']) {
    await page.setViewport({ width: 1440, height: 1000 })
    await page.goto(`${base}/${lang}`, { waitUntil: 'networkidle0' })
    assert.equal(await page.$('#canvas'), null, 'No hidden animated background on the editorial homepage')
    assert.equal(
      await page.$$eval('[data-facet]', e => e.length),
      4,
      'Four narrative facets'
    )
    assert.equal(
      await page.$$eval('[data-machine]', e => e.length),
      7,
      'Seven explorable targets'
    )
    for (const id of ['rust', 'nix', 'testing', 'bitcoin']) {
      console.log('facet', lang, id)
      await page.click(`[data-facet-link="${id}"]`)
      await page.waitForFunction(
        id =>
          Math.abs(
            document.getElementById(id).getBoundingClientRect().top - 32
          ) < 3,
        {},
        id
      )
      await page.waitForFunction(
        id =>
          document
            .querySelector(`[data-facet-link="${id}"]`)
            ?.getAttribute('aria-current') === 'step',
        {},
        id
      )
    }
    for (const name of [
      'Server',
      'Cube',
      'pi',
      'Clovis',
      'Septimius',
      'Clotaire',
      'installer'
    ]) {
      await page.$eval(`[data-machine="${name}"]`, el => el.click())
      assert.equal(
        await page.$eval('#machine-detail h4', el => el.textContent),
        name
      )
      assert.equal(
        await page.$eval(`[data-machine="${name}"]`, el =>
          el.getAttribute('aria-pressed')
        ),
        'true'
      )
    }
    await page.$eval('[data-machine="Server"]', el => el.focus())
    await page.keyboard.press('Enter')
    assert.equal(
      await page.$eval('#machine-detail h4', el => el.textContent),
      'Server'
    )
    await page.$eval('#proof', el => el.scrollIntoView())
    await page.waitForFunction(() =>
      [...document.querySelectorAll('[data-counter]')].every(
        el => el.dataset.complete === 'true'
      )
    )
    assert.equal(await page.$$eval('[data-counter]', e => e.length), 4)
    await page.screenshot({
      path: `${output}/${lang}-desktop-full.png`,
      fullPage: true
    })
    await page.$eval('#rust', el => el.scrollIntoView())
    await page.screenshot({ path: `${output}/${lang}-rust.png` })
    await page.$eval('#nix', el => el.scrollIntoView())
    await page.screenshot({ path: `${output}/${lang}-nix.png` })
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: `${output}/${lang}-hero.png` })
    for (const width of [390, 768]) {
      await page.setViewport({ width, height: 844 })
      await page.evaluate(() => window.scrollTo(0, 0))
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        ),
        `No overflow at ${width}`
      )
      await page.screenshot({
        path: `${output}/${lang}-${width}.png`,
        fullPage: true
      })
    }
  }
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' }
  ])
  await page.goto(`${base}/en`, { waitUntil: 'networkidle0' })
  assert.equal(
    await page.$eval('.narrative', el => el.dataset.motion),
    'reduced'
  )
  assert.equal(
    await page.$$eval('[data-counter]', els =>
      els.every(el => el.dataset.complete === 'true')
    ),
    true
  )
  assert.equal(
    await page.$eval('canvas.cursor-grab', el => el.dataset.motion),
    'reduced'
  )
  assert.equal(
    await page.$eval('.narrative', el => getComputedStyle(el).scrollBehavior),
    'auto'
  )
  assert.deepEqual(errors, [])
  console.log(
    JSON.stringify(
      {
        result: 'PASS',
        languages: ['en', 'fr'],
        widths: [1440, 768, 390],
        facets: 4,
        machines: 7,
        counters: 4,
        keyboard: true,
        reducedMotion: true,
        errors,
        screenshots: output
      },
      null,
      2
    )
  )
} finally {
  await browser.close()
}
