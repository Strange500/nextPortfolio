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

/**
 * Loads projects from an external JSON file
 * Adds _fr to the filename if lang is 'fr'
 */
export async function loadProjects(lang: string = 'en'): Promise<Project[]> {
  const isFrench = lang === 'fr';
  const getPathForLang = (basePath: string) => {
    if (!isFrench) return basePath;
    const parsed = path.parse(basePath);
    return path.join(parsed.dir, `${parsed.name}_fr${parsed.ext}`);
  };

  if (process.env.PROJECTS_FILE_PATH) {
    try {
      const absolutePath = path.resolve(process.cwd(), getPathForLang(process.env.PROJECTS_FILE_PATH));
      const fileContent = await fs.readFile(absolutePath, 'utf-8');
      const projects: Project[] = JSON.parse(fileContent);
      return projects;
    } catch {
      console.warn('Falling back to default projects file...');
    }
  }
  
  try {
    const defaultPath = path.resolve(process.cwd(), getPathForLang(DEFAULT_PROJECTS_PATH));
    const fileContent = await fs.readFile(defaultPath, 'utf-8');
    const projects: Project[] = JSON.parse(fileContent);
    return projects;
  } catch {
    // If French fails, try English
    if (isFrench) {
      try {
         const englishPath = path.resolve(process.cwd(), DEFAULT_PROJECTS_PATH);
         const fileContent = await fs.readFile(englishPath, 'utf-8');
         return JSON.parse(fileContent);
      } catch {}
    }
    return [];
  }
}