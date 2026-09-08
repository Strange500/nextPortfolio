import Link from 'next/link'
import { ArrowLeft, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import { getAllPostSlugs, getPostBySlug } from '@/lib/blog'
import { Mermaid } from '@/components/mdx/Mermaid'

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
  h1: (props: React.ComponentPropsWithoutRef<'h1'>) => <h1 className="mt-8 mb-4 text-3xl font-bold text-foreground" {...props} />,
  h2: (props: React.ComponentPropsWithoutRef<'h2'>) => <h2 className="mt-10 mb-4 text-2xl font-semibold text-foreground" {...props} />,
  h3: (props: React.ComponentPropsWithoutRef<'h3'>) => <h3 className="mt-6 mb-3 text-xl font-medium text-foreground" {...props} />,
  p: (props: React.ComponentPropsWithoutRef<'p'>) => <p className="mb-4 leading-relaxed text-foreground/90" {...props} />,
  ul: (props: React.ComponentPropsWithoutRef<'ul'>) => <ul className="mb-4 list-disc pl-6 text-foreground/90" {...props} />,
  ol: (props: React.ComponentPropsWithoutRef<'ol'>) => <ol className="mb-4 list-decimal pl-6 text-foreground/90" {...props} />,
  li: (props: React.ComponentPropsWithoutRef<'li'>) => <li className="mb-1" {...props} />,
  a: (props: React.ComponentPropsWithoutRef<'a'>) => <a className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary" {...props} />,
  strong: (props: React.ComponentPropsWithoutRef<'strong'>) => <strong className="font-semibold text-foreground" {...props} />,
  blockquote: (props: React.ComponentPropsWithoutRef<'blockquote'>) => <blockquote className="my-5 border-l-4 border-primary pl-4 italic text-foreground/80" {...props} />,
  code: (props: any) => {
    // rehype-highlight adds `hljs` (and a `language-*`) class to fenced code blocks.
    // Inline code (single backticks) has no className — style it as inline.
    const cls = typeof props.className === 'string' ? props.className : '';
    const isBlock = cls.includes('hljs') || cls.includes('language-');
    if (isBlock) {
      return <code {...props} />;
    }
    return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-primary" {...props} />;
  },
  pre: (props: any) => {
    // Mermaid diagrams are fenced as ```mermaid and rendered client-side.
    const child = props.children;
    if (
      child &&
      child.props &&
      typeof child.props.className === 'string' &&
      child.props.className.includes('language-mermaid')
    ) {
      return <Mermaid chart={child.props.children as string} />;
    }
    return <pre className="my-6 overflow-x-auto rounded-xl border border-white/5 bg-[#0d1117] p-4 text-sm leading-relaxed text-[#e6edf3]" {...props} />;
  },
  hr: (props: React.ComponentPropsWithoutRef<'hr'>) => <hr className="my-10 border-border" {...props} />,
  Tldr: (props: { title?: string; children: React.ReactNode }) => (
    <div className="my-8 rounded-xl border border-primary/30 bg-primary/10 p-5">
      <div className="mb-3 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
        <Lightbulb size={14} />
        {props.title ?? 'TL;DR — Executive Summary'}
      </div>
      <div className="space-y-1.5 text-sm leading-relaxed text-foreground/90">{props.children}</div>
    </div>
  ),
  Cta: (props: { title?: string; children: React.ReactNode }) => (
    <div className="my-10 rounded-xl border border-border bg-muted/50 p-6">
      {props.title && (
        <div className="mb-2 font-semibold text-foreground">{props.title}</div>
      )}
      <div className="space-y-2 text-sm leading-relaxed text-foreground/80">{props.children}</div>
    </div>
  ),
  Alert: (props: { variant?: 'info' | 'warning'; children: React.ReactNode }) => (
    <div
      className={`my-6 rounded-lg border p-4 text-sm leading-relaxed ${
        props.variant === 'warning'
          ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-200'
          : 'border-blue-500/40 bg-blue-500/10 text-blue-200'
      }`}
    >
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
    <section className="min-h-screen w-full selection:bg-primary/20 py-24 px-4 md:px-8">
      <div className="container mx-auto max-w-3xl flex flex-col">

        <Button asChild variant="ghost" className="w-fit -ml-2 mb-4 text-muted-foreground hover:text-foreground">
          <Link href={`/${lang}/blog`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {lang === 'fr' ? 'Retour au blog' : 'Back to blog'}
          </Link>
        </Button>

        {/* Solid panel so long-form text sits on an untextured, high-contrast surface. */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-2xl md:p-12">

          <div className="mb-8 border-b border-border pb-8">
            <h1 className="font-sans text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="font-mono text-sm text-muted-foreground">{post.date}</span>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="font-mono text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>

          <article className="max-w-none">
            <MDXRemote
              source={post.content}
              components={components}
              options={{
                mdxOptions: {
                  rehypePlugins: [rehypeHighlight],
                },
              }}
            />
          </article>

        </div>
      </div>
    </section>
  )
}