import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ReadMeDialog } from '@/components/ReadMeDialog'
import { Badge } from '@/components/ui/badge'
import { JSX } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { marked } from 'marked'

export function getSvgForLink(url: string): JSX.Element | undefined {
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
      <Button
        className={
          'bg-accent text-foreground hover:bg-muted hover:text-foreground'
        }
      >
        {getSvgForLink(url)}
        <span className='ml-2'>{text}</span>
      </Button>
    </Link>
  )
}

function fixImgLink(relativeLink: string, readmeUrl: string) {
  const baseUrl = readmeUrl.split('/').slice(0, -1).join('/')
  return `${baseUrl}/${relativeLink.replace('./', '')}`
}

function replaceBrokenMarkdownLinks(content: string, readmeUrl: string) {
  // test regexp

  return content.replace(/\[.*\]\(((\.\/.*)|([a-zA-Z]*\/.*))\)/g, match => {
    const tmp = fixImgLink(match.split('](')[1].split(')')[0], readmeUrl)
    console.log(match.split('](')[0] + `](${tmp})`)
    return match.split('](')[0] + `](${tmp})`
  })
}

async function getHtmlFromMarkdown(content: string | undefined) {
  if (!content) return ''
  return marked.parse(content)
}

interface ProjectCardProps {
  title: string
  description: string
  tags: string[]
  links: string[]
  readme: string | undefined
}

export const ProjectCard = async ({
  title,
  description,
  tags,
  links,
  readme
}: ProjectCardProps) => {
  let content = ''
  let fixedReadme = ''
  let contentString = ''
  if (readme) {
    contentString =
      (await fetch(readme)
        .then(res => res.text())
        .catch(() => null)) || ''
    fixedReadme = replaceBrokenMarkdownLinks(contentString, readme)
    content = await getHtmlFromMarkdown(fixedReadme)
  }
  return (
    <Card
      className={`flex h-full flex-col justify-between bg-foreground shadow-md`}
    >
      <CardHeader>
        <CardTitle className={`flex flex-row justify-between text-secondary`}>
          {title}
          {content !== '' && <ReadMeDialog content={content} title={title} />}
        </CardTitle>
        <CardDescription className={'text-justify text-muted-foreground'}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className={'flex flex-row'}>
        {tags.map(tag => (
          <Badge
            key={tag}
            className='rounded-lg bg-secondary-foreground pr-3 text-sm text-muted-foreground hover:bg-accent'
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