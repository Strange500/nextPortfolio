# ASCII cube regression checks

## Cause and dependency contract

At zoom 1500, the previously pinned engine (`5a342104c61eeaf04cbbce1671994da3430db1f6`)
projected a sparse 50×50 point grid onto a 120×60 character buffer. Depending on
rotation, adjacent samples skipped screen cells. Those cells were cleared to
spaces each frame, producing moving holes, not a React redraw or canvas-clear race.
The old binary produced 12,525 interior empty cells across 180 deterministic
orientations (149 affected frames).

The pin now includes upstream `5fd2c3101a1efd0c2acc926de0303ba7f8f3ab6b`, which
restores a 100×100 sampling grid and correct row-major logo coordinate mapping.
`FACE_TEXTURE_SIZE` in `components/AsciiCube.tsx` must match that 100×100 grid for
both SVG logos and video uploads; merely bumping the engine would leave textures
partially populated. The tracked WASM binary was rebuilt from this exact commit
with `wasm-pack build --target web --mode no-install --release` (Rust 1.97.0,
wasm-bindgen 0.2.121); its JS glue and type declarations are unchanged. Nix builds
consume the same upstream revision through `flake.lock`.

## Fast, deterministic test (also runs in CI)

```sh
node scripts/test-cube-raster.mjs
```

This loads the actual tracked WASM binary and checks 180 orientations for empty
cells between occupied cells in each scanline of the convex cube. It also checks
four-quadrant texture/color mapping, identical frozen frames, and live texture
updates. To compare another generated module, set `CUBE_MODULE=/absolute/path/cube.js`.
This is a regression at the portfolio's current dimensions/zoom, not a guarantee
for arbitrary larger zoom values or viewport buffers.

## Real browser check

```sh
npm ci
npm run build
# Match the standalone package layout produced by flake.nix:
cp -r public .next/standalone/
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/
HOSTNAME=127.0.0.1 PORT=3100 node .next/standalone/server.js
# In another terminal, with a real installed Chrome/Chromium:
CHROME_PATH=/path/to/chromium node scripts/test-cube-browser.mjs
```

Optional settings: `CUBE_URL` (default `http://127.0.0.1:3100/en`),
`CUBE_SCREENSHOTS` (output directory) and `CUBE_THEME=dark` (emulated system
preference). The test uses a desktop viewport: the existing layout intentionally
hides the cube below the `lg` breakpoint.

The browser test observes actual canvas draw calls over at least 180 frames,
asserts contiguous occupied scanlines, exercises pointer drag/release and logo
cycling, forces a video onto an initial face, checks 100×100 texture reads, and
rejects browser errors. Screenshots can be inspected separately. The launcher
uses a fresh Puppeteer profile; `--no-sandbox` is for this isolated test environment,
not a recommendation to browse untrusted sites without the sandbox.

## Agent browser-launch issue

The integrated Hermes browser failed before page navigation with Chromium exit
code -5 and `chrome_crashpad_handler: --database is required`. No portfolio code
is involved at that stage, and no Hermes installation/configuration was changed
by this fix. The packaged Chromium also started successfully when launched
directly from the shell; an independent Nix Chromium 157.0.8103.38 launched through
Puppeteer then rendered the portfolio and supplied before/after screenshots.
Thus this is a verified alternative launch path, not a claim that the integrated
browser launcher itself has been repaired. The underlying launcher/environment
cause beyond the Crashpad error remains unconfirmed.
