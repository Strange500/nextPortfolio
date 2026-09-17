'use client'

import { Linkedin, Github, FileText, ExternalLink } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SmallSocialBtnProps {
  lang?: string
}

export const SmallSocialBtn = ({ lang = 'en' }: SmallSocialBtnProps) => {
  const isFr = lang === 'fr'

  return (
    <div className='flex items-center justify-center space-x-2 pt-2 md:items-start'>
      <a
        href='https://www.linkedin.com/in/roget-benjamin'
        target='_blank'
        rel='noopener noreferrer'
        aria-label='LinkedIn'
        className='rounded bg-accent p-2 text-foreground shadow hover:bg-muted hover:text-foreground transition-colors'
      >
        <Linkedin size={16} />
      </a>

      <a
        href='https://github.com/Strange500'
        target='_blank'
        rel='noopener noreferrer'
        aria-label='GitHub'
        className='rounded bg-accent p-2 text-foreground shadow hover:bg-muted hover:text-foreground transition-colors'
      >
        <Github size={16} />
      </a>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            title={isFr ? 'CV / Resume (EN & FR)' : 'Resume / CV (EN & FR)'}
            aria-label={isFr ? 'Télécharger mon CV' : 'Download Resume'}
            className='rounded bg-accent p-2 text-foreground shadow hover:bg-muted hover:text-foreground cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-primary'
          >
            <FileText size={16} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align='end'
          className='w-56 p-1.5 bg-background/95 backdrop-blur-md border border-border/60 shadow-xl rounded-xl'
        >
          <DropdownMenuItem asChild className='p-0 focus:bg-accent/80 rounded-lg'>
            <a
              href={isFr ? '/resume-fr.pdf' : '/resume.pdf'}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-between gap-2 p-2 cursor-pointer w-full text-foreground hover:text-primary transition-colors'
            >
              <div className='flex items-center gap-2.5'>
                <span className='text-base'>{isFr ? '🇫🇷' : '🇺🇸'}</span>
                <div className='flex flex-col text-left'>
                  <span className='text-xs font-semibold'>
                    {isFr ? 'Version française (A4)' : 'English version (ATS)'}
                  </span>
                  <span className='text-[10px] text-muted-foreground font-mono'>
                    {isFr ? 'Format A4 standard' : 'Letter · ATS-friendly'}
                  </span>
                </div>
              </div>
              <ExternalLink size={12} className='text-muted-foreground/70 shrink-0' />
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className='p-0 focus:bg-accent/80 rounded-lg'>
            <a
              href={isFr ? '/resume.pdf' : '/resume-fr.pdf'}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-between gap-2 p-2 cursor-pointer w-full text-foreground hover:text-primary transition-colors'
            >
              <div className='flex items-center gap-2.5'>
                <span className='text-base'>{isFr ? '🇺🇸' : '🇫🇷'}</span>
                <div className='flex flex-col text-left'>
                  <span className='text-xs font-semibold'>
                    {isFr ? 'Version anglaise (US / ATS)' : 'French version (A4)'}
                  </span>
                  <span className='text-[10px] text-muted-foreground font-mono'>
                    {isFr ? 'Letter · ATS-friendly' : 'Format A4 standard'}
                  </span>
                </div>
              </div>
              <ExternalLink size={12} className='text-muted-foreground/70 shrink-0' />
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}