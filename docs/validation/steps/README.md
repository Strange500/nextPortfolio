# Staged navigation review

The current homepage has seven fixed-height reading states. These viewport
captures show the collapsed Rust chapter, mobile mission overview and ultrawide
contact. Technical content is preserved in native disclosures; opening one can
scroll inside the chapter, without shifting the window to another chapter.

Run `scripts/test-step-navigation.mjs` against the optimized standalone server
with CHROME_PATH, PORTFOLIO_URL and REVIEW_DIR as documented in
../../local-development.md. It checks all seven chapters at 1440×1000,
2560×720, 3440×1440 and 390×844, including that each default chapter fits its
screen, plus threshold, inertia, reverse input, keyboard, disclosures, touch,
resize, direct links and reduced motion. CI uploads the complete screenshot
matrix and JSON measurements alongside the ultrawide review artifact.

This supersedes the old continuous-scroll input behavior. The single persistent
Rust/WASM instance and the 240×120 silhouette regression remain unchanged.
These are local screenshots; they do not establish remote host activation.
