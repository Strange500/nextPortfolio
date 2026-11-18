import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import ts from 'typescript'
import puppeteer from 'puppeteer-core'
const base = process.env.PORTFOLIO_URL || 'http://localhost:3100',
  output = process.env.REVIEW_DIR || '/tmp/portfolio-logo-audit'
await mkdir(output, { recursive: true })
const compile = async path =>
  ts.transpileModule(await readFile(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    }
  }).outputText
const run = (source, deps = {}) => {
  const exports = {}
  new Function('require', 'exports', source)(name => deps[name], exports)
  return exports
}
const technologies = run(await compile('../data/technologies.ts'))
const context = run(await compile('../data/cube-context.ts'), {
  './technologies': technologies
})
const assets = run(await compile('../data/cube-logo-assets.ts'))
const source = await compile('../lib/cube-technologies.ts')
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
try {
  const p = await browser.newPage()
  await p.setViewport({ width: 1120, height: 1800 })
  await p.goto(`${base}/fr`, { waitUntil: 'networkidle0' })
  await p.waitForSelector('[data-wasm="ready"]')
  const logos = await p.evaluate(
    `(async()=>{const exports={};const deps=${JSON.stringify({ '@/data/cube-context': context, '@/data/cube-logo-assets': assets })};const require=name=>deps[name];${source};return (await exports.loadCubeTechnologies()).map(l=>({...l,characters:Array.from(l.characters)}));})()`
  )
  assert.equal(logos.length, 22)
  const report = logos.map(l => {
    assert.notEqual(l.kind, 'fallback', `${l.name} decoded`)
    const foreground = l.characters.filter(c => c === 35).length
    const coords = l.characters.flatMap((c, i) =>
      c === 35 ? [[i % 100, Math.floor(i / 100)]] : []
    )
    const bounds = [
      Math.min(...coords.map(p => p[0])),
      Math.min(...coords.map(p => p[1])),
      Math.max(...coords.map(p => p[0])),
      Math.max(...coords.map(p => p[1]))
    ]
    const density =
      foreground / ((bounds[2] - bounds[0] + 1) * (bounds[3] - bounds[1] + 1))
    assert.ok(
      foreground > 80 && foreground < 6000,
      `${l.name}: not blank or a solid tile (${foreground})`
    )
    assert.ok(density < 0.93, `${l.name}: negative spaces survive (${density})`)
    return { name: l.name, kind: l.kind, foreground, density, bounds }
  })
  const { default: init, Cube } = await import('../wasm-cube/cube.js')
  const { memory } = await init({
    module_or_path: await readFile(
      new URL('../wasm-cube/cube_bg.wasm', import.meta.url)
    )
  })
  const loader = run(source, {
    '@/data/cube-context': context,
    '@/data/cube-logo-assets': assets
  })
  const cube = new Cube(240, 120)
  cube.set_zoom(3300)
  cube.set_rotation_speed(0, 0, 0)
  cube.set_rotation(0, 0, 0)
  const frames = logos.map(l => {
    const texture = loader.faceTechnology(
      { ...l, characters: Uint8Array.from(l.characters) },
      5
    )
    cube.update_face_fast(5, texture.characters, texture.colors)
    cube.next_frame()
    return {
      name: l.name,
      chars: Array.from(
        new Uint8Array(memory.buffer, cube.chars_ptr(), 240 * 120)
      )
    }
  })
  cube.free()
  await p.evaluate(frames => {
    document.body.replaceChildren()
    document.body.style.cssText = 'margin:0;background:#0c1420'
    const canvas = document.createElement('canvas')
    canvas.width = 1120
    canvas.height = Math.ceil(frames.length / 4) * 280
    document.body.append(canvas)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#0c1420'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    frames.forEach((frame, i) => {
      const left = (i % 4) * 280,
        top = Math.floor(i / 4) * 280
      ctx.fillStyle = '#eaf0f5'
      ctx.font = '14px monospace'
      ctx.fillText(frame.name, left + 20, top + 24)
      ctx.font = '2.2px monospace'
      for (let row = 0; row < 120; row++)
        for (let col = 0; col < 240; col++) {
          const c = frame.chars[row * 240 + col]
          if (c === 32) continue
          ctx.fillStyle = c === 46 ? '#273647' : '#d3e0eb'
          ctx.fillText(
            String.fromCharCode(c),
            left + 20 + col,
            top + 36 + row * 2
          )
        }
    })
  }, frames)
  await p.screenshot({ path: `${output}/ascii-logo-atlas.png`, fullPage: true })
  await writeFile(
    `${output}/evidence.json`,
    JSON.stringify({ result: 'PASS', logos: report }, null, 2)
  )
  console.log(JSON.stringify({ result: 'PASS', logos: report }))
} finally {
  await browser.close()
}
