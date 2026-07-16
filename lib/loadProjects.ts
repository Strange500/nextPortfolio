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
  return (lang === 'fr' ? frProjects : enProjects) as Project[];
}