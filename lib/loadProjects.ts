import { promises as fs } from 'fs';
import path from 'path';

export interface Project {
  order: number;
  title: string;
  description: string;
  tags: string[];
  links: string[];
  readme: string;
}

const DEFAULT_PROJECTS_PATH = 'data/projects.json';

// Default projects fallback data
const DEFAULT_PROJECTS: Project[] = [
  {
    order: 36,
    title: "Classification-K-NN",
    description: "In this project, we developed a 2D data visualization application, offering features such as K-NN classification, robustness testing, and predictions. The application was implemented according to the MVC model in Java, using the JavaFX graphical library.",
    tags: ["Java", "JavaFX", "MVC"],
    links: ["https://github.com/Strange500/Classification-K-NN"],
    readme: "https://raw.githubusercontent.com/Strange500/Classification-K-NN/refs/heads/main/README.md"
  },
  {
    order: 1,
    title: "GameList",
    description: "This project is a web application built with Next.js that provides an interactive interface for displaying information about video games using the RAWG API. Users can search for games, view detailed information, and download games directly from the server.",
    tags: ["React", "Next.js", "TailwindCSS", "Docker", "JavaScript"],
    links: ["https://github.com/Strange500/GameList"],
    readme: "https://raw.githubusercontent.com/Strange500/GameList/refs/heads/main/README.md"
  },
  {
    order: 2,
    title: "Bagarre.io",
    description: "Bagarre.io is an Agar.io-like game developed in JavaScript. The game is a real-time multiplayer game where players can fight to become the biggest player.",
    tags: ["JavaScript", "Node.js", "Socket.io"],
    links: ["https://github.com/Strange500/BAGARRE.IO"],
    readme: "https://raw.githubusercontent.com/Strange500/BAGARRE.IO/refs/heads/main/README.md"
  },
  {
    order: 3,
    title: "QGChat",
    description: "QGChat is a web application that allows users to create and manage discussion threads with one or more participants. Each user can post and read messages in these threads. The application follows an MVC architecture in JEE, with a responsive interface compatible with both desktop and mobile.",
    tags: ["Java", "JEE", "MVC", "Tomcat", "JavaScript"],
    links: [
      "https://github.com/Strange500/QGChat",
      "https://tomcat.qgroget.com/sae"
    ],
    readme: "https://raw.githubusercontent.com/Strange500/QGChat/refs/heads/main/README.md"
  },
  {
    order: 5,
    title: "This portfolio",
    description: "This portfolio is a Next.js application that showcases my projects and skills. It is built with TypeScript, TailwindCSS, and uses a custom design system. The site is fully responsive and optimized for performance.",
    tags: ["React", "Next.js", "TailwindCSS", "TypeScript"],
    links: ["https://github.com/Strange500/nextPortfolio"],
    readme: "https://raw.githubusercontent.com/Strange500/nextPortfolio/refs/heads/main/README.md"
  },
  {
    order: 3,
    title: "HomeLab",
    description: "My homeLab is my domestic server that hosts various services such as a JellyFin instance, a Gitea instance, a Pi-hole instance, and this portfolio! The server runs Unraid as the host OS and uses docker for containerization.",
    tags: ["Unraid", "Docker", "Linux", "Self-hosting"],
    links: [],
    readme: ""
  }
];

/**
 * Loads projects from an external JSON file
 * Uses environment variable PROJECTS_FILE_PATH if provided, otherwise defaults to data/projects.json
 * Supports both relative paths (from project root) and absolute paths
 * Implements error handling with graceful fallback to default projects
 */
export async function loadProjects(): Promise<Project[]> {
  try {
    // Get the projects file path from environment variable or use default
    const projectsFilePath = process.env.PROJECTS_FILE_PATH || DEFAULT_PROJECTS_PATH;
    
    // Resolve the absolute path - supports both relative and absolute paths
    // Relative paths are resolved from process.cwd() (project root)
    // Absolute paths are used as-is, allowing files outside the project
    const absolutePath = path.resolve(process.cwd(), projectsFilePath);
    
    // Read and parse the JSON file
    const fileContent = await fs.readFile(absolutePath, 'utf-8');
    const projects: Project[] = JSON.parse(fileContent);
    
    // Validate that the parsed data is an array and not empty
    if (!Array.isArray(projects)) {
      throw new Error('Projects data must be an array');
    }
    
    if (projects.length === 0) {
      throw new Error('Projects array is empty');
    }
    
    console.log(`Successfully loaded ${projects.length} projects from ${projectsFilePath}`);
    return projects;
    
  } catch (error) {
    console.error('Error loading projects:', error);
    
    // Return default projects as fallback to ensure the application displays content
    // This maintains functionality even when custom project files are missing or invalid
    console.warn('Falling back to default projects');
    return DEFAULT_PROJECTS;
  }
}