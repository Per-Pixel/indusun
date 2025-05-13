'use client';

import { useState, useEffect } from 'react';
import { DesktopSearchForm } from './DesktopSearchForm';
import { MobileSearchForm } from './MobileSearchForm';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export function HeroSection() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on client side
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Handle search from components
  const handleSearch = (query: string, type: string) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (type !== 'all') params.append('type', type);
    
    router.push(`/properties/search?${params.toString()}`);
  };

  return (
    <section className="relative w-full h-[80vh] min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop"
          alt="Modern Home"
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            Modern living for everyone
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 mb-8"
          >
            Find your dream property with our extensive listings and expert guidance.
          </motion.p>

          {/* Search Form - Desktop */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden md:block"
          >
            <DesktopSearchForm onSearch={handleSearch} />
          </motion.div>
        </div>
      </div>

      {/* Mobile Search Form - Positioned at bottom of hero */}
      {isMobile && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <MobileSearchForm onSearch={handleSearch} />
        </div>
      )}
    </section>
  );
}
