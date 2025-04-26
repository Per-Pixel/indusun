'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

// Custom Hamburger Menu Component
const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuVariants = {
    closed: {
      opacity: 0,
      y: "-100%",
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    open: {
      opacity: 1,
      y: "0%",
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="text-white hover:text-gray-200 transition-colors p-2 relative w-6 h-6 z-50"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 flex flex-col gap-[6px]">
          <span className={`w-6.5 h-[4px] bg-current filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] transition-transform ${isOpen ? 'rotate-45 translate-y-[13px]' : ''}`}></span>
          <span className={`w-5 h-[3px] bg-current filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] transition-opacity ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-6.5 h-[4px] bg-current filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] transition-transform ${isOpen ? '-rotate-45 -translate-y-[13px]' : ''}`}></span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed top-0 left-0 w-full h-screen bg-blue-600 z-40"
          >
            <div className="flex flex-col items-center justify-center h-full text-white text-2xl gap-8">
              <Link href="/" className="hover:scale-110 transition-transform">
                Home
              </Link>
              <Link href="/properties" className="hover:scale-110 transition-transform">
                Properties
              </Link>
              <Link href="/about" className="hover:scale-110 transition-transform">
                About
              </Link>
              <Link href="/contact" className="hover:scale-110 transition-transform">
                Contact
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Navbar = () => {
  const pathname = usePathname();
  const isPropertiesPage = pathname.includes('/properties');

  return (
    <nav className="fixed w-full top-0 z-50">
      <div 
        className={`w-full h-[40px] md:h-[70px] px-6 sm:px-8 md:px-12 lg:px-16 rounded-b-2xl relative`}
      >
        {/* Background with opacity */}
        <div className={`absolute inset-0 bg-gradient-to-r from-white to-blue-600 rounded-b-2xl ${
          isPropertiesPage ? 'opacity-10' : 'opacity-100'
        }`}></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto h-full flex items-center">
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
            <HamburgerMenu />

            <Link href="/" className="flex items-center gap-2">
              <img
                src="/navbar/logo.svg"
                alt="Indusun Logo"
                className="h-[2rem] sm:h-[2.5rem] md:h-[3rem] lg:h-[3.5rem] w-auto filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"
              />
              <span className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                Indusun
              </span>
            </Link>
          </div>

          <div className="ml-auto flex items-center">
            {/* Buttons container */}
            <div className="flex items-center gap-4 sm:gap-6 md:gap-8 scale-[0.8] sm:scale-90 md:scale-95 lg:scale-100 origin-left">
              {/* For Broker Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="whitespace-nowrap px-6 py-2
                border-2 border-white rounded-lg text-white
                          hover:bg-white hover:text-blue-600 transition-colors duration-300"
              >
                For Broker
              </motion.button>

              {/* Pay Bill Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="whitespace-nowrap px-8 py-2 rounded-lg text-white
                          bg-[#D9D9D9]/50 hover:bg-[#c4c4c4]/50
                          transition-colors duration-300"
              >
                Pay Bill
              </motion.button>
            </div>

            {/* Right side navigation items */}
            <div className="hidden md:flex items-center gap-4 ml-8">
              <Link href="/sign-up" className="text-sm md:text-base lg:text-lg text-white hover:text-gray-200 transition-colors">
                Sign up
              </Link>
              <div className="h-4 w-px bg-white/50"></div>
              <Link href="/login" className="text-sm md:text-base lg:text-lg text-white hover:text-gray-200 transition-colors">
                Login
              </Link>
              <div className="h-4 w-px bg-white/50"></div>
              <button className="text-white hover:text-gray-200 transition-colors">
                <Bell size={16} className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
