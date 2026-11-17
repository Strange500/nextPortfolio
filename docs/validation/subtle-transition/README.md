# Restrained opening transition

The first transition keeps the entire cube in the viewport, with a modest scale
lift rather than a full-screen zoom. The stage peaks at 40% of the bounded
composition width, capped at 640px and the available viewport height. Compared
with the intro stage (32%), this is a 25% lift when height permits. Translation
and rotation continue through the peak; there is no parked close-up.

The intro fades before the cube crosses the center. Rust fades in during its
retreat, with both HTML compositions pinned to their reading positions. The
2400ms opening pace, reverse travel, one Rust/WASM instance and reduced motion
are retained. Later chapter transitions remain at 1100ms.

`subtle-transition.webm` records the optimized standalone build at 1440×1000,
30fps, 75% scale. PNGs retain full viewport resolution. Frame measurements in
`evidence.json` show a maximum stage around 576px, continuous movement and open
space around the cube. The timing regression now rejects stage sizes over
640px and rejects viewport-wide coverage. The ultrawide suite once again
requires viewport-safe bounds throughout the opening, with no overscan exception.

The previous full-screen foreground recording is historical. These local
observations do not establish remote service activation.
