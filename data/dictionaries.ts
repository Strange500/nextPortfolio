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
            "Refactored and structured an existing Selenium/Java test framework, separating framework code from test scenarios and introducing reusable abstractions to factor out duplication and improve readability.",
            "Migrated the testing platform to Spring Boot and built an Angular interface to launch and monitor runs; tests execute identically through Maven in CI (Jenkins) or an asynchronous REST API, across roughly 50 to 70 automated tests depending on scope.",
            "Improved automated test reliability through framework refactoring and test-data lifecycle management (creation, update and deletion) in shared environments where other users also modify the data.",
            "Cut the time needed to adapt tests after an environment change or a major application version from about four hours to under ten minutes.",
            "Develop and maintain business application features in Java and Angular, and designed a Spring Boot internal tool that now distributes daily product-support duties across about 40 developers.",
            "Led technical assessments for intern and apprentice recruitment, designing Java coding exercises and questionnaires on Java, Hibernate and Agile practices and conducting technical interviews; trained an intern and an apprentice on the testing framework."
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
            "Refactoring et structuration d'un framework de tests Selenium/Java existant : séparation du code du framework et des scénarios, introduction d'abstractions réutilisables pour factoriser le code et améliorer sa lisibilité.",
            "Migration de la plateforme de tests vers Spring Boot et développement d'une interface Angular pour lancer et superviser les exécutions ; les tests s'exécutent à l'identique via Maven en CI (Jenkins) ou via une API REST asynchrone, sur un ensemble d'environ 50 à 70 tests automatisés selon le périmètre.",
            "Amélioration de la fiabilité des tests via le refactoring du framework et la gestion du cycle de vie des données de test (création, mise à jour, suppression) dans des environnements partagés où d'autres utilisateurs modifient aussi les données.",
            "Réduction du temps d'adaptation des tests après un changement d'environnement ou une version majeure de l'application, d'environ quatre heures à moins de dix minutes.",
            "Développement et déploiement d'un outil interne Spring Boot répartissant chaque jour les tâches de support produit entre environ 40 développeurs, et maintenance de fonctionnalités métier en Java et Angular.",
            "Responsabilité de l'évaluation technique des candidats stagiaires et alternants : conception d'un exercice Java sur ordinateur et de QCM Java, Hibernate et pratiques Agile, entretiens techniques ; formation d'un stagiaire et d'un alternant au framework de tests."
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