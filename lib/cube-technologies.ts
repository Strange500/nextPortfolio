import { cubeTechnologyNames } from '@/data/cube-context'
import { cubeLogoAssets } from '@/data/cube-logo-assets'

export type CubeTechnology = {
  name: string
  characters: Uint8Array
  kind: 'asset' | 'wordmark' | 'fallback'
}
const edge = 100
let cached: Promise<CubeTechnology[]> | undefined

/** Sample transparent monochrome glyphs once, preserving holes/negative space.
 * Legacy colored tiles cannot be flattened into a binary mask: JS/TS letters
 * would disappear into their backgrounds. All cube-specific SVGs use alpha. */
export function loadCubeTechnologies() {
  return (cached ??= Promise.all(
    cubeTechnologyNames.map(async name => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = edge
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      let kind: CubeTechnology['kind'] =
        name === 'Home Manager' ? 'wordmark' : 'asset'
      try {
        const image = new Image()
        image.src = `/logo/cube/${cubeLogoAssets[name]}.svg`
        await image.decode()
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
      } catch {
        // Keep a readable identifier if an asset ever fails, never a blank face.
        kind = 'fallback'
        console.warn('Cube logo unavailable:', name)
        ctx.fillStyle = '#000'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = 'bold 16px monospace'
        ctx.fillText(name, 50, 50, 78)
      }
      const pixels = ctx.getImageData(0, 0, edge, edge).data
      return {
        name,
        kind,
        characters: Uint8Array.from({ length: edge * edge }, (_, i) =>
          pixels[i * 4 + 3] > 100 ? 35 : 46
        )
      }
    })
  ))
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
