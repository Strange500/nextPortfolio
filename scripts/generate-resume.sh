#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Regenerate the ATS-ready resume from the portfolio's source of truth.
#
#   1. generate-resume.mjs  data/*.ts + data/*.json  ->  resume.json
#   2. render-resume.py     resume.json               ->  public/resume.pdf
#
# Run from the repo root (or anywhere; paths resolve from this script).
# -----------------------------------------------------------------------------
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/.." && pwd)"

# Resolve a Python interpreter that has weasyprint, auto-provisioning a local
# venv if none is available. Order: active venv -> repo .venv -> system python
# -> auto-provision (.venv via uv).
find_python() {
  if [ -n "${VIRTUAL_ENV:-}" ] && "$VIRTUAL_ENV/bin/python" -c "import weasyprint" 2>/dev/null; then
    echo "$VIRTUAL_ENV/bin/python"; return 0
  fi
  if [ -x "$ROOT/.venv/bin/python" ] && "$ROOT/.venv/bin/python" -c "import weasyprint" 2>/dev/null; then
    echo "$ROOT/.venv/bin/python"; return 0
  fi
  local syspy
  syspy="$(command -v python3 || command -v python)"
  if [ -n "$syspy" ] && "$syspy" -c "import weasyprint" 2>/dev/null; then
    echo "$syspy"; return 0
  fi
  if command -v uv >/dev/null 2>&1; then
    echo "  (provisioning $ROOT/.venv with weasyprint…)" >&2
    uv venv "$ROOT/.venv" --python 3.13 >&2
    uv pip install --python "$ROOT/.venv/bin/python" weasyprint >&2
    echo "$ROOT/.venv/bin/python"; return 0
  fi
  return 1
}

echo "▶ 1/2  Generating resume.json (JSON Resume)…"
node "$DIR/generate-resume.mjs"

echo "▶ 2/2  Rendering public/resume.pdf (WeasyPrint)…"
if ! PY="$(find_python)"; then
  echo "✗ weasyprint not found and uv not available." >&2
  echo "  Install it with:  pip install weasyprint   (needs system pango/cairo)" >&2
  exit 1
fi

"$PY" "$DIR/render-resume.py"

echo "▶ Done. public/resume.pdf is ready to deploy."