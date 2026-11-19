'use client'

import { FileText, ChevronDown, ExternalLink, Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface ResumeDropdownProps {
  lang: 'en' | 'fr'
  label: string
  download?: boolean
}

export function ResumeDropdown({
  lang,
  label,
  download = false
}: ResumeDropdownProps) {
  const options = [
    {
      lang: 'en',
      href: '/resume.pdf',
      title: 'English',
      detail: 'Résumé · PDF'
    },
    {
      lang: 'fr',
      href: '/resume-fr.pdf',
      title: 'Français',
      detail: 'CV · PDF'
    }
  ].sort((a, b) => Number(b.lang === lang) - Number(a.lang === lang))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          className='resume-trigger'
          data-resume-download={download || undefined}
        >
          <FileText size={16} aria-hidden='true' />
          {label}
          <ChevronDown size={14} aria-hidden='true' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='resume-menu'
        align='start'
        sideOffset={8}
        collisionPadding={12}
      >
        <p className='resume-menu-label'>
          {lang === 'fr' ? 'Choisir une langue' : 'Choose a language'}
        </p>
        {options.map(option => (
          <DropdownMenuItem key={option.lang} asChild>
            <a
              className='resume-option'
              href={option.href}
              download={
                download ? `Benjamin-Roget-CV-${option.lang}.pdf` : undefined
              }
              target={download ? undefined : '_blank'}
              rel={download ? undefined : 'noopener noreferrer'}
              lang={option.lang}
            >
              <span>
                <strong>{option.title}</strong>
                <small>{option.detail}</small>
              </span>
              {download ? (
                <Download size={16} aria-hidden='true' />
              ) : (
                <ExternalLink
                  size={16}
                  aria-label={lang === 'fr' ? 'Nouvel onglet' : 'New tab'}
                />
              )}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
