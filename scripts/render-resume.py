#!/usr/bin/env python3
"""
render-resume.py
--------------------------------------------------------------------------------
Render resume.json (JSON Resume schema) into an ATS-friendly, print-optimized
PDF using WeasyPrint.

Default:
    python3 scripts/render-resume.py

Custom output:
    python3 scripts/render-resume.py out.pdf

A4:
    python3 scripts/render-resume.py out.pdf --a4

Dependencies:
    pip install weasyprint
--------------------------------------------------------------------------------
"""

import argparse
import html
import json
from pathlib import Path

from weasyprint import HTML


ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "public" / "fonts"

INTER = FONTS / "Inter" / "extras" / "ttf"
FIRACODE = FONTS / "FiraCode" / "ttf"


MONTHS = {
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
}


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------

def fmt_date(date: str) -> str:
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

    return f"{MONTHS.get(month, parts[1])} {year}"


def fmt_range(start: str, end: str) -> str:
    start_text = fmt_date(start)
    end_text = "Present" if not end else fmt_date(end)

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

def css(page_size: str) -> str:
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
        margin: 0.28in;
        background: #FAFAFA;
    }}

    :root {{
        --ink: #1E293B;
        --ink-strong: #0F172A;
        --ink-muted: #475569;
        --accent: #4F46E5;
        --rule: #E2E8F0;
        --bg: #FAFAFA;
        --card-bg: #FFFFFF;
        --tag-bg: #F8FAFC;
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
        font-size: 7.45pt;
        line-height: 1.28;
        color: var(--ink);
        background: var(--bg);
    }}

    a {{
        color: var(--accent);
        text-decoration: none;
    }}

    .mono {{
        font-family: 'Fira Code', monospace;
    }}

    /* -------------------------------------------------------------------------
       Header
       ------------------------------------------------------------------------- */

    header {{
        text-align: center;
        margin-bottom: 8pt;
    }}

    .name {{
        margin: 0;
        color: var(--ink-strong);
        font-size: 16pt;
        line-height: 1.05;
        font-weight: 800;
        letter-spacing: -0.025em;
    }}

    .label {{
        margin-top: 2pt;
        color: var(--accent);
        font-size: 8.5pt;
        line-height: 1.15;
        font-weight: 500;
    }}

    .contact {{
        margin-top: 4pt;
        color: var(--ink-muted);
        font-size: 6.9pt;
        line-height: 1.5;
    }}

    .contact .mono {{
        color: var(--accent);
        font-weight: 500;
    }}

    .contact .sep {{
        color: #CBD5E1;
        padding: 0 3pt;
    }}

    .profile-row {{
        margin-top: 1pt;
    }}

    /* -------------------------------------------------------------------------
       Sections
       ------------------------------------------------------------------------- */

    section {{
        margin-bottom: 6pt;
    }}

    h2 {{
        margin: 0 0 3pt 0;
        padding: 0;
        color: var(--ink-strong);
        font-size: 8pt;
        line-height: 1.1;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.105em;
    }}

    /* -------------------------------------------------------------------------
       Common cards
       ------------------------------------------------------------------------- */

    .card {{
        background: var(--card-bg);
        border-radius: 4px;
        padding: 5pt 7pt;
        border: 1px solid rgba(226, 232, 240, 0.55);
    }}

    /* -------------------------------------------------------------------------
       Summary
       ------------------------------------------------------------------------- */

    .summary .card {{
        padding: 5pt 7pt;
    }}

    .summary p {{
        margin: 0;
        line-height: 1.38;
    }}

    /* -------------------------------------------------------------------------
       Experience
       ------------------------------------------------------------------------- */

    .job {{
        margin-bottom: 4pt;
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
        margin-bottom: 2pt;
    }}

    .job-main {{
        min-width: 0;
        flex: 1;
    }}

    .job-title {{
        margin: 0;
        font-size: 8.8pt;
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
        font-size: 6.95pt;
        color: var(--ink-muted);
    }}

    .job ul {{
        margin: 2pt 0 0 0;
        padding-left: 13pt;
    }}

    .job li {{
        margin: 0 0 1.2pt 0;
        padding-left: 1.5pt;
        line-height: 1.32;
    }}

    .job li:last-child {{
        margin-bottom: 0;
    }}

    .job li::marker {{
        color: #94A3B8;
    }}

    .deeplink {{
        margin-top: 3pt;
        font-family: 'Fira Code', monospace;
        font-size: 6.8pt;
    }}

    /* -------------------------------------------------------------------------
       Projects
       ------------------------------------------------------------------------- */

    .projects-table {{
        width: 100%;
        border-collapse: separate;
        border-spacing: 5pt 0;
        table-layout: fixed;
    }}

    .proj-col {{
        width: 50%;
        vertical-align: top;
        padding: 0;
    }}

    .project {{
        break-inside: avoid;
        margin-bottom: 4pt;
    }}

    .project.featured {{
        border-color: rgba(79, 70, 229, 0.16);
    }}

    .project-head {{
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 4pt;
        margin-bottom: 1pt;
    }}

    .project-name {{
        margin: 0;
        color: var(--ink-strong);
        font-size: 8pt;
        font-weight: 700;
        line-height: 1.2;
    }}

    .project-links {{
        flex-shrink: 0;
        font-family: 'Fira Code', monospace;
        font-size: 6.5pt;
        line-height: 1.2;
        text-align: right;
    }}

    .project-links .sep {{
        color: #CBD5E1;
        padding: 0 2pt;
    }}

    .project-description {{
        margin: 0;
        line-height: 1.3;
        font-size: 7pt;
    }}

    .project-tags {{
        display: inline-block;
        margin-top: 2pt;
        padding: 1pt 3pt;
        border-radius: 3px;
        background: var(--tag-bg);
        color: var(--ink-muted);
        font-family: 'Fira Code', monospace;
        font-size: 6.5pt;
        line-height: 1.2;
    }}

    /* -------------------------------------------------------------------------
       Skills
       ------------------------------------------------------------------------- */

    .skills-card {{
        padding: 5pt 7pt;
    }}

    .skill-row {{
        display: flex;
        align-items: baseline;
        margin-bottom: 2pt;
        line-height: 1.3;
    }}

    .skill-row:last-child {{
        margin-bottom: 0;
    }}

    .skill-group {{
        width: 103pt;
        flex-shrink: 0;
        color: var(--ink-strong);
        font-weight: 700;
    }}

    .skill-items {{
        color: var(--ink);
        min-width: 0;
    }}

    .skill-item {{
        font-family: 'Fira Code', monospace;
        color: var(--accent);
        font-size: 6.95pt;
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
        padding: 0;
    }}

    /* -------------------------------------------------------------------------
       Education
       ------------------------------------------------------------------------- */

    .education {{
        margin-bottom: 4pt;
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
        color: var(--ink-strong);
        font-size: 8.4pt;
        font-weight: 700;
        line-height: 1.2;
    }}

    .education-date {{
        flex-shrink: 0;
        white-space: nowrap;
        color: var(--ink-muted);
        font-family: 'Fira Code', monospace;
        font-size: 6.75pt;
    }}

    .education-school {{
        margin-top: 1.5pt;
        color: var(--ink-muted);
        line-height: 1.25;
    }}

    .education-honor {{
        color: var(--accent);
        font-style: italic;
    }}

    /* -------------------------------------------------------------------------
       Languages & interests
       ------------------------------------------------------------------------- */

    .compact-card {{
        padding: 5pt 7pt;
    }}

    .compact-line {{
        margin: 0;
        line-height: 1.32;
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

def render_header(data: dict) -> str:
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
        country_map = {
            "FR": "France",
            "US": "USA",
            "GB": "UK",
        }

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

    return f"""
    <header>
        <h1 class="name">{escape(basics["name"])}</h1>
        <div class="label">{escape(basics.get("label", ""))}</div>

        <div class="contact">
            <div>
                {separator.join(contact_parts)}
            </div>

            <div class="profile-row">
                {separator.join(profile_parts)}
            </div>
        </div>
    </header>
    """


def render_summary(data: dict) -> str:
    summary = data["basics"].get("summary", "")

    if not summary:
        return ""

    return f"""
    <section class="summary">
        <h2>Summary</h2>

        <div class="card">
            <p>{escape(summary)}</p>
        </div>
    </section>
    """


def render_experience(data: dict) -> str:
    jobs = []

    for job in data.get("work", []):
        date = fmt_range(
            job.get("startDate", ""),
            job.get("endDate", "")
        )

        highlights = "".join(
            f"<li>{escape(highlight)}</li>"
            for highlight in job.get("highlights", [])
        )

        deeplink = ""

        if job.get("url"):
            deeplink = f"""
            <div class="deeplink">
                ↳
                <a href="{escape(job["url"])}">
                    {escape(short_url(job["url"]))}
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
        <h2>Experience</h2>
        {"".join(jobs)}
    </section>
    """


def render_projects(data: dict) -> str:
    projects = []

    for index, project in enumerate(data.get("projects", [])):
        links = []

        if project.get("url"):
            links.append(
                f'<a href="{escape(project["url"])}">'
                f'{escape(short_url(project["url"]))}'
                f'</a>'
            )

        if project.get("blog"):
            links.append(
                f'<a href="{escape(project["blog"])}">'
                f'{escape(short_url(project["blog"]))}'
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

        featured = " featured" if index < 2 else ""

        projects.append(
            f"""
            <article class="project card{featured}">
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

    # Split into two columns using a table (WeasyPrint doesn't support CSS grid)
    left = projects[::2]   # indices 0, 2, 4, 6
    right = projects[1::2] # indices 1, 3, 5

    rows = []
    for i in range(max(len(left), len(right))):
        l = left[i] if i < len(left) else ""
        r = right[i] if i < len(right) else ""
        rows.append(f"""
        <tr>
            <td class="proj-col">{l}</td>
            <td class="proj-col">{r}</td>
        </tr>
        """)

    return f"""
    <section>
        <h2>Selected Projects</h2>
        <table class="projects-table">
            {"".join(rows)}
        </table>
    </section>
    """


def render_skills(data: dict) -> str:
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

    left = skills[::2]
    right = skills[1::2]
    rows = []
    for i in range(max(len(left), len(right))):
        l = skill_cell(left[i] if i < len(left) else None)
        r = skill_cell(right[i] if i < len(right) else None)
        rows.append(f"""
        <tr>
            <td class="skill-col">{l}</td>
            <td class="skill-col">{r}</td>
        </tr>
        """)

    return f"""
    <section>
        <h2>Skills</h2>
        <div class="card skills-card">
            <table class="skills-table">
                {"".join(rows)}
            </table>
        </div>
    </section>
    """


def render_education(data: dict) -> str:
    entries = []

    for education in data.get("education", []):
        date = fmt_range(
            education.get("startDate", ""),
            education.get("endDate", "")
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
                    <div class="education-degree">
                        {escape(degree)}
                    </div>

                    <div class="education-date">
                        {escape(date)}
                    </div>
                </div>

                <div class="education-school">
                    {escape(education.get("institution", ""))}
                    {honor}
                </div>
            </article>
            """
        )

    if not entries:
        return ""

    # Build languages & interests inline to put next to education
    languages = join_non_empty(
        [
            f'{escape(language["language"])} '
            f'({escape(language["fluency"])})'
            for language in data.get("languages", [])
        ]
    )

    interests = join_non_empty(
        [
            escape(interest["name"])
            for interest in data.get("interests", [])
        ]
    )

    lang_int_html = f"""
    <div class="card compact-card" style="margin-top:0">
        <p class="compact-line">
            <strong>Languages:</strong> {languages}
        </p>
        <p class="compact-line" style="margin-top:3pt">
            <strong>Interests:</strong> {interests}
        </p>
    </div>
    """

    return f"""
    <section>
        <table style="width:100%; border-collapse:collapse; table-layout:fixed;">
            <tr>
                <td style="width:55%; vertical-align:top; padding-right:6pt;">
                    <h2>Education</h2>
                    {"".join(entries)}
                </td>
                <td style="width:45%; vertical-align:top; padding-left:2pt;">
                    <h2>Languages &amp; Interests</h2>
                    {lang_int_html}
                </td>
            </tr>
        </table>
    </section>
    """


def render_languages_interests(data: dict) -> str:
    # Now merged into render_education — this is a no-op
    return ""


# -----------------------------------------------------------------------------
# Full HTML document
# -----------------------------------------------------------------------------

def render(data: dict, page_size: str) -> str:
    basics = data["basics"]

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{escape(basics["name"])} — Resume</title>

    <style>
        {css(page_size)}
    </style>
</head>

<body>
    {render_header(data)}
    {render_summary(data)}
    {render_experience(data)}
    {render_projects(data)}
    {render_skills(data)}
    {render_education(data)}
    {render_languages_interests(data)}
</body>
</html>
"""


# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------

def parse_args():
    parser = argparse.ArgumentParser(
        description="Render resume.json into a PDF."
    )

    parser.add_argument(
        "output",
        nargs="?",
        default=None,
        help="Output PDF path."
    )

    parser.add_argument(
        "--a4",
        action="store_true",
        help="Render using A4 instead of US Letter."
    )

    return parser.parse_args()


def main() -> int:
    args = parse_args()

    resume_path = ROOT / "resume.json"

    if not resume_path.exists():
        print(f"Error: resume file not found: {resume_path}")
        return 1

    data = json.loads(resume_path.read_text(encoding="utf-8"))

    if args.output:
        output = Path(args.output)
    else:
        output = ROOT / "public" / "resume.pdf"

    output.parent.mkdir(parents=True, exist_ok=True)

    page_size = "A4" if args.a4 else "Letter"

    html_document = render(
        data=data,
        page_size=page_size,
    )

    HTML(
        string=html_document,
        base_url=str(ROOT),
    ).write_pdf(str(output))

    print(f"✓ wrote {output} ({page_size})")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())