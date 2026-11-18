import { technologies } from '@/data/technologies'
import { wordmarks } from '@/data/cube-context'

export type CubeTechnology = {
  name: string
  characters: Uint8Array
  kind?: 'asset' | 'wordmark'
}
const edge = 100
let cached: Promise<CubeTechnology[]> | undefined

/** Local legacy assets, sampled once into the existing WASM texture contract. */
export function loadCubeTechnologies() {
  return (cached ??= Promise.all(
    technologies.map(async (technology): Promise<CubeTechnology | null> => {
      try {
        const image = new Image()
        image.src = technology.svg
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = edge
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!
        const scale = 78 / Math.max(image.naturalWidth, image.naturalHeight)
        const width = image.naturalWidth * scale,
          height = image.naturalHeight * scale
        ctx.drawImage(
          image,
          (edge - width) / 2,
          (edge - height) / 2,
          width,
          height
        )
        const pixels = ctx.getImageData(0, 0, edge, edge).data
        const characters = new Uint8Array(edge * edge)
        for (let i = 0; i < characters.length; i++) {
          const j = i * 4
          const white = Math.min(pixels[j], pixels[j + 1], pixels[j + 2]) > 238
          characters[i] = pixels[j + 3] > 100 && !white ? 35 : 46
        }
        return { name: technology.name, characters, kind: 'asset' }
      } catch {
        return null
      }
    })
  ).then(items => [
    ...items.filter((item): item is CubeTechnology => item !== null),
    ...wordmarks.map(name => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = edge
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#000'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const lines =
        name === 'Home Manager'
          ? ['HOME', 'MANAGER']
          : [
              name === 'WebAssembly'
                ? 'WASM'
                : name === 'Bitcoin'
                  ? 'BTC'
                  : name.toUpperCase()
            ]
      ctx.font = `bold ${lines[0].length > 5 ? 15 : 19}px monospace`
      lines.forEach((line, i) =>
        ctx.fillText(line, 50, 50 + (i - (lines.length - 1) / 2) * 24)
      )
      const data = ctx.getImageData(0, 0, edge, edge).data
      return {
        name,
        kind: 'wordmark' as const,
        characters: Uint8Array.from({ length: edge * edge }, (_, i) =>
          data[i * 4 + 3] > 100 ? 35 : 46
        )
      }
    })
  ]))
}

/** Orient UVs so text-bearing logos read correctly on each outward-facing side. */
export function faceTechnology(texture: CubeTechnology, face: number) {
  const characters = new Uint8Array(edge * edge),
    colors = new Uint32Array(edge * edge)
  for (let y = 0; y < edge; y++)
    for (let x = 0; x < edge; x++) {
      const u = face === 2 ? 99 - y : face === 3 ? y : face === 4 ? 99 - x : x
      const v = face === 1 ? 99 - y : face === 2 || face === 3 ? x : y
      const index = y * edge + x
      characters[index] = texture.characters[v * edge + u]
      colors[index] = 0x100001 + face + (characters[index] === 46 ? 0x100 : 0)
    }
  return { characters, colors }
}
