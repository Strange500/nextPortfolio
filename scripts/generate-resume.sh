#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# generate-resume.sh
# Regenerate all resume artifacts from the portfolio's source of truth.
#
# Usage:
#   ./scripts/generate-resume.sh [options]
#
# Options:
#   --theme-en <name>   Theme for the EN resume  (default: from themes.config.json)
#   --theme-fr <name>   Theme for the FR resume  (default: from themes.config.json)
#   --install           Auto-install missing npm theme packages
#   --html              Output HTML in addition to PDF
#   --list-themes       Print available themes and exit
#   --skip-pdf          Only generate JSON, skip PDF rendering
#
# Theme names:
#   weasyprint          Custom single-column ATS layout (default)
#   even, flat, stackoverflow, elegant, spartan, kendall …
#   Any jsonresume-theme-<name> package on npm
#
# Run from the repo root (or anywhere; paths resolve from this script).
# -----------------------------------------------------------------------------
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/.." && pwd)"

# ---------------------------------------------------------------------------
# Defaults & arg parsing
# ---------------------------------------------------------------------------
THEME_EN=""
THEME_FR=""
INSTALL_FLAG=""
HTML_FLAG=""
SKIP_PDF=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --theme-en)   THEME_EN="$2";    shift 2 ;;
    --theme-fr)   THEME_FR="$2";    shift 2 ;;
    --install)    INSTALL_FLAG="--install"; shift ;;
    --html)       HTML_FLAG="--html"; shift ;;
    --skip-pdf)   SKIP_PDF=true;    shift ;;
    --list-themes)
      node "$DIR/render-resume.mjs" --list
      exit 0
      ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

# Build theme flags (pass them to render-resume.mjs only if explicitly set)
EN_THEME_FLAG=""
FR_THEME_FLAG=""
[[ -n "$THEME_EN" ]] && EN_THEME_FLAG="--theme $THEME_EN"
[[ -n "$THEME_FR" ]] && FR_THEME_FLAG="--theme $THEME_FR"

# ---------------------------------------------------------------------------
# Step 1 — Generate JSON Resume files
# ---------------------------------------------------------------------------
echo "▶ 1/2  Generating JSON Resumes (EN & FR)…"
node "$DIR/generate-resume.mjs"

if [ "$SKIP_PDF" = true ]; then
  echo "▶ Skipped PDF rendering (--skip-pdf)."
  exit 0
fi

# ---------------------------------------------------------------------------
# Step 2 — Render PDFs
# ---------------------------------------------------------------------------
echo "▶ 2/2  Rendering PDFs…"

render() {
  local json="$1"
  local pdf="$2"
  local lang="$3"
  local theme_flag="$4"

  node "$DIR/render-resume.mjs" \
    --resume "$json" \
    --output "$pdf" \
    --lang   "$lang" \
    ${theme_flag} \
    ${INSTALL_FLAG} \
    ${HTML_FLAG}
}

# English (US Letter)
render \
  "$ROOT/resume.json" \
  "$ROOT/public/resume.pdf" \
  "en" \
  "$EN_THEME_FLAG"

cp "$ROOT/public/resume.pdf" "$ROOT/public/resume-en.pdf"

# French (A4)
render \
  "$ROOT/resume-fr.json" \
  "$ROOT/public/resume-fr.pdf" \
  "fr" \
  "$FR_THEME_FLAG"

cp "$ROOT/public/resume-fr.pdf" "$ROOT/public/cv-fr.pdf"

# ---------------------------------------------------------------------------
echo ""
echo "▶ Done. Resume artifacts ready to deploy:"
echo "  public/resume.pdf     — English (${THEME_EN:-default theme})"
echo "  public/resume-en.pdf  — English (alias)"
echo "  public/resume-fr.pdf  — French  (${THEME_FR:-default theme})"
echo "  public/cv-fr.pdf      — French  (alias)"
echo ""
echo "  To switch theme: ./scripts/generate-resume.sh --theme-en even --theme-fr flat"
echo "  To list themes:  ./scripts/generate-resume.sh --list-themes"