import type { Metadata } from 'next'
import PortfolioNarrative from '@/components/PortfolioNarrative'

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
    title: 'Benjamin Groget — Software, systems & evidence',
    description:
      lang === 'fr'
        ? 'Quatre facettes d’une même exigence : Rust/WASM, NixOS, automatisation des tests et Bitcoin. Projets, architecture et résultats contextualisés.'
        : 'Four facets of one engineering practice: Rust/WASM, NixOS, test automation and Bitcoin. Inspect the projects, architecture and evidence.'
  }
}

export default async function Page({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  return <PortfolioNarrative lang={lang === 'fr' ? 'fr' : 'en'} />
}
