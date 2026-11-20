# Develop and review the portfolio

## Source and tools

The homepage is Next.js 16 / React 19, built with webpack. Use **npm** and the
tracked `package-lock.json` (`npm ci`); pnpm in the old shell is not the
lockfile manager. Node 22 is selected by `.node-version`, the flake and CI. Node
24.22.1 was also used for the local browser/build checks in this review.

Start with the locked Nix environment on a host that supports Nix:

```sh
nix develop
npm ci
npm run dev -- --hostname 0.0.0.0 --port 3100
```

The dev shell includes the upstream pinned minimal Rust toolchain, the
`wasm32-unknown-unknown` target, wasm-pack and wasm-bindgen. It leaves tracked
`wasm-cube/` files intact. The Nix package copies artifacts from the exact
locked Rust input before building the frontend. The older `shell.nix` / Devbox
setup contains unrelated Vite/Yarn tools and does not define the frontend build.

In restricted containers, Nix can fail on sandbox namespaces
(`cannot set domain name`). A portable attempt here with sandbox disabled
subsequently exhausted space downloading Rust HTML docs. The upstream toolchain
now uses the minimal profile. The complete Nix package has **not** been built in
this container. The validated fallback is the existing Node runtime plus
workspace-local Rust 1.97.0, wasm-pack 0.13.1 and wasm-bindgen-cli 0.2.121.

## Rebuild the actual Rust engine

`wasm-cube/` is a generated package, not the Rust source. Read the exact source
revision from `flake.lock`, preserving its Cargo.lock:

```sh
mkdir -p work
git clone https://github.com/Strange500/ascii-cube-rs.git work/ascii-cube-rs
CUBE_REV=$(node -p 'JSON.parse(require("fs").readFileSync("flake.lock")).nodes["ascii-cube-rs"].locked.rev')
git -C work/ascii-cube-rs checkout --detach "$CUBE_REV"
(cd work/ascii-cube-rs && wasm-pack build --target web --mode no-install --release)
CUBE_MODULE="$PWD/work/ascii-cube-rs/pkg/cube.js" node scripts/test-cube-raster.mjs
cp work/ascii-cube-rs/pkg/cube_bg.wasm wasm-cube/cube_bg.wasm
# Also copy JS / declarations if the exported API changes; unchanged in this review.
node scripts/test-cube-raster.mjs
```

Without Nix, install the **matching** tools outside the repository. For example,
with rustup already available:
`rustup toolchain install 1.97.0 --profile minimal --target wasm32-unknown-unknown`;
select that toolchain, wasm-pack 0.13.1 and wasm-bindgen-cli 0.2.121. Do not
update Cargo.lock during the rebuild.

The 240×120 scene grid uses the adaptive Rust sampler. `update_face_fast`
retains its 100×100 texture-upload contract. The tracked binary was rebuilt
locally; its generated JS and declarations are unchanged. The frontend imports
this file package as `ascii-cube`; webpack emits the WASM asset and serves it as
`application/wasm`.

## Optimized local server and browser checks

Do not run `next dev` and `next build` against the same `.next` directory at
once. Build, then serve the same standalone layout used by deployment:

```sh
npm run build
cp -r public .next/standalone/
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/
HOSTNAME=0.0.0.0 PORT=3100 node .next/standalone/server.js
```

The CI also uploads a `portfolio-test-node22` artifact containing the complete
standalone server and assets. Extract it, then run
`PORT=3100 HOSTNAME=127.0.0.1 node server.js` with Node 22. This is a runnable
test package, not a deployment.

The local URL is `http://localhost:3100/fr` (or `/en`). For a remote browser,
forward port 3100 using the environment's forwarding mechanism. Chromium was
already installed at `/usr/bin/chromium`; the repository supplies Puppeteer
Core. In another terminal, set:

```sh
export CHROME_PATH=/usr/bin/chromium
export PORTFOLIO_URL=http://localhost:3100
export REVIEW_DIR="$PWD/work/visual-review"
node scripts/test-scroll-scene.mjs
node scripts/test-scroll-comfort.mjs
node scripts/test-narrative-browser.mjs
RECORD_VIDEO=1 node scripts/capture-scroll-review.mjs
```

Video capture additionally uses `/usr/bin/ffmpeg` through the fast realtime
`scripts/ffmpeg-preview.sh` wrapper. Override `FFMPEG_BIN` for its binary, or
`FFMPEG_PATH` to bypass the wrapper. The recording is 15fps at 75% scale; PNGs
retain the full viewport resolution. Use separate review directories to retain
evidence from each suite. Run browser suites sequentially to avoid sharing
constrained CPU resources.

