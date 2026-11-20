#!/usr/bin/env python3
"""
render-resume.py
--------------------------------------------------------------------------------
Render resume.json or resume-fr.json (JSON Resume schema) into an ATS-friendly,
print-optimized PDF using WeasyPrint.

Default:
    python3 scripts/render-resume.py
    (renders resume.json -> public/resume.pdf)

Render French resume:
    python3 scripts/render-resume.py resume-fr.json public/resume-fr.pdf

Custom output / format:
    python3 scripts/render-resume.py resume.json out.pdf --a4

Dependencies:
    pip install weasyprint
--------------------------------------------------------------------------------
"""

import argparse
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "public" / "fonts"

INTER = FONTS / "Inter" / "extras" / "ttf"
FIRACODE = FONTS / "FiraCode" / "ttf"


MONTHS = {
    "en": {
        1: "Jan",
        2: "Feb",
        3: "Mar",
        4: "Apr",
        5: "May",
        6: "Jun",
        7: "Jul",
        8: "Aug",
        9: "Sep",
        10: "Oct",
        11: "Nov",
        12: "Dec",
    },
    "fr": {
        1: "janv.",
        2: "févr.",
        3: "mars",
        4: "avr.",
        5: "mai",
        6: "juin",
        7: "juil.",
        8: "août",
        9: "sept.",
        10: "oct.",
        11: "nov.",
        12: "déc.",
    },
}

LABELS = {
    "en": {
        "title_suffix": "Resume",
        "summary": "Summary",
        "experience": "Experience",
        "projects": "Selected Projects",
        "skills": "Skills",
        "education": "Education",
        "languages_interests": "Languages & Interests",
        "languages": "Languages",
        "interests": "Interests:",
        "present": "Present",
    },
    "fr": {
        "title_suffix": "CV",
        "summary": "Profil",
        "experience": "Expérience Professionnelle",
        "projects": "Projets Sélectionnés",
        "skills": "Compétences Techniques",
        "education": "Formation",
        "languages_interests": "Langues & Centres d'intérêt",
        "languages": "Langues",
        "interests": "Centres d'intérêt :",
        "present": "Présent",
    },
}

COUNTRIES = {
    "en": {
        "FR": "France",
        "US": "USA",
        "GB": "UK",
    },
    "fr": {
        "FR": "France",
        "US": "États-Unis",
        "GB": "Royaume-Uni",
    },
}


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------

def fmt_date(date: str, lang: str = "en") -> str:
    if not date:
        return ""

    parts = date.split("-")
    year = parts[0]

    if len(parts) < 2:
        return year

    try:
        month = int(parts[1])
    except ValueError:
        return year

    month_map = MONTHS.get(lang, MONTHS["en"])
    return f"{month_map.get(month, parts[1])} {year}"


def fmt_range(start: str, end: str, lang: str = "en") -> str:
    start_text = fmt_date(start, lang)
    end_text = LABELS[lang]["present"] if not end else fmt_date(end, lang)

    if not start_text:
        return end_text

    return f"{start_text} – {end_text}"


def short_url(url: str) -> str:
    """
    Make URLs visually compact while preserving the actual href.
    """
    if not url:
        return ""

    url = url.strip()
    url = url.replace("https://", "")
    url = url.replace("http://", "")
    url = url.replace("www.", "")
    return url.rstrip("/")


def escape(value: str) -> str:
    return html.escape(value or "")


def join_non_empty(parts, separator=" · "):
    return separator.join(part for part in parts if part)


# -----------------------------------------------------------------------------
# CSS
# -----------------------------------------------------------------------------

def portfolio_palette() -> dict[str, str]:
    """Use the portfolio's light palette for the printable document."""
    source = (ROOT / "app" / "narrative.css").read_text(encoding="utf-8")
    root = re.search(r":root\s*\{(.*?)\}", source, re.S)
    if not root:
        raise ValueError("Portfolio light palette not found")
    colors = {}
    for token in ("paper", "ink", "muted", "line", "acid", "panel"):
        match = re.search(
            r"--portfolio-" + token + r":\s*(#[0-9a-fA-F]{6})\s*;", root.group(1)
        )
        if not match:
            raise ValueError(f"Missing portfolio palette token: {token}")
        colors[token] = match.group(1)
    return colors


