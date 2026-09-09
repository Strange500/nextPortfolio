#!/usr/bin/env python3
"""
render-resume.py
--------------------------------------------------------------------------------
Renders `resume.json` (JSON Resume schema) into an ATS-friendly, print-optimized
PDF using WeasyPrint. Single column, generous negative space, Inter for body and
Fira Code for technical accents. No pure black — anthracite #1E293B as the
primary text color.

    python3 scripts/render-resume.py            # writes public/resume.pdf
    python3 scripts/render-resume.py out.pdf    # custom output path

Dependencies: weasyprint (pip install weasyprint).
--------------------------------------------------------------------------------
"""
import html
import json
import sys
from pathlib import Path

from weasyprint import HTML

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "public" / "fonts"

# -- fonts (TTF — best supported by WeasyPrint) -------------------------------
INTER = FONTS / "Inter" / "extras" / "ttf"
FIRACODE = FONTS / "FiraCode" / "ttf"

MONTHS = {
    1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
    7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
}


def fmt_date(d: str) -> str:
    y, m, _ = d.split("-")
    return f"{MONTHS[int(m)]} {y}"


def fmt_range(start: str, end: str) -> str:
    s = fmt_date(start)
    e = "Present" if not end else fmt_date(end)
    return f"{s} &ndash; {e}"


def short_url(u: str) -> str:
    return u.replace("https://", "").replace("http://", "").rstrip("/")


def e(s: str) -> str:
    return html.escape(s or "")


