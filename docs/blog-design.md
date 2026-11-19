# Editorial blog and cube constellation

The blog shares the portfolio’s typography, signature, system palettes, language
and appearance controls. The index leads with the newest real publication,
followed by an editorial archive rather than floating cards. Dates, tags,
article sources and reported results remain unchanged. Posts using a
`description` frontmatter field now expose it as their summary too.

Article layout keeps a bounded reading column, a compiled heading outline on
large screens and a native expandable outline below 1100px. Internal H1s become
H2s, with stable Unicode-aware unique IDs. A repeated publication title at the
start of legacy MDX is omitted from the rendered body; source files are intact.
Tables use `remark-gfm` and scroll within the reading column. Code, callouts
and Mermaid diagrams follow the selected palette. Enlarged diagrams use the
existing accessible dialog primitives (Escape and focus return).

The old point cloud and its document-wide mouse/context-menu handlers are
removed. The decorative wireframe constellation exists only in the blog layout:
9 varied cubes on the index (4 on small screens), 5 slower cubes in desktop
article margins, none behind mobile article text. It draws at most 24 fps, caps
DPR at 2 and the backing store at 4096×2160, pauses outside the viewport or in a
hidden document, and draws a static composition for reduced motion. It does
not replace, instantiate or modify the homepage’s Rust/WASM cube.

`npm ci` installs the frozen lockfile. `remark-gfm` 4.0.1 is the only new direct
dependency; its transitive heading utility is updated as required. The Nix npm
hash is recomputed using the nixpkgs revision pinned in `flake.lock`.

Run against an optimized standalone server:

```sh
PORTFOLIO_URL=http://localhost:3100 node scripts/test-blog-design.mjs
```

The browser regression checks every existing FR/EN article in both themes,
heading/outline integrity, semantic tables, diagram enlargement, mobile,
ultrawide/landscape, reduced motion, offscreen suspension, keyboard skip link,
theme/language changes and navigation back to the original WASM scene. Viewport
captures and JSON evidence are written to `REVIEW_DIR` (default `/tmp/blog-review`).

Light-mode cube edges use stronger opacity and a 1.1px stroke; dark mode keeps
its quieter 0.8px edges. The shared rotation phase advances at 0.16 rad/s on the
index and 0.06 rad/s in reading margins. Motion remains capped at 24 fps and is
still disabled by reduced-motion preferences.