Other checks: `npx tsc --noEmit`, `npm run lint`,
`node scripts/test-cube-raster.mjs`, `python3 scripts/test-resume-preview.py`,
`git diff --check`. Global lint retains six pre-existing errors in the blog,
Mermaid, résumé renderer and Tailwind config; changed-file lint is checked
separately. Full-page screenshots do not describe the viewport-pinned cube's
scroll choreography; inspect the viewport sequence and recording.

## Configuration and deployment boundary

No secret is required for local rendering. `PROJECTS_FILE_PATH` is optional and
falls back to `data/projects.json`; `PORT` and `HOSTNAME` select the server
bind. There is no required `.env` example. Browser review variables above are
tooling configuration, not application secrets.

The requested `test-portoflio` spelling has no declared route. The existing
configuration in `Strange500/nixos-config` declares
**https://test-portfolio.qgroget.com/fr**, routed to 127.0.0.1:3002 and the
rootless `hermes` user service `portfolio-test`. mTLS must remain enabled.
Production uses the independent `portfolio` flake input.

Update only `portfolio-test` in deployment PR #112. On an authorized host, build
and inspect the exact generated Home Manager user unit, retain the previous
preview unit for rollback, and activate only `portfolio-test.service`; do not
run a system switch or restart production. Verify its ExecStart, active state,
build ID, served HTML versus the package, and WASM loading through an authorized
browser or SSH tunnel. A temporary manual unit activation can be reverted by a
later Home Manager deployment until the pin PR merges.

This environment has no SSH credential or mTLS client certificate for that host.
A pushed pin / successful local build is **not** a verified remote deployment.

Ultrawide regression (against the standalone server above):

```sh
CHROME_PATH=/usr/bin/chromium PORTFOLIO_URL=http://localhost:3100 \
  REVIEW_DIR=/tmp/portfolio-ultrawide node scripts/test-ultrawide.mjs
```

This checks 203 desktop viewport states across seven screen sizes, including
2560×720 and 5120×1440. CI runs it against the packaged standalone server
and uploads viewport screenshots and geometry evidence.

Desktop staged navigation regression (900px and wider):

```sh
CHROME_PATH=/usr/bin/chromium PORTFOLIO_URL=http://localhost:3100 \
  REVIEW_DIR=/tmp/portfolio-steps node scripts/test-step-navigation.mjs
```

The old comfort suite's native-wheel-distance assertion describes the previous
continuous-scroll design and is intentionally superseded. Use the step suite
for current input behavior, plus the ultrawide and raster suites for geometry.

First-transition pacing (real frame samples, forward/reverse modest scale and absence of a parked close-up,
ordinary transition duration and reduced motion):

```sh
CHROME_PATH=/usr/bin/chromium PORTFOLIO_URL=http://localhost:3100 \
  REVIEW_DIR=/tmp/portfolio-intro-timing node scripts/test-intro-timing.mjs
```

Technology textures (22 local assets, hidden-face cycling and inspection):

```sh
CHROME_PATH=/usr/bin/chromium PORTFOLIO_URL=http://localhost:3100 \
  REVIEW_DIR=/tmp/portfolio-technologies node scripts/test-intro-technologies.mjs
```

Audit texture masks and their Rust/WASM rendering, then interaction boundaries:

```sh
PORTFOLIO_URL=http://localhost:3100 node scripts/test-cube-logo-assets.mjs
PORTFOLIO_URL=http://localhost:3100 node scripts/test-cube-interaction-boundaries.mjs
```

### Mobile reading layout

Below 900px the homepage uses native document scrolling, including touch gestures
started on the inline cube. Sections grow with their content; the desktop dock,
step controls and pinned scene are hidden. A header menu links to chapter anchors.
The single Rust/WASM renderer is aligned with the small introduction demo and
pauses when that demo leaves the viewport. Horizontal gestures still rotate it.
Project technology names remain available as HTML in each relevant section.

```sh
CHROME_PATH=/usr/bin/chromium PORTFOLIO_URL=http://localhost:3100 \
  REVIEW_DIR=/tmp/portfolio-mobile node scripts/test-mobile-portfolio.mjs
```

This suite replaces the former mobile snap/viewport assertions. It checks five
phone/landscape sizes, native touch and intermediate scroll positions, the menu,
inline controls, responsive mode switching, and the persistent WASM renderer.

Recruiter journey (homepage information and CV, direct experience link, visible
results, bilingual case-study diagrams/update date, and contact):

```sh
CHROME_PATH=/usr/bin/chromium PORTFOLIO_URL=http://localhost:3100 \
  REVIEW_DIR=/tmp/portfolio-recruiter node scripts/test-recruiter-path.mjs
```