def css(page_size: str, lang: str = "en") -> str:
    # Keep the body readable on one A4 page instead of shrinking it.
    body_font_size = "9.25pt"
    body_line_height = "1.34"
    palette = portfolio_palette()

    return f"""
    @font-face {{
        font-family: 'Inter';
        src: url('{INTER / "Inter-Regular.ttf"}');
        font-weight: 400;
        font-style: normal;
    }}

    @font-face {{
        font-family: 'Inter';
        src: url('{INTER / "Inter-Medium.ttf"}');
        font-weight: 500;
        font-style: normal;
    }}

    @font-face {{
        font-family: 'Inter';
        src: url('{INTER / "Inter-Bold.ttf"}');
        font-weight: 700;
        font-style: normal;
    }}

    @font-face {{
        font-family: 'Inter';
        src: url('{INTER / "Inter-ExtraBold.ttf"}');
        font-weight: 800;
        font-style: normal;
    }}

    @font-face {{
        font-family: 'Fira Code';
        src: url('{FIRACODE / "FiraCode-Regular.ttf"}');
        font-weight: 400;
        font-style: normal;
    }}

    @font-face {{
        font-family: 'Fira Code';
        src: url('{FIRACODE / "FiraCode-Medium.ttf"}');
        font-weight: 500;
        font-style: normal;
    }}

    @page {{
        size: {page_size};
        margin: 13mm 14mm;
        background: {palette["paper"]};
    }}

    :root {{
        --ink: {palette["ink"]};
        --ink-strong: {palette["ink"]};
        --ink-muted: {palette["muted"]};
        --accent: {palette["acid"]};
        --rule: {palette["line"]};
        --bg: {palette["paper"]};
        --card-bg: #FFFFFF;
        --tag-bg: {palette["panel"]};
    }}

    * {{
        box-sizing: border-box;
    }}

    html {{
        font-family: 'Inter', sans-serif;
        color: var(--ink);
        background: var(--bg);
    }}

    body {{
        margin: 0;
        font-size: {body_font_size};
        line-height: {body_line_height};
        color: var(--ink);
        background: var(--bg);
    }}

    a {{
        color: var(--accent);
        text-decoration: none;
    }}

    .nowrap {{ white-space: nowrap; }}

    .mono {{
        font-family: 'Fira Code', monospace;
    }}

    /* -------------------------------------------------------------------------
       Header
       ------------------------------------------------------------------------- */

    header {{
        text-align: left;
        margin-bottom: 9pt;
        padding-bottom: 7pt;
        border-bottom: 1px solid var(--rule);
    }}

    .name {{
        margin: 0;
        color: var(--ink-strong);
        font-size: 23pt;
        line-height: 1.05;
        font-weight: 500;
        letter-spacing: -0.06em;
    }}

    .label {{
        margin-top: 4pt;
        color: var(--accent);
        font-size: 11pt;
        line-height: 1.2;
        font-weight: 500;
    }}

    .contact {{
        margin-top: 4pt;
        color: var(--ink-muted);
        font-size: 7.5pt;
        line-height: 1.5;
    }}

    .contact .mono {{
        color: var(--ink-muted);
        font-weight: 500;
    }}

    .contact .sep {{
        color: #CBD5E1;
        padding: 0 3pt;
    }}

    .profile-row {{
        margin-top: 1pt;
    }}

    .language-highlight {{
        display: inline-block;
        margin-top: 5pt;
        padding: 3pt 8pt;
        border: 1px solid var(--rule);
        border-radius: 4px;
        background: var(--card-bg);
        color: var(--accent);
        font-size: 8.5pt;
        font-weight: 700;
        line-height: 1.2;
    }}

    /* -------------------------------------------------------------------------
       Sections
       ------------------------------------------------------------------------- */

    section {{
        margin-bottom: 7pt;
    }}

    h2 {{
        margin: 0 0 3pt 0;
        padding: 0 0 3pt;
        border-bottom: 1px solid var(--rule);
        color: var(--ink-muted);
        font-family: 'Fira Code', monospace;
        font-size: 8pt;
        line-height: 1.2;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        break-after: avoid;
    }}

    /* -------------------------------------------------------------------------
       Common cards
       ------------------------------------------------------------------------- */

    .card {{
        background: transparent;
        border-radius: 0;
        padding: 0;
        border: 0;
    }}

    /* -------------------------------------------------------------------------
       Summary
       ------------------------------------------------------------------------- */

    .summary .card {{
        padding: 0;
    }}

    .summary p {{
        margin: 0;
        line-height: 1.36;
    }}

    .summary .availability {{
        margin-bottom: 5pt;
        padding-left: 7pt;
        border-left: 2pt solid var(--accent);
        color: var(--ink-strong);
    }}

    /* -------------------------------------------------------------------------
       Experience
       ------------------------------------------------------------------------- */

    .job {{
        margin-bottom: 3.5pt;
        break-inside: avoid;
    }}

    .job:last-child {{
        margin-bottom: 0;
    }}

    .job-head {{
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10pt;
        margin-bottom: 1.5pt;
    }}

    .job-main {{
        min-width: 0;
        flex: 1;
    }}

    .job-title {{
        margin: 0;
        font-size: 9.5pt;
        line-height: 1.2;
        font-weight: 700;
        color: var(--ink-strong);
    }}

    .job-company {{
        font-weight: 500;
        color: var(--ink);
    }}

    .job-date {{
        flex-shrink: 0;
        white-space: nowrap;
        font-family: 'Fira Code', monospace;
        font-size: 7.5pt;
        color: var(--ink-muted);
    }}

    .job ul {{
        margin: 1.5pt 0 0 0;
        padding-left: 12pt;
    }}

    .job li {{
        margin: 0 0 2pt 0;
        padding-left: 1.5pt;
        line-height: 1.3;
    }}

    .job li:last-child {{
        margin-bottom: 0;
    }}

    .job li::marker {{
        color: #94A3B8;
    }}

    .deeplink {{
        margin-top: 2.5pt;
        font-family: 'Fira Code', monospace;
        font-size: 7.5pt;
    }}

    /* -------------------------------------------------------------------------
       Projects
       ------------------------------------------------------------------------- */

    .projects-table {{
        width: 100%;
        border-collapse: separate;
        border-spacing: 5pt 3.5pt;
        table-layout: fixed;
    }}

    .proj-col {{
        vertical-align: top;
        padding: 0;
    }}

    .project {{
        break-inside: avoid;
        margin-bottom: 3.5pt;
    }}

    /* Cells stretch to the tallest card without fixed heights or clipping. */
    .proj-col.card {{
        padding: 4.5pt 6.5pt;
    }}

    .proj-col.featured {{
        border-color: rgba(79, 70, 229, 0.16);
    }}

    .project-head {{
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 3pt 6pt;
        margin-bottom: 1pt;
    }}

    .project-name {{
        margin: 0;
        color: var(--ink-strong);
        font-size: 9pt;
        font-weight: 700;
        line-height: 1.2;
        min-width: 0;
        overflow-wrap: anywhere;
    }}

    .project-links {{
        flex-shrink: 1;
        min-width: 0;
        font-family: 'Fira Code', monospace;
        font-size: 7.5pt;
        line-height: 1.35;
        text-align: right;
        overflow-wrap: anywhere;
    }}

    .project-links .sep {{
        color: #CBD5E1;
        padding: 0 2pt;
    }}

    .project-description {{
        margin: 0;
        line-height: 1.3;
        font-size: 9pt;
    }}

    .project-tags {{
        display: inline-block;
        margin-top: 2pt;
        padding: 0;
        border-radius: 0;
        background: transparent;
        color: var(--ink-muted);
        font-family: 'Fira Code', monospace;
        font-size: 7.5pt;
        line-height: 1.2;
    }}

    /* -------------------------------------------------------------------------
       Skills
       ------------------------------------------------------------------------- */

    .skills-card {{
        padding: 0;
    }}

    .skill-row {{
        margin-bottom: 3pt;
        line-height: 1.28;
    }}

    .skill-row:last-child {{
        margin-bottom: 0;
    }}

    .skill-group {{
        display: inline;
        margin-bottom: 1pt;
        color: var(--ink-strong);
        font-weight: 700;
    }}

    .skill-items {{
        display: inline;
        color: var(--ink);
        min-width: 0;
    }}

    .skill-item {{
        font-family: 'Inter', sans-serif;
        color: var(--ink);
        font-size: 9pt;
        font-weight: 500;
    }}

    .skills-table {{
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
    }}

    .skill-col {{
        width: 50%;
        vertical-align: top;
        padding: 0 5pt 0 0;
    }}

    /* -------------------------------------------------------------------------
       Education
       ------------------------------------------------------------------------- */

    .education {{
        margin-bottom: 3.5pt;
        break-inside: avoid;
    }}

    .education:last-child {{
        margin-bottom: 0;
    }}

    .education-head {{
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8pt;
    }}

    .education-degree {{
        margin-top: 0.5pt;
        color: var(--ink);
        line-height: 1.3;
    }}

    .education-institution {{
        color: var(--ink-strong);
        font-size: 9pt;
        font-weight: 700;
        line-height: 1.3;
    }}

    .education-date {{
        flex-shrink: 0;
        white-space: nowrap;
        color: var(--ink-muted);
        font-family: 'Fira Code', monospace;
        font-size: 7.5pt;
    }}

    .education-honor {{
        color: var(--accent);
        font-style: italic;
    }}

    /* -------------------------------------------------------------------------
       Languages & interests
       ------------------------------------------------------------------------- */

    .compact-card {{
        padding: 4.5pt 6.5pt;
    }}

    .compact-line {{
        margin: 0;
        line-height: 1.3;
    }}

    .compact-line strong {{
        color: var(--ink-strong);
        font-weight: 700;
    }}

    .compact-separator {{
        color: #CBD5E1;
        padding: 0 7pt;
    }}
    """


