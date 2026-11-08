"""Check committed resume PDFs and write full-page PNGs (requires PyMuPDF).

Run from the repository root after `npm run resume`:
  python scripts/check-resume-layout.py --baseline origin/main
"""
import argparse
from collections import Counter
import json
from itertools import combinations
from pathlib import Path
import re
import subprocess

import pymupdf

ROOT = Path(__file__).resolve().parent.parent


def baseline(ref, path):
    return subprocess.check_output(["git", "show", f"{ref}:{path}"], cwd=ROOT)


def words(document):
    # Ignore layout-dependent whitespace, but preserve every factual word/number.
    return Counter(re.findall(r"\w+", "\n".join(p.get_text() for p in document)))


def uris(document):
    return {link["uri"] for page in document for link in page.get_links() if "uri" in link}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--baseline", default="origin/main")
    parser.add_argument("--output", type=Path, default=ROOT / "docs/resume-preview")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)

    for name in ("resume.json", "resume-en.json", "resume-fr.json"):
        assert json.loads((ROOT / name).read_text()) == json.loads(baseline(args.baseline, name)), name
    print("JSON: all three sources unchanged from", args.baseline)

    for lang, name, alias in (("en", "resume.pdf", "resume-en.pdf"), ("fr", "resume-fr.pdf", "cv-fr.pdf")):
        path = f"public/{name}"
        document = pymupdf.open(ROOT / path)
        old = pymupdf.open(stream=baseline(args.baseline, path), filetype="pdf")
        assert len(document) == 1, f"{lang}: expected one page, got {len(document)}"
        assert words(document) == words(old), f"{lang}: text changed: {words(document) - words(old)} / {words(old) - words(document)}"
        assert uris(document) == uris(old), f"{lang}: link targets changed"
        assert (ROOT / path).read_bytes() == (ROOT / "public" / alias).read_bytes(), alias
        page = document[0]
        assert abs(page.rect.width - 595.276) < 0.01 and abs(page.rect.height - 841.89) < 0.01, page.rect
        assert not page.get_images(), f"{lang}: unexpected photo/image"
        spans = [span for block in page.get_text("dict")["blocks"] if "lines" in block
                 for line in block["lines"] for span in line["spans"] if span["text"].strip()]
        assert min(s["size"] for s in spans) >= 6.99, f"{lang}: text below 7pt"
        for word in page.get_text("words"):
            assert page.rect.contains(pymupdf.Rect(word[:4])), f"{lang}: out-of-page word {word}"
        for first, second in combinations(page.get_text("words"), 2):
            overlap = pymupdf.Rect(first[:4]) & pymupdf.Rect(second[:4])
            assert overlap.width <= 0.5 or overlap.height <= 0.5, f"{lang}: overlapping words {first} / {second}"
        for link in page.get_links():
            assert page.rect.contains(link["from"]), f"{lang}: out-of-page link {link}"
        preview = args.output / f"resume-{lang}.png"
        page.get_pixmap(dpi=144, alpha=False).save(preview)
        print(f"{lang}: 1 A4 page, {len(page.get_text('words'))} words in bounds, "
              f"{len(uris(document))} unchanged URI targets, no images; "
              f"font >= {min(s['size'] for s in spans):.1f}pt; "
              f"bottom={max(s['bbox'][3] for s in spans):.2f}pt; PNG: {preview}")


if __name__ == "__main__":
    main()
