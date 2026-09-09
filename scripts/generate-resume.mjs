#!/usr/bin/env node
/**
 * generate-resume.mjs
 * -----------------------------------------------------------------------------
 * Parses the portfolio's single source of truth (data/dictionaries.ts,
 * data/education.ts, data/projects.json, data/technologies.ts) and emits a
 * standard, ATS-ready `resume.json` following the JSON Resume schema
 * (https://jsonresume.org).
 *
 * Runs with Node's native TypeScript type-stripping, so the .ts data files are
 * imported directly — no build step, no duplicated content.
 *
 *   node scripts/generate-resume.mjs          # writes resume.json at repo root
 *
 * Design rules enforced here (see portfolio-resume-polishing skill):
 *   - "Show, don't tell": project/work descriptions use Action + Tool + Result.
 *   - NO fabricated impact metrics — no invented percentages or counts.
 *   - Faithful US localization of degrees/titles (M.Eng., NOT "M.S.").
 * -----------------------------------------------------------------------------
 */
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

import { dictionaries } from "../data/dictionaries.ts";
import { education } from "../data/education.ts";
import { technologies } from "../data/technologies.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const projects = JSON.parse(
  readFileSync(join(ROOT, "data", "projects.json"), "utf8")
);

// ---------------------------------------------------------------------------
// Resume-specific data that does NOT (yet) live in the portfolio data files.
// This is the one place to edit contact info, the objective, languages, etc.
// ---------------------------------------------------------------------------
const basics = {
  name: "Benjamin Roget",
  label: "Software Engineer — Backend & Systems",
  email: "benjamin.rogetpro@gmail.com",
  phone: "+33 7 83 03 95 25",
  url: "https://portfolio.qgroget.com",
  summary:
    "Software engineer (co-op) focused on backend development and systems tooling. " +
    "I build reliable, maintainable systems by combining rigorous automated testing " +
    "with declarative infrastructure (NixOS, Docker). Seeking a 3-month software " +
    "engineering internship in the US, starting June 2027.",
  location: {
    address: "12 bis rue Jules Ferry",
    postalCode: "59491",
    city: "Villeneuve d'Ascq",
    region: "Hauts-de-France",
    countryCode: "FR",
  },
  profiles: [
    { network: "GitHub", username: "Strange500", url: "https://github.com/Strange500" },
    { network: "LinkedIn", username: "roget-benjamin", url: "https://www.linkedin.com/in/roget-benjamin" },
  ],
};

const languages = [
  { language: "French", fluency: "Native" },
  { language: "English", fluency: "Professional — TOEIC 980" },
  { language: "Spanish", fluency: "Intermediate" },
];

const interests = [
  { name: "Sport shooting", keywords: ["national level"] },
  { name: "Running", keywords: [] },
  { name: "Swimming", keywords: [] },
  { name: "Cycling", keywords: [] },
  { name: "Weightlifting", keywords: [] },
];

// Work history intentionally absent from the portfolio's "Experience" section
// (non-software, kept brief for completeness).
const extraWork = [
  {
    name: "Flint Group",
    position: "Logistics Assistant",
    startDate: "2023-06-01",
    endDate: "2024-08-31",
    summary: "Seasonal role — summers 2023 and 2024.",
    highlights: [
      "Managed inventory with SAP, ran weekly stock counts, and tracked finished-goods flows.",
    ],
  },
];

// "Show, don't tell" rewrites of each project, keyed by project title.
// Action + Tool + Result — no invented metrics (see hard rule #1 in the skill).
const projectDescriptions = {
  "min-btc-node":
    "Built a minimal Bitcoin full node in Rust from scratch, hand-rolling the wire " +
    "protocol's binary serialization and concurrent peer handling to understand how " +
    "blocks propagate across the network.",
  "nixos-config":
    "Declared multi-host NixOS configurations and dotfiles with Nix flakes and Home " +
    "Manager to make development environments versioned and fully reproducible across " +
    "machines.",
  "pixel-war":
    "Designed a Web3 pixel-canvas dApp with Solidity and JavaScript where users bid " +
    "on-chain to own pixels, claim refunds when outbid, and mint ERC-721 snapshots — " +
    "reasoning through on-chain state and smart-contract security.",
  "HomeLab Infrastructure":
    "Provisioned a self-hosted server with Unraid and Docker running Jellyfin, Gitea, " +
    "and Pi-hole to learn bare-metal provisioning and network routing hands-on.",
};

// ---------------------------------------------------------------------------
// Mappers: portfolio data -> JSON Resume schema
// ---------------------------------------------------------------------------

const workDateMap = {
  "Sept 2025 – Present": { startDate: "2025-09-01", endDate: "" },
  "April 2025 – June 2025": { startDate: "2025-04-01", endDate: "2025-06-30" },
};

