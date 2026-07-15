import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ReadMeDialog } from '@/components/ReadMeDialog'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Github, Linkedin, ExternalLink } from 'lucide-react'
import { marked } from 'marked'

function getLinkConfig(url: string) {
  if (url.includes('github.com')) return { icon: <Github size={16} />, text: 'GitHub' }
  if (url.includes('linkedin.com')) return { icon: <Linkedin size={16} />, text: 'LinkedIn' }
  return { icon: <ExternalLink size={16} />, text: 'Visit' }
}

function fixImgLink(relativeLink: string, readmeUrl: string) {
  const baseUrl = readmeUrl.split('/').slice(0, -1).join('/')
  return `${baseUrl}/${relativeLink.replace('./', '')}`
}

function replaceBrokenMarkdownLinks(content: string, readmeUrl: string) {
  return content.replace(/\[.*\]\(((\.\/.*)|([a-zA-Z]*\/.*))\)/g, match => {
    const tmp = fixImgLink(match.split('](')[1].split(')')[0], readmeUrl)
    console.log(match.split('](')[0] + `](${tmp})`)
    return match.split('](')[0] + `](${tmp})`
  })
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
    content = fixedReadme ? await marked.parse(fixedReadme) : ''
  }
  return (
    <Card className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border/40 bg-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-border/80">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="font-sans text-xl font-medium tracking-tight text-foreground">
            {title}
          </CardTitle>
          {content !== '' && <ReadMeDialog content={content} title={title} />}
        </div>
        <CardDescription className="mt-3 line-clamp-3 font-sans text-sm leading-relaxed text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 px-6 pb-4">
        {tags.map(tag => (
          <span
            key={tag}
            className="font-mono text-[10px] border-l-2 border-primary/40 pl-1.5 uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-foreground/80"
          >
            {tag}
          </span>
        ))}
      </CardContent>
      <CardFooter className="mt-auto p-6 pt-0">
        <div className="flex flex-wrap gap-3">
          {links.map(link => {
            const { icon, text } = getLinkConfig(link)
            return (
              <Button
                key={link}
                asChild
                variant="ghost"
                size="sm"
                className="h-8 gap-2 px-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                <Link href={link} target="_blank" rel="noopener noreferrer">
                  {icon}
                  <span>{text}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </CardFooter>
    </Card>
  )
}