# -----------------------------------------------------------------------------
# Render sections
# -----------------------------------------------------------------------------

def render_header(data: dict, lang: str = "en") -> str:
    basics = data["basics"]

    contact_parts = []

    if basics.get("email"):
        email = escape(basics["email"])
        contact_parts.append(
            f'<a href="mailto:{email}">{email}</a>'
        )

    if basics.get("phone"):
        contact_parts.append(
            f'<span class="mono">{escape(basics["phone"])}</span>'
        )

    location = basics.get("location")
    if location:
        country_map = COUNTRIES.get(lang, COUNTRIES["en"])
        country = country_map.get(
            location.get("countryCode", ""),
            location.get("countryCode", "")
        )

        city = ", ".join(
            part
            for part in [
                location.get("city"),
                country,
            ]
            if part
        )

        if city:
            contact_parts.append(escape(city))

    profile_parts = []

    for profile in basics.get("profiles", []):
        url = profile.get("url", "")
        if not url:
            continue

        visible_url = short_url(url)

        profile_parts.append(
            f'<a href="{escape(url)}">'
            f'<span class="mono">{escape(visible_url)}</span>'
            f'</a>'
        )

    if basics.get("url"):
        url = basics["url"]

        profile_parts.append(
            f'<a href="{escape(url)}">'
            f'<span class="mono">{escape(short_url(url))}</span>'
            f'</a>'
        )

    separator = '<span class="sep">·</span>'

    # Keep both printable versions photo-free; languages live in one section.
    return f"""
    <header>
        <h1 class="name">{escape(basics["name"])}</h1>
        <div class="label">{escape(basics.get("label", ""))}</div>

        <div class="contact">
            <div>{separator.join(contact_parts)}</div>
            <div class="profile-row">{separator.join(profile_parts)}</div>
        </div>
    </header>
    """


