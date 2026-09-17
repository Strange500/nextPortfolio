#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Regenerate the ATS-ready resumes (EN & FR) from the portfolio's source of truth.
#
#   1. generate-resume.mjs  data/*.ts + data/*.json  ->  resume.json / resume-fr.json
#   2. render-resume.py     resume.json               ->  public/resume.pdf (EN)
#                           resume-fr.json            ->  public/resume-fr.pdf (FR)
#
# Run from the repo root (or anywhere; paths resolve from this script).
# -----------------------------------------------------------------------------
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/.." && pwd)"

# Run Python with WeasyPrint available. Order:
# active venv -> repo .venv -> system python -> nix-shell -> auto-provision (uv).
run_python() {
  if [ -n "${VIRTUAL_ENV:-}" ] && "$VIRTUAL_ENV/bin/python" -c "import weasyprint" 2>/dev/null; then
    "$VIRTUAL_ENV/bin/python" "$@"
    return $?
  fi
  if [ -x "$ROOT/.venv/bin/python" ] && "$ROOT/.venv/bin/python" -c "import weasyprint" 2>/dev/null; then
    "$ROOT/.venv/bin/python" "$@"
    return $?
  fi
  local syspy
  syspy="$(command -v python3 || command -v python || true)"
  if [ -n "$syspy" ] && "$syspy" -c "import weasyprint" 2>/dev/null; then
    "$syspy" "$@"
    return $?
  fi
  if command -v nix-shell >/dev/null 2>&1; then
    nix-shell -p python3Packages.weasyprint --run "python3 $(printf '%q ' "$@")"
    return $?
  fi
  if command -v uv >/dev/null 2>&1; then
    echo "  (provisioning $ROOT/.venv with weasyprint…)" >&2
    uv venv "$ROOT/.venv" --python 3.13 >&2
    uv pip install --python "$ROOT/.venv/bin/python" weasyprint >&2
    "$ROOT/.venv/bin/python" "$@"
    return $?
  fi
  echo "✗ weasyprint not found and neither nix-shell nor uv is available." >&2
  echo "  Install it with:  pip install weasyprint   (needs system pango/cairo)" >&2
  return 1
}

echo "▶ 1/2  Generating JSON Resumes (EN & FR)…"
node "$DIR/generate-resume.mjs"

echo "▶ 2/2  Rendering PDFs with WeasyPrint…"
# English version (US Letter, ATS-friendly)
run_python "$DIR/render-resume.py" "$ROOT/resume.json" "$ROOT/public/resume.pdf" --letter --lang en
cp "$ROOT/public/resume.pdf" "$ROOT/public/resume-en.pdf"

# French version (A4, format français standard)
run_python "$DIR/render-resume.py" "$ROOT/resume-fr.json" "$ROOT/public/resume-fr.pdf" --a4 --lang fr
cp "$ROOT/public/resume-fr.pdf" "$ROOT/public/cv-fr.pdf"

echo "▶ Done. All resume artifacts are ready to deploy:"
echo "  - public/resume.pdf (English ATS, Letter)"
echo "  - public/resume-en.pdf (English ATS, Letter)"
echo "  - public/resume-fr.pdf (French A4)"
echo "  - public/cv-fr.pdf (French A4)"