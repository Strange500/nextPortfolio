import { SmallSocialBtn } from '@/components/smallSocialBtn'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { JSX } from 'react'

import { ReadMeDialog } from '@/components/ReadMeDialog'
import { marked } from 'marked'
import Link from 'next/link'


function getSvgForLink(url: string): JSX.Element | undefined {
  if (url.startsWith('https://github.com')) {
    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='16'
        height='16'
        fill='currentColor'
        className='bi bi-github'
        viewBox='0 0 16 16'
      >
        <path d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8' />
      </svg>
    )
  } else if (url.startsWith('https://www.linkedin.com')) {
    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='16'
        height='16'
        fill='currentColor'
        className='bi bi-github'
        viewBox='0 0 16 16'
      >
        <path d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8' />
      </svg>
    )
  } else {
    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='16'
        height='16'
        fill='currentColor'
        className='bi bi-box-arrow-up-right'
        viewBox='0 0 16 16'
      >
        <path
          fillRule='evenodd'
          d='M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5'
        />
        <path
          fillRule='evenodd'
          d='M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z'
        />
      </svg>
    )
  }
}

function getButtonForLink(url: string): JSX.Element {
  let text: string = 'Test it !'
  if (url.startsWith('https://github.com')) {
    text = 'See on GitHub'
  } else if (url.startsWith('https://www.linkedin.com')) {
    text = 'See on LinkedIn'
  }
  return (
    <Link href={url}>
      <Button>
        {getSvgForLink(url)}
        <span className='ml-2'>{text}</span>
      </Button>
    </Link>
  )
}

function fixImgLink(relativeLink: string, readmeUrl:string) {
  const baseUrl = readmeUrl.split('/').slice(0, -1).join('/')
  return `${baseUrl}/${relativeLink.replace('./', '')}`
}

function replaceBrokenMarkdownLinks(content: string, readmeUrl: string) {
  // test regexp

  return content.replace(/\[.*\]\((\.\/.*)\)/g, (match) => {
    const tmp = fixImgLink(match.split('](')[1].split(')')[0], readmeUrl);
    console.log(match.split('](')[0] + `](${tmp})`)
    return match.split('](')[0] + `](${tmp})`
  });
}

const projects = [
  {
    order: 36,
    title: 'Classification-K-NN',
    description: `Dans ce projet, nous avons développé une application de visualisation de données en 2D, offrant des fonctionnalités telles que la classification K-NN, des tests de robustesse et des prédictions. L'application a été implémentée selon le modèle MVC en Java, utilisant la bibliothèque graphique JavaFX.`,
    tags: ['Java', 'JavaFX', 'MVC'],
    links: ['https://github.com/Strange500/Classification-K-NN'],
    readme:
      'https://github.com/Strange500/Classification-K-NN/raw/cc6b9ab8f5a912ab2f789068e2789b27c43a3d6c/README.md'
  },
  {
    order: 1,
    title: 'GameList',
    description:
      'This project is a web application built with Next.js that provides an interactive interface for displaying information about video games using the RAWG API. Users can search for games, view detailed information, and download games directly from the server.',
    tags: ['React', 'Next.js', 'TailwindCSS', 'Docker', 'JavaScript'],
    links: [
      'https://github.com/Strange500/GameList',
      'https://gamelist.portfolio.qgroget.com'
    ],
    readme:
      'https://github.com/Strange500/GameList/raw/859c49fe87b581e9fc5d7b44dea0807d79e2d2da/README.md'
  },
  {
    order: 2,
    title: 'Bagarre.io',
    description: `Bagarre.io est un Agar.io-like développé en JavaScript. Le jeu est un jeu multijoueur en temps réel où les joueurs peuvent se battre pour devenir le plus gros joueur.`,
    tags: ['JavaScript', 'Node.js', 'Socket.io'],
    links: ['https://bagarre.portfolio.qgroget.com']
  },
  {
    order: 3,
    title: 'QGChat',
    description:
      'QGChat est une application web permettant aux utilisateurs de créer et gérer des fils de discussion avec un ou plusieurs participants. Chaque utilisateur peut poster et lire des messages dans ces fils. L’application suit une architecture MVC en JEE, avec une interface responsive compatible avec ordinateur et mobile.',
    tags: ['Java', 'JEE', 'MVC', 'Tomcat', 'JavaScript'],
    links: ['https://github.com', 'https://tomcat.qgroget.com/sae']
  },
  {
    order: 5,
    title: 'This portfolio',
    description:
      'This portfolio is a Next.js application that showcases my projects and skills. It is built with TypeScript, TailwindCSS, and uses a custom design system. The site is fully responsive and optimized for performance.',
    tags: ['React', 'Next.js', 'TailwindCSS', 'TypeScript'],
    links: ['https://github.com/Strange500/nextPortfolio'],
    readme:
      'https://github.com/Strange500/nextPortfolio/raw/3930e3fbb708fcadf93cc80a255b43d6a318d6d5/README.md'
  },
  {
    order: 3,
    title: 'HomeLab',
    description:
      'My homeLab is my domestic server that hosts various services such as a JellyFin instance, a Gitea instance, a Pi-hole instance, and this portfolio! The server runs Unraid as the host OS and uses docker for containerization.',
    tags: ['Unraid', 'Docker', 'Linux', 'Self-hosting'],
    links: []
  }
]