def render_summary(data: dict, lang: str = "en") -> str:
    summary = data["basics"].get("summary", "")

    if not summary:
        return ""

    # Keep a one-line availability callout, then the profile paragraph.
    marker = "À la recherche" if lang == "fr" else "Seeking"
    content = ""
    profile = summary

    if summary.startswith(marker):
        head, point, tail = summary.partition(". ")
        availability = head + (point or "")
        content += f'<p class="availability"><strong>{escape(availability)}</strong></p>'
        profile = tail

    if profile.strip():
        content += f'<p>{escape(profile.strip())}</p>'

    return f"""
    <section class="summary">
        <h2>{LABELS[lang]["summary"]}</h2>

        <div class="card">
            {content}
        </div>
    </section>
    """


def format_highlight(value: str) -> str:
    # Keep this compound tool name intact in the PDF's text extraction too.
    return escape(value).replace(
        "Maven/Jenkins", '<span class="nowrap">Maven/Jenkins</span>'
    )


def render_experience(data: dict, lang: str = "en") -> str:
    jobs = []

    for job in data.get("work", []):
        date = fmt_range(
            job.get("startDate", ""),
            job.get("endDate", ""),
            lang=lang,
        )

        highlights = "".join(
            f"<li>{format_highlight(highlight)}</li>"
            for highlight in job.get("highlights", [])
        )

        deeplink = ""

        if job.get("url"):
            deeplink = f"""
            <div class="deeplink">
                <a href="{escape(job["url"])}">
                    {"Étude de cas · plateforme de tests" if lang == "fr" else "Case study · automated test platform"} ↗
                </a>
            </div>
            """

        jobs.append(
            f"""
            <article class="job card">
                <div class="job-head">
                    <div class="job-main">
                        <div class="job-title">
                            {escape(job.get("position", ""))}
                            <span class="job-company">
                                — {escape(job.get("name", ""))}
                            </span>
                        </div>
                    </div>

                    <div class="job-date">{escape(date)}</div>
                </div>

                <ul>
                    {highlights}
                </ul>

                {deeplink}
            </article>
            """
        )

    if not jobs:
        return ""

    return f"""
    <section>
        <h2>{LABELS[lang]["experience"]}</h2>
        {"".join(jobs)}
    </section>
    """


