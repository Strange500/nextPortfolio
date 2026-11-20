# Native mobile portfolio

Validated against the production standalone server with Chromium touch emulation.
Viewports: 320×568, 360×640, 390×844, 430×932 and 844×390.

The mobile layout uses native scroll, content-height chapters and an anchor menu.
The one persistent Rust/WASM cube sits after the introduction actions, with its
own catalogue and pause control, and stops rendering while offscreen. Vertical
gestures starting on its faces scroll the page; horizontal gestures rotate it
with inertia. Desktop retains its staged scene at 900px and above.

The mobile browser suite checks intermediate scroll positions, actual touch
input, cube-origin pan/rotation, inertia, native anchor links, catalogue focus,
expanded content, reduced motion and a persistent renderer across breakpoints.
Other passing checks: production build/TypeScript, scoped ESLint, desktop step
navigation, technology interactions, interaction boundaries, system palettes and
native French/English CV downloads. No page errors were observed in these suites.

Screenshots: [introduction](intro.png), [small phone](small-phone.png),
[reading](reading.png), [contact](contact.png),
[dark landscape / reduced motion](dark-landscape.png).

```sh
PORTFOLIO_URL=http://localhost:3107 CHROME_PATH=/usr/bin/chromium \
  node scripts/test-mobile-portfolio.mjs
```

Physical iOS/Safari and Android devices have not been tested in this environment.
