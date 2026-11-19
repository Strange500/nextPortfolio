'use client'
import { usePathname } from 'next/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ModeToggle } from './ModeToggle'

export default function GlobalControls() {
  const path = usePathname()
  // The blog puts these controls in its semantic header, after its skip link.
  if (/^\/(en|fr)\/blog(?:\/|$)/.test(path)) return null
  return (
    <div className='global-controls absolute right-4 top-6 z-50 flex items-center gap-2'>
      <LanguageSwitcher />
      <ModeToggle />
    </div>
  )
}
