# Scroll-driven Rust/WASM scene

The homepage mounts **one** `ScrollCubeScene` and one `ascii-cube` `Cube` for its entire lifetime. It uses the existing flake-pinned Rust engine and 120×60 shared-memory raster, not a CSS cube or a static substitute. The old standalone `AsciiCube` component remains available outside this homepage.

## State and interaction

- Native `window.scrollY` is the source of truth. Section document offsets define reading anchors; a smoothstep interpolates position, size and Euler XYZ orientation during the transition before each anchor. Long sections retain a stable cube pose while their HTML scrolls naturally.
- Intro → Rust progressively enlarges and moves the object left; the next chapters alternate sides. All text stays selectable HTML in document order. Section entry/exit opacity is derived from the same scroll position, not timed entrance animations.
- Six projected face polygons correspond to intro, Rust, NixOS, testing, Bitcoin and contact. Projection matches Rust's face order, XYZ matrix, camera distance 100, zoom 2100 and 8×16 character cells. Back faces are not interactive. Short labels use the same theme variables as the page.
- Hover highlights a face and suspends the small autonomous orientation drift. Clicking a face or using the six-entry text navigation invokes the same native smooth-scroll function, without another pose animation. Keyboard users use the equivalent ordinary links; decorative SVG is hidden from assistive technology.
- A single 30fps-capped requestAnimationFrame loop updates the scene and raster. It skips work while the document is hidden. Cleanup cancels the loop, removes listeners and frees the Rust allocation.
- Reduced motion snaps between chapter poses and draws only after scroll, resize or theme invalidation. No autonomous motion or fades. Failed WASM loading leaves all content and text navigation usable, with an explicit fallback message.
- Mobile places the object above the text. The navigation wraps rather than hiding contact behind a horizontal scroll. Landscape uses side-by-side composition. All long content can scroll past the fixed navigation; it is not trapped inside viewport-height panels.

## Reproducible browser verification

Install dependencies normally and build with `npm run build`. Serve the standalone output including `.next/static` and `public`, or run the exact deployed Nix package. Then:

```sh
CHROME_PATH=/absolute/path/to/chromium \
PORTFOLIO_URL=http://localhost:3101 \
REVIEW_DIR="$TMPDIR/portfolio-scroll-review" \
node scripts/test-scroll-scene.mjs
```

The suite checks bidirectional first-transition coordinates/zoom, reading plateau, persistent canvas, pause, EN/FR section navigation, keyboard selection, seven infrastructure targets, 390/768/1440px, all six face reading poses and polygon-centroid hover/click, resumed manual scrolling, landscape resize, dark palette screenshot, frozen reduced-motion raster, and WASM-request failure fallback. `evidence.json` contains actual observed positions and checkpoints; screenshots accompany it. A second new page must not be opened until the first page's animation tests finish: Chromium can suspend rAF on the background page.

Also run `node scripts/test-narrative-browser.mjs`, `node scripts/test-cube-raster.mjs`, TypeScript, targeted ESLint and `git diff --check`. Whole-repo ESLint has six pre-existing errors in the blog, Mermaid, résumé script and Tailwind config; do not interpret this as a green global lint gate.

## Preview deployment boundary

The requested name `test-portoflio` does **not** match a declared hostname. The existing preview is **test-portfolio.qgroget.com**, routed to the rootless `portfolio-test.service` on 127.0.0.1:3002, with mTLS. Preserve that route and production's independent `portfolio` input. Pin only `portfolio-test` in a separate nixos-config PR, build its exact generated Home Manager service unit, and activate only that user unit. A manual unit symlink activation is temporary until the pin PR merges; later Home Manager activation may restore the main pin. Browser QA through an SSH tunnel is application verification, not an assertion that unauthenticated public HTTPS returns 200.
