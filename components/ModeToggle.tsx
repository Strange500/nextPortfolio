'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const fr = usePathname().startsWith('/fr')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          data-theme-toggle
          variant='outline'
          size='icon'
          className='relative rounded-full bg-background/50 text-muted-foreground'
          aria-label={fr ? 'Changer le thème' : 'Change theme'}
        >
          <Sun aria-hidden='true' className='h-4 w-4 dark:hidden' />
          <Moon aria-hidden='true' className='hidden h-4 w-4 dark:block' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        collisionPadding={12}
        className='theme-menu'
        aria-label={fr ? 'Apparence' : 'Appearance'}
      >
        <DropdownMenuRadioGroup
          value={theme || 'system'}
          onValueChange={setTheme}
        >
          <DropdownMenuRadioItem value='light' data-theme-choice='light'>
            <Sun aria-hidden='true' size={16} /> {fr ? 'Clair' : 'Light'}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='dark' data-theme-choice='dark'>
            <Moon aria-hidden='true' size={16} /> {fr ? 'Sombre' : 'Dark'}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='system' data-theme-choice='system'>
            <Monitor aria-hidden='true' size={16} />{' '}
            {fr ? 'Automatique' : 'Automatic'}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
