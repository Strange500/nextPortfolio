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
 * Uses environment variable PROJECTS_FILE_PATH if provided, otherwise defaults to data/projects.json
 * Implements error handling with graceful fallback
 */
export async function loadProjects(): Promise<Project[]> {
  try {
    // Get the projects file path from environment variable or use default
    const projectsFilePath = process.env.PROJECTS_FILE_PATH || DEFAULT_PROJECTS_PATH;
    
    // Resolve the absolute path from the project root
    const absolutePath = path.resolve(process.cwd(), projectsFilePath);
    
    // Read and parse the JSON file
    const fileContent = await fs.readFile(absolutePath, 'utf-8');
    const projects: Project[] = JSON.parse(fileContent);
    
    // Validate that the parsed data is an array
    if (!Array.isArray(projects)) {
      throw new Error('Projects data must be an array');
    }
    
    console.log(`Successfully loaded ${projects.length} projects from ${projectsFilePath}`);
    return projects;
    
  } catch (error) {
    console.error('Error loading projects:', error);
    
    // Return empty array as fallback to prevent application crashes
    // In a production environment, you might want to return default projects or cached data
    console.warn('Falling back to empty projects array');
    return [];
  }
}