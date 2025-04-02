'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bell, Menu } from 'lucide-react';

// Custom Hamburger Menu Component
const HamburgerMenu = () => {
  return (
    <button className="text-white hover:text-gray-200 transition-colors p-2 relative w-6 h-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 flex flex-col gap-[6px]">
        <span className="w-6.5 h-[4px] bg-current filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"></span>
        <span className="w-5 h-[3px] bg-current filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"></span>
        <span className="w-6.5 h-[4px] bg-current filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"></span>
      </div>
    </button>
  );
};

const Navbar = () => {
  return (
    <nav className="fixed w-full top-0 z-50">
      <div className="w-full h-[40px] md:h-[70px] bg-gradient-to-r from-white to-blue-600 px-6 sm:px-8 md:px-12 lg:px-16 rounded-b-2xl">
        <div className="max-w-7xl mx-auto h-full flex items-center">
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
                className="whitespace-nowrap px-6 py-2 border-2 border-white rounded-lg text-white 
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
