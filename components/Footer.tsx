import React from 'react'
import { SmallSocialBtn } from '@/components/smallSocialBtn'

const Footer = () => {
  return (
    <footer className='bg-foreground py-6 text-secondary'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-col items-center justify-between md:flex-row'>
          <div className='mb-4 md:mb-0'>
            <h3 className='text-lg font-semibold'>Contact me</h3>
            <p className='mt-2'>
              <a href='mailto:benjamin.rogetpro@gmail.com'>
                <span className='text-blue-500'>Benjamin Roget</span>
              </a>
            </p>
          </div>
          <div className='mb-4 md:mb-0'>
            <h3 className='text-lg font-semibold'>Find me on</h3>
            <div className='mt-2 flex space-x-3'>
              <SmallSocialBtn />
            </div>
          </div>
        </div>
        <div className='mt-4 text-center text-sm'>
          <p>
            &copy; {new Date().getFullYear()} Benjamin Roget. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer