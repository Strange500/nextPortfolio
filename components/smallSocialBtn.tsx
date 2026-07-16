import { Linkedin, Github, FileText } from 'lucide-react'

export const SmallSocialBtn = () => {
  return (
    <div className='flex items-center justify-center space-x-2 pt-2 md:items-start '>
      <a
        href='https://www.linkedin.com/in/roget-benjamin'
        className='rounded bg-accent p-2 text-foreground shadow hover:bg-muted hover:text-foreground'
      >
        <Linkedin size={16} />
      </a>

      <a
        href='https://github.com/Strange500'
        className='rounded bg-accent p-2 text-foreground shadow hover:bg-muted hover:text-foreground'
      >
        <Github size={16} />
      </a>

      <a
        href='/CV_Benjamin_Roget_v2.pdf'
        className='rounded bg-accent p-2 text-foreground shadow hover:bg-muted hover:text-foreground'
      >
        <FileText size={16} />
      </a>
    </div>
  )
}