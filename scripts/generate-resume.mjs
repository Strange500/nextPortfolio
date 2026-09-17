#!/usr/bin/env node
/**
 * generate-resume.mjs
 * -----------------------------------------------------------------------------
 * Parses the portfolio's single source of truth (data/dictionaries.ts,
 * data/education.ts, data/projects.json, data/projects_fr.json, data/technologies.ts)
 * and emits standard, ATS-ready JSON Resume files following the JSON Resume
 * schema (https://jsonresume.org) in both English and French:
 *
 *   - resume.json & resume-en.json (English, US/ATS-oriented)
 *   - resume-fr.json (French, standard format)
 *
 * Runs with Node's native TypeScript type-stripping, so the .ts data files are
 * imported directly — no build step, no duplicated content.
 * -----------------------------------------------------------------------------
 */
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

import { dictionaries } from "../data/dictionaries.ts";
import { education } from "../data/education.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const projectsEn = JSON.parse(
  readFileSync(join(ROOT, "data", "projects.json"), "utf8")
);
const projectsFr = JSON.parse(
  readFileSync(join(ROOT, "data", "projects_fr.json"), "utf8")
);

// ---------------------------------------------------------------------------
// Resume-specific data per language
// ---------------------------------------------------------------------------
const basicsData = {
  en: {
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
  },
  fr: {
    name: "Benjamin Roget",
    label: "Ingénieur Logiciel — Backend & Systèmes",
    email: "benjamin.rogetpro@gmail.com",
    phone: "+33 7 83 03 95 25",
    url: "https://portfolio.qgroget.com/fr",
    summary:
      "Ingénieur logiciel (en alternance) axé sur le développement backend et l'outillage système. " +
      "Je conçois des systèmes fiables et maintenables en combinant tests automatisés rigoureux " +
      "et environnements déclaratifs (NixOS, Docker). À la recherche d'un stage d'ingénieur de 3 mois, " +
      "dès juin 2027.",
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
  },
};

const languagesData = {
  en: [
    { language: "French", fluency: "Native" },
    { language: "English", fluency: "Professional — TOEIC 980" },
    { language: "Spanish", fluency: "Intermediate" },
  ],
  fr: [
    { language: "Français", fluency: "Langue maternelle" },
    { language: "Anglais", fluency: "Courant / Professionnel — TOEIC 980" },
    { language: "Espagnol", fluency: "Intermédiaire" },
  ],
};

const interestsData = {
  en: [
    { name: "Sport shooting", keywords: ["national level"] },
    { name: "Running", keywords: [] },
    { name: "Swimming", keywords: [] },
    { name: "Cycling", keywords: [] },
    { name: "Weightlifting", keywords: [] },
  ],
  fr: [
    { name: "Tir sportif", keywords: ["niveau national"] },
    { name: "Course à pied", keywords: [] },
    { name: "Natation", keywords: [] },
    { name: "Cyclisme", keywords: [] },
    { name: "Musculation", keywords: [] },
  ],
};

const extraWorkData = {
  en: [
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
  ],
  fr: [
    {
      name: "Flint Group",
      position: "Assistant Logistique",
      startDate: "2023-06-01",
      endDate: "2024-08-31",
      summary: "Emploi saisonnier — étés 2023 et 2024.",
      highlights: [
        "Gestion des stocks avec SAP, inventaires hebdomadaires et suivi des flux de produits finis.",
      ],
    },
  ],
};

