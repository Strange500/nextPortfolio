'use client'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Info } from 'lucide-react'

export const handleSmoothScroll = (
  event: React.MouseEvent<HTMLAnchorElement>
) => {
  event.preventDefault()
  const targetId = event.currentTarget.getAttribute('href')
  if (!targetId) return
  const targetElement = document.querySelector(targetId)
  if (!targetElement) return

  targetElement.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

export const ReadMeDialog = ({ content, title }: { content: React.ReactNode, title: string }) => {
  return (
    <Dialog>
      <DialogTrigger>
        <div className='group'>
          <Info className='w-6 h-6 text-foreground/80 group-hover:text-primary transition-colors' />
        </div>
      </DialogTrigger>
      <DialogContent className={`max-h-[80vh] w-full md:max-w-[1500px] max-w-[468px] overflow-x-hidden overflow-y-auto p-2`}>
        <DialogTitle className={`hidden`}>{title}</DialogTitle>
        <section className={`markdown-body p-[15px] md:max-w-[1500px] max-w-[400px] md:p-[45px] prose prose-invert max-w-none`}>
          {content}
        </section>
      </DialogContent>
    </Dialog>
  )
}