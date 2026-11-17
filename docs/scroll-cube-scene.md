# One staged Rust/WASM scene

## Current navigation contract

The homepage now advances through seven viewport-sized chapters: intro, Rust,
NixOS, testing, Bitcoin, missions, contact. `StepNavigation` accumulates 100px
of vertical wheel intent, then animates the window to the next or previous
chapter over 1100ms. The desktop intro ↔ Rust transition has a dedicated
2400ms continuous foreground passage, without an interior pause. The cube
keeps translating and rotating while its scale reverses at the peak. Its opaque
projected faces cover the viewport; the outgoing and incoming compositions stay
pinned and swap behind it halfway through. Receding reveals the Rust composition.
The same window progression drives the cube in reverse too. The opening passage
is the only deliberate exception to normal viewport-safe cube bounds.
Wheel input is consumed during transit; a 180ms quiet gap
re-arms the next gesture so trackpad inertia cannot skip chapters. Keyboard,
swipe, previous/next buttons, text links and cube faces use the same controller.
Reduced motion changes chapters immediately. Resize preserves the selected
chapter. Hash links restore it on entry. Tab focus can enter another chapter.

The one persistent WASM cube still reads the actual window position, including
transit. No second scene or independent click timeline is created. Chapter
containers are exactly 100dvh. Technical details use native disclosures, keeping
the initial reading state short; expanded details and unusually short or zoomed
viewports may scroll inside the chapter without moving the outer viewport.
At an internal boundary, vertical input can advance or return. Without JavaScript,
the document remains readable in normal flow.

`scripts/test-step-navigation.mjs` verifies screen heights, wheel threshold,
reverse navigation, stable stops, keyboard, clicks, gesture inertia, expanded
content, swipe, resize, reduced motion, direct links and a single live cube.
The earlier native-wheel-distance comfort contract below and historical videos
are superseded by this explicitly requested staged interaction. The ultrawide
geometry/raster regression remains applicable and runs alongside the new suite.

## Renderer and previous choreography reference

The homepage keeps one `ScrollCubeScene`, one Rust `Cube` allocation and one
visible canvas from intro through contact. The renderer is the upstream engine
pinned in `flake.lock`, with a rebuilt generated artifact in `wasm-cube/`. See
[local development](local-development.md) for setup and deployment commands.

## Composition and motion

The homepage uses a full-width charcoal-green surface with off-white text, sage
secondary text and citron for interactive/active elements. It has the same
palette under both global theme settings; blog themes remain independent. There
is no 1600px outer panel or blue margin for the viewport-fixed cube to cross.

Native `scrollY` is the scene clock. Intro → Rust crosses the foreground,
occludes the old composition and recedes left to reveal Rust on the right.
There is no parked close-up and no intro crossfade in the staged scene. Both directions use the same
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
follows viewport size × device pixel ratio (capped at 2 and 4096×2160). Directional face luminance
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
safe margins and is capped at 1000px in reading states, even on super-ultrawide
screens. Only the opening foreground passage intentionally exceeds these bounds.

The 240×120 raster includes projection clearance around the rotated silhouette.
At zoom 3300, the earlier 200×100 buffer touched an outer row or column in 469
of 720 sampled orientations. The new regression checks all four raster borders,
in addition to holes and texture mapping; the larger buffer has zero affected
frames. The Rust engine and projection zoom are unchanged.

The desktop opening passage covers the viewport while the HTML compositions
swap in place; the receding cube reveals Rust. Mobile intro text scrolls naturally. `test-ultrawide.mjs` covers 2560×1080, 3440×1440,
3840×1080 and 5120×1440 as well as desktop/mobile baselines, checking frame
bounds, contact width, text overlap, projected corners and reverse traversal.
Cross-column moves toward NixOS and Bitcoin briefly recede and rise before
returning to their reading pose; captions are hidden during these traversals so
they do not mask incoming headings.

The canvas now rasterizes the visible viewport rather than allocating pixels for
the entire oversized cube. Backing resolution follows DPR up to 2, bounded by
4096×2160. A single fill of the visible projected face paths makes the silhouette
opaque between ASCII glyphs without internal antialias seams. Rust still supplies
the ASCII material; the same projected corners drive occlusion and face hit tests.
The scene viewport clips overscan and avoids horizontal document overflow.