const projectDescriptions = {
  en: {
    "min-btc-node":
      "Built a Bitcoin node from scratch in Rust, implementing the P2P wire protocol " +
      "(handshake, inventory, block headers) with zero protocol dependencies and concurrent peer parsing.",
    "nixos-config":
      "Declared multi-host NixOS configurations and dotfiles with Nix flakes and Home " +
      "Manager to make development environments versioned and fully reproducible across " +
      "machines.",
    "pixel-war":
      "Architected a Web3 pixel-canvas dApp in Solidity with pull-over-push refund patterns " +
      "to prevent reentrancy attacks, and on-chain ERC-721 snapshot minting.",
    "HomeLab Infrastructure":
      "Provisioned a self-hosted server with Unraid and Docker running Jellyfin, Gitea, " +
      "and Pi-hole to learn bare-metal provisioning and network routing hands-on.",
  },
  fr: {
    "min-btc-node":
      "Nœud Bitcoin développé from scratch en Rust : implémentation du protocole P2P " +
      "(handshake, inventory, blocs) sans dépendance tierce et gestion concurrente des pairs.",
    "nixos-config":
      "Configuration multi-machines déclarative et dotfiles avec Nix flakes et Home Manager " +
      "pour des environnements de développement versionnés et 100% reproductibles.",
    "pixel-war":
      "dApp Web3 pixel-canvas en Solidity : pattern pull-over-push pour sécuriser les remboursements " +
      "contre la réentrance, et frappe d'instantanés en NFT ERC-721.",
    "Infrastructure HomeLab":
      "Déploiement d'un serveur auto-hébergé avec Unraid et Docker (Jellyfin, Gitea, Pi-hole) " +
      "pour la maîtrise concrète du provisionnement bare-metal et du routage réseau.",
    "HomeLab Infrastructure":
      "Déploiement d'un serveur auto-hébergé avec Unraid et Docker (Jellyfin, Gitea, Pi-hole) " +
      "pour la maîtrise concrète du provisionnement bare-metal et du routage réseau.",
  },
};

