# Resume & CV Pipeline (English ATS + French A4)

Generates standardized `resume.json` / `resume-fr.json` (JSON Resume schema) and print-ready PDFs from the portfolio's single source of truth — no duplicated content, no manual sync.

## One command

```bash
./scripts/generate-resume.sh
# or: npm run resume
```

This produces:

| Output                 | Format / Size | Description                                           |
| ---------------------- | ------------- | ----------------------------------------------------- |
| `resume.json`          | JSON Resume   | Canonical English JSON Resume schema, US-localized    |
| `resume-en.json`       | JSON Resume   | English JSON Resume schema                            |
| `resume-fr.json`       | JSON Resume   | French JSON Resume schema                             |
| `public/resume.pdf`    | US Letter     | English ATS-friendly PDF (Inter + Fira Code, 1 page)  |
| `public/resume-en.pdf` | US Letter     | English ATS-friendly PDF (alias)                      |
| `public/resume-fr.pdf` | A4            | French standard PDF (Inter + Fira Code, 1 page)       |
| `public/cv-fr.pdf`     | A4            | French standard PDF (alias)                           |

All files are committed and are the artifacts the portfolio's "Resume / CV" CTA points to.

## How it works

1. `generate-resume.mjs` imports the live data files
   (`data/dictionaries.ts`, `data/education.ts`, `data/projects.json`, `data/projects_fr.json`,
   `data/technologies.ts`) using Node's native TypeScript type-stripping
   (`node` ≥ 23), maps them onto the JSON Resume schema, and writes
   `resume.json`, `resume-en.json`, and `resume-fr.json`.
2. `render-resume.py` renders the JSON Resumes into PDFs with WeasyPrint:
   - English: US Letter, ATS-oriented, English dates & headings
   - French: A4, French standard, localized dates & headings

## Dependencies

- **Node ≥ 23** (native `.ts` type-stripping).
- **WeasyPrint** (Python) — automatically discovered via active venv, `.venv`, system python, Nix (`nix-shell`), or auto-provisioned via `uv`.

## Design & content rules

- **Single column**, standard section headings → parses cleanly in ATS and reads clearly on paper.
- **No pure black** — body text is `#1E293B` (anthracite).
- **Inter** for body, **Fira Code** for technical accents (dates, links, tech).
- **"Show, don't tell"**: every project/job uses *Action + Tool + Result*.
- **No fabricated metrics** — no invented percentages or counts.
- **Faithful localization**:
  - English: `M.Eng. (Diplôme d'Ingénieur)`, `Software Engineer (Co-op)`, US Letter
  - French: `Diplôme d'Ingénieur (Grade de Master)`, `Ingénieur Logiciel (Alternance)`, A4