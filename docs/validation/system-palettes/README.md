# System palettes

Chromium viewport captures of the optimized standalone server, 18 November 2026.

- `dark.png`: Encre & glacier, following the system dark preference.
- `light.png`: Papier & cobalt, following the system light preference.
- `theme-menu-mobile.png`: persistent appearance button and selected Automatic option on the contact chapter.

Reproduce with `PORTFOLIO_URL=http://localhost:3100 node scripts/test-system-palettes.mjs`.
The test covers initial detection and live light/dark changes, persistent WASM
canvas recoloring (including reduced motion), text/action contrast, mobile,
portalled résumé menus and CSS fallback before JavaScript hydration.
