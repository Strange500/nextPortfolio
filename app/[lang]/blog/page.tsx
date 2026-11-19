import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import { blogDate } from '@/lib/blog-headings'

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }]
}
export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  return {
    title:
      lang === 'fr'
        ? 'Carnet — Benjamin Roget'
        : 'Field notes — Benjamin Roget',
    description:
      lang === 'fr'
        ? 'Architecture, systèmes et expériences : les projets expliqués depuis le code.'
        : 'Architecture, systems and experiments: project notes from the code.'
  }
}
export default async function BlogPage({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params,
    fr = lang === 'fr',
    posts = getAllPosts(lang),
    [featured, ...rest] = posts
  return (
    <main tabIndex={-1} id='blog-main' className='blog-index'>
      <section className='blog-index-intro' aria-labelledby='blog-title'>
        <p className='blog-eyebrow'>
          {fr ? 'LE CARNET / DEPUIS LE CODE' : 'FIELD NOTES / FROM THE CODE'}
        </p>
        <h1 id='blog-title'>
          {fr ? (
            <>
              Derrière le code.
              <br />
              <em>Les décisions.</em>
            </>
          ) : (
            <>
              Behind the code.
              <br />
              <em>The decisions.</em>
            </>
          )}
        </h1>
        <p className='blog-deck'>
          {fr
            ? 'Des projets, leurs choix d’architecture et ce qu’ils m’ont appris. Rust, infrastructure et tests : le travail, déplié.'
            : 'Projects, architectural choices and lessons from building them. Rust, infrastructure and testing: the work, unfolded.'}
        </p>
        <Link className='blog-back' href={`/${lang}`}>
          ← {fr ? 'Retour au portfolio' : 'Back to portfolio'}
        </Link>
      </section>
      {featured && (
        <section className='blog-feature' aria-labelledby='featured-title'>
          <div className='blog-feature-label'>
            <span className='blog-eyebrow'>
              {fr ? 'DERNIÈRE PUBLICATION' : 'LATEST NOTE'}
            </span>
            <time dateTime={featured.date}>
              {blogDate(featured.date, lang)}
            </time>
          </div>
          <Link
            className='blog-feature-link'
            href={`/${lang}/blog/${featured.slug}`}
          >
            <h2 id='featured-title'>{featured.title}</h2>
            <p>{featured.summary}</p>
            <span className='blog-read'>
              {fr ? 'Lire l’article' : 'Read the note'}{' '}
              <span aria-hidden='true'>↗</span>
            </span>
          </Link>
          <ul className='blog-tags' aria-label={fr ? 'Sujets' : 'Topics'}>
            {featured.tags.map(t => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}
      <section className='blog-archive' aria-labelledby='archive-title'>
        <div className='blog-archive-heading'>
          <h2 id='archive-title'>{fr ? 'Les autres notes' : 'More notes'}</h2>
          <span className='blog-eyebrow'>{fr ? 'ARCHIVES' : 'ARCHIVE'}</span>
        </div>
        {rest.map(post => (
          <article className='blog-post-row' key={post.slug}>
            <time dateTime={post.date}>{blogDate(post.date, lang)}</time>
            <div>
              <Link href={`/${lang}/blog/${post.slug}`}>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <span className='blog-read'>
                  {fr ? 'Lire l’article' : 'Read the note'} ↗
                </span>
              </Link>
              <ul className='blog-tags' aria-label={fr ? 'Sujets' : 'Topics'}>
                {post.tags.map(t => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
        {!posts.length && (
          <p>{fr ? 'Aucun article pour le moment.' : 'No notes yet.'}</p>
        )}
        {posts.length === 1 && (
          <p>
            {fr
              ? 'D’autres notes viendront compléter ce carnet.'
              : 'More notes will follow.'}
          </p>
        )}
      </section>
    </main>
  )
}
