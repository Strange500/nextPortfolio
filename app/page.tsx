'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // English-first: this portfolio targets US recruiters, so default to /en.
    router.replace('/en')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {/* Optional loading state while redirecting */}
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  )
}