def css() -> str:
    return f"""
    @font-face {{
      font-family: 'Inter';
      src: url('{INTER / "Inter-Regular.ttf"}');
      font-weight: 400; font-style: normal;
    }}
    @font-face {{
      font-family: 'Inter';
      src: url('{INTER / "Inter-Medium.ttf"}');
      font-weight: 500; font-style: normal;
    }}
    @font-face {{
      font-family: 'Inter';
      src: url('{INTER / "Inter-SemiBold.ttf"}');
      font-weight: 600; font-style: normal;
    }}
    @font-face {{
      font-family: 'Inter';
      src: url('{INTER / "Inter-Bold.ttf"}');
      font-weight: 700; font-style: normal;
    }}
    @font-face {{
      font-family: 'Fira Code';
      src: url('{FIRACODE / "FiraCode-Regular.ttf"}');
      font-weight: 400; font-style: normal;
    }}
    @font-face {{
      font-family: 'Fira Code';
      src: url('{FIRACODE / "FiraCode-Medium.ttf"}');
      font-weight: 500; font-style: normal;
    }}

    @page {{
      size: Letter;
      margin: 0.55in 0.65in 0.6in 0.65in;
    }}

    :root {{
      --ink: #1E293B;          /* body — anthracite, never pure black */
      --ink-strong: #0F172A;  /* headings */
      --ink-muted: #475569;   /* secondary labels / dates */
      --accent: #2563EB;      /* sparingly — links, label */
      --rule: #E2E8F0;        /* hairline dividers */
    }}

    * {{ box-sizing: border-box; }}
    body {{
      font-family: 'Inter', sans-serif;
      color: var(--ink);
      font-size: 10pt;
      line-height: 1.5;
      margin: 0;
    }}
    a {{ color: var(--accent); text-decoration: none; }}
    .mono {{ font-family: 'Fira Code', monospace; }}

    /* ---- header ---- */
    header {{ margin-bottom: 18pt; }}
    .name {{
      font-size: 24pt;
      font-weight: 700;
      color: var(--ink-strong);
      letter-spacing: -0.01em;
      margin: 0 0 2pt 0;
    }}
    .label {{
      font-size: 11pt;
      font-weight: 500;
      color: var(--accent);
      margin: 0 0 8pt 0;
    }}
    .contact {{
      font-size: 8.6pt;
      color: var(--ink-muted);
      line-height: 1.65;
    }}
    .contact .mono {{ color: var(--accent); }}
    .contact .sep {{ color: #CBD5E1; padding: 0 5pt; }}

    /* ---- sections ---- */
    section {{ margin-bottom: 14pt; }}
    h2 {{
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: var(--ink-strong);
      margin: 0 0 7pt 0;
      padding-bottom: 4pt;
      border-bottom: 1px solid var(--rule);
    }}

    /* ---- summary ---- */
    .summary p {{ margin: 0; color: var(--ink); }}

    /* ---- experience ---- */
    .job {{ margin-bottom: 9pt; }}
    .job:last-child {{ margin-bottom: 0; }}
    .job .head {{
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 1pt;
    }}
    .job .role {{
      font-weight: 600;
      color: var(--ink-strong);
      font-size: 10.5pt;
    }}
    .job .co {{ color: var(--ink); }}
    .job .date {{
      flex-shrink: 0;
      font-family: 'Fira Code', monospace;
      font-size: 8.6pt;
      color: var(--ink-muted);
      margin-left: 8pt;
    }}
    .job ul {{ margin: 3pt 0 0 0; padding: 0 0 0 13pt; }}
    .job li {{
      margin-bottom: 2pt;
      color: var(--ink);
      padding-left: 1pt;
    }}
    .job li::marker {{ color: #94A3B8; }}
    .deeplink {{
      font-family: 'Fira Code', monospace;
      font-size: 8pt;
      color: var(--accent);
      margin-top: 2pt;
    }}

    /* ---- projects ---- */
    .proj {{ margin-bottom: 8pt; }}
    .proj:last-child {{ margin-bottom: 0; }}
    .proj .head {{ margin-bottom: 1pt; }}
    .proj .name {{ font-weight: 600; color: var(--ink-strong); }}
    .proj .links {{
      font-family: 'Fira Code', monospace;
      font-size: 8pt;
    }}
    .proj .links .sep {{ color: #CBD5E1; padding: 0 4pt; }}
    .proj .desc {{ margin: 2pt 0 1pt 0; }}
    .proj .tags {{
      font-family: 'Fira Code', monospace;
      font-size: 8pt;
      color: var(--ink-muted);
      letter-spacing: 0.01em;
    }}

    /* ---- skills ---- */
    .skill-row {{ margin-bottom: 4pt; }}
    .skill-row:last-child {{ margin-bottom: 0; }}
    .skill-row .group {{ font-weight: 600; color: var(--ink-strong); }}
    .skill-row .items {{ color: var(--ink); }}
    .skill-row .items .mono {{ font-size: 8.6pt; }}

    /* ---- education ---- */
    .edu {{ margin-bottom: 6pt; }}
    .edu:last-child {{ margin-bottom: 0; }}
    .edu .head {{
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 0;
    }}
    .edu .study {{ font-weight: 600; color: var(--ink-strong); }}
    .edu .date {{
      flex-shrink: 0;
      font-family: 'Fira Code', monospace;
      font-size: 8.6pt;
      color: var(--ink-muted);
      margin-left: 8pt;
    }}
    .edu .school {{ color: var(--ink-muted); }}
    .edu .honor {{ font-style: italic; color: var(--ink-muted); font-size: 9pt; }}

    /* ---- languages & interests ---- */
    .lang-int {{ font-size: 9.5pt; color: var(--ink); }}
    .lang-int .sep {{ color: #CBD5E1; padding: 0 6pt; }}
    """


