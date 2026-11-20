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
      resume_en: "English Version (A4 / ATS)",
      resume_en_desc: "A4 · ATS-friendly",
      resume_fr: "French Version (A4)",
      resume_fr_desc: "A4 · Format standard français",
      blog: "Read Blog",
      powered_by: "Powered by WebAssembly & Rust (ascii-cube-rs)"
    },
    about: {
      background_title: "Experience",
      background_p1: "I am currently an apprentice engineer studying at IMT Nord Europe. Rather than just taking notes, I've spent my time building real systems. I began by architecting an enterprise automated testing framework from the ground up, utilizing Java Spring Boot and Selenium.",
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
          role: "Software Engineer Apprentice",
          company: "Numih France",
          date: "Sept 2025 – Present",
          deepDive: "/en/blog/automated-testing-framework",
          bullets: [
            "Refactored an existing Selenium/Java framework and migrated it to Spring Boot, sharing the test engine between Maven/Jenkins CI and an asynchronous REST API.",
            "Built the Angular interface end to end for test launches, scheduling and execution monitoring, integrating WebSocket status notifications.",
            "Made roughly 50–70 tests more reliable through test-data lifecycle management; reduced environment/version adaptation from about 4 hours to under 10 minutes (work-experience estimate).",
            "Developed a separate Spring Boot tool distributing daily product-support duties across about 40 developers; maintained Java and Angular business features.",
            "Conducted technical recruitment assessments (Java exercises and interviews); trained an intern and an apprentice on the testing framework."
          ]
        },
        {
          role: "Full-Stack Developer Intern",
          company: "Ekeep-IT",
          date: "April 2025 – June 2025",
          deepDive: "",
          bullets: [
            "Developed REST APIs with Java and Spring Boot for My-UUU, an equestrian-facility directory and review platform.",
            "Built responsive Next.js interfaces and delivered features in an Agile/Scrum team."
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
      resume_en: "Version anglaise (A4 / ATS)",
      resume_en_desc: "Format A4 · Optimisé ATS",
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
          company: "Numih France",
          date: "Sept 2025 – Présent",
          deepDive: "/fr/blog/automated-testing-framework",
          bullets: [
            "Refonte d’un framework Selenium/Java existant et migration vers Spring Boot : moteur partagé entre la CI Maven/Jenkins et une API REST asynchrone.",
            "Réalisation intégrale de l’interface Angular de lancement, programmation et suivi des tests, avec intégration des notifications de statut WebSocket.",
            "Fiabilisation d’environ 50–70 tests par gestion du cycle de vie des données ; adaptation d’environnement/version ramenée d’environ 4 h à moins de 10 min (estimation issue de l’expérience).",
            "Développement d’un outil Spring Boot distinct répartissant le support quotidien entre environ 40 développeurs ; maintenance de fonctionnalités métier Java et Angular.",
            "Évaluation technique de candidats (exercices Java et entretiens) ; formation d’un stagiaire et d’un alternant au framework de tests."
          ]
        },
        {
          role: "Stagiaire Développeur Full-Stack",
          company: "Ekeep-IT",
          date: "Avril 2025 – Juin 2025",
          deepDive: "",
          bullets: [
            "Développement d'API REST en Java et Spring Boot pour My-UUU, plateforme d'annuaire et d'avis sur les établissements équestres.",
            "Réalisation d'interfaces responsive en Next.js et livraison de fonctionnalités au sein d'une équipe Agile/Scrum."
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