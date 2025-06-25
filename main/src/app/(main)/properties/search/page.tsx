'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Property } from '../types';
import { mockProperties } from '../mockData';
import { Building2, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PropertyCard } from '../components/PropertyCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('q') || '';
  const [properties, setProperties] = useState<Property[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageReady, setIsPageReady] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hide footer when this component mounts
  useEffect(() => {
    // Hide footer
    const footer = document.querySelector('footer');
    const bottomNav = document.querySelector('nav.fixed.bottom-0');
    
    if (footer) {
      footer.style.display = 'none';
    }
    
    if (bottomNav) {
      bottomNav.style.display = 'none';
    }
    
    // Add a full-screen background to prevent any content from showing through
    const overlay = document.createElement('div');
    overlay.id = 'search-background-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'white';
    overlay.style.zIndex = '9998';
    document.body.appendChild(overlay);
    
    // Initial page load - hide until ready to animate
    setTimeout(() => {
      setIsPageReady(true);
    }, 100);
    
    // Cleanup function
    return () => {
      if (footer) {
        footer.style.display = '';
      }
      
      if (bottomNav) {
        bottomNav.style.display = '';
      }
      
      const overlayElement = document.getElementById('search-background-overlay');
      if (overlayElement) {
        document.body.removeChild(overlayElement);
      }
    };
  }, []);

  // Filter properties based on search query
  useEffect(() => {
    if (!mockProperties) return;
    
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      const filtered = mockProperties.filter(property =>
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setProperties(filtered);
      setIsLoading(false);
    }, 800); // Add a slight delay to show loading state
  }, [searchQuery]);

  // Go back to previous page
  const handleGoBack = () => {
    router.back();
  };

  // Page animation variants
  const pageVariants = {
    initial: {
      y: "100%",
    },
    animate: {
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 100
      }
    },
    exit: {
      y: "100%",
      transition: {
        duration: 0.3
      }
    }
  };

  // If page is not ready yet, show loading indicator
  if (!isPageReady) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-white z-[9999] overflow-y-auto"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        {/* Handle at the top for a native feel */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2 relative z-10" />
        
        <div className="container mx-auto px-4 pt-6 pb-8 min-h-screen relative z-10">
          <div className="flex items-center mb-8">
            <button 
              onClick={handleGoBack}
              className="mr-3 p-2 rounded-full bg-white shadow-sm"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Results</h1>
              {!isLoading && (
                <p className="text-gray-600">
                  {properties.length === 0 
                    ? 'No properties found' 
                    : `Found ${properties.length} ${properties.length === 1 ? 'property' : 'properties'} for "${searchQuery}"`}
                </p>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Searching properties...</h2>
              <p className="text-gray-500 text-center">
                Finding the best matches for &quot;{searchQuery}&quot;
              </p>
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h2>
              <p className="text-gray-500 text-center mb-4">
                Try adjusting your search criteria or browse all properties
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
          
          {/* View All Properties button moved to bottom */}
          <div className="mt-8 text-center">
            <Link 
              href="/properties" 
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {isMobile ? 'View All Properties' : 'Back to Properties'}
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}























