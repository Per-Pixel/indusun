'use client';

import { useState, useEffect } from 'react';
import { HeroSection } from './components/HeroSection';
import { CounterSection } from './components/CounterSection';
import { FindBetterPlaces } from './components/FindBetterPlaces';
import { FeaturedSection } from './components/FeaturedSection';
import { HighlightedProjects } from './components/HighlightedProjects';
import { ServicesSection } from './components/ServicesSection';
import { OngoingProjects } from './components/OngoingProjects';
import { TestimonialsSection } from './components/TestimonialsSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { DesktopSearchForm } from './components/DesktopSearchForm';
import { MobileSearchForm } from './components/MobileSearchForm';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
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
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection removeSearchBar={true} />

      {/* Search Bar - Positioned to overlap with Hero section */}
      <div className="relative z-30" style={{ marginTop: '-80px', position: 'relative' }}>
        <div className="container mx-auto px-4">
          <div className="search-container max-w-3xl mx-auto shadow-md rounded-lg overflow-hidden" style={{ position: 'relative', top: '0px' }}>
            {isMobile ? (
              <MobileSearchForm onSearch={handleSearch} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <DesktopSearchForm onSearch={handleSearch} />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Counter Section */}
      <CounterSection />

      {/* Find Better Places Section */}
      <FindBetterPlaces />

      {/* Featured Properties Section */}
      <FeaturedSection />

      {/* Highlighted Projects Section */}
      <HighlightedProjects />

      {/* Services Section */}
      <ServicesSection />

      {/* Ongoing Projects Section */}
      <OngoingProjects />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Why Choose Us Section */}
      <WhyChooseUs />
    </main>
  );
}
