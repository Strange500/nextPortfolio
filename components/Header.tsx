"use client";
import React, { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('Home');

  const handleLinkClick = (link:string) => {
    setActiveLink(link);
    setIsOpen(false); // Close the menu on link click
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className='sticky top-0 z-10 flex w-full items-center justify-between bg-neutral-900 p-4 px-8 shadow-md'>
      <div className='text-lg font-semibold text-white'>Portfolio</div>

      <div className='cursor-pointer md:hidden' onClick={toggleMenu}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6 text-white'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M4 6h16M4 12h16m-7 6h7'
          />
        </svg>
      </div>

      <ul
        className={`absolute flex-col bg-[--black-transparent] transition-all duration-300 md:static md:flex md:flex-row md:space-x-6 md:bg-transparent ${isOpen ? 'top-16' : 'top-[-200px]'} md:top-0`}
      >
        <li
          className={`group ${activeLink === 'Home' ? 'font-bold' : ''} w-16 flex align-middle justify-center`}
        >
          <a
            href='#'
            onClick={() => handleLinkClick('Home')}
            className={`block text-white transition duration-300 hover:text-gray-300`}
          >
            Home
          </a>
        </li>
        <li
          className={`group ${activeLink === 'Technologies' ? 'font-bold' : ''} w-16  flex align-middle justify-center`}
        >
          <a
            href='#techContainer'
            onClick={() => handleLinkClick('Technologies')}
            className={`block text-white transition duration-300 hover:text-gray-300 ${activeLink === 'Technologies' ? 'font-bold' : ''}`}
          >
            Techno
          </a>
        </li>
        <li
          className={`group ${activeLink === 'Projects' ? 'font-bold' : ''} w-16  flex align-middle justify-center`}
        >
          <a
            href='#projects'
            onClick={() => handleLinkClick('Projects')}
            className={`block text-white transition duration-300 hover:text-gray-300 ${activeLink === 'Projects' ? 'font-bold' : ''}`}
          >
            Projects
          </a>
        </li>
        <li className={`group  ${activeLink === 'Contact' ? 'font-bold' : ''} w-16  flex align-middle justify-center`}>
          <a
            href='#contact'
            onClick={() => handleLinkClick('Contact')}
            className={`block text-white transition duration-300 hover:text-gray-300 ${activeLink === 'Contact' ? 'font-bold' : ''}`}
          >
            Contact
          </a>
        </li>
      </ul>
    </nav>
  )
};

export default Navbar;