import React from 'react';
import { SmallSocialBtn } from '@/components/smallSocialBtn'

const Footer = () => {
  return (
    <footer className="bg-black text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">Contact me</h3>
            <p className="mt-2">
              <a href="mailto:benjamin.rogetpro@gmail.com">
                <span className="text-blue-500">
                  Benjamin Roget
                </span>
              </a>

            </p>

          </div>
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">Find me on</h3>
            <div className="flex space-x-3 mt-2">
              <SmallSocialBtn />
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Benjamin Roget. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;