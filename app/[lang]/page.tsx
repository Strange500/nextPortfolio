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
    title:
      lang === 'fr'
        ? 'Benjamin Roget — Backend Java & systèmes'
        : 'Benjamin Roget — Java Backend & Systems',
    description:
      lang === 'fr'
        ? 'Apprenti ingénieur à l’IMT Nord Europe, en alternance chez Numih. Backend Java/Spring Boot, Angular et systèmes. Stage de trois mois recherché à partir de juin 2027.'
        : 'Engineering apprentice at IMT Nord Europe and Numih. Java/Spring Boot backend, Angular and systems. Seeking a three-month internship from June 2027.'
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
