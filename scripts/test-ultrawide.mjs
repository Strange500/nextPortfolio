import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'

const base = process.env.PORTFOLIO_URL || 'http://localhost:3100'
const output = process.env.REVIEW_DIR || '/tmp/portfolio-ultrawide'
await mkdir(output, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const evidence = [],
  errors = []
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
try {
  const page = await browser.newPage()
  page.on('pageerror', error => errors.push(error.message))
  const measure = () =>
    page.evaluate(() => {
      const rect = element => {
        const r = element.getBoundingClientRect()
        return {
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          right: r.right,
          bottom: r.bottom
        }
      }
      const cube = document.querySelector('[data-persistent-cube]')
      const svg = cube.querySelector('svg')
      const canvas = cube.querySelector('canvas')
      const pixels = canvas
        .getContext('2d')
        .getImageData(0, 0, canvas.width, canvas.height).data
      const painted = pixels.some(
        (value, index) => index % 4 === 3 && value > 0
      )
      const faces = [...svg.querySelectorAll('g')].filter(
        g => !g.hasAttribute('hidden') && getComputedStyle(g).display !== 'none'
      )
      return {
        viewport: { width: innerWidth, height: innerHeight },
        y: scrollY,
        cube: rect(cube),
        footer: rect(document.getElementById('contact')),
        contact: rect(document.querySelector('#contact > div')),
        rustTitle: rect(document.querySelector('#rust h2')),
        rustOpacity: getComputedStyle(document.getElementById('rust')).opacity,
        rasterBounds: [
          ...svg.querySelectorAll('g:not([hidden]) polygon')
        ].every(polygon =>
          [...polygon.points].every(
            p =>
              p.x > 0 &&
              p.x < svg.viewBox.baseVal.width &&
              p.y > 0 &&
              p.y < svg.viewBox.baseVal.height
          )
        ),
        flyby: cube.dataset.flyby === 'true',
        painted,
        visibleFaces: faces.length,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        count: document.querySelectorAll('[data-persistent-cube]').length
      }
    })
  const overlaps = (a, b) =>
    a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y
  for (const [width, height] of [
    [1440, 1000],
    [1920, 1080],
    [2560, 1080],
    [2560, 720],
    [3440, 1440],
    [3840, 1080],
    [5120, 1440],
    [390, 844]
  ]) {
    await page.setViewport({ width, height })
    await page.goto(`${base}/en`, { waitUntil: 'networkidle0' })
    await page.waitForSelector('[data-wasm="ready"]')
    const anchors = await page.evaluate(() =>
      Object.fromEntries(
        ['intro', 'rust', 'nix', 'testing', 'bitcoin', 'contact'].map(id => [
          id,
          id === 'intro'
            ? 0
            : document.getElementById(id).getBoundingClientRect().top + scrollY
        ])
      )
    )
    const introEnd = await page.$eval('.scroll-scene', e =>
      Number(e.dataset.introEnd)
    )
    const check = async (name, y, incoming) => {
      await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y)
      await delay(100)
      const state = await measure()
      assert.equal(state.count, 1)
      assert.ok(
        state.painted && state.visibleFaces > 0,
        `${width}/${name}: real cube must be painted and visible`
      )
      assert.equal(
        state.horizontalOverflow,
        false,
        `${width}/${name}: horizontal overflow`
      )
      if (!state.flyby)
        assert.equal(state.rustOpacity, '1', 'Reading content is fully opaque')
      assert.equal(
        state.rasterBounds,
        true,
        `${width}/${name}: projected face is cut by the raster`
      )
      if (width >= 900) {
        assert.ok(
          state.cube.x >= 15 &&
            state.cube.right <= width - 15 &&
            state.cube.y >= 0 &&
            state.cube.bottom <= height - 100,
          `${width}/${name}: cube leaves safe viewport: ${JSON.stringify(state.cube)}`
        )
        assert.ok(
          state.cube.width <= 1001,
          'Ultrawide must not enlarge the cube indefinitely'
        )
        assert.ok(
          state.contact.width >= 450,
          `${width}: contact column collapses: ${state.contact.width}`
        )
        if (
          Number(state.rustOpacity) > 0.2 &&
          state.rustTitle.y < height &&
          state.rustTitle.bottom > 0
        )
          assert.equal(
            overlaps(state.cube, state.rustTitle),
            false,
            `${width}/${name}: cube masks the Rust title`
          )
        if (Object.keys(anchors).includes(name) && name !== 'intro') {
          const reading = await page.$eval(`#${name} > :first-child`, e => {
            const r = e.getBoundingClientRect()
            return { x: r.x, y: r.y, right: r.right, bottom: r.bottom }
          })
          assert.equal(
            overlaps(state.cube, reading),
            false,
            `${width}/${name}: reading composition overlaps`
          )
        }
      }
      if (incoming && width >= 900) {
        const heading = await page.$eval(`#${incoming} h2`, e => {
          const r = e.getBoundingClientRect()
          return { x: r.x, y: r.y, right: r.right, bottom: r.bottom }
        })
        if (heading.y < height && heading.bottom > 0) {
          assert.equal(
            overlaps(state.cube, heading),
            false,
            `${width}/${name}: cube masks incoming ${incoming} title`
          )
          const caption = await page.$eval('.cube-caption', e => {
            const r = e.getBoundingClientRect()
            return {
              x: r.x,
              y: r.y,
              right: r.right,
              bottom: r.bottom,
              visible: getComputedStyle(e).visibility !== 'hidden'
            }
          })
          if (caption.visible)
            assert.equal(
              overlaps(caption, heading),
              false,
              `${width}/${name}: caption masks incoming title`
            )
        }
      }
      evidence.push({ width, height, name, ...state })
      if (
        [3440, 3840, 5120, 390].includes(width) &&
        ['intro', 'close-up', 'rust-entry', 'rust', 'contact'].includes(name)
      )
        await page.screenshot({
          path: `${output}/${width}-${height}-${name}.png`
        })
    }
    await check('intro', 0)
    for (let i = 1; i <= 10; i++)
      await check(
        i === 4 ? 'close-up' : i === 9 ? 'rust-entry' : `transition-${i}`,
        (introEnd * i) / 10
      )
    for (const [name, y] of Object.entries(anchors).slice(1))
      await check(name, y)
    for (const id of ['nix', 'testing', 'bitcoin', 'contact']) {
      for (const distance of [0.65, 0.45, 0.25])
        await check(
          `move-${id}-${distance}`,
          anchors[id] - height * distance,
          id
        )
    }
    await check('reverse-close-up', introEnd * 0.4)
    if (width >= 2560) {
      await page.evaluate(() =>
        scrollTo({
          top: document.getElementById('contact').offsetTop,
          behavior: 'instant'
        })
      )
      await page.click('#contact .resume-trigger')
      await page.waitForSelector('.resume-menu')
      assert.ok(
        await page.$eval('.resume-menu', e => {
          const r = e.getBoundingClientRect()
          return r.x >= 0 && r.right <= innerWidth && r.bottom <= innerHeight
        })
      )
      await page.keyboard.press('Escape')
    }
  }
  assert.deepEqual(errors, [])
  await writeFile(
    `${output}/evidence.json`,
    JSON.stringify({ result: 'PASS', evidence, errors }, null, 2)
  )
  console.log(
    JSON.stringify({
      result: 'PASS',
      checkpoints: evidence.length,
      output,
      errors
    })
  )
} finally {
  await browser.close()
}
