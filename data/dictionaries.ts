export type Dictionary = typeof dictionaries.en;

export const dictionaries = {
  en: {
    hero: {
      badge: "Benjamin Roget — Software & Systems",
      title_start: "Building ",
      title_highlight: "robust backend systems",
      title_end: "\nand declarative infrastructure.",
      description_1: "Software Engineer focused on ",
      description_highlight: "backend development",
      description_2: " and systems tooling. By combining rigorous automated testing with declarative environments (NixOS, Docker), I build reliable, maintainable applications.",
      status: "Currently seeking a 3-month engineering internship — starting June 2027.",
      cta: "View Architecture & Projects",
      resume: "Download Resume",
      resume_en: "English Version (US / ATS)",
      resume_en_desc: "Letter · Single-column, ATS-friendly",
      resume_fr: "French Version (A4)",
      resume_fr_desc: "A4 · Format standard français",
      blog: "Read Blog",
      powered_by: "Powered by WebAssembly & Rust (ascii-cube-rs)"
    },
    about: {
      background_title: "Experience",
      background_p1: "I am currently a co-op engineering student at IMT Nord Europe. Rather than just taking notes, I've spent my time building real systems. I began by architecting an enterprise automated testing framework from the ground up, utilizing Java Spring Boot and Selenium.",
      background_p2: "Now, I work on the core team to rewrite and modernize internal framework modules. Whether writing systems-level Rust or deploying Spring Boot apps, my focus is always on engineering resilient software.",
      skills_title: "Technical Arsenal",
      systems_iac: "Systems & IaC",
      backend_testing: "Backend & Testing",
      web: "Web"
    },
    experience: {
      title: "Experience",
      jobs: [
        {
          role: "Software Engineer (Co-op)",
          company: "Numih France (DOGRH)",
          date: "Sept 2025 – Present",
          deepDive: "/en/blog/automated-testing-framework",
          bullets: [
            "Architected and maintain a unified E2E test engine (Java Spring Boot, Selenium) running 50–70 automated integration tests, executable identically via Maven in CI or an async REST API.",
            "Refactored the test architecture to cut the false-positive rate by ~70% and reduce environment/version migrations from ~4 hours to under 10 minutes.",
            "Built developer tooling and data-isolation abstractions (Jenkins) to interact easily with in-house applications and eliminate concurrent test collisions.",
            "Developed and deployed a Spring Boot internal tool that auto-distributes daily product-support duties across ~40 developers."
          ]
        },
        {
          role: "Fullstack Developer Intern",
          company: "Ekeep-IT",
          date: "April 2025 – June 2025",
          deepDive: "",
          bullets: [
            "Engineered RESTful backend services (Java Spring Boot, relational database) powering My-UUU, an equestrian-facility directory and review platform.",
            "Developed responsive interfaces in Next.js (React) and shipped sprint user stories in an Agile/Scrum team for a production-facing product."
          ]
        }
      ]
    },
    education: {
      title: "Education"
    },
    projects: {
      title: "Selected Work",
      description: "A collection of hardcore systems and infrastructure I've built and configured."
    }
  },
  fr: {
    hero: {
      badge: "Benjamin Roget — Logiciels & Systèmes",
      title_start: "Conception de ",
      title_highlight: "systèmes backend robustes",
      title_end: "\net d'infrastructures déclaratives.",
      description_1: "Ingénieur Logiciel axé sur le ",
      description_highlight: "développement backend",
      description_2: " et l'outillage système. En combinant tests automatisés et environnements déclaratifs (NixOS, Docker), je conçois des applications fiables et maintenables.",
      status: "À la recherche d'un stage d'ingénieur de 3 mois — dès juin 2027.",
      cta: "Voir les Projets",
      resume: "Télécharger mon CV",
      resume_en: "Version anglaise (US / ATS)",
      resume_en_desc: "Format US · Optimisé ATS",
      resume_fr: "Version française (A4)",
      resume_fr_desc: "Format standard A4",
      blog: "Lire le Blog",
      powered_by: "Propulsé par WebAssembly & Rust (ascii-cube-rs)"
    },
    about: {
      background_title: "Expérience",
      background_p1: "Je suis actuellement apprenti ingénieur à l'IMT Nord Europe. Plutôt que de simplement prendre des notes, je passe mon temps à concevoir de vrais systèmes. J'ai commencé par architecturer un framework de tests automatisés d'entreprise en utilisant Java Spring Boot et Selenium.",
      background_p2: "Aujourd'hui, je travaille avec l'équipe principale pour réécrire et moderniser nos modules internes. Qu'il s'agisse d'écrire du Rust bas niveau ou de déployer des applications Spring Boot, mon objectif est toujours de concevoir des logiciels résilients.",
      skills_title: "Arsenal Technique",
      systems_iac: "Systèmes & IaC",
      backend_testing: "Backend & Tests",
      web: "Web"
    },
    experience: {
      title: "Expérience",
      jobs: [
        {
          role: "Ingénieur Logiciel (Alternance)",
          company: "Numih France (DOGRH)",
          date: "Sept 2025 – Présent",
          deepDive: "/fr/blog/automated-testing-framework",
          bullets: [
            "Architecture et maintien d'un moteur de tests E2E unifié (Spring Boot, Selenium) pilotant 50 à 70 tests d'intégration, exécutable à l'identique via Maven en CI ou via API REST asynchrone.",
            "Refactoring de l'architecture de test ayant réduit le taux de faux positifs de ~70 % et ramené les migrations (version/environnement) de ~4 h à moins de 10 min.",
            "Conception d'outils développeur et d'abstractions d'isolation de données (Jenkins) pour interagir facilement avec les applications internes et éliminer les collisions concurrentes.",
            "Développement et déploiement en production d'un outil Spring Boot répartissant chaque jour le support produit auprès d'environ 40 développeurs."
          ]
        },
        {
          role: "Ingénieur Fullstack (Stage)",
          company: "Ekeep-IT",
          date: "Avril 2025 – Juin 2025",
          deepDive: "",
          bullets: [
            "Développement des services backend (Java Spring Boot, base relationnelle) de My-UUU, plateforme de référencement et d'avis sur les structures équestres.",
            "Réalisation d'interfaces responsive Next.js (React) et livraison de user stories en équipe Agile/Scrum pour un produit en production."
          ]
        }
      ]
    },
    education: {
      title: "Formation"
    },
    projects: {
      title: "Projets Récents",
      description: "Une collection de systèmes et d'infrastructures que j'ai conçus et configurés."
    }
  }
};