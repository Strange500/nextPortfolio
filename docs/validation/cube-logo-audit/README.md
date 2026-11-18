# Technology glyph and interaction audit

22 textures decoded through the real loader and rendered through the pinned
Rust/WASM engine, 18 November 2026. `ascii-logo-atlas.png` shows the actual
front-face frame buffers; it is not an illustration of the intended glyphs.
`evidence.json` records coverage and negative-space checks for every texture.

JavaScript and TypeScript retain their cut-out letters; NixOS is a transparent
snowflake. WebAssembly, Maven and Bitcoin have local glyphs. Home Manager uses
a labeled typographic name (not a fabricated official emblem). Provenance and
licenses: `public/logo/cube/README.md`.

Reproduce against a running standalone server:

```sh
PORTFOLIO_URL=http://localhost:3100 node scripts/test-cube-logo-assets.mjs
PORTFOLIO_URL=http://localhost:3100 node scripts/test-cube-interaction-boundaries.mjs
```

The interaction regression checks wheel input at both boundaries, fractional
reading anchors, drag/card/touch followed by navigation, and explicit Pause.
