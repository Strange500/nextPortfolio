import { SmallSocialBtn } from '@/components/smallSocialBtn'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProjectCard } from '@/components/ProjectCard'
import { education, projects, techno } from '@/app/(root)/var'
import { handleSmoothScroll } from '@/components/Header'
import { Separator } from '@/components/ui/separator'

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
        <div className='flex flex-col items-center justify-center md:pt-32'>
          <section className='pt-12' />
          <Card className='bg-foreground shadow-md'>
            <CardContent className='pt-3'>
              <div className='flex flex-col items-center justify-center md:flex-row'>
                <article className='flex items-center justify-center pr-2 md:w-1/2'>
                  <p className='text-justify text-secondary'>
                    Currently a second-year student in a Bachelor&#39;s program
                    in Computer Science, I am passionate about software
                    development and system administration. I have acquired
                    skills in Java, Python, C, and JavaScript/TypeScript, as
                    well as experience with tools such as Docker, Podman, git, I
                    use also frameworks like Next.js, and TailwindCSS. I also
                    have hands-on experience in server configuration and
                    database management.
                  </p>
                </article>
                <section className='grid grid-cols-3 gap-4 border-l-2 border-secondary pt-3 md:w-1/2 md:pl-2'>
                  {techno.map((tech, index) => (
                    <Badge
                      key={index}
                      className='rounded-lg bg-foreground hover:bg-primary p-1 text-sm text-secondary'
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
        </div>
        <div className='pt-12'></div>
        <Card className='bg-foreground shadow-md'>
          <CardContent>
            <div className='flex flex-col items-center justify-center'>
              <h4 className='text-xl font-semibold text-secondary md:text-xl'>
                Education
              </h4>
              <section className='pt-4'></section>
              <ul className='flex flex-col  justify-center '>
                {education.sort((a, b) => b.date - a.date).
                  map((edu, index) => (
                  <li key={index}>
                    <Card className='bg-foreground shadow-md'>
                      <CardContent className={"text-secondary"}>
                        <h2 className='text-xl font-semibold '>
                          {edu.title}
                        </h2>
                        <p>{edu.date}</p>
                        <p>{edu.description}</p>

                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        <a
          href='#projects'
          onClick={handleSmoothScroll}
          className='hidden justify-start pt-6 md:flex'
        >
          <Button className='relative rounded p-2 bg-secondary text-primary shadow hover:bg-accent'>
            <h2>
              See my projects
              <span className='absolute right-[-2] top-[-2] animate-ping rounded-full bg-red-600 p-1 opacity-75'></span>
              <span className='absolute right-[-2] top-[-2] rounded-full bg-red-400 p-1'></span>
            </h2>
          </Button>
        </a>
      </div>

      <div className='container mx-auto' id={'project'}>
        <div className={`pt-16 md:pt-96`}></div>
        <h1 className='text-2xl text-secondary font-semibold md:text-4xl' id={'projects'}>
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