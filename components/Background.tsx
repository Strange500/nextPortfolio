'use client'
import { usePathname } from 'next/navigation'
import CubeConstellation from './blog/CubeConstellation'

export default function Background() {
  const pathname = usePathname(),
    segments = pathname.split('/').filter(Boolean)
  if (segments[1] !== 'blog') return null
  return <CubeConstellation reading={segments.length > 2} />
}