def render_projects(data: dict, lang: str = "en") -> str:
    projects = []

    for project in data.get("projects", []):
        links = []

        if project.get("url"):
            links.append(
                f'<a href="{escape(project["url"])}">'
                f'{"GitHub" if project["url"].startswith("https://github.com/") else escape(short_url(project["url"]))}'
                f'</a>'
            )

        if project.get("blog"):
            links.append(
                f'<a href="{escape(project["blog"])}">'
                f'{"Article" if lang == "fr" else "Deep dive"}'
                f'</a>'
            )

        links_html = ""

        if links:
            links_html = f"""
            <div class="project-links">
                {"<span class='sep'>·</span>".join(links)}
            </div>
            """

        tags = " · ".join(
            escape(keyword)
            for keyword in project.get("keywords", [])
        )

        tags_html = ""

        if tags:
            tags_html = f"""
            <div class="project-tags">
                {tags}
            </div>
            """

        projects.append(
            f"""
            <article class="project card">
                <div class="project-head">
                    <div class="project-name">
                        {escape(project.get("name", ""))}
                    </div>

                    {links_html}
                </div>

                <p class="project-description">
                    {escape(project.get("description", ""))}
                </p>

                {tags_html}
            </article>
            """
        )

    if not projects:
        return ""

    return f"""
    <section>
        <h2>{LABELS[lang]["projects"]}</h2>
        {"".join(projects)}
    </section>
    """


def render_skills(data: dict, lang: str = "en") -> str:
    skills = data.get("skills", [])
    if not skills:
        return ""

    def skill_cell(skill):
        if not skill:
            return ""
        items = " · ".join(
            f'<span class="skill-item">{escape(kw)}</span>'
            for kw in skill.get("keywords", [])
        )
        return f"""
        <div class="skill-row">
            <div class="skill-group">{escape(skill.get("name", ""))}:</div>
            <div class="skill-items">{items}</div>
        </div>
        """

    rows = [skill_cell(skill) for skill in skills]

    return f"""
    <section>
        <h2>{LABELS[lang]["skills"]}</h2>
        <div class="card skills-card">
            {"".join(rows)}
        </div>
    </section>
    """


def render_education(data: dict, lang: str = "en") -> str:
    entries = []

    for education in data.get("education", []):
        date = fmt_range(
            education.get("startDate", ""),
            education.get("endDate", ""),
            lang=lang,
        )

        degree = join_non_empty(
            [
                education.get("studyType", ""),
                education.get("area", ""),
            ],
            " — "
        )

        honor = ""

        if education.get("score"):
            honor = (
                f' <span class="education-honor">'
                f'— {escape(education["score"])}'
                f'</span>'
            )

        entries.append(
            f"""
            <article class="education card">
                <div class="education-head">
                    <div class="education-institution">
                        {escape(education.get("institution", ""))}
                    </div>

                    <div class="education-date">
                        {escape(date)}
                    </div>
                </div>

                <div class="education-degree">
                    {escape(degree)}{honor}
                </div>
            </article>
            """
        )

    if not entries:
        return ""

    return f"""
    <section>
        <h2>{LABELS[lang]["education"]}</h2>
        {"".join(entries)}
    </section>
    """


def render_languages(data: dict, lang: str = "en") -> str:
    languages = join_non_empty(
        [
            f'{escape(language["language"])} — {escape(language["fluency"])}'
            for language in data.get("languages", [])
        ],
        "; ",
    )

    interests = join_non_empty(
        [escape(interest["name"]) + (" (" + escape(", ".join(interest["keywords"])) + ")" if interest.get("keywords") else "") for interest in data.get("interests", [])]
    )

    lines = ""

    if languages:
        lines += f'<p class="compact-line">{languages}</p>'

    if interests:
        lines += (
            f'<p class="compact-line" style="margin-top:2pt">'
            f'<strong>{LABELS[lang]["interests"]}</strong> {interests}</p>'
        )

    if not lines:
        return ""

    return f"""
    <section>
        <h2>{LABELS[lang]["languages"]}</h2>
        {lines}
    </section>
    """


