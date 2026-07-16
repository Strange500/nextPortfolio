import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }];
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params;
  
  // Dummy posts for now - later you can move this to a JSON file or Markdown files
  const posts = [
    {
      id: 1,
      title: lang === 'fr' ? 'Bienvenue sur mon Blog' : 'Welcome to my Blog',
      date: '2026-07-16',
      summary: lang === 'fr' ? 'Cet espace servira à partager mes projets personnels, découvertes techniques et notes d\'architecture.' : 'This space will be used to share my personal projects, technical discoveries, and architecture notes.',
      tags: ['General', 'Welcome']
    }
  ]

  return (
    <section className="min-h-screen w-full selection:bg-primary/20 py-20 px-4 md:px-8">
      <div className="container mx-auto max-w-4xl flex flex-col space-y-12">
        
        {/* Header */}
        <div className="flex flex-col space-y-6">
          <Button asChild variant="ghost" className="w-fit -ml-4 text-muted-foreground hover:text-foreground">
            <Link href={`/${lang}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {lang === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
            </Link>
          </Button>
          <h1 className="font-sans text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {lang === 'fr' ? 'Le Blog' : 'The Blog'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {lang === 'fr' ? 'Articles, projets, et notes techniques.' : 'Articles, projects, and technical notes.'}
          </p>
        </div>

        {/* Posts List */}
        <div className="flex flex-col space-y-8">
          {posts.map(post => (
            <div key={post.id} className="flex flex-col space-y-4 p-6 border border-border/40 rounded-2xl bg-card/50 transition-all hover:bg-card">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">{post.date}</span>
                <div className="flex gap-2">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="font-mono text-[10px]">{tag}</Badge>
                  ))}
                </div>
              </div>
              <h2 className="text-2xl font-medium text-foreground">{post.title}</h2>
              <p className="text-muted-foreground">{post.summary}</p>
              <Button variant="link" className="w-fit p-0 text-primary">
                {lang === 'fr' ? 'Lire la suite' : 'Read more'} →
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
