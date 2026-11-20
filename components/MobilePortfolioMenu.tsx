'use client'
import { useRef } from 'react'
import { Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from './ui/dropdown-menu'
export default function MobilePortfolioMenu({ lang }: { lang: 'fr' | 'en' }) {
  const navigating = useRef(false)
  const fr = lang === 'fr'
  const sections = [
    ['testing', fr ? 'Expérience Numih' : 'Work at Numih'],
    ['rust', 'Rust / WASM'],
    ['nix', 'NixOS'],
    ['bitcoin', 'Bitcoin'],
    ['missions', fr ? 'Missions' : 'The work'],
    ['contact', 'Contact']
  ]
  return (
    <div className='mobile-portfolio-menu'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            aria-label={fr ? 'Explorer le portfolio' : 'Explore the portfolio'}
            data-mobile-menu
          >
            <Menu size={18} aria-hidden='true' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='mobile-portfolio-links'
          align='end'
          collisionPadding={16}
          onCloseAutoFocus={event => {
            if (navigating.current) event.preventDefault()
            navigating.current = false
          }}
        >
          {sections.map(([id, label]) => (
            <DropdownMenuItem
              key={id}
              asChild
              onSelect={() => {
                navigating.current = true
              }}
            >
              <a href={`#${id}`}>{label}</a>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem asChild>
            <a href={`/${lang}/blog`}>{fr ? 'Le carnet' : 'Field notes'} ↗</a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
