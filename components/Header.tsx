"use client";
import React, { useEffect, useState } from 'react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('Home');

  const handleLinkClick = (link:string) => {
    setActiveLink(link);
    setIsOpen(false); // Close the menu on link click
  };

  const handleSmoothScroll = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const targetId = event.currentTarget.getAttribute('href') as string
    const targetElement = document.querySelector(targetId)
    if (!targetElement) return
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // get all a link and apply the same scroll effect
    const localALinks = document.querySelectorAll('a');
    const array = [...localALinks];
    array.filter(a => {
      const href = a.getAttribute('href');
      if (!href) {
        return false;
      }

      return href.startsWith(window.location.origin);
    })
    console.log(array)
    array.forEach((a)=> {
      a.addEventListener("click", (event)=> {
        handleLinkClick((event.currentTarget)?.getAttribute('href') as string);
        handleSmoothScroll(event);
      });
    })
  }, [])

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
        <li
          className={`group ${activeLink === 'Home' ? 'font-bold' : ''} flex w-16 justify-center align-middle`}
        >
          <a
            // scroll to div with id home
            onClick={(event) => {
              handleLinkClick('Home');
              handleSmoothScroll(event);
            }}
            href='#home'
            className={`block text-white transition duration-300 hover:text-gray-300`}
          >
            Home
          </a>
        </li>
        <li
          className={`group ${activeLink === 'Technologies' ? 'font-bold' : ''} flex w-16 justify-center align-middle`}
        >
          <a
            onClick={(event) => {
              handleLinkClick('Technologies');
              handleSmoothScroll(event);
            }}
            href={'#technologies'}
            className={`block text-white transition duration-300 hover:text-gray-300 ${activeLink === 'Technologies' ? 'font-bold' : ''}`}
          >
            Techno
          </a>
        </li>
        <li
          className={`group ${activeLink === 'Projects' ? 'font-bold' : ''} flex w-16 justify-center align-middle`}
        >
          <a
            onClick={(event) => {
              handleLinkClick('Projects');
              handleSmoothScroll(event);
            }}
            href={'#projects'}
            className={`block text-white transition duration-300 hover:text-gray-300 ${activeLink === 'Projects' ? 'font-bold' : ''}`}
          >
            Projects
          </a>
        </li>
        <li
          className={`group ${activeLink === 'Contact' ? 'font-bold' : ''} flex w-16 justify-center align-middle`}
        >
          <a
            onClick={(event) => {
              handleLinkClick('Contact');
              handleSmoothScroll(event);
            }}
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