"""Validate generated resume PDFs against current JSON, not outdated content.
Run after npm run resume; requires PyMuPDF. Writes visual previews to --output.
"""
import argparse
from itertools import combinations
import json
from pathlib import Path
import re
import pymupdf

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
for lang, filename, alias in [('en', 'resume.pdf', 'resume-en.pdf'), ('fr', 'resume-fr.pdf', 'cv-fr.pdf')]:
    data = json.loads((ROOT / f'resume-{lang}.json').read_text())
    document = pymupdf.open(ROOT / 'public' / filename)
    assert len(document) == 1, (lang, 'page count', len(document))
    assert (ROOT / 'public' / filename).read_bytes() == (ROOT / 'public' / alias).read_bytes()
    page = document[0]
    text = page.get_text()
    assert not page.get_images(), (lang, 'unexpected image')
    assert abs(page.rect.width - 595.276) < .01 and abs(page.rect.height - 841.89) < .01
    assert not re.search(r'70\s*%|Bachelor|M\.Eng|Master of Engineering|fin d’études', text)
    assert '2027' in text and ('3-month' in text or '3 mois' in text)
    assert 'DUT' in text and 'IMT Nord Europe' in text
    assert all(p['name'] in text for p in data['projects'])
    normalized = re.sub(r'\s+', ' ', text).strip()
    for claim in [h for job in data['work'] for h in job.get('highlights', [])] + [p['description'] for p in data['projects']]:
        assert re.sub(r'\s+', ' ', claim).strip() in normalized, (lang, 'missing or broken claim', claim)
    assert 'RayTracer' in text
    assert 'pico-ledger' not in text and 'ascii-cube' not in text
    words = page.get_text('words')
    for word in words:
        assert page.rect.contains(pymupdf.Rect(word[:4])), (lang, 'out of bounds', word)
    overlaps = []
    for first, second in combinations(words, 2):
        overlap = pymupdf.Rect(first[:4]) & pymupdf.Rect(second[:4])
        if overlap.width > .5 and overlap.height > .5:
            overlaps.append((first[4], second[4], tuple(overlap)))
    assert not overlaps, (lang, 'overlapping words', overlaps[:10])
    for link in page.get_links():
        assert page.rect.contains(link['from']), (lang, 'out-of-bounds link', link)
    actual = {link['uri'] for link in page.get_links() if 'uri' in link}
    expected = {data['basics']['url'], 'mailto:' + data['basics']['email']}
    expected.update(p['url'] for p in data['basics']['profiles'])
    expected.update(w['url'] for w in data['work'] if w.get('url'))
    expected.update(p[key] for p in data['projects'] for key in ['url', 'blog'] if p.get(key))
    assert expected <= actual, (lang, 'missing links', expected - actual)
    spans = [s for b in page.get_text('dict')['blocks'] if 'lines' in b for l in b['lines'] for s in l['spans'] if s['text'].strip()]
    assert min(s['size'] for s in spans) >= 7
    (args.output / f'resume-{lang}.txt').write_text(text)
    page.get_pixmap(dpi=144, alpha=False).save(args.output / f'resume-{lang}.png')
    (args.output / f'links-{lang}.json').write_text(json.dumps(sorted(actual), indent=2))
    print(f'{lang}: 1 A4 page, {len(words)} words, no collisions or clipping, {len(actual)} URI targets, min font {min(s["size"] for s in spans):.2f}pt')
