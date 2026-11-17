# Intro technology showcase — first prototype

The persistent Rust/WASM cube displays the 17 existing technology logos from
`data/technologies.ts`, sampled once from the local legacy SVG/PNG assets into
100×100 monochrome textures. Its intro-only yaw/pitch/roll is stronger; a logo
changes only after its face has been visible and is safely on the rear side.
Hover and pause freeze rotation and cycling. The caption names the technology
and actual section destination; clicking still navigates using the projected
face. Text/keyboard/mobile navigation remains available.

Leaving the intro freezes its rotation clock, blends into the existing scene
along the shortest angular path and fades logos back into ordinary ASCII face
materials. The cube is not replaced. Return restores the cached assignments.
Reduced motion uses a static cube and exposes the HTML technology list.

A fine static monochrome grain overlays the whole scene at low-opacity
soft-light blend. The local 192×192 SVG tile needs no animation loop and does
not intercept input. Higher-contrast preference disables it. The grain was
visually inspected and served with HTTP 200 / image/svg+xml. A flat background
sample has about 1.7–2.1 RGB-level standard deviation with grain, versus zero
without it, keeping text and ASCII details readable.

`technology-showcase.webm` records the optimized standalone page: intro rotation,
hidden logo changes, hover pause and real wheel navigation to Rust. Chromium,
1440×1000, 30fps at 75% scale. PNGs retain full viewport resolution; mobile is
390×844. The reduced-motion screenshot includes the accessible technology list.

`evidence.json` records the prototype regression: all 17 assets decoded, observed
changes were on hidden faces, substantial intro rotation, hover freeze, an actual
projected-face click, calm section motion, one persistent cube, return, reduced
motion, mobile layout and no page errors. The ordinary intro-transition timing
suite also passed; the 720-orientation Rust raster regression remains green.
CI runs these alongside the chapter, ultrawide and package checks.

These are local prototype observations, not activation of a remote service.
