#!/usr/bin/env node
/**
 * generate-resume.mjs
 * -----------------------------------------------------------------------------
 * Parses the portfolio's single source of truth (data/dictionaries.ts,
 * data/education.ts, data/projects.json, data/projects_fr.json, data/technologies.ts)
 * and emits standard, ATS-ready JSON Resume files following the JSON Resume
 * schema (https://jsonresume.org) in both English and French:
 *
 *   - resume.json & resume-en.json (English, Europe & US / ATS-friendly)
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
    label: "Software Engineering Student | Backend & Systems",
    email: "benjamin.rogetpro@gmail.com",
    phone: "+33 7 83 03 95 25",
    url: "https://portfolio.qgroget.com",
    summary:
      "Seeking a 3-month software engineering internship starting June 2027 in Poland, Romania, " +
      "Czechia or the Nordics, in English-speaking teams; the US is a secondary option. " +
      "Engineering student and software engineering apprentice with experience building Java/Spring Boot " +
      "applications and automated testing tools. Personal projects focus on Rust, networking and Linux infrastructure.",
    location: {
      city: "Villeneuve d'Ascq",
      region: "Hauts-de-France",
      countryCode: "FR",
    },
    profiles: [
      { network: "GitHub",   username: "Strange500",    url: "https://github.com/Strange500" },
      { network: "LinkedIn", username: "roget-benjamin", url: "https://www.linkedin.com/in/roget-benjamin" },
    ],
  },
  fr: {
    name: "Benjamin Roget",
    label: "Ingénieur Logiciel — Backend & Systèmes",
    email: "benjamin.rogetpro@gmail.com",
    phone: "+33 7 83 03 95 25",
    url: "https://portfolio.qgroget.com/fr",
    image: `file://${join(ROOT, "public/img/cv-profile.jpg")}`,
    summary:
      "À la recherche d'un stage d'ingénieur de 3 mois à partir de juin 2027. " +
      "Apprenti ingénieur à l'IMT Nord Europe, spécialisé en backend Java/Spring Boot, " +
      "tests automatisés et outillage système (Rust, NixOS, Docker).",
    location: {
      address: "12 bis rue Jules Ferry",
      postalCode: "59491",
      city: "Villeneuve d'Ascq",
      region: "Hauts-de-France",
      countryCode: "FR",
    },
    profiles: [
      { network: "GitHub",   username: "Strange500",    url: "https://github.com/Strange500" },
      { network: "LinkedIn", username: "roget-benjamin", url: "https://www.linkedin.com/in/roget-benjamin" },
    ],
  },
};

const languagesData = {
  en: [
    { language: "French",  fluency: "Native" },
    { language: "English", fluency: "TOEIC Listening & Reading: 980/990, 2026" },
    { language: "Spanish", fluency: "Intermediate" },
  ],
  fr: [
    { language: "Français", fluency: "Langue maternelle" },
    { language: "Anglais",  fluency: "Courant (TOEIC 980/990)" },
    { language: "Espagnol", fluency: "Intermédiaire" },
  ],
};

const interestsData = {
  en: [
    { name: "Sport shooting",     keywords: ["national level"] },
    { name: "Triathlon training", keywords: [] },
    { name: "Weightlifting",      keywords: [] },
  ],
  fr: [
    { name: "Tir sportif",            keywords: ["niveau national"] },
    { name: "Entraînement triathlon", keywords: [] },
    { name: "Musculation",            keywords: [] },
  ],
};


const projectDescriptions = {
  en: {
    "min-btc-node":
      "Built a Rust Bitcoin light-client prototype with asynchronous P2P networking across " +
      "multiple peers, block-header synchronization, and BIP157/158 compact filters to retrieve " +
      "relevant blocks and track wallet UTXOs.",
    "nixos-config":
      "Managed six hosts with declarative NixOS configurations, Nix flakes and Home Manager, " +
      "with version-controlled settings and dotfiles.",
    "pico-ledger":
      "Built an embedded Bitcoin wallet prototype in Rust with a host-tested portable core, " +
      "BIP39 mnemonic generation, entropy encryption, and wallet locking.",
  },
  fr: {
    "min-btc-node":
      "Prototype de client léger Bitcoin en Rust : réseau P2P asynchrone multi-pairs, " +
      "synchronisation des en-têtes de blocs et filtres compacts BIP157/158 pour récupérer les " +
      "blocs pertinents et suivre les UTXO du portefeuille.",
    "nixos-config":
      "Gestion de six machines via des configurations NixOS déclaratives (Nix flakes, " +
      "Home Manager), avec réglages système et dotfiles versionnés.",
    "pico-ledger":
      "Prototype de portefeuille Bitcoin embarqué en Rust : cœur portable testé sur hôte, " +
      "génération de phrases BIP39, chiffrement de l’entropie et verrouillage du portefeuille.",
  },
};

const extraProjectsData = {
  en: [
    {
      name: "RayTracer-Rust",
      description:
        "CPU ray tracer in Rust with BVH acceleration, Phong shading and reflections.",
      keywords: ["Rust", "Graphics", "Ray Tracing", "BVH"],
      url: "https://github.com/Strange500/RayTracer-Rust",
    },
    {
      name: "QGChat",
      description:
        "Java EE MVC chat application with a REST API for channels and messages, PostgreSQL " +
        "persistence, temporary JWT tokens for channel invitations, and Docker Compose deployment.",
      keywords: ["Java EE", "PostgreSQL", "Docker"],
      url: "https://github.com/Strange500/QGChat",
    },
    {
      name: "ascii-cube-rs",
      description:
        "Real-time ASCII 3D cube renderer compiled to WebAssembly via a Nix flake; " +
        "powers the interactive hero on my portfolio website.",
      keywords: ["Rust", "WebAssembly", "Nix"],
      url: "https://github.com/Strange500/ascii-cube-rs",
    },
  ],
  fr: [
    {
      name: "RayTracer-Rust",
      description:
        "Moteur de ray tracing CPU en Rust avec accélération BVH, ombrage de Phong et réflexions.",
      keywords: ["Rust", "Graphisme", "Ray Tracing", "BVH"],
      url: "https://github.com/Strange500/RayTracer-Rust",
    },
    {
      name: "QGChat",
      description:
        "Application de chat MVC en Java EE : API REST pour les canaux et les messages, " +
        "persistance PostgreSQL, invitations par jetons JWT temporaires et déploiement Docker Compose.",
      keywords: ["Java EE", "PostgreSQL", "Docker"],
      url: "https://github.com/Strange500/QGChat",
    },
    {
      name: "ascii-cube-rs",
      description:
        "Moteur de rendu 3D d'un cube ASCII en temps réel compilé en WebAssembly via un flake Nix ; " +
        "anime la scène interactive de mon site portfolio.",
      keywords: ["Rust", "WebAssembly", "Nix"],
      url: "https://github.com/Strange500/ascii-cube-rs",
    },
  ],
};

const skillGroupsData = {
  en: {
    "Backend": ["Java", "Spring Boot", "Java EE", "REST APIs", "SQL", "Maven"],
    "Systems & Languages": ["Rust", "C", "Python", "TypeScript", "JavaScript", "WebAssembly"],
    "Web": ["Angular", "React", "Next.js"],
    "Testing & Tooling": ["Selenium", "JUnit 5", "Jenkins", "Git"],
    "Infrastructure": ["NixOS", "Linux", "Docker", "Podman"],
  },
  fr: {
    "Backend": ["Java", "Spring Boot", "Java EE", "API REST", "SQL", "Maven"],
    "Langages & Systèmes": ["Rust", "C", "Python", "TypeScript", "JavaScript", "WebAssembly"],
    "Web": ["Angular", "React", "Next.js"],
    "Tests & Outillage": ["Selenium", "JUnit 5", "Jenkins", "Git"],
    "Infrastructure": ["NixOS", "Linux", "Docker", "Podman"],
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
    "DUT Informatique (University Diploma of Technology in Computer Science)": {
      area: "",
      studyType: "DUT Informatique (University Diploma of Technology in Computer Science)",
      score: "Ranked first in the cohort in each year.",
    },
    "Diplôme d'ingénieur (expected 2028)": {
      area: "Computer Science, Telecommunications and Networks",
      studyType: "Diplôme d'ingénieur, expected 2028 (apprenticeship)",
    },
  },
  fr: {
    "DUT Informatique (Diplôme Universitaire de Technologie)": {
      area: "",
      studyType: "DUT Informatique (Diplôme Universitaire de Technologie)",
      score: "Premier de promotion chacune des deux années.",
    },
    "Diplôme d'ingénieur (prévu en 2028)": {
      area: "Informatique, télécommunications et réseaux",
      studyType: "Diplôme d'ingénieur, diplôme prévu en 2028 (apprentissage)",
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
      const { area, studyType, score: mappedScore } = eduMap[e.title] ?? {
        area: e.title,
        studyType: "",
      };
      const score = mappedScore;
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
    // Replace the gallery entry only in the resume, without inheriting its links.
    if (p.title === "pixel-war") {
      return {
        name: "pico-ledger",
        description: descMap["pico-ledger"],
        keywords: ["Rust", "Bitcoin", "Embedded"],
        url: "https://github.com/Strange500/pico-ledger",
      };
    }
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

  const allProjects = [
    ...projectsOut.filter((p) => !/homelab/i.test(p.name)),
    ...extraProjectsData[lang],
  ];

  // Curate only the resume, leaving the portfolio gallery intact.
  const selectedProjects = ["min-btc-node", "QGChat", "nixos-config"].map((name) => {
    const project = allProjects.find((entry) => entry.name === name);
    if (!project) throw new Error(`Missing selected resume project: ${name}`);
    return project;
  });

  const skills = Object.entries(skillGroupsData[lang]).map(([name, keywords]) => ({
    name,
    keywords,
  }));

  return {
    $schema:
      "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: basicsData[lang],
    work,
    education: educationOut,
    skills,
    languages: languagesData[lang],
    interests: interestsData[lang],
    projects: selectedProjects,
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
