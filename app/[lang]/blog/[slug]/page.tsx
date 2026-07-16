import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllPostSlugs, getPostBySlug } from '@/lib/blog'

export async function generateStaticParams() {
  const params: { lang: string, slug: string }[] = [];
  
  // Generate pages for all combinations of languages and slugs
  for (const lang of ['en', 'fr']) {
    const slugs = getAllPostSlugs(lang);
    for (const slug of slugs) {
      params.push({ lang, slug });
    }
  }
  
  return params;
}

// Custom components to pass to MDX
const components = {
  h1: (props: React.ComponentPropsWithoutRef<'h1'>) => <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground" {...props} />,
  h2: (props: React.ComponentPropsWithoutRef<'h2'>) => <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground" {...props} />,
  h3: (props: React.ComponentPropsWithoutRef<'h3'>) => <h3 className="text-xl font-medium mt-6 mb-3 text-foreground" {...props} />,
  p: (props: React.ComponentPropsWithoutRef<'p'>) => <p className="text-muted-foreground leading-relaxed mb-4" {...props} />,
  ul: (props: React.ComponentPropsWithoutRef<'ul'>) => <ul className="list-disc pl-6 mb-4 text-muted-foreground" {...props} />,
  ol: (props: React.ComponentPropsWithoutRef<'ol'>) => <ol className="list-decimal pl-6 mb-4 text-muted-foreground" {...props} />,
  a: (props: React.ComponentPropsWithoutRef<'a'>) => <a className="text-primary hover:underline" {...props} />,
  blockquote: (props: React.ComponentPropsWithoutRef<'blockquote'>) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4" {...props} />,
  code: (props: React.ComponentPropsWithoutRef<'code'>) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props} />,
  pre: (props: React.ComponentPropsWithoutRef<'pre'>) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono text-foreground my-6 border border-border/40" {...props} />,
  Alert: (props: { variant?: 'info' | 'warning', children: React.ReactNode }) => (
    <div className={`p-4 rounded-lg border my-6 ${props.variant === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
      {props.children}
    </div>
  ),
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string, slug: string }>
}) {
  const { lang, slug } = await params;
  const post = getPostBySlug(slug, lang);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl">Post not found</h1>
      </div>
    );
  }

  return (
    <section className="min-h-screen w-full selection:bg-primary/20 py-20 px-4 md:px-8">
      <div className="container mx-auto max-w-3xl flex flex-col">
        
        <div className="mb-12">
          <Button asChild variant="ghost" className="w-fit -ml-4 text-muted-foreground hover:text-foreground mb-8">
            <Link href={`/${lang}/blog`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {lang === 'fr' ? 'Retour au blog' : 'Back to blog'}
            </Link>
          </Button>

          <h1 className="font-sans text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-mono text-sm text-muted-foreground">{post.date}</span>
            <div className="flex gap-2">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="font-mono text-xs">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>

        <article className="prose prose-invert max-w-none">
          <MDXRemote source={post.content} components={components} />
        </article>
      </div>
    </section>
  )
}
