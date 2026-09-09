# Resume pipeline (US / ATS-oriented)

Generates a standardized `resume.json` (JSON Resume schema) and an ATS-friendly
PDF from the portfolio's single source of truth — no duplicated content, no
manual sync.

## One command

```bash
./scripts/generate-resume.sh
```

This produces:

| Output            | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `resume.json`     | JSON Resume schema, US-localized, `show-don't-tell`.     |
| `public/resume.pdf` | Single-column, ATS-friendly PDF (Inter + Fira Code).   |

Both files are **committed** and are the artifacts the portfolio's "Download
Resume" CTA points to.

## How it works

1. `generate-resume.mjs` imports the live data files
   (`data/dictionaries.ts`, `data/education.ts`, `data/projects.json`,
   `data/technologies.ts`) using Node's native TypeScript type-stripping
   (`node` ≥ 23), maps them onto the JSON Resume schema, and writes
   `resume.json`. Resume-only fields (contact info, objective, languages,
   interests, project rewrites) live at the top of the script.
2. `render-resume.py` renders `resume.json` to PDF with WeasyPrint.

## Dependencies

- **Node ≥ 23** (native `.ts` type-stripping).
- **WeasyPrint** (Python) — `pip install weasyprint`, plus the system
  `pango`/`cairo`/`pango` libraries it needs.

## Design & content rules

- **Single column**, standard section headings → parses cleanly in ATS.
- **No pure black** — body text is `#1E293B` (anthracite).
- **Inter** for body, **Fira Code** for technical accents (dates, links, tech).
- **"Show, don't tell"**: every project/job uses *Action + Tool + Result*.
- **No fabricated metrics** — no invented percentages or counts (see the
  `portfolio-resume-polishing` skill).
- **Faithful US localization**: `M.Eng. (Diplôme d'Ingénieur)`, `Software
  Engineer (Co-op)` — no inflated titles or degrees.