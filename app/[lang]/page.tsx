import { SmallSocialBtn } from '@/components/smallSocialBtn'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProjectCard } from '@/components/ProjectCard'
import { education as eduData } from '@/data/education'
import { technologies as techno } from '@/data/technologies'
import { loadProjects, type Project } from '@/lib/loadProjects'
import { ArrowRight } from 'lucide-react'
import AsciiCube from '@/components/AsciiCube'
import { dictionaries } from '@/data/dictionaries'
import Link from 'next/link'

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }];
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params;
  const t = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  
  // Pass lang to loadProjects
  const projects: Project[] = await loadProjects(lang);
  const education = eduData[lang as keyof typeof eduData] || eduData.en;
  
  return (
    <section className="min-h-screen w-full selection:bg-primary/20">
      {/* Hero Section */}
      <div className="container mx-auto flex min-h-[75vh] items-center justify-between px-4 md:px-8 py-20 lg:py-0">
        <div className="flex flex-col items-start max-w-3xl space-y-6 z-10">
          <Badge variant="outline" className="font-mono text-xs font-normal text-muted-foreground border-border/50">
            {t.hero.badge}
          </Badge>
          
          <h1 className="font-sans text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl whitespace-pre-line">
            {t.hero.title_start}<span className="font-mono text-primary">{t.hero.title_highlight}</span>{t.hero.title_end}
          </h1>
          
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            {t.hero.description_1}<span className="font-mono text-foreground/80 text-sm">{t.hero.description_highlight}</span>{t.hero.description_2}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button asChild className="group rounded-full px-6">
              <a href="#projects">
                {t.hero.cta}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6 border-primary/20 hover:bg-primary/5">
              <a href="/CV_Benjamin_Roget_v2.pdf" target="_blank" rel="noopener noreferrer">
                {t.hero.resume}
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6 border-primary/20 hover:bg-primary/5">
              <Link href={`/${lang}/blog`}>
                {t.hero.blog}
              </Link>
            </Button>
            <SmallSocialBtn />
          </div>
        </div>
        <div className="hidden lg:flex flex-col justify-center items-center opacity-80 pl-8">
          <AsciiCube />
          <a 
            href="https://github.com/Strange500/ascii-cube-rs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 text-xs font-mono text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            {t.hero.powered_by}
          </a>
        </div>
      </div>

      {/* About & Timeline Section */}
      <div className="container mx-auto px-4 md:px-8 py-24">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          
          {/* Left Column: Experience & Skills */}
          <div className="flex flex-col space-y-12 lg:col-span-7">
            <section className="space-y-6">
              <h2 className="text-2xl font-medium tracking-tight text-foreground">{t.experience.title}</h2>
              <div className="space-y-8">
                {t.experience.jobs.map((job, index) => (
                  <div key={index} className="flex flex-col space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">{job.role}</h3>
                      <span className="font-mono text-xs text-muted-foreground">{job.date}</span>
                    </div>
                    <p className="font-medium text-primary text-sm">{job.company}</p>
                    <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground mt-2">
                      {job.bullets.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-medium tracking-tight text-foreground">{t.about.skills_title}</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.about.systems_iac}</h3>
                  <div className="flex flex-wrap gap-2">
                    {techno.filter(t => ['NixOS', 'Linux', 'Docker', 'Git'].includes(t.name)).map((tech, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-2 border border-border/40 bg-muted/30 px-3 py-1.5 font-mono text-xs font-normal text-foreground transition-all duration-300 hover:border-muted-foreground/50 hover:bg-muted/50 hover:text-foreground">
                        <img src={tech.light_svg} className="h-4 w-4 dark:hidden" alt={tech.name} />
                        <img src={tech.svg} className="hidden h-4 w-4 dark:block" alt={tech.name} />
                        {tech.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.about.backend_testing}</h3>
                  <div className="flex flex-wrap gap-2">
                    {techno.filter(t => ['Rust', 'Java EE', 'Spring Boot', 'Selenium', 'Postgres', 'Python'].includes(t.name)).map((tech, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-2 border border-border/40 bg-muted/30 px-3 py-1.5 font-mono text-xs font-normal text-foreground transition-all duration-300 hover:border-muted-foreground/50 hover:bg-muted/50 hover:text-foreground">
                        <img src={tech.light_svg} className="h-4 w-4 dark:hidden" alt={tech.name} />
                        <img src={tech.svg} className="hidden h-4 w-4 dark:block" alt={tech.name} />
                        {tech.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.about.web}</h3>
                  <div className="flex flex-wrap gap-2">
                    {techno.filter(t => !['NixOS', 'Linux', 'Docker', 'Git', 'Rust', 'Java EE', 'Spring Boot', 'Selenium', 'Postgres', 'Python'].includes(t.name)).map((tech, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-2 border border-border/40 bg-muted/30 px-3 py-1.5 font-mono text-xs font-normal text-foreground transition-all duration-300 hover:border-muted-foreground/50 hover:bg-muted/50 hover:text-foreground">
                        <img src={tech.light_svg} className="h-4 w-4 dark:hidden" alt={tech.name} />
                        <img src={tech.svg} className="hidden h-4 w-4 dark:block" alt={tech.name} />
                        {tech.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Timeline */}
          <div className="lg:col-span-4 lg:col-start-9">
            <h2 className="mb-8 text-2xl font-medium tracking-tight text-foreground">{t.education.title}</h2>
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
                    {edu.description && (
                      <p className="mt-1 text-sm text-muted-foreground italic">
                        {edu.description}
                      </p>
                    )}
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
            {t.projects.title}
          </h2>
          <p className="text-muted-foreground">{t.projects.description}</p>
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