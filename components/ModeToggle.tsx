'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className={
            'group ml-2 bg-primary hover:border-primary hover:bg-secondary'
          }
        >
          <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 text-secondary transition-all group-hover:text-primary' />
          <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 text-secondary transition-all group-hover:text-primary' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className={'bg-primary'}>
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={'text-secondary'}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
