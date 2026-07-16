'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if the user's browser language is French (e.g., 'fr', 'fr-FR', 'fr-CA')
    const isFrench = navigator.languages
      ? navigator.languages.some(lang => lang.startsWith('fr'))
      : navigator.language.startsWith('fr')

    if (isFrench) {
      router.replace('/fr')
    } else {
      router.replace('/en')
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {/* Optional loading state while detecting language */}
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  )
}
