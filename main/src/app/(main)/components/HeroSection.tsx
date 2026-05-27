'use client';

import { useState, useEffect } from 'react';
import { DesktopSearchForm } from './DesktopSearchForm';
import { MobileSearchForm } from './MobileSearchForm';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface HeroContent {
  headline?: string;
  subheadline?: string;
  image?: string;
}

interface HeroSectionProps {
  removeSearchBar?: boolean;
  content?: HeroContent;
}

const HERO_DEFAULTS: Required<HeroContent> = {
  headline: 'Modern living for everyone',
  subheadline:
    'We provide a complete service for the sale, purchase or rental of real estate. We have been operating in Madrid and Barcelona more than 15 years.',
  image:
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop',
};

export function HeroSection({ removeSearchBar = false, content }: HeroSectionProps) {
  const headline = content?.headline?.trim() || HERO_DEFAULTS.headline;
  const subheadline = content?.subheadline?.trim() || HERO_DEFAULTS.subheadline;
  const image = content?.image?.trim() || HERO_DEFAULTS.image;

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
    <>
      {/* Mobile Hero Section */}
      {isMobile && (
        <div className="md:hidden relative bg-white">
          {/* Hero Section with clip-path for rounded corners */}
          <div 
            className="relative h-[500px]"
            style={{
              clipPath: 'inset(0 0 50px 0 round 0 0 20px 20px)'
            }}
          >
            <img
              src={image}
              alt="Hero"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
          </div>
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-4">
            <div className="max-w-3xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold text-white mb-4"
              >
                {headline}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-white/90 mb-8"
              >
                {subheadline}
              </motion.p>
            </div>
          </div>
          
          {/* Mobile Search Form */}
          {!removeSearchBar && (
            <div className="relative z-30 max-w-3xl mx-auto -mt-6 px-4">
              <MobileSearchForm onSearch={handleSearch} />
            </div>
          )}
        </div>
      )}

      {/* Desktop/Tablet Hero Section */}
      {!isMobile && (
        <section className="hidden md:block relative w-full h-[80vh] min-h-[600px] overflow-hidden bg-white z-10">
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0 bg-white"
            style={{
              clipPath: 'inset(0 0 0 0 round 0 0 30px 30px)'
            }}
          >
            <img
              src={image}
              alt="Hero"
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
                className="text-5xl lg:text-6xl font-bold text-white mb-4"
              >
                {headline}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-white/90 mb-8"
              >
                {subheadline}
              </motion.p>
            </div>
          </div>

          {/* Desktop Search Form */}
          {!removeSearchBar && (
            <div className="fixed-search-container fixed left-0 right-0 mx-auto max-w-3xl px-4 bg-white z-30" style={{ bottom: 'calc(100vh - 80vh - 40px)' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <DesktopSearchForm onSearch={handleSearch} />
              </motion.div>
            </div>
          )}
        </section>
      )}
    </>
  );
}








