import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAllPosts } from '@/lib/blog'

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }];
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params;
  
  const posts = getAllPosts(lang);

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
            <Link href={`/${lang}/blog/${post.slug}`} key={post.slug} className="group">
              <div className="flex flex-col space-y-4 p-6 border border-border/40 rounded-2xl bg-card/50 transition-all hover:bg-card hover:border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{post.date}</span>
                  <div className="flex gap-2">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="font-mono text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <h2 className="text-2xl font-medium text-foreground group-hover:text-primary transition-colors">{post.title}</h2>
                <p className="text-muted-foreground">{post.summary}</p>
                <div className="w-fit p-0 text-primary font-medium mt-2">
                  {lang === 'fr' ? 'Lire la suite' : 'Read more'} →
                </div>
              </div>
            </Link>
          ))}
          {posts.length === 0 && (
            <div className="text-muted-foreground text-center py-12 border border-dashed rounded-xl">
              {lang === 'fr' ? 'Aucun article pour le moment.' : 'No posts yet.'}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
