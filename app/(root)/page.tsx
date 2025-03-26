import { SmallSocialBtn } from '@/components/smallSocialBtn'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProjectCard } from '@/components/ProjectCard'
import { education, projects, techno } from '@/app/(root)/var'
import { handleSmoothScroll } from '@/components/Header'

export default function Page() {
  return (
    <section className='h-full w-screen bg-background'>
      <div className='container mx-auto h-full' id={'overview'}>
        <div className={`pt-28 md:pt-60`}></div>
        <div className='flex justify-center md:justify-start'>
          <div className='mx-4 flex flex-col justify-center text-center md:mx-0 md:text-left'>
            <h1 className='text-2xl font-semibold text-secondary md:text-4xl'>
              Hi, I&#39;m{' '}
              <span className='relative animate-[--color-shift]'>
                Benjamin Roget
                <span
                  className={`prenomnom absolute left-0 top-0 flex h-full w-full animate-[--ping-text] items-center justify-center text-center opacity-75`}
                >
                  Benjamin Roget
                </span>
              </span>
            </h1>
            <p className='text-lg text-secondary'>
              I&#39;m a IT student from France
            </p>
          </div>
        </div>
        <SmallSocialBtn />
      </div>

      <div className='container mx-auto'>
        <div className='flex flex-col items-center pt-8 md:pt-32'>
          <div className={'flex flex-col md:w-5/6 md:flex-row'}>
            <section className={'flex flex-col items-center md:w-3/4'}>
              <Card className='bg-foreground shadow-md md:mr-4'>
                <CardContent className='flex flex-col items-center justify-center pt-3 md:flex-row'>
                  <article className='flex flex-col items-start justify-center pr-2'>
                    <section className='flex flex-col items-start p-2'>
                      <div className='mb-4 flex flex-row items-center'>
                        <h2 className='ml-4 text-xl font-semibold text-secondary'>
                          About Me
                        </h2>
                      </div>
                    </section>

                    <p className='text-justify text-secondary'>
                      Currently a second-year student in a Bachelor&#39;s
                      program in Computer Science, I am passionate about
                      software development and system administration. <br />I
                      have acquired skills in Java, Python, C, and
                      JavaScript/TypeScript, as well as experience with tools
                      such as Docker, Podman, git, I use also frameworks like
                      Next.js, and TailwindCSS. I also have hands-on experience
                      in server configuration and database management.
                    </p>
                    <a
                      href='#projects'
                      onClick={handleSmoothScroll}
                      className='hidden justify-start pt-6 md:flex'
                    >
                      <Button className='relative rounded bg-accent p-2 text-foreground shadow hover:bg-muted hover:text-foreground'>
                        <h2>
                          See my projects
                          <span className='absolute right-[-2] top-[-2] animate-ping rounded-full bg-red-600 p-1 opacity-75'></span>
                          <span className='absolute right-[-2] top-[-2] rounded-full bg-red-400 p-1'></span>
                        </h2>
                      </Button>
                    </a>
                  </article>
                </CardContent>
              </Card>

              <Card className='mt-4 h-1/2 bg-foreground shadow-md md:mr-4'>
                <CardContent>
                  <div className='flex flex-col items-center justify-center'>
                    <section className='pt-4'></section>
                    <section
                      className={'flex flex-row flex-wrap justify-start'}
                    >
                      {techno.map((tech, index) => (
                        <Badge
                          key={index}
                          className='m-1 rounded-lg bg-secondary-foreground p-1 text-sm text-muted-foreground hover:bg-accent'
                        >
                          <img
                            src={tech.svg}
                            className='h-8 w-8 pr-1'
                            alt={tech.name}
                          />
                          {tech.name}
                        </Badge>
                      ))}
                    </section>
                  </div>
                </CardContent>
              </Card>
            </section>

            <Card className='mt-4 bg-foreground shadow-md md:mt-0'>
              <CardContent className='pt-3'>
                <div className='flex flex-col items-center justify-center md:flex-row'>
                  <section className='border-muted pt-3 md:pl-2'>
                    <div className={'flex flex-col'}>
                      <ol className={'relative border-s border-muted'}>
                        {education
                          .sort((a, b) => b.date - a.date)
                          .map((edu, index) => (
                            <li className='mb-10 ms-4' key={index}>
                              <div className='absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-secondary bg-accent'></div>
                              <time className='mb-1 text-sm font-normal leading-none text-muted-foreground'>
                                {edu.period}
                              </time>
                              <h3 className='text-lg font-semibold text-secondary'>
                                {edu.title}
                              </h3>
                              <p className='mb-4 text-base font-normal text-muted'>
                                {edu.school}
                              </p>
                              <p className='mb-4 text-base font-normal text-muted-foreground'>
                                {edu.description}
                              </p>
                            </li>
                          ))}
                      </ol>
                    </div>
                  </section>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className='mx-aut" container pb-12' id={'project'}>
        <div className={`pt-16 md:pt-96`}></div>
        <h1
          className='text-2xl font-semibold text-secondary md:text-4xl'
          id={'projects'}
        >
          Projects I worked on
        </h1>
        <section className={`pt-12`}></section>
        <ul
          className={`grid h-[80%] grid-cols-1 gap-4 overflow-y-scroll md:h-auto md:grid-cols-2 md:overflow-auto lg:grid-cols-3`}
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