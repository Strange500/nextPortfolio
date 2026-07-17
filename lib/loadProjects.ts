import fs from 'fs';
import enProjects from '@/data/projects.json';
import frProjects from '@/data/projects_fr.json';

export interface Project {
  order: number;
  title: string;
  description: string;
  tags: string[];
  links: string[];
}

export async function loadProjects(lang: string = 'en'): Promise<Project[]> {
  const customPath = process.env.PROJECTS_FILE_PATH;
  if (customPath) {
    try {
      const fileContents = fs.readFileSync(customPath, 'utf8');
      return JSON.parse(fileContents) as Project[];
    } catch {
      // Fallback gracefully
    }
  }

  return (lang === 'fr' ? frProjects : enProjects) as Project[];
}
