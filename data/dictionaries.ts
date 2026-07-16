export type Dictionary = typeof dictionaries.en;

export const dictionaries = {
  en: {
    hero: {
      badge: "Benjamin Roget — Software & Systems",
      title_start: "Building ",
      title_highlight: "resilient systems",
      title_end: "\nand scalable architecture.",
      description_1: "I am a Backend Engineer specializing in ",
      description_highlight: "high-performance architecture",
      description_2: ". By combining rigorous automated testing with declarative infrastructure, I ship code that stays up when it counts.",
      cta: "View Architecture & Projects",
      resume: "Download Resume",
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
          role: "Backend Engineering Apprentice",
          company: "[Add Company Name]",
          date: "[Add Dates, e.g., 2023 - Present]",
          bullets: [
            "Architected an enterprise automated testing framework utilizing Java Spring Boot and Selenium.",
            "Designed complex data-isolation systems and robust test suites, improving lifecycle management.",
            "Joined the core development team to rewrite and modernize legacy internal framework modules."
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
      title_highlight: "systèmes robustes",
      title_end: "\net d'architectures scalables.",
      description_1: "Ingénieur Backend spécialisé dans les ",
      description_highlight: "architectures haute performance",
      description_2: ". En alliant tests automatisés et infrastructure déclarative, je conçois des applications taillées pour la production.",
      cta: "Voir les Projets",
      resume: "Télécharger mon CV",
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
          role: "Apprenti Ingénieur Backend",
          company: "[Ajouter le nom de l'entreprise]",
          date: "[Ajouter les dates, ex: 2023 - Présent]",
          bullets: [
            "Architecture d'un framework de tests automatisés d'entreprise avec Java Spring Boot et Selenium.",
            "Conception de systèmes complexes d'isolation de données et de suites de tests robustes.",
            "Intégration à l'équipe de développement principale pour réécrire et moderniser les modules internes."
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
