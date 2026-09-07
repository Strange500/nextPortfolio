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
      title: "Bachelor's Degree in Computer Science (BUT)",
      date: 2025,
      period: '2023 - 2025',
      school: 'University Institute of Technology of Lille',
      description: 'Graduated top of the class'
    },
    {
      title: 'M.Eng. in Software Engineering (Diplôme d\'Ingénieur)',
      date: 2028,
      period: '2025 - now',
      school: 'IMT Nord Europe, Institut Mines-Télécom',
      description: 'Master\'s-level engineering degree. Currently studying.'
    }
  ],
  fr: [
    {
      title: "BUT Informatique (Bachelor Universitaire de Technologie)",
      date: 2025,
      period: '2023 - 2025',
      school: 'IUT de Lille',
      description: 'Major de promotion'
    },
    {
      title: 'Diplôme d\'Ingénieur en Ingénierie Logicielle',
      date: 2028,
      period: '2025 - aujourd\'hui',
      school: 'IMT Nord Europe, Institut Mines-Télécom',
      description: 'En cours.'
    }
  ]
};