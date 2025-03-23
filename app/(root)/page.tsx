import { SmallSocialBtn } from '@/components/smallSocialBtn'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProjectCard } from '@/components/ProjectCard'
import { projects, techno } from '@/app/(root)/var'

export default function Page() {

  return (
    <section className='h-full w-screen bg-[--white-transparent]'>
      <div className='container mx-auto h-full' id={'home'}>
        <div className={`pt-28 md:pt-60`}></div>
        <div className='flex justify-center md:justify-start'>
          <div className='mx-4 flex flex-col justify-center text-center md:mx-0 md:text-left'>
            <h1 className='text-2xl font-semibold text-neutral-900 md:text-4xl'>
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
            <p className='text-lg text-neutral-900'>
              I&#39;m a IT student from France
            </p>
          </div>
        </div>
        <SmallSocialBtn />
        <div className={`pt-12`}></div>
        <a
          href={`#presentation`}
          className={`hidden justify-center align-middle md:flex md:justify-start`}
        >
          <Button
            className={`relative rounded p-2 text-white shadow hover:bg-neutral-900`}
          >
            <h2>
              See my presentation
              <span
                className={`absolute right-[-2] top-[-2] animate-ping rounded-full bg-red-600 p-1 opacity-75`}
              ></span>
              <span className='absolute right-[-2] top-[-2] rounded-full bg-red-400 p-1'></span>
            </h2>
          </Button>
        </a>
      </div>

      <div className={`pt-16 md:pt-96`}></div>
      <div className='container mx-auto' id={'presentation'}>
        <div className={'align-center flex flex-col justify-center md:pt-32'}>
          <h1 className='text-2xl font-semibold md:text-4xl'>Presentation</h1>
          <section className={`pt-12`}></section>
          <Card className={`bg-white shadow-md`}>
            <CardContent className={'pt-3'}>
              <div
                className={
                  'align-center flex flex-col justify-center md:flex-row'
                }
              >
                <section className={'md:w-1/2 flex align-center justify-center'}>
                  <p className={'text-justify'}>
                    Currently a second-year student in a Bachelor's program in
                    Computer Science, I am passionate about software development
                    and system administration. I have acquired skills in Java,
                    Python, C, HTML, CSS, and JavaScript, as well as experience
                    with tools such as Docker, Git, IntelliJ IDEA, PostgreSQL,
                    and Visual Studio Code. I also have hands-on experience in
                    server configuration and database management.
                  </p>
                </section>
                <section className={`grid md:w-1/2 grid-cols-3 gap-4 md:pl-3 pt-3`}>
                  {techno.map((tech, index) => {
                    return (
                      <Badge
                        key={index}
                        className='rounded-lg bg-neutral-100 p-1 text-sm text-neutral-900'
                      >
                        <img
                          src={tech.svg}
                          className='h-8 w-8 pr-1'
                          alt={tech.name}
                        />
                        {tech.name}
                      </Badge>
                    )
                  })}
                </section>
              </div>
            </CardContent>
          </Card>
          <a
            href={`#projects`}
            className={`hidden justify-center align-middle md:flex md:justify-start pt-6`}
          >
            <Button
              className={`relative rounded p-2 text-white shadow hover:bg-neutral-900`}
            >
              <h2>
                See my projects
                <span
                  className={`absolute right-[-2] top-[-2] animate-ping rounded-full bg-red-600 p-1 opacity-75`}
                ></span>
                <span className='absolute right-[-2] top-[-2] rounded-full bg-red-400 p-1'></span>
              </h2>
            </Button>
          </a>
        </div>
      </div>

      <div className='container mx-auto' id={'project'}>
        <div className={`pt-16 md:pt-96`}></div>
        <h1 className='text-2xl font-semibold md:text-4xl' id={'projects'}>
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