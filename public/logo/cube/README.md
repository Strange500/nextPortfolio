# Cube-specific technology glyphs

The cube rasterizes transparent monochrome shapes using alpha, preserving the
negative spaces in JavaScript/TypeScript instead of merging letters into their
colored tile backgrounds. These are local files; no runtime CDN request occurs.

- 19 glyphs are unmodified Simple Icons 16.0.0 SVGs, fetched from
  https://cdn.jsdelivr.net/npm/simple-icons@16.0.0/icons/ . The filename is the
  upstream icon slug. CC0 license: `SIMPLE-ICONS-LICENSE.md`.
- Nix and NixOS share the NixOS snowflake. Project-specific captions distinguish
  their roles; no separate Nix symbol is invented.
- `java.svg` retains the existing `../jee.svg` path geometry, normalized to
  black for alpha sampling. The portfolio displays this existing asset as Java.
- `home-manager.svg` is a local typographic project identifier, not an official
  brand emblem. The Home Manager repository provides no dedicated logo asset;
  the name remains readable instead of borrowing another project's symbol.
- WebAssembly, Apache Maven and Bitcoin now use their glyphs rather than the
  earlier generated WASM/MAVEN/BTC text fallbacks.

Names and trademarks remain those of their owners. Other portfolio assets are
unchanged. `scripts/test-cube-logo-assets.mjs` renders the real texture loader,
checks all 22 entries (including decode failures and solid/blank masks), and
writes an ASCII atlas for visual review.
