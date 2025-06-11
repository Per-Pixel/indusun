'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Custom Hamburger Menu Component
const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle navigation and menu closing
  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

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
        className="text-white hover:text-gray-200 transition-colors p-2 relative w-6 h-6 z-50 cursor-pointer"
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
            className="fixed top-0 left-0 w-full h-screen bg-gradient-to-br from-blue-600 to-purple-700 z-40"
          >
            {isMobile ? (
              // Mobile Layout
              <div className="container mx-auto px-6 py-16 h-full flex flex-col justify-between">
                <div className="flex flex-col items-start gap-8 mt-16">
                  <button onClick={() => handleNavigation('/')} className="text-white text-4xl font-bold hover:translate-x-2 transition-transform">
                    Home
                  </button>
                  <button onClick={() => handleNavigation('/about')} className="text-white text-4xl font-bold hover:translate-x-2 transition-transform">
                    About Us
                  </button>
                  <button onClick={() => handleNavigation('/properties')} className="text-white text-4xl font-bold hover:translate-x-2 transition-transform">
                    Properties
                  </button>
                  <button onClick={() => handleNavigation('/contact')} className="text-white text-4xl font-bold hover:translate-x-2 transition-transform">
                    Contact
                  </button>
                  <button onClick={() => handleNavigation('/faq')} className="text-white text-4xl font-bold hover:translate-x-2 transition-transform">
                    FAQ
                  </button>
                </div>

                <div className="mt-auto">
                  <p className="text-white/80 mb-4">We are available here</p>
                  <div className="flex gap-6">
                    <a href="#" className="text-white hover:text-white/80">
                      <Instagram size={28} />
                    </a>
                    <a href="#" className="text-white hover:text-white/80">
                      <Twitter size={28} />
                    </a>
                    <a href="#" className="text-white hover:text-white/80">
                      <Facebook size={28} />
                    </a>
                    <a href="#" className="text-white hover:text-white/80">
                      <Linkedin size={28} />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              // Desktop Layout
              <div className="container mx-auto px-8 py-16 h-full flex">
                {/* Left side - Contact Info */}
                <div className="w-1/3 text-white/80 flex flex-col justify-end">
                  <p className="mb-4">Reach out to us at:</p>
                  <a href="mailto:contact@indusun.com" className="underline">contact@indusun.com</a>
                  
                  <div className="mt-8">
                    <p className="mb-4">We are available here</p>
                    <div className="flex gap-4">
                      <a href="#" className="text-white hover:text-white/80">
                        <Instagram size={24} />
                      </a>
                      <a href="#" className="text-white hover:text-white/80">
                        <Twitter size={24} />
                      </a>
                      <a href="#" className="text-white hover:text-white/80">
                        <Facebook size={24} />
                      </a>
                      <a href="#" className="text-white hover:text-white/80">
                        <Linkedin size={24} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right side - Navigation */}
                <div className="w-2/3 flex flex-col justify-center items-start pl-20">
                  <button onClick={() => handleNavigation('/')} className="text-white text-5xl font-bold mb-6 hover:translate-x-2 transition-transform">
                    Home
                  </button>
                  <button onClick={() => handleNavigation('/about')} className="text-white text-5xl font-bold mb-6 hover:translate-x-2 transition-transform">
                    About Us
                  </button>
                  <button onClick={() => handleNavigation('/properties')} className="text-white text-5xl font-bold mb-6 hover:translate-x-2 transition-transform">
                    Properties
                  </button>
                  <button onClick={() => handleNavigation('/contact')} className="text-white text-5xl font-bold mb-6 hover:translate-x-2 transition-transform">
                    Contact
                  </button>
                  <button onClick={() => handleNavigation('/faq')} className="text-white text-5xl font-bold mb-6 hover:translate-x-2 transition-transform">
                    FAQ
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate opacity based on scroll position for all pages
  const navbarOpacity = Math.min(scrollY / 150, 1); // Gradually increase from 0 to 1 over 150px scroll

  const handleBrokerClick = () => {
    router.push('/broker/login');
  };

  const handlePayBillClick = () => {
    if (user) {
      // If user is logged in, redirect to dashboard payments section
      router.push('/dashboard?tab=payments');
    } else {
      // If user is not logged in, redirect to login page with return URL
      router.push(`/login?returnUrl=${encodeURIComponent('/dashboard?tab=payments')}`);
    }
  };

  return (
    <nav className="fixed w-full top-0 z-50">
      <div 
        className={`w-full h-[55px] md:h-[70px] px-6 sm:px-8 md:px-12 lg:px-16 rounded-b-xl md:rounded-b-2xl relative flex items-center justify-between`}
      >
        {/* Background with opacity */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-white to-blue-600 rounded-b-xl md:rounded-b-2xl transition-opacity duration-200"
          style={{ opacity: navbarOpacity }}
        ></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto h-full flex items-center justify-between w-full">
          {/* Logo and text section */}
          <div className="flex items-center gap-2">
            <HamburgerMenu />
            <Link href="/" className="flex items-center gap-2 relative z-10">
              <img
                src="/navbar/logo.svg"
                alt="Indusun Logo"
                className="h-[2rem] sm:h-[2.5rem] md:h-[3rem] lg:h-[3.5rem] w-auto filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] hidden sm:block"
              />
              <span className="text-[14px] xs:text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] ml-[10px] xs:ml-[12px] sm:ml-[-50px]">
                Indusun
              </span>
            </Link>
          </div>

          {/* Buttons container */}
          <div className="flex items-center">
            <div className="flex items-center gap-2 xs:gap-4 sm:gap-4 md:gap-4 scale-[0.65] xs:scale-[0.95] sm:scale-50 md:scale-[0.90] lg:scale-100 origin-right ml-[-60px] xs:ml-[-80px]">
              {/* For Broker Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBrokerClick}
                className="whitespace-nowrap px-6 py-2
                border-2 border-white rounded-lg text-white
                          hover:bg-white hover:text-blue-600 transition-colors duration-300"
              >
                For Broker
              </motion.button>

              {/* Pay Bill Button */}
              <motion.button
                onClick={handlePayBillClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                className="whitespace-nowrap px-8 py-2 rounded-lg text-white
                          bg-[#D9D9D9]/50 hover:bg-[#c4c4c4]/50
                          transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Pay Bill'}
              </motion.button>
            </div>

            {/* Right side navigation items */}
            <div className="hidden md:flex items-center gap-4 ml-4">
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