# -----------------------------------------------------------------------------
# Full HTML document
# -----------------------------------------------------------------------------

def render(data: dict, page_size: str, lang: str = "en") -> str:
    basics = data["basics"]

    # Both CVs lead with Education (student applications), then experience.
    body_content = f"""
        {render_header(data, lang=lang)}
        {render_summary(data, lang=lang)}
        {render_experience(data, lang=lang)}
        {render_education(data, lang=lang)}
        {render_skills(data, lang=lang)}
        {render_projects(data, lang=lang)}
        {render_languages(data, lang=lang)}
        """

    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
    <meta charset="utf-8">
    <title>{escape(basics["name"])} — {LABELS[lang]["title_suffix"]}</title>

    <style>
        {css(page_size, lang=lang)}
    </style>
</head>

<body>
    {body_content}
</body>
</html>
"""


# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------

def parse_args():
    parser = argparse.ArgumentParser(
        description="Render resume.json or resume-fr.json into a PDF."
    )

    parser.add_argument(
        "arg1",
        nargs="?",
        default=None,
        help="Input JSON path or Output PDF path (if .pdf)."
    )

    parser.add_argument(
        "arg2",
        nargs="?",
        default=None,
        help="Output PDF path."
    )

    parser.add_argument(
        "--lang",
        choices=["en", "fr"],
        default=None,
        help="Language (en or fr). Defaults to auto-detect from JSON or 'en'."
    )

    parser.add_argument(
        "--html",
        action="store_true",
        help="Write an HTML preview without requiring WeasyPrint."
    )

    parser.add_argument(
        "--a4",
        action="store_true",
        help="Render using A4 instead of US Letter."
    )

    parser.add_argument(
        "--letter",
        action="store_true",
        help="Render using US Letter instead of A4."
    )

    return parser.parse_args()


def main() -> int:
    args = parse_args()

    # Determine input and output paths with backward compatibility
    resume_path = ROOT / "resume.json"
    output_path = None

    if args.arg1:
        if args.arg1.endswith(".pdf"):
            output_path = Path(args.arg1)
        elif args.arg1.endswith(".json") or Path(args.arg1).exists():
            resume_path = Path(args.arg1)
            if args.arg2:
                output_path = Path(args.arg2)
        else:
            resume_path = Path(args.arg1)

    if args.arg2 and not output_path:
        output_path = Path(args.arg2)

    if not resume_path.is_absolute():
        resume_path = ROOT / resume_path

    if not resume_path.exists():
        print(f"Error: resume file not found: {resume_path}")
        return 1

    data = json.loads(resume_path.read_text(encoding="utf-8"))

    # Auto-detect language
    if args.lang:
        lang = args.lang
    elif data.get("meta", {}).get("lang"):
        lang = data["meta"]["lang"]
    elif "fr" in str(resume_path).lower():
        lang = "fr"
    else:
        lang = "en"

    # Default output path if not specified
    if not output_path:
        suffix = ".html" if args.html else ".pdf"
        if lang == "fr":
            output_path = ROOT / "public" / f"resume-fr{suffix}"
        else:
            output_path = ROOT / "public" / f"resume{suffix}"
    elif not output_path.is_absolute():
        output_path = ROOT / output_path

    output_path.parent.mkdir(parents=True, exist_ok=True)

    # A4 by default for European applications; retain explicit Letter support.
    if args.a4:
        page_size = "A4"
    elif args.letter:
        page_size = "Letter"
    else:
        page_size = "A4"

    html_document = render(
        data=data,
        page_size=page_size,
        lang=lang,
    )

    if args.html or output_path.suffix == ".html":
        output_path.write_text(html_document, encoding="utf-8")
        print(f"✓ wrote {output_path} (HTML, lang: {lang})")
        return 0

    from weasyprint import HTML

    HTML(
        string=html_document,
        base_url=str(ROOT),
    ).write_pdf(str(output_path))

    print(f"✓ wrote {output_path} ({page_size}, lang: {lang})")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())