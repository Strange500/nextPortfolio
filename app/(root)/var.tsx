import { Project } from '@/lib/loadProjects';

// Projects are now loaded from external JSON file
// This is a placeholder - actual projects will be loaded in page.tsx
export const projects: Project[] = [];

export const techno = [
  {
    name: "Docker",
    svg: "/logo/docker-logo-blue.svg",
    light_svg: "/logo/docker-logo-blue.svg"
  },
  {
    name: "Spring Boot",
    svg: "/logo/spring-icon.svg",
    light_svg: "/logo/spring-icon.svg"
  },
  {
    name: "React",
    svg: "/logo/react.svg",
    light_svg: "/logo/react.svg"
  },
  {
    name: "NextJS",
    svg: "/logo/next-js.svg",
    light_svg: "/logo/next-js.svg"
  },
  {
    name: "Java EE",
    svg: "/logo/jee.svg",
    light_svg: "/logo/jee.svg"
  },
  {
    name: "Node.js",
    svg: "/logo/nodejs-icon.svg",
    light_svg: "/logo/nodejs-icon.svg"
  },
  {
    name: "Python",
    svg: "/logo/python.svg",
    light_svg: "/logo/python.svg"
  },
  {
    name: "TailwindCSS",
    svg: "/logo/tailwindcss.svg",
    light_svg: "/logo/tailwindcss.svg"
  },
  {
    name: "Git",
    svg: "/logo/git-icon.svg",
    light_svg: "/logo/git-icon.svg"
  },
  {
    name: "Postgres",
    svg: "/logo/postgresql.svg",
    light_svg: "/logo/postgresql.svg"
  },
  {
    name: "Linux",
    svg: "/logo/linux.svg",
    light_svg: "/logo/linux.svg"
  },
  {
    name: "TypeScript",
    svg: "/logo/typescript.svg",
    light_svg : "/logo/typescript.svg"
  },
  {
    name: "JavaScript",
    svg: "/logo/javascript.svg",
    light_svg : "/logo/javascript.svg"
  },
  {
    name: "NixOS",
    svg: "/logo/nixos.svg",
    light_svg : "/logo/nix-snowflake-colours.svg"
  }
];

export const education = [
  {
    title: 'Baccalauréat with a specialization in Mathematics and Computer Science',
    date: 2022,
    period: '2022',
    school: 'Jean Racine High School, Montdidier',
    description: 'Obtained with honors.'
  },
  {
    title: 'intensive one-year study course (Classe Préparatoire)',
    date: 2023,
    period: '2022 - 2023',
    school: 'University of Technology of Compiègne',
  },
  {
    title: 'Associate’s Degree in Computer Science',
    date: 2025,
    period: '2023 - 2025',
    school: 'University Institute of Technology of Lille',
    description: 'Graduated top of the class'
  },
  {
    title: 'Engineering degree in Software Development',
    date: 2028,
    period: '2025 - now',
    school: 'IMT Nord Europe, Institut Mines-Télécom',
    description: 'Currently studying.'
  }
]
