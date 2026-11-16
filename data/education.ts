export interface Education {
  title: string;
  date: number;
  period: string;
  school: string;
  description?: string;
}

export const education: Record<'en' | 'fr', Education[]> = {
  en: [
    {
      title: "DUT Informatique (University Diploma of Technology in Computer Science)",
      date: 2025,
      period: '2023 - 2025',
      school: 'University of Lille',
      description: 'Ranked first in the cohort in each year.'
    },
    {
      title: "Diplôme d'ingénieur (expected 2028)",
      date: 2028,
      period: '2025 - now',
      school: 'IMT Nord Europe, Institut Mines-Télécom',
      description:
        'Computer Science, Telecommunications and Networks — Computer Science track. Apprenticeship-based engineering program.'
    }
  ],
  fr: [
    {
      title: "DUT Informatique (Diplôme Universitaire de Technologie)",
      date: 2025,
      period: '2023 - 2025',
      school: 'IUT de Lille',
      description: 'Premier de promotion chacune des deux années.'
    },
    {
      title: "Diplôme d'ingénieur (prévu en 2028)",
      date: 2028,
      period: '2025 - aujourd\'hui',
      school: 'IMT Nord Europe, Institut Mines-Télécom',
      description:
        'Informatique, télécommunications et réseaux — parcours informatique. Formation en apprentissage.'
    }
  ]
};