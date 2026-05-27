'use client';

// Client portion of the homepage: holds the responsive search bar logic and
// section composition. Receives CMS content as a prop from the server page.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import type { PageContent } from '@/lib/page-content';

interface Props {
  content: PageContent;
}

const isVisible = (content: PageContent, key: string) =>
  content[key]?.visible !== false;

export default function HomePageClient({ content }: Props) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleSearch = (query: string, type: string) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (type !== 'all') params.append('type', type);
    router.push(`/properties/search?${params.toString()}`);
  };

  return (
    <main className="min-h-screen">
      {isVisible(content, 'hero') && (
        <div className="relative">
          <HeroSection removeSearchBar={true} content={content.hero?.data} />
        </div>
      )}

      <div className="relative z-30" style={{ marginTop: '-80px' }}>
        <div className="container mx-auto px-4">
          {!isMobile && (
            <div
              className="search-container max-w-3xl mx-auto shadow-md rounded-lg overflow-hidden"
              style={{ transform: 'translateY(40px)' }}
            >
              <DesktopSearchForm onSearch={handleSearch} />
            </div>
          )}
        </div>
      </div>

      {isMobile && (
        <div className="md:hidden relative z-20">
          <MobileSearchForm onSearch={handleSearch} className="mt-[-120px]" />
        </div>
      )}

      <div className="bg-white relative z-10 -mt-8">
        {isVisible(content, 'counter') && <CounterSection />}
        <FindBetterPlaces />
        {isVisible(content, 'featured') && <FeaturedSection content={content.featured?.data} />}
        <HighlightedProjects />
        {isVisible(content, 'services') && <ServicesSection content={content.services?.data} />}
        <OngoingProjects />
        {isVisible(content, 'testimonials') && <TestimonialsSection />}
        {isVisible(content, 'why_choose_us') && <WhyChooseUs />}
      </div>
    </main>
  );
}
