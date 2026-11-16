'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from './ui/button'

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  const currentLang = pathname.startsWith('/fr') ? 'fr' : 'en'

  useEffect(() => {
    document.documentElement.lang = currentLang
  }, [currentLang])

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'fr' : 'en'

    let newPath = pathname
    if (pathname === '/') {
      newPath = `/${nextLang}`
    } else {
      newPath = pathname.replace(`/${currentLang}`, `/${nextLang}`)
    }
    router.push(newPath)
  }

  return (
    <Button
      data-language-switch
      aria-label={currentLang === 'en' ? 'Lire en français' : 'Read in English'}
      variant='ghost'
      size='icon'
      onClick={toggleLanguage}
      title={currentLang === 'en' ? 'Passer en Français' : 'Switch to English'}
    >
      <span className='font-mono font-bold uppercase'>
        {currentLang === 'en' ? 'FR' : 'EN'}
      </span>
    </Button>
  )
}
