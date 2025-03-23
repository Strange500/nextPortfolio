"use client";
import React, { useState, useEffect } from 'react';

export const handleSmoothScroll = (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  const targetId = event.currentTarget.getAttribute('href');
  if (!targetId) return;
  const targetElement = document.querySelector(targetId);
  if (!targetElement) return;

  targetElement.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('overview');

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const sections = ['overview', 'projects', 'contact'];
  const handleScroll = () => {
    const scrollPosition = window.scrollY;

    sections.forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (section) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop - 50 && scrollPosition < sectionTop + sectionHeight) {
          setActiveLink(sectionId);
        }
      }
    });
  };

  useEffect(() => {
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className='sticky z-10 top-0 flex w-full items-center justify-between bg-neutral-900 p-4 px-8 shadow-md'>
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
        {sections.map((link, index) => (
          <li key={index} className={`group ${activeLink === link ? 'font-bold' : ''} flex w-16 justify-center align-middle`}>
            <a
              onClick={handleSmoothScroll}
              href={`#${link.toLowerCase()}`}
              className={`block text-white transition duration-300 hover:text-gray-300`}
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;