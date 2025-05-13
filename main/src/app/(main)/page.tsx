'use client';

import { HeroSection } from './components/HeroSection';
import { CounterSection } from './components/CounterSection';
import { FindBetterPlaces } from './components/FindBetterPlaces';
import { FeaturedSection } from './components/FeaturedSection';
import { HighlightedProjects } from './components/HighlightedProjects';
import { ServicesSection } from './components/ServicesSection';
import { OngoingProjects } from './components/OngoingProjects';
import { TestimonialsSection } from './components/TestimonialsSection';
import { WhyChooseUs } from './components/WhyChooseUs';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Search */}
      <HeroSection />

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
