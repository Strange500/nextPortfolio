# Continuous opening foreground passage

The desktop intro → Rust transition is a continuous 2400ms passage. The same
Rust/WASM cube translates, rotates and grows beyond the viewport, occludes the
old composition with a restrained overscan, then recedes to its Rust reading position while revealing the
new composition. Both HTML compositions stay in place during the passage; they
swap under the opaque projected cube. There is no parked close-up or intro fade.
Reverse travel follows the same path. Later chapter transitions retain 1100ms;
reduced motion remains instant and mobile retains its compact transition.

`foreground-passage.webm` records the actual optimized standalone page in
Chromium (1440×1000, 30fps, 75% scale). PNGs retain full viewport resolution.
`evidence.json` records actual frame timing, full opacity at 15 viewport sample
points during occlusion and continuous center movement through the close-up,
in both directions. The timing test replaces the previous hold assertion.

The viewport canvas is bounded by DPR 2 and 4096×2160, independently of the
oversized cube, keeping enlarged glyphs sharp without a giant backing buffer.
One fill of the actual visible face paths prevents HTML leaking between glyphs
or along face seams. Face hit geometry and opaque faces share the same projected
corners. The Rust/WASM engine and single persistent cube are preserved.

The 232-state ultrawide and 28-state chapter suites passed locally. The ultrawide
bounds check exempts only the deliberate opening foreground passage; reading
states remain bounded, with no horizontal document overflow. CI also runs the
new timing/occlusion regression. These recordings establish local behavior,
not activation of a remote host.
