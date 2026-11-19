# Homepage CV downloads

Chromium captures of the optimized standalone server, 19 November 2026.
The intro offers a secondary download action beside the work link. French and
English PDFs use native downloads with descriptive filenames; current language
comes first. The existing contact menu keeps its PDF preview behavior.

`PORTFOLIO_URL=http://localhost:3100 node scripts/test-homepage-resume.mjs` checks
first-viewport visibility, language ordering, actual browser downloads of both
PDFs (including file signatures), no section navigation and Escape focus return
on desktop and mobile. Downloads are stored only in the test output directory.
