import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { compileMDX } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { getAllPostSlugs, getPostBySlug } from '@/lib/blog'
import {
  blogDate,
  rehypeBlogHeadings,
  type BlogHeading
} from '@/lib/blog-headings'
import { articleComponents } from '@/components/blog/ArticleContent'

export const dynamicParams = false
export function generateStaticParams() {
  return ['en', 'fr'].flatMap(lang =>
    getAllPostSlugs(lang).map(slug => ({ lang, slug }))
  )
}
type Props = { params: Promise<{ lang: string; slug: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params,
    post = getPostBySlug(slug, lang)
  return post
    ? { title: `${post.title} — Benjamin Roget`, description: post.summary }
    : { title: 'Not found' }
}
export default async function BlogPostPage({ params }: Props) {
  const { lang, slug } = await params,
    fr = lang === 'fr',
    post = getPostBySlug(slug, lang)
  if (!post) notFound()
  const headings: BlogHeading[] = []
  // One publication title; some legacy posts repeat it as their first MDX H1.
  const source = post.content.replace(
    /^\s*# (.+)\r?\n/,
    (full, title: string) => (title.trim() === post.title.trim() ? '\n' : full)
  )
  const { content } = await compileMDX({
    source,
    components: articleComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [rehypeHighlight, { ignoreMissing: true }],
          [rehypeBlogHeadings, { headings }]
        ]
      }
    }
  })
  return (
    <main tabIndex={-1} id='blog-main' className='blog-article'>
      <Link className='blog-back' href={`/${lang}/blog`}>
        ← {fr ? 'Toutes les notes' : 'All field notes'}
      </Link>
      <div className='blog-reading-layout'>
        <div className='blog-reading-column'>
          <header className='blog-article-header'>
            <p className='blog-eyebrow'>
              <time dateTime={post.date}>{blogDate(post.date, lang)}</time>{' '}
              <span aria-hidden='true'>/</span>{' '}
              {fr ? 'CARNET TECHNIQUE' : 'TECHNICAL FIELD NOTES'}
            </p>
            <h1>{post.title}</h1>
            <p className='blog-deck'>{post.summary}</p>
            <ul className='blog-tags' aria-label={fr ? 'Sujets' : 'Topics'}>
              {post.tags.map(t => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </header>
          <details className='blog-mobile-toc'>
            <summary>{fr ? 'Dans cet article' : 'In this note'}</summary>
            <nav
              aria-label={fr ? 'Sommaire mobile' : 'Article contents, mobile'}
            >
              {headings.map(h => (
                <a key={h.id} href={`#${h.id}`} data-depth={h.depth}>
                  {h.text}
                </a>
              ))}
            </nav>
          </details>
          <article className='blog-prose'>{content}</article>
          <div className='blog-article-end'>
            <Link href={`/${lang}/blog`}>
              ← {fr ? 'Retour au carnet' : 'Back to field notes'}
            </Link>
            <Link href={`/${lang}#contact`}>
              {fr ? 'En discuter' : 'Let’s discuss'} ↗
            </Link>
          </div>
        </div>
        <aside className='blog-toc'>
          <nav aria-label={fr ? 'Sommaire de l’article' : 'Article contents'}>
            <p className='blog-eyebrow'>
              {fr ? 'DANS CET ARTICLE' : 'IN THIS NOTE'}
            </p>
            {headings.map(h => (
              <a key={h.id} href={`#${h.id}`} data-depth={h.depth}>
                {h.text}
              </a>
            ))}
            <a className='blog-toc-top' href='#blog-main'>
              ↑ {fr ? 'Retour en haut' : 'Back to top'}
            </a>
          </nav>
        </aside>
      </div>
    </main>
  )
}
