import { Project } from '@/lib/loadProjects';
import { technologies as techno } from '@/data/technologies';
import { education } from '@/data/education';

// Projects are now loaded from external JSON file
// This is a placeholder - actual projects will be loaded in page.tsx
export const projects: Project[] = [];

// Re-export data for backward compatibility
export { techno, education };
