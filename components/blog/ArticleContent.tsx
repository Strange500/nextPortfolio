import {
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactNode
} from 'react'
import { Mermaid } from '@/components/mdx/Mermaid'

/** Native semantic elements keep article CSS and anchors consistent. */
export const articleComponents = {
  code: ({ className, ...props }: ComponentPropsWithoutRef<'code'>) => (
    <code className={className} {...props} />
  ),
  pre: ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) => {
    if (
      isValidElement<{ className?: string; children?: ReactNode }>(children) &&
      children.props.className?.includes('language-mermaid')
    )
      return <Mermaid chart={String(children.props.children || '')} />
    return (
      <pre tabIndex={0} {...props}>
        {children}
      </pre>
    )
  },
  table: (props: ComponentPropsWithoutRef<'table'>) => (
    <div
      className='blog-table-scroll'
      role='region'
      aria-label='Table'
      tabIndex={0}
    >
      <table {...props} />
    </div>
  ),
  Tldr: ({ title, children }: { title?: string; children: ReactNode }) => (
    <aside className='blog-callout'>
      <p className='blog-callout-title'>{title || 'TL;DR'}</p>
      {children}
    </aside>
  ),
  Cta: ({ title, children }: { title?: string; children: ReactNode }) => (
    <aside className='blog-article-cta'>
      {title && <p className='blog-callout-title'>{title}</p>}
      {children}
    </aside>
  ),
  Alert: ({
    variant,
    children
  }: {
    variant?: 'info' | 'warning'
    children: ReactNode
  }) => (
    <aside className='blog-callout' data-variant={variant || 'info'}>
      {children}
    </aside>
  )
}
