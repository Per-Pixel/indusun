'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PropertyCard } from '../properties/components/PropertyCard';
import { PropertyCardDesktop } from '../properties/components/PropertyCardDesktop';
import { mockProperties } from '../properties/mockData';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface FeaturedContent {
  headline?: string;
  subheadline?: string;
  cta?: { label?: string; url?: string };
}

interface FeaturedSectionProps {
  content?: FeaturedContent;
}

const FEATURED_DEFAULTS = {
  headline: 'Featured Properties',
  subheadline: 'Discover Your Dream Home Today',
  ctaLabel: 'View All',
  ctaUrl: '/properties',
};

export function FeaturedSection({ content }: FeaturedSectionProps = {}) {
  const headline = content?.headline?.trim() || FEATURED_DEFAULTS.headline;
  const subheadline = content?.subheadline?.trim() || FEATURED_DEFAULTS.subheadline;
  const ctaLabel = content?.cta?.label?.trim() || FEATURED_DEFAULTS.ctaLabel;
  const ctaUrl = content?.cta?.url?.trim() || FEATURED_DEFAULTS.ctaUrl;

  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
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
  
  // Check if device is desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);
  
  // Get featured properties
  const featuredProperties = mockProperties
    .filter(property => property.featured)
    .slice(0, 6); // Limit to 6 properties
  
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {headline}
            </h2>
            <p className="text-gray-600 mt-2">
              {subheadline}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-4 md:mt-0"
          >
            <Link 
              href={ctaUrl}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              {ctaLabel}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
        >
          {featuredProperties.map((property) => (
            <div key={property.id} className="h-full">
              {isDesktop ? (
                <PropertyCardDesktop 
                  property={{
                    ...property,
                    listedDate: property.postedDate || new Date().toISOString()
                  }}
                />
              ) : (
                <PropertyCard 
                  property={{
                    ...property,
                    listedDate: property.postedDate || new Date().toISOString()
                  }}
                />
              )}
            </div>
          ))}
        </motion.div>
        
        {/* Mobile View All Button */}
        {isMobile && (
          <div className="mt-8 text-center">
            <Link 
              href={ctaUrl}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}


