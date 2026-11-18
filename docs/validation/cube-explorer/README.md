# Contextual technology explorer

Captured on the optimized standalone build with Chromium, 18 November 2026.

- `rust.png`: upright legends attached to the real projected face centres.
- `mobile-card.png`: technology inspection without leaving the intro.
- `parcours.webm`: three trackball gestures with damped release, first transition, then moving Rust chapter legends.

Run `CHROME_PATH=/usr/bin/chromium PORTFOLIO_URL=http://localhost:3100 node scripts/test-intro-technologies.mjs` for interaction evidence and fresh viewport screenshots. The script checks curated chapter sets, drag versus click, keyboard, reduced motion, touch drag/tap, angular velocity decay, moving labels, landscape content width, stale legend removal, one persistent cube and browser exceptions.

Five technologies without local logo files use monochrome typographic marks; the other 17 retain the existing assets. No official logo was invented. There is no production deployment in this change.

`node scripts/test-cube-orientation.mjs` verifies the XYZ bridge at both gimbal poles, quaternion composition, interpolation and inertial travel at 30/120 Hz. Gesture state never accumulates Euler angles; only the unchanged WASM/projection API receives an XYZ conversion. Reduced motion disables coasting.