def render(data: dict) -> str:
    b = data["basics"]

    # header
    contact_parts = []
    if b.get("email"):
        contact_parts.append(f'<a href="mailto:{e(b["email"])}">{e(b["email"])}</a>')
    if b.get("phone"):
        contact_parts.append(f'<span class="mono">{e(b["phone"])}</span>')
    if b.get("location"):
        loc = b["location"]
        country = {"FR": "France", "US": "USA", "GB": "UK"}.get(
            loc.get("countryCode", ""), loc.get("countryCode", "")
        )
        city = ", ".join(x for x in [loc.get("city"), country] if x)
        if city:
            contact_parts.append(e(city))

    profile_parts = []
    for p in b.get("profiles", []):
        url = p.get("url", "")
        profile_parts.append(
            f'<a href="{e(url)}"><span class="mono">{e(short_url(url))}</span></a>'
        )
    if b.get("url"):
        profile_parts.append(
            f'<a href="{e(b["url"])}"><span class="mono">{e(short_url(b["url"]))}</span></a>'
        )

    sep = '<span class="sep">·</span>'
    header = f"""
    <header>
      <div class="name">{e(b['name'])}</div>
      <div class="label">{e(b.get('label',''))}</div>
      <div class="contact">
        {sep.join(contact_parts)}
        <br/>
        {sep.join(profile_parts)}
      </div>
    </header>
    """

    # summary
    summary = f'<section class="summary"><h2>Summary</h2><p>{e(b.get("summary",""))}</p></section>'

    # experience
    jobs = []
    for j in data.get("work", []):
        date = fmt_range(j.get("startDate", ""), j.get("endDate", ""))
        bullets = "".join(f"<li>{e(h)}</li>" for h in j.get("highlights", []))
        dl = ""
        if j.get("url"):
            dl = f'<div class="deeplink">↳ {e(short_url(j["url"]))}</div>'
        jobs.append(f"""
        <div class="job">
          <div class="head">
            <span class="date">{date}</span>
            <span class="role">{e(j['position'])}</span>
            <span class="co">— {e(j['name'])}</span>
          </div>
          <ul>{bullets}</ul>
          {dl}
        </div>
        """)
    experience = f'<section><h2>Experience</h2>{"".join(jobs)}</section>'

    # projects
    projs = []
    for p in data.get("projects", []):
        links = []
        if p.get("url"):
            links.append(f'<a href="{e(p["url"])}">{e(short_url(p["url"]))}</a>')
        if p.get("blog"):
            links.append(f'<a href="{e(p["blog"])}">{e(short_url(p["blog"]))}</a>')
        tags = " · ".join(e(t) for t in p.get("keywords", []))
        projs.append(f"""
        <div class="proj">
          <div class="head">
            <span class="name">{e(p['name'])}</span>
            {"<span class='links'>&nbsp;" + sep.join(links) + "</span>" if links else ""}
          </div>
          <div class="desc">{e(p.get('description',''))}</div>
          {"<div class='tags'>" + tags + "</div>" if tags else ""}
        </div>
        """)
    projects = f'<section><h2>Selected Projects</h2>{"".join(projs)}</section>'

    # skills
    skills = []
    for s in data.get("skills", []):
        items = " · ".join(f'<span class="mono">{e(k)}</span>' for k in s.get("keywords", []))
        skills.append(
            f'<div class="skill-row"><span class="group">{e(s["name"])}:</span> '
            f'<span class="items">{items}</span></div>'
        )
    skills_html = f'<section><h2>Skills</h2>{"".join(skills)}</section>'

    # education
    edus = []
    for ed in data.get("education", []):
        date = fmt_range(ed.get("startDate", ""), ed.get("endDate", ""))
        honor = f' <span class="honor">— {e(ed["score"])}</span>' if ed.get("score") else ""
        edus.append(f"""
        <div class="edu">
          <div class="head">
            <span class="date">{date}</span>
            <span class="study">{e(ed.get('studyType',''))} — {e(ed.get('area',''))}</span>
          </div>
          <div class="school">{e(ed.get('institution',''))}{honor}</div>
        </div>
        """)
    education = f'<section><h2>Education</h2>{"".join(edus)}</section>'

    # languages & interests
    langs = " · ".join(
        f"{e(l['language'])} ({e(l['fluency'])})" for l in data.get("languages", [])
    )
    interests = " · ".join(e(i["name"]) for i in data.get("interests", []))
    lang_int = f"""
    <section>
      <h2>Languages &amp; Interests</h2>
      <div class="lang-int">
        <strong>Languages:</strong> {langs}
        <br/>
        <strong>Interests:</strong> {interests}
      </div>
    </section>
    """

    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><title>{e(b['name'])} — Resume</title>
<style>{css()}</style></head>
<body>
{header}
{summary}
{experience}
{projects}
{skills_html}
{education}
{lang_int}
</body></html>"""


def main() -> int:
    data = json.loads((ROOT / "resume.json").read_text())
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "public" / "resume.pdf"
    html_doc = render(data)
    HTML(string=html_doc).write_pdf(str(out))
    print(f"✓ wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
