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
      title: 'Baccalauréat with a specialization in Mathematics and Computer Science',
      date: 2022,
      period: '2022',
      school: 'Jean Racine High School, Montdidier',
      description: 'Obtained with honors.'
    },
    {
      title: 'intensive one-year study course (Classe Préparatoire)',
      date: 2023,
      period: '2022 - 2023',
      school: 'University of Technology of Compiègne',
    },
    {
      title: "Associate's Degree in Computer Science",
      date: 2025,
      period: '2023 - 2025',
      school: 'University Institute of Technology of Lille',
      description: 'Graduated top of the class'
    },
    {
      title: 'Engineering degree in Software Development',
      date: 2028,
      period: '2025 - now',
      school: 'IMT Nord Europe, Institut Mines-Télécom',
      description: 'Currently studying.'
    }
  ],
  fr: [
    {
      title: 'Baccalauréat spécialité Mathématiques et Informatique',
      date: 2022,
      period: '2022',
      school: 'Lycée Jean Racine, Montdidier',
      description: 'Obtenu avec mention.'
    },
    {
      title: 'Classe Préparatoire aux Grandes Écoles (CPGE)',
      date: 2023,
      period: '2022 - 2023',
      school: 'Université de Technologie de Compiègne',
    },
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