const extraProjectsData = {
  en: [
    {
      name: "RayTracer-Rust",
      description:
        "CPU ray tracer in Rust with Bounding Volume Hierarchy (BVH) spatial partitioning " +
        "for O(log N) ray-primitive intersections, Phong shading, and reflections.",
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
  ],
  fr: [
    {
      name: "RayTracer-Rust",
      description:
        "Moteur de ray tracing CPU en Rust avec partitionnement spatial BVH pour des " +
        "intersections en O(log N), ombrage de Phong et réflexions récursives.",
      keywords: ["Rust", "Graphisme", "Ray Tracing", "BVH"],
      url: "https://github.com/Strange500/RayTracer-Rust",
    },
    {
      name: "QGChat",
      description:
        "Application de messagerie instantanée en Java EE avec déploiement Docker Compose, " +
        "persistance SQL et interface JavaScript.",
      keywords: ["Java", "Java EE", "Docker", "WebSocket", "SQL"],
      url: "https://github.com/Strange500/QGChat",
    },
    {
      name: "ascii-cube-rs",
      description:
        "Moteur de rendu 3D d'un cube ASCII en temps réel compilé en WebAssembly via un flake Nix — " +
        "anime le widget hero de ce portfolio.",
      keywords: ["Rust", "WebAssembly", "Nix"],
      url: "https://github.com/Strange500/ascii-cube-rs",
    },
  ],
};

const skillGroupsData = {
  en: {
    "Languages & Systems": ["Rust", "Java", "C", "Python", "TypeScript", "JavaScript", "WebAssembly"],
    "Backend & Web": ["Spring Boot", "Java EE", "React", "Next.js", "Node.js", "Angular"],
    "DevOps & Infrastructure": ["NixOS", "Linux", "Docker", "Podman", "Jenkins", "Traefik", "Git"],
    "Architecture & Quality": ["Selenium", "JUnit 5", "Design Patterns", "Agile"],
  },
  fr: {
    "Langages & Systèmes": ["Rust", "Java", "C", "Python", "TypeScript", "JavaScript", "WebAssembly"],
    "Backend & Web": ["Spring Boot", "Java EE", "React", "Next.js", "Node.js", "Angular"],
    "DevOps & Infrastructure": ["NixOS", "Linux", "Docker", "Podman", "Jenkins", "Traefik", "Git"],
    "Architecture & Qualité": ["Selenium", "JUnit 5", "Design Patterns", "Agile"],
  },
};

const workDateMap = {
  "Sept 2025 – Present": { startDate: "2025-09-01", endDate: "" },
  "April 2025 – June 2025": { startDate: "2025-04-01", endDate: "2025-06-30" },
  "Sept 2025 – Présent": { startDate: "2025-09-01", endDate: "" },
  "Avril 2025 – Juin 2025": { startDate: "2025-04-01", endDate: "2025-06-30" },
};

const educationMaps = {
  en: {
    "Bachelor's Degree in Computer Science (BUT)": {
      area: "Computer Science",
      studyType: "Bachelor of Science",
    },
    "M.Eng. in Software Engineering (Diplôme d'Ingénieur)": {
      area: "Software Engineering",
      studyType: "Master of Engineering",
    },
  },
  fr: {
    "BUT Informatique (Bachelor Universitaire de Technologie)": {
      area: "Informatique",
      studyType: "BUT Informatique",
    },
    "Diplôme d'Ingénieur en Ingénierie Logicielle": {
      area: "Ingénierie Logicielle",
      studyType: "Diplôme d'Ingénieur (Grade de Master)",
    },
  },
};

function buildResume(lang) {
  const dict = dictionaries[lang];
  const eduList = education[lang];
  const rawProjects = lang === "fr" ? projectsFr : projectsEn;

  const work = dict.experience.jobs.map((job) => ({
    name: job.company,
    position: job.role,
    ...(workDateMap[job.date] ?? { startDate: "", endDate: "" }),
    ...(job.deepDive ? { url: `https://portfolio.qgroget.com${job.deepDive}` } : {}),
    highlights: job.bullets,
  }));

  const eduMap = educationMaps[lang];
  const educationOut = eduList
    .map((e) => {
      const [startRaw, endRaw] = e.period.split("-").map((s) => s.trim());
      const isCurrent = /now|présent|aujourd/i.test(endRaw);
      const { area, studyType } = eduMap[e.title] ?? {
        area: e.title,
        studyType: "",
      };
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
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  const descMap = projectDescriptions[lang];
  const projectsOut = rawProjects.map((p) => {
    const github = p.links.find((l) => l.includes("github.com")) ?? "";
    const blog = p.links.find((l) => l.includes("/blog/")) ?? "";
    return {
      name: p.title,
      description: descMap[p.title] ?? p.description,
      keywords: p.tags ?? [],
      ...(github ? { url: github } : {}),
      ...(blog ? { blog: `https://portfolio.qgroget.com${blog}` } : {}),
    };
  });

  const allProjects = [...projectsOut, ...extraProjectsData[lang]];

  const skills = Object.entries(skillGroupsData[lang]).map(([name, keywords]) => ({
    name,
    keywords,
  }));

  return {
    $schema:
      "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: basicsData[lang],
    work: [...work, ...extraWorkData[lang]],
    education: educationOut,
    skills,
    languages: languagesData[lang],
    interests: interestsData[lang],
    projects: allProjects,
    meta: {
      version: "1.0.0",
      lang,
      canonical: lang === "fr" ? "https://portfolio.qgroget.com/fr" : "https://portfolio.qgroget.com",
      generatedFrom:
        "data/dictionaries.ts, data/education.ts, data/projects.json, data/projects_fr.json, data/technologies.ts",
    },
  };
}

// Generate English resume
const resumeEn = buildResume("en");
const outEn = join(ROOT, "resume.json");
const outEnCopy = join(ROOT, "resume-en.json");
writeFileSync(outEn, JSON.stringify(resumeEn, null, 2) + "\n");
writeFileSync(outEnCopy, JSON.stringify(resumeEn, null, 2) + "\n");
console.log(`✓ wrote ${outEn} and ${outEnCopy}`);

// Generate French resume
const resumeFr = buildResume("fr");
const outFr = join(ROOT, "resume-fr.json");
writeFileSync(outFr, JSON.stringify(resumeFr, null, 2) + "\n");
console.log(`✓ wrote ${outFr}`);
console.log(
  `  [EN] ${resumeEn.projects.length} projects, ${resumeEn.work.length} roles, ${resumeEn.education.length} degrees`
);
console.log(
  `  [FR] ${resumeFr.projects.length} projects, ${resumeFr.work.length} roles, ${resumeFr.education.length} degrees`
);
