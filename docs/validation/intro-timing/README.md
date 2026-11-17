> Historical paused close-up; superseded by the continuous foreground passage
> documented in ../foreground-passage/. This recording is not the current animation.

# First transition pacing

The desktop intro ↔ Rust transition now lasts 2800ms rather than 1100ms.
Its existing window/cube path is re-timed into an 800ms approach, 650ms
close-up plateau, 900ms retreat and 450ms reading-screen arrival. The path
still ends the cube movement before the Rust title reaches its area.
Ordinary chapter transitions stay at 1100ms; reduced motion remains instant.
Mobile retains its shorter transition without the desktop zoom choreography.

`first-transition.webm` records the real staged transition in the optimized
standalone build (Chromium, 1440×1000, 15fps at 75% scale). The four PNGs
retain full viewport resolution. Frame samples in `evidence.json` measured
approximately 2.82s forward and 2.81s reverse, with 0.87–0.88s within 3px of
the central close-up at essentially maximum scale. The apparent hold includes
the gently eased edges of the explicit 650ms plateau. No page errors occurred.

`scripts/test-intro-timing.mjs` verifies the minimum readable close-up hold,
forward/reverse duration, ordinary transition rhythm and reduced motion using
actual browser frames. CI runs it alongside the chapter and ultrawide suites.
These are local observations, not remote deployment verification.
