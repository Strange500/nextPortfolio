import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'data/posts');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  content: string;
}

export function getAllPostSlugs(lang: string) {
  const dir = path.join(POSTS_DIR, lang);
  if (!fs.existsSync(dir)) return [];
  const fileNames = fs.readdirSync(dir);
  return fileNames.filter(name => name.endsWith('.mdx')).map(fileName => {
    return fileName.replace(/\.mdx$/, '');
  });
}

export function getPostBySlug(slug: string, lang: string): BlogPost | null {
  try {
    const fullPath = path.join(POSTS_DIR, lang, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || slug,
      date: data.date || '',
      summary: data.summary || '',
      tags: data.tags || [],
      content,
    };
  } catch (e) {
    console.error(`Error reading post ${slug} in ${lang}:`, e);
    return null;
  }
}

export function getAllPosts(lang: string): BlogPost[] {
  const slugs = getAllPostSlugs(lang);
  const posts = slugs
    .map(slug => getPostBySlug(slug, lang))
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
  return posts;
}
