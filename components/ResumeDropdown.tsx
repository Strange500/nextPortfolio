'use client'

import * as React from 'react'
import { FileText, ChevronDown, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ResumeDropdownProps {
  lang: 'en' | 'fr'
  label: string
  resumeEnLabel?: string
  resumeEnDesc?: string
  resumeFrLabel?: string
  resumeFrDesc?: string
}

export function ResumeDropdown({
  lang,
  label,
  resumeEnLabel = 'English Version US',
  resumeEnDesc = 'Letter · ATS-friendly',
  resumeFrLabel = 'Version française (A4)',
  resumeFrDesc = 'A4 · Standard français',
}: ResumeDropdownProps) {
  const isFr = lang === 'fr'

  const enOption = {
    key: 'en',
    href: '/resume.pdf',
    flag: '🇺🇸',
    title: resumeEnLabel,
    desc: resumeEnDesc,
    badge: isFr ? 'US Letter' : 'Recommended',
  }

  const frOption = {
    key: 'fr',
    href: '/resume-fr.pdf',
    flag: '🇫🇷',
    title: resumeFrLabel,
    desc: resumeFrDesc,
    badge: isFr ? 'Recommandé' : 'A4 Format',
  }

  // Show user's language choice first
  const options = isFr ? [frOption, enOption] : [enOption, frOption]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="group rounded-full px-6 border-primary/20 hover:bg-primary/5 transition-all"
        >
          <FileText className="mr-2 h-4 w-4 text-primary group-hover:scale-105 transition-transform" />
          <span>{label}</span>
          <ChevronDown className="ml-2 h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-72 p-2 bg-background/95 backdrop-blur-md border border-border/60 shadow-xl rounded-xl"
      >
        <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground/80">
          {isFr ? 'Sélectionner une version' : 'Select resume version'}
        </div>

        {options.map((opt) => (
          <DropdownMenuItem key={opt.key} asChild className="p-0 focus:bg-accent/80 rounded-lg">
            <a
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 p-2.5 cursor-pointer w-full text-foreground hover:text-primary transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl leading-none select-none">{opt.flag}</span>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{opt.title}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {opt.desc}
                  </span>
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
