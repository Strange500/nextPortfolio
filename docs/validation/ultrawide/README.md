# Ultrawide correction review

Verified against a production-mode standalone build in Chromium, 2026-11-17.

The previous viewport-wide placement made the intro stage 1376px wide at
3440×1440 and put its top above the viewport. The footer combined a 1440px
maximum width with 54vw horizontal padding, collapsing its first content
column to zero width. Both now use a shared, centered 1600px composition;
the background still fills the screen. Contact content measures 736px at
3440×1440. The cube recedes and rises during cross-column traversals, keeping
incoming titles clear. Its first close-up finishes before Rust reading begins.

`evidence.json` records 232 passing checkpoints across 1440×1000, 1920×1080,
2560×1080, 2560×720, 3440×1440, 3840×1080, 5120×1440 and 390×844.
Checks cover stage bounds, actual canvas paint, visible faces, SVG projection,
text overlap, contact width, reverse traversal and résumé menu bounds. No
JavaScript page errors were recorded. Selected viewport PNGs show the intro,
close-up, Rust entry and contact. These are local validation, not evidence of
remote service activation.

The separate raster regression samples 720 orientations at 240×120, zoom
3300: zero interior holes and zero border-touching frames. The earlier 200×100
raster touched a border in 469 sampled orientations. The existing Rust/WASM
engine, camera zoom and single persistent cube remain in use.

Run commands are in ../../local-development.md. CI uploads the complete
ultrawide screenshot set as `portfolio-ultrawide-review`.
