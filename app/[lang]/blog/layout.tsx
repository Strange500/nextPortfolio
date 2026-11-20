import Link from 'next/link'
import Background from '@/components/Background'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ModeToggle } from '@/components/ModeToggle'
import { notFound } from 'next/navigation'
import '@/app/blog.css'

export default async function BlogLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (lang !== 'fr' && lang !== 'en') notFound()
  const fr = lang === 'fr'
  return (
    <div className='blog-shell' lang={lang}>
      <Background />
      <a className='blog-skip' href='#blog-main'>
        {fr ? 'Aller au contenu' : 'Skip to content'}
      </a>
      <header className='blog-header'>
        <Link
          className='blog-brand'
          href={`/${lang}`}
          aria-label={fr ? 'Benjamin Roget, accueil' : 'Benjamin Roget, home'}
        >
          b<span>_</span>r <small>/ Benjamin Roget</small>
        </Link>
        <nav aria-label={fr ? 'Navigation principale' : 'Main navigation'}>
          <Link href={`/${lang}#missions`}>{fr ? 'Projets' : 'Projects'}</Link>
          <Link href={`/${lang}/blog`} aria-current='true'>
            {fr ? 'Carnet' : 'Field notes'}
          </Link>
          <Link href={`/${lang}#contact`}>Contact ↗</Link>
        </nav>
        <div className='blog-controls'>
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      </header>
      {children}
      <footer className='blog-footer'>
        <span>
          BENJAMIN ROGET <span aria-hidden='true'>/</span>{' '}
          {fr
            ? 'PROJETS ET RETOURS D’EXPÉRIENCE.'
            : 'PROJECTS AND ENGINEERING NOTES.'}
        </span>
        <Link href={`/${lang}#contact`}>
          {fr ? 'Échangeons' : 'Get in touch'} ↗
        </Link>
      </footer>
    </div>
  )
}
