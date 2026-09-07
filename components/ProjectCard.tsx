import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Github, Linkedin, ExternalLink, BookOpen } from 'lucide-react'

function getLinkConfig(url: string) {
  if (url.startsWith('/')) return { icon: <BookOpen size={16} />, text: 'Read Deep-Dive' }
  if (url.includes('github.com')) return { icon: <Github size={16} />, text: 'GitHub' }
  if (url.includes('linkedin.com')) return { icon: <Linkedin size={16} />, text: 'LinkedIn' }
  return { icon: <ExternalLink size={16} />, text: 'Visit' }
}

interface ProjectCardProps {
  title: string
  description: string
  tags: string[]
  links: string[]
}

export const ProjectCard = ({
  title,
  description,
  tags,
  links
}: ProjectCardProps) => {
  return (
    <Card className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/10 bg-card/60 shadow-[0_2px_14px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-border/20 hover:bg-card hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.16)]">
      <CardHeader className="p-7 pb-5">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="font-sans text-xl font-medium tracking-tight text-foreground">
            {title}
          </CardTitle>
        </div>
        <CardDescription className="mt-3 line-clamp-4 font-sans text-sm leading-relaxed text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 px-7 pb-5">
        {tags.map(tag => (
          <span
            key={tag}
            className="font-mono text-[10px] border-l-2 border-primary/40 pl-1.5 uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-foreground/80"
          >
            {tag}
          </span>
        ))}
      </CardContent>
      <CardFooter className="mt-auto p-7 pt-0">
        <div className="flex flex-wrap gap-3">
          {links.map(link => {
            const { icon, text } = getLinkConfig(link)
            const isInternal = link.startsWith('/')
            return (
              <Button
                key={link}
                asChild
                variant="ghost"
                size="sm"
                className="h-8 gap-2 px-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                {isInternal ? (
                  <Link href={link}>
                    {icon}
                    <span>{text}</span>
                  </Link>
                ) : (
                  <Link href={link} target="_blank" rel="noopener noreferrer">
                    {icon}
                    <span>{text}</span>
                  </Link>
                )}
              </Button>
            )
          })}
        </div>
      </CardFooter>
    </Card>
  )
}