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
      cta: "View Architecture & Projects",
      resume: "Download Resume",
      blog: "Read Blog",
      powered_by: "Powered by WebAssembly & Rust (ascii-cube-rs)"
    },
    about: {
      background_title: "Experience",
      background_p1: "I am currently an engineering apprentice at IMT Nord Europe. Rather than just taking notes, I've spent my time building real systems. I began by architecting an enterprise automated testing framework from the ground up, utilizing Java Spring Boot and Selenium.",
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
          role: "Software Developer Apprentice",
          company: "Numih France (DOGRH)",
          date: "Sept 2025 – Present",
          bullets: [
            "Architected and executed the automated integration test suite for the Hôpital Numérique platform.",
            "Massively refactored the test architecture to unify execution via API or maven, optimizing developer workflow.",
            "Created abstractions and data isolation tools via Jenkins for reproducible test environments.",
            "Developed and deployed a Spring Boot internal tool to production."
          ]
        },
        {
          role: "Fullstack Developer Intern",
          company: "Ekeep-IT",
          date: "April 2025 – June 2025",
          bullets: [
            "Developed a web application within an Agile environment.",
            "Utilized Spring Boot for the backend and Next.js for the frontend."
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
      cta: "Voir les Projets",
      resume: "Télécharger mon CV",
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
          role: "Développeur Logiciel (Apprenti)",
          company: "Numih France (DOGRH)",
          date: "Sept 2025 – Présent",
          bullets: [
            "Architecture et exécution de la suite de tests d'intégration automatisés pour la plateforme Hôpital Numérique.",
            "Refactoring massif de l'architecture de test permettant l'exécution unifiée via API ou mvn test.",
            "Création d'abstractions et d'outils d'isolation de données via Jenkins pour des tests reproductibles.",
            "Développement et déploiement en production d'un outil interne Spring Boot."
          ]
        },
        {
          role: "Développeur Fullstack (Stagiaire)",
          company: "Ekeep-IT",
          date: "Avril 2025 – Juin 2025",
          bullets: [
            "Développement d'une application web en environnement et rituels Agile.",
            "Utilisation de Spring Boot pour le backend et Next.js (React) pour le frontend."
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
