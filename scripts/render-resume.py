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
      src: url('{INTER / "Inter-Bold.ttf"}');
      font-weight: 700; font-style: normal;
    }}
    @font-face {{
      font-family: 'Inter';
      src: url('{INTER / "Inter-ExtraBold.ttf"}');
      font-weight: 800; font-style: normal;
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
      margin: 0.25in;
      background-color: #FAFAFA;
    }}

    :root {{
      --ink: #1E293B;
      --ink-strong: #0F172A;
      --ink-muted: #475569;
      --accent: #4F46E5;
      --rule: #E2E8F0;
      --bg: #FAFAFA;
      --card-bg: #FFFFFF;
      --card-shadow: 0 1px 2px -1px rgba(0,0,0,0.05);
    }}

    * {{ box-sizing: border-box; }}
    body {{
      font-family: 'Inter', sans-serif;
      color: var(--ink);
      background-color: var(--bg);
      font-size: 7.5pt;
      line-height: 1.25;
      margin: 0;
    }}
    a {{ color: var(--accent); text-decoration: none; }}
    .mono {{ font-family: 'Fira Code', monospace; }}

    /* ---- header ---- */
    header {{ margin-bottom: 4pt; text-align: center; }}
    .name {{
      font-size: 14pt;
      font-weight: 800;
      color: var(--ink-strong);
      letter-spacing: -0.02em;
      margin: 0 0 1pt 0;
    }}
    .label {{
      font-size: 8.5pt;
      font-weight: 500;
      color: var(--accent);
      margin: 0 0 1pt 0;
    }}
    .contact {{
      font-size: 7pt;
      color: var(--ink-muted);
      line-height: 1.3;
    }}
    .contact .mono {{ color: var(--accent); font-weight: 500; }}
    .contact .sep {{ color: #CBD5E1; padding: 0 3pt; }}

    /* ---- sections ---- */
    section {{ margin-bottom: 4pt; }}
    h2 {{
      font-size: 8pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--ink-strong);
      margin: 0 0 2pt 0;
      padding-bottom: 0;
    }}

    /* ---- cards ---- */
    .card {{
      background: var(--card-bg);
      border-radius: 4px;
      padding: 4pt 6pt;
      margin-bottom: 2pt;
      box-shadow: var(--card-shadow);
    }}
    .card:last-child {{ margin-bottom: 0; }}

    /* ---- summary ---- */
    .summary p {{ margin: 0; color: var(--ink); padding: 0 2pt; }}

    /* ---- experience ---- */
    .job.card {{ margin-bottom: 4pt; }}
    .job .head {{
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2pt;
    }}
    .job .role {{
      font-weight: 700;
      color: var(--ink-strong);
      font-size: 9pt;
    }}
    .job .co {{ color: var(--ink); font-weight: 500; }}
    .job .date {{
      flex-shrink: 0;
      font-family: 'Fira Code', monospace;
      font-size: 7.5pt;
      color: var(--ink-muted);
      margin-left: 8pt;
    }}
    .job ul {{ margin: 2pt 0 0 0; padding: 0 0 0 12pt; }}
    .job li {{
      margin-bottom: 1pt;
      color: var(--ink);
      padding-left: 2pt;
    }}
    .job li::marker {{ color: #94A3B8; }}
    .deeplink {{
      font-family: 'Fira Code', monospace;
      font-size: 7.5pt;
      color: var(--accent);
      margin-top: 2pt;
    }}

    /* ---- projects ---- */
    .proj.card {{ margin-bottom: 4pt; }}
    .proj .head {{ margin-bottom: 1pt; }}
    .proj .name {{ font-weight: 700; color: var(--ink-strong); font-size: 9pt; }}
    .proj .links {{
      font-family: 'Fira Code', monospace;
      font-size: 7.5pt;
    }}
    .proj .links .sep {{ color: #CBD5E1; padding: 0 3pt; }}
    .proj .desc {{ margin: 1pt 0 2pt 0; line-height: 1.35; }}
    .proj .tags {{
      font-family: 'Fira Code', monospace;
      font-size: 7pt;
      color: var(--ink-muted);
      background: var(--bg);
      padding: 1pt 3pt;
      border-radius: 3px;
      display: inline-block;
      margin-top: 2pt;
    }}

    /* ---- skills ---- */
    .skill-row {{ margin-bottom: 2pt; }}
    .skill-row:last-child {{ margin-bottom: 0; }}
    .skill-row .group {{ font-weight: 700; color: var(--ink-strong); display: inline-block; width: 115pt; }}
    .skill-row .items {{ color: var(--ink); }}
    .skill-row .items .mono {{ font-size: 7.5pt; color: var(--accent); font-weight: 500; }}

    /* ---- education ---- */
    .edu.card {{ margin-bottom: 4pt; }}
    .edu .head {{
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 0.5pt;
    }}
    .edu .study {{ font-weight: 700; color: var(--ink-strong); font-size: 8.5pt; }}
    .edu .date {{
      flex-shrink: 0;
      font-family: 'Fira Code', monospace;
      font-size: 7pt;
      color: var(--ink-muted);
      margin-left: 4pt;
    }}
    .edu .school {{ color: var(--ink-muted); margin-top: 0.5pt; }}
    .edu .honor {{ font-style: italic; color: var(--accent); font-size: 7.5pt; }}

    /* ---- languages & interests ---- */
    .lang-int {{ font-size: 7.5pt; color: var(--ink); padding: 2pt; }}
    .lang-int strong {{ color: var(--ink-strong); font-weight: 700; }}
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
    summary = f'<section class="summary"><h2>Summary</h2><div class="card"><p>{e(b.get("summary",""))}</p></div></section>'

    # experience
    jobs = []
    for j in data.get("work", []):
        date = fmt_range(j.get("startDate", ""), j.get("endDate", ""))
        bullets = "".join(f"<li>{e(h)}</li>" for h in j.get("highlights", []))
        dl = ""
        if j.get("url"):
            dl = f'<div class="deeplink">↳ {e(short_url(j["url"]))}</div>'
        jobs.append(f"""
        <div class="job card">
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
        <div class="proj card">
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
    skills_html = f'<section><h2>Skills</h2><div class="card">{"".join(skills)}</div></section>'

    # education
    edus = []
    for ed in data.get("education", []):
        date = fmt_range(ed.get("startDate", ""), ed.get("endDate", ""))
        honor = f' <span class="honor">— {e(ed["score"])}</span>' if ed.get("score") else ""
        edus.append(f"""
        <div class="edu card">
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
      <div class="lang-int card">
        <strong>Languages:</strong> {langs}
        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
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
