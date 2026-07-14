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
    <Card className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_-15px_rgba(255,255,255,0.1)]">
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
          <Badge
            key={tag}
            variant="secondary"
            className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80 transition-colors group-hover:text-foreground/80"
          >
            {tag}
          </Badge>
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