# Recruitment-oriented portfolio review

The mobile PR #49 was merged before this branch. This change keeps its native
mobile scrolling and the desktop cube choreography.

## Content evidence

The backend history was reviewed across all five pages of commits available on
the default branch, along with selected diffs and current execution code. It
contains an inherited project with several contributors. Benjamin's first
identified contribution is dated 23 September 2025; the latest in that history
is dated 7 October 2026. These are contribution dates, not a claim that the
project or the employment started with the first commit.

The progression supports maintenance and data preparation, reusable Selenium
abstractions and unit tests, Spring Boot migration, asynchronous API execution,
persistence/history, cancellation, permissions and simple restart recovery.
The implementation confirms a notification-based WebSocket frontend which
reloads execution details via REST. Server-side notification publishing is a
team contribution.

The frontend repository contains an import snapshot rather than its full
development history. Benjamin confirmed that he built the interface end to end,
starting in early August 2026. That date is not inferred from the November import.

The repositories remain private. No employer source, configuration, credentials,
logs or application data was copied into this public portfolio. The revised
article uses original explanatory diagrams and high-level descriptions.

The 50–70 test scope, ~4h to <10min migration estimate, ~70% false-positive
reduction estimate and separate ~40-developer support tool remain reported work
experience, not independently validated measurements. Benjamin confirmed that
the measurement context for ~70% is unavailable. The article states that limit
and no longer presents the former 50ms/20s example as a measured result.

The Nix article now distinguishes six hosts from the seventh target (installer
ISO), consistent with the homepage and résumé.

## Reproduce validation

Build and run the standalone server as in `docs/local-development.md`, then:

```sh
PORTFOLIO_URL=http://localhost:3110 CHROME_PATH=/usr/bin/chromium \
  node scripts/test-recruiter-path.mjs
PORTFOLIO_URL=http://localhost:3110 CHROME_PATH=/usr/bin/chromium \
  node scripts/test-step-navigation.mjs
PORTFOLIO_URL=http://localhost:3110 CHROME_PATH=/usr/bin/chromium \
  node scripts/test-mobile-portfolio.mjs
PORTFOLIO_URL=http://localhost:3110 CHROME_PATH=/usr/bin/chromium \
  node scripts/test-blog-design.mjs
PORTFOLIO_URL=http://localhost:3110 CHROME_PATH=/usr/bin/chromium \
  node scripts/test-homepage-resume.mjs
```

The recruiter-path suite checks the actual homepage → professional experience →
case study → contact flow in FR/EN, first-viewport availability/CV access at
1440×1000, 1440×600, 390×844 and 320×568, non-collapsed results, both article
diagrams, its update date and responsive overflow. It runs in CI alongside the
existing browser regressions.

CVs were regenerated with the existing WeasyPrint renderer (70.0 in an external
virtual environment). FR/EN PDFs and aliases remain one A4 page with selectable
text. Physical mobile devices and Safari were not available for this review.

Visual checkpoints: [desktop introduction](desktop-intro.png),
[short desktop / experience](desktop-experience.png),
[mobile introduction](mobile-intro.png), [small phone](small-phone.png),
and [case study](article.png).

Completed local checks include production build/TypeScript, scoped ESLint, the
recruiter journey, 21 desktop reading states plus input/detail regressions,
203 ultrawide checkpoints, five native-mobile sizes and touch interactions,
12 blog article/theme combinations, contextual technology interactions and
native FR/EN PDF downloads. Browser suites reported no page errors.

The final 600px-height composition also keeps the featured case above the desktop
navigation: [short desktop introduction](short-desktop.png). The first-scroll
regression reported zero hero, Rust and header drift in both directions.
