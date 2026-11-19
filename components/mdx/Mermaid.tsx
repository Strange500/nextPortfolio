'use client'
import { useEffect, useId, useState } from 'react'
import mermaid from 'mermaid'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { Maximize2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog'

export function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState(''),
    [failed, setFailed] = useState(false),
    id = useId().replace(/[^a-z0-9]/gi, ''),
    { resolvedTheme } = useTheme(),
    fr = usePathname().startsWith('/fr')
  useEffect(() => {
    let cancelled = false
    const palette = getComputedStyle(document.documentElement),
      token = (name: string) =>
        palette.getPropertyValue(`--portfolio-${name}`).trim()
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      theme: 'base',
      themeVariables: {
        darkMode: resolvedTheme === 'dark',
        background: token('paper'),
        primaryColor: token('panel'),
        primaryTextColor: token('ink'),
        primaryBorderColor: token('line'),
        lineColor: token('muted'),
        secondaryColor: token('panel'),
        tertiaryColor: token('paper'),
        clusterBkg: token('panel'),
        clusterBorder: token('line'),
        edgeLabelBackground: token('paper'),
        titleColor: token('ink')
      },
      fontFamily: 'system-ui, sans-serif'
    })
    mermaid
      .render(`diagram-${id}`, chart)
      .then(({ svg }) => {
        if (!cancelled) {
          setSvg(svg)
          setFailed(false)
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [chart, resolvedTheme, id])
  if (failed) return <pre data-diagram-fallback>{chart}</pre>
  if (!svg)
    return (
      <div
        className='blog-diagram-placeholder'
        role='status'
        aria-label={fr ? 'Chargement du diagramme' : 'Loading diagram'}
      />
    )
  return (
    <Dialog>
      <figure className='blog-diagram'>
        <div
          className='blog-diagram-preview'
          role='img'
          aria-label={fr ? 'Diagramme d’architecture' : 'Architecture diagram'}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <DialogTrigger asChild>
          <button type='button'>
            <Maximize2 size={14} aria-hidden='true' />
            {fr ? 'Agrandir le diagramme' : 'Enlarge diagram'}
          </button>
        </DialogTrigger>
      </figure>
      <DialogContent className='blog-diagram-dialog'>
        <DialogTitle>
          {fr ? 'Diagramme d’architecture' : 'Architecture diagram'}
        </DialogTitle>
        <DialogDescription className='sr-only'>
          {fr
            ? 'Version agrandie. Échap pour fermer.'
            : 'Expanded view. Press Escape to close.'}
        </DialogDescription>
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      </DialogContent>
    </Dialog>
  )
}