async function getHtmlFromMarkdown(content: string | undefined) {
  if (!content) return ''
  return marked.parse(content)
}

async function ProjectCard({
  title,
  description,
  tags,
  links,
  readme
}: {
  title: string
  description: string
  tags: string[]
  links: string[]
  readme: string | undefined
}) {
  let content = '';
  let fixedReadme = '';
  let contentString = '';
  if (readme) {
    contentString = await fetch(readme).then(res => res.text()) || '';
    fixedReadme = replaceBrokenMarkdownLinks(contentString, readme)
    content = await getHtmlFromMarkdown(fixedReadme);
  }
  return (
    <Card className={`flex h-full flex-col justify-between bg-white shadow-md`}>
      <CardHeader>
        <CardTitle className={`flex flex-row justify-between`}>
          {title}
          {content !== '' && <ReadMeDialog content={content} title={title} /> }
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {tags.map(tag => (
          <Badge
            key={tag}
            className='rounded-lg bg-neutral-100 p-1 text-sm text-neutral-900'
          >
            {tag}
          </Badge>
        ))}
      </CardContent>
      <CardFooter>
        <ul className={`flex space-x-4`}>
          {links.map(link => (
            <li key={link}>{getButtonForLink(link)}</li>
          ))}
        </ul>
      </CardFooter>
    </Card>
  )
}

export default function Page() {
  const handleSmoothScroll = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const targetId = event.currentTarget.getAttribute('href') as string
    const targetElement = document.querySelector(targetId)
    if (!targetElement) return
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  return (
    <section className='h-screen w-screen overflow-x-hidden'>
      <Header />

      <div className='container mx-auto h-full'>
        <div className={`pt-12 md:pt-60`}></div>
        <div className='flex justify-center md:justify-start'>
          <div className='mx-4 flex flex-col justify-center text-center md:mx-0 md:text-left'>
            <h1 className='text-2xl font-semibold text-neutral-900 md:text-4xl'>
              Hi, I&#39;m <span className='gradient-text'>Benjamin Roget</span>
            </h1>
            <p className='text-lg text-neutral-900'>
              I&#39;m a IT student from France
            </p>
          </div>
        </div>
        <SmallSocialBtn />
        <div className={`pt-12`}></div>
        <a
          href={`#project`}
          className={`flex justify-center align-middle md:justify-start`}
        >
          <Button
            className={`relative rounded p-2 text-white shadow hover:bg-neutral-900`}
          >
            <h2>
              Explore my projects
              <span
                className={`absolute right-[-2] top-[-2] animate-ping rounded-full bg-red-600 p-1 opacity-75`}
              ></span>
              <span className='absolute right-[-2] top-[-2] rounded-full bg-red-400 p-1'></span>
            </h2>
          </Button>
        </a>
      </div>

      <div className='container mx-auto h-[100vh]' id={'project'}>
        <div className={`pt-16 md:pt-32`}></div>
        <h1 className='text-2xl font-semibold md:text-4xl'>
          Projects I worked on
        </h1>
        <section className={`pt-12`}></section>
        <ul
          className={`grid h-[80%] grid-cols-1 gap-4 overflow-y-scroll md:h-auto md:grid-cols-2 md:overflow-visible lg:grid-cols-3`}
        >
          {projects
            .sort((a, b) => a.order - b.order)
            .map((project, index) => (
              <li key={index} className={`rounded-lg`}>
                <ProjectCard {...project} />
              </li>
            ))}
        </ul>
      </div>
    </section>
  )
}