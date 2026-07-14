import { SmallSocialBtn } from '@/components/smallSocialBtn'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProjectCard } from '@/components/ProjectCard'
import { education, techno } from '@/app/(root)/var'
import { loadProjects, type Project } from '@/lib/loadProjects'
import { ArrowRight } from 'lucide-react'

export default async function Page() {
  const projects: Project[] = await loadProjects();

  return (
    <section className="min-h-screen w-full selection:bg-primary/20">
      {/* Hero Section */}
      <div className="container mx-auto flex min-h-[75vh] flex-col justify-center px-4 md:px-8">
        <div className="flex flex-col items-start max-w-3xl space-y-6">
          <Badge variant="outline" className="font-mono text-xs font-normal text-muted-foreground border-border/50">
            System Admin & Software Developer
          </Badge>
          
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Building resilient systems and scalable applications.
          </h1>
          
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            I&#39;m Benjamin Roget, an engineering student specializing in software architecture and declarative DevOps. I bridge the gap between infrastructure and high-performance frontend interfaces.
          </p>
          
          <div className="flex items-center gap-4 pt-4">
            <Button asChild className="group rounded-full px-6">
              <a href="#projects">
                View Architecture & Projects
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <SmallSocialBtn />
          </div>
        </div>
      </div>

      {/* About & Timeline Section */}
      <div className="container mx-auto px-4 md:px-8 py-24">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          
          {/* Left Column: About & Skills */}
          <div className="flex flex-col space-y-12 lg:col-span-7">
            <section className="space-y-6">
              <h2 className="text-2xl font-medium tracking-tight text-foreground">Background</h2>
              <div className="prose prose-neutral dark:prose-invert text-muted-foreground">
                <p>
                  I am currently an engineering student at IMT Nord Europe, completing my studies through an apprenticeship. During my apprenticeship, I am architecting and developing an enterprise automated testing framework built with Java Spring Boot, Selenium, and an Angular frontend.
                </p>
                <p>
                  My expertise spans from systems programming in Rust to modern web frameworks like Next.js. I focus heavily on infrastructure as code (specifically NixOS), containerization, and building tools that improve developer experience and system reliability.
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-medium tracking-tight text-foreground">Technical Arsenal</h2>
              <div className="flex flex-wrap gap-2">
                {techno.map((tech, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-2 border border-border/40 bg-muted/30 px-3 py-1.5 font-mono text-xs font-normal text-foreground transition-colors hover:bg-muted/80"
                  >
                    <img src={tech.light_svg} className="h-4 w-4 dark:hidden" alt={tech.name} />
                    <img src={tech.svg} className="hidden h-4 w-4 dark:block" alt={tech.name} />
                    {tech.name}
                  </Badge>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Timeline */}
          <div className="lg:col-span-4 lg:col-start-9">
            <h2 className="mb-8 text-2xl font-medium tracking-tight text-foreground">Education</h2>
            <ol className="relative space-y-8 border-s border-border/40">
              {education
                .sort((a, b) => b.date - a.date)
                .map((edu, index) => (
                  <li key={index} className="ms-6">
                    <span className="absolute -start-1.5 mt-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-muted ring-4 ring-background"></span>
                    <time className="mb-2 block font-mono text-xs font-medium tracking-widest text-muted-foreground/80 uppercase">
                      {edu.period}
                    </time>
                    <h3 className="text-base font-medium text-foreground">
                      {edu.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {edu.school}
                    </p>
                  </li>
                ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-4 md:px-8 py-24" id="projects">
        <div className="mb-12 flex flex-col space-y-4">
          <h2 className="text-3xl font-medium tracking-tight text-foreground">
            Selected Work
          </h2>
          <p className="text-muted-foreground">A collection of systems I&#39;ve built and configured.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects
            .sort((a, b) => a.order - b.order)
            .map((project, index) => (
              <ProjectCard key={index} {...project} />
            ))}
        </div>
      </div>
    </section>
  )
}