const work = dictionaries.en.experience.jobs.map((job) => ({
  name: job.company,
  position: job.role,
  ...(workDateMap[job.date] ?? { startDate: "", endDate: "" }),
  ...(job.deepDive ? { url: `https://portfolio.qgroget.com${job.deepDive}` } : {}),
  highlights: job.bullets,
}));

// Education titles are a fixed, known shape; map them explicitly (no fragile
// string slicing). `period` is authoritative for dates.
const educationMap = {
  "Bachelor's Degree in Computer Science (BUT)": {
    area: "Computer Science",
    studyType: "Bachelor of Science",
  },
  "M.Eng. in Software Engineering (Diplôme d'Ingénieur)": {
    area: "Software Engineering",
    studyType: "Master of Engineering",
  },
};

const educationOut = education.en
  .map((e) => {
    const [startRaw, endRaw] = e.period.split("-").map((s) => s.trim());
    const isCurrent = /now|présent|aujourd/i.test(endRaw);
    const { area, studyType } = educationMap[e.title] ?? {
      area: e.title,
      studyType: "",
    };
    // Only carry achievement-like descriptions ("Graduated top of the class");
    // explanatory text ("Currently studying") is already implied by an empty
    // endDate and would pollute the `score` field.
    const score =
      e.description && /top|major/i.test(e.description) ? e.description : undefined;
    return {
      institution: e.school,
      area,
      studyType,
      startDate: `${startRaw}-09-01`,
      endDate: isCurrent ? "" : `${endRaw}-06-01`,
      ...(score ? { score } : {}),
    };
  })
  .sort((a, b) => b.startDate.localeCompare(a.startDate)); // most recent first

const projectsOut = projects.map((p) => {
  const github = p.links.find((l) => l.includes("github.com")) ?? "";
  const blog = p.links.find((l) => l.includes("/blog/")) ?? "";
  return {
    name: p.title,
    description: projectDescriptions[p.title] ?? p.description,
    keywords: p.tags ?? [],
    ...(github ? { url: github } : {}),
    ...(blog ? { blog: `https://portfolio.qgroget.com${blog}` } : {}),
  };
});

// Extra projects that live on GitHub but not in the portfolio data files.
const extraProjects = [
  {
    name: "RayTracer-Rust",
    description:
      "CPU ray tracer in Rust with BVH acceleration, Phong shading, reflections, " +
      "and a custom scene file format — built from scratch.",
    keywords: ["Rust", "Graphics", "Ray Tracing", "BVH"],
    url: "https://github.com/Strange500/RayTracer-Rust",
  },
  {
    name: "QGChat",
    description:
      "Full-stack chat app in Java EE with Docker Compose deployment, " +
      "SQL persistence, and a JavaScript frontend.",
    keywords: ["Java", "Java EE", "Docker", "WebSocket", "SQL"],
    url: "https://github.com/Strange500/QGChat",
  },
  {
    name: "ascii-cube-rs",
    description:
      "Real-time ASCII 3D cube renderer compiled to WebAssembly via a Nix flake — " +
      "powers the hero widget on this portfolio.",
    keywords: ["Rust", "WebAssembly", "Nix"],
    url: "https://github.com/Strange500/ascii-cube-rs",
  },
];

const allProjects = [...projectsOut, ...extraProjects];

// Skills grouped from technologies.ts (single source of truth for the stack).
const skillGroups = {
  "Languages & Systems": ["Rust", "Java", "C", "Python", "TypeScript", "JavaScript", "WebAssembly"],
  "Backend & Web": ["Spring Boot", "Java EE", "React", "Next.js", "Node.js", "Angular"],
  "DevOps & Infrastructure": ["NixOS", "Linux", "Docker", "Podman", "Jenkins", "Traefik", "Git"],
  "Architecture & Quality": ["Selenium", "JUnit 5", "Design Patterns", "Agile"],
};
const skills = Object.entries(skillGroups).map(([name, keywords]) => ({
  name,
  keywords,
}));

const resume = {
  $schema:
    "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
  basics,
  work: [...work, ...extraWork],
  education: educationOut,
  skills,
  languages,
  interests,
  projects: allProjects,
  meta: {
    version: "1.0.0",
    canonical: "https://portfolio.qgroget.com",
    generatedFrom:
      "data/dictionaries.ts, data/education.ts, data/projects.json, data/technologies.ts",
  },
};

const out = join(ROOT, "resume.json");
writeFileSync(out, JSON.stringify(resume, null, 2) + "\n");
console.log(`✓ wrote ${out}`);
console.log(
  `  ${resume.projects.length} projects, ${resume.work.length} roles, ${resume.education.length} degrees`
);
