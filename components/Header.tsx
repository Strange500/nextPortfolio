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
    <nav className="flex justify-between items-center p-4 px-8 bg-[--black-transparent] shadow-md sticky top-0 w-full z-10">
      <div className="text-white text-lg font-semibold">Portfolio</div>

      <div className="md:hidden cursor-pointer" onClick={toggleMenu}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </div>

      <ul className={`flex-col md:flex md:flex-row md:space-x-6 absolute md:static bg-[--black-transparent] md:bg-transparent transition-all duration-300 ${isOpen ? "top-16" : "top-[-200px]"} md:top-0`}>
        <li>
          <a
            href="#"
            onClick={() => handleLinkClick('Home')}
            className={`block text-white transition duration-300 hover:text-gray-300 ${activeLink === 'Home' ? 'font-bold' : ''}`}
          >
            Home
          </a>
        </li>
        <li>
          <a
            href="#techContainer"
            onClick={() => handleLinkClick('Technologies')}
            className={`block text-white transition duration-300 hover:text-gray-300 ${activeLink === 'Technologies' ? 'font-bold' : ''}`}
          >
            Technologies
          </a>
        </li>
        <li>
          <a
            href="#projects"
            onClick={() => handleLinkClick('Projects')}
            className={`block text-white transition duration-300 hover:text-gray-300 ${activeLink === 'Projects' ? 'font-bold' : ''}`}
          >
            Projects
          </a>
        </li>
        <li>
          <a
            href="#contact"
            onClick={() => handleLinkClick('Contact')}
            className={`block text-white transition duration-300 hover:text-gray-300 ${activeLink === 'Contact' ? 'font-bold' : ''}`}
          >
            Contact
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;