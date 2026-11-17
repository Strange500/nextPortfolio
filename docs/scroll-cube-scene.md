# One scroll-driven Rust/WASM scene

The homepage keeps one `ScrollCubeScene`, one Rust `Cube` allocation and one
visible canvas from intro through contact. The renderer is the upstream engine
pinned in `flake.lock`, with a rebuilt generated artifact in `wasm-cube/`. See
[local development](local-development.md) for setup and deployment commands.

## Composition and motion

The homepage uses a full-width charcoal-green surface with off-white text, sage
secondary text and citron for interactive/active elements. It has the same
palette under both global theme settings; blog themes remain independent. There
is no 1600px outer panel or blue margin for the viewport-fixed cube to cross.

Native `scrollY` is the scene clock. Intro → Rust approaches the center, holds a
brief close-up, then retreats left before the Rust copy finishes appearing on
the right. The intro fades during approach. Both directions use the same
piecewise smoothstep curve, with no delayed pose interpolation after scroll
ends. Later chapters vary scale and orientation; Nix → Testing stays on the
right, and Bitcoin → Contact stays on the left. Large traversals are deliberate
rather than an automatic alternating pattern. Each chapter retains a reading
plateau of at least 45vh before its next transition (longer chapters retain
more).

The document remains native HTML in normal flow. The text navigation and visible
face clicks call the same native smooth scroll; they do not run a second cube
animation. Wheel, touch, pointer and scrolling-key input explicitly cancel a
pending navigation animation without preventing the native input. Keyboard
navigation and ordinary section links provide access to every chapter, including
hidden faces. Reduced motion changes chapter poses directly, suppresses
fades/drift and skips repeated raster work. A WASM-load failure leaves the HTML
and navigation available with a fallback message.

## Material and interaction

The stable 240×120 ASCII buffer avoids density changes during zoom. Projection
uses camera distance 100, zoom 3300 and 8×16 logical cells. Rust surface
sampling adapts to the buffer width, capped at 256; legacy clients keep their
historical grid, and texture uploads retain 100×100 row-major coordinates. The
raster test checks 720 orientations at the scene settings with zero interior
holes and verifies texture/color mapping at both sizes.

A regular monospace glyph is measured to fit each 8px cell, avoiding bold
overlap and programming ligatures. Contiguous material runs are drawn together
rather than shaping thousands of individual glyphs. Canvas backing resolution
follows CSS size × device pixel ratio (capped at 2). Directional face luminance
makes the volume readable without coloring passive material citron. One stable
ASCII grid is used at every scale; mobile has a smaller viewport composition.

Six face polygons use the same XYZ transform, camera, zoom and cell dimensions
as Rust. Only visible faces accept pointer input. Raster and hit geometry update
together; idle drift is capped at 30fps and scroll invalidations draw promptly.
Viewport transforms follow display frames. Hover identifies the face and
suspends the quiet autonomous drift. The Pause control also suspends drift while
leaving scroll/navigation operational. Cleanup frees the Rust allocation,
removes listeners and cancels the frame loop.

## Validation

Use `scripts/test-scroll-scene.mjs` for EN/FR, desktop/mobile/landscape, reverse
scrolling, persistent allocation, reading plateaus, all six visible-face
hover/click interactions, keyboard access, manual scroll after clicks, pause,
reduced motion and WASM-failure injection.

`scripts/test-scroll-comfort.mjs` checks theme-owned ink, distinct face
lighting, uncancelled native wheel distance, absence of scroll snap, and pose
agreement within two frames after an instant scroll with no subsequent position
inertia. `scripts/test-narrative-browser.mjs` exercises retained content and
infrastructure controls. `scripts/capture-scroll-review.mjs` records viewport
states including intermediate transitions and can record a WebM traversal; it
also records WASM HTTP/MIME status and canvas backing sizes. Inspect these
images and recording, not only full-page screenshots.

The older evidence under `validation/scroll-comfort/` describes the prior 85ms
amortized scene and remains historical. It does not verify this revision or its
remote deployment. Current results and limitations are recorded separately.

## Test deployment

The configured route is `test-portfolio.qgroget.com`, rootless
`portfolio-test.service`, port 3002, with mTLS. No literal `test-portoflio`
route is declared. Only the `portfolio-test` consumer pin may change;
production's independent `portfolio` input must stay unchanged. Deployment
requires host access, which is absent in this environment; a prepared deployment
pin is not an activated or verified service.

## Ultrawide and silhouette bounds

A shared CSS composition width caps content and cube positions at 1600px while
the background remains full-bleed. The footer explicitly spans the viewport; its
horizontal padding is derived from that composition rather than mixing a 1440px
max-width with viewport-relative padding. The canvas stage stays inside vertical
safe margins and is capped at 1000px even on super-ultrawide screens.

The 240×120 raster includes projection clearance around the rotated silhouette.
At zoom 3300, the earlier 200×100 buffer touched an outer row or column in 469
of 720 sampled orientations. The new regression checks all four raster borders,
in addition to holes and texture mapping; the larger buffer has zero affected
frames. The Rust engine and projection zoom are unchanged.

The desktop approach/close-up/retreat now finishes before Rust reading content
enters the cube's vertical range. Rust HTML stays opaque throughout; mobile
intro text scrolls naturally. `test-ultrawide.mjs` covers 2560×1080, 3440×1440,
3840×1080 and 5120×1440 as well as desktop/mobile baselines, checking frame
bounds, contact width, text overlap, projected corners and reverse traversal.
Cross-column moves toward NixOS and Bitcoin briefly recede and rise before
returning to their reading pose; captions are hidden during these traversals so
they do not mask incoming headings.
