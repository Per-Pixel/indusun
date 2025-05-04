'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DesktopSearchFormProps {
  onSearch?: (query: string, type: string) => void;
  className?: string;
  initialPropertyType?: string;
  initialSearchTerm?: string;
}

export function DesktopSearchForm({ 
  onSearch, 
  className = '',
  initialPropertyType = 'all',
  initialSearchTerm = ''
}: DesktopSearchFormProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [propertyType, setPropertyType] = useState(initialPropertyType);
  const [isFocused, setIsFocused] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const searchSuggestions = [
    "2 BHK property near me",
    "Big bungalow in Mumbai",
    "3 BHK apartment in Pune",
    "Villa with swimming pool",
    "Commercial space for rent",
    "1 BHK flat under 50 lakhs",
    "Luxury apartments in Delhi",
    "Property near metro station",
    "4 BHK penthouse",
    "Ready to move property"
  ];

  // Animation effect for search suggestions
  useEffect(() => {
    if (isFocused) return; // Don't animate if input is focused
    
    const interval = setInterval(() => {
      setIsAnimatingOut(true);
      setTimeout(() => {
        setCurrentSuggestionIndex((prev) => (prev + 1) % searchSuggestions.length);
        setIsAnimatingOut(false);
      }, 800);
    }, 4000);

    return () => clearInterval(interval);
  }, [isFocused, searchSuggestions.length]);

  // Animation variants
  const dropdownVariants = {
    hidden: { 
      opacity: 0,
      y: -5,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSearch) {
      onSearch(searchTerm, propertyType);
    } else {
      // Default behavior - redirect to search page
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (propertyType !== 'all') params.append('type', propertyType);
      
      router.push(`/properties/search?${params.toString()}`);
    }
  };

  return (
    <div className={`bg-white shadow-md rounded-lg overflow-hidden ${className}`}>
      {/* Top Navigation Area */}
      <div className="flex justify-between bg-blue-600 text-white overflow-x-auto">
        <motion.button
          key="buy"
          whileHover={{ backgroundColor: 'rgba(29, 78, 216, 0.8)' }}
          className={`flex-1 px-4 py-4 text-center text-base font-medium whitespace-nowrap
            ${propertyType === 'buy' ? 'bg-blue-700' : ''} 
            transition-colors`}
          onClick={() => setPropertyType('buy')}
        >
          Buy
        </motion.button>
        <motion.button
          key="new"
          whileHover={{ backgroundColor: 'rgba(29, 78, 216, 0.8)' }}
          className={`flex-1 px-4 py-4 text-center text-base font-medium whitespace-nowrap
            ${propertyType === 'new' ? 'bg-blue-700' : ''} 
            transition-colors`}
          onClick={() => setPropertyType('new')}
        >
          New Launch<span className="text-red-500 text-xs ml-1">*</span>
        </motion.button>
        <motion.button
          key="commercial"
          whileHover={{ backgroundColor: 'rgba(29, 78, 216, 0.8)' }}
          className={`flex-1 px-4 py-4 text-center text-base font-medium whitespace-nowrap
            ${propertyType === 'commercial' ? 'bg-blue-700' : ''} 
            transition-colors`}
          onClick={() => setPropertyType('commercial')}
        >
          Commercials
        </motion.button>
        <motion.button
          key="plots"
          whileHover={{ backgroundColor: 'rgba(29, 78, 216, 0.8)' }}
          className={`flex-1 px-4 py-4 text-center text-base font-medium whitespace-nowrap
            ${propertyType === 'plots' ? 'bg-blue-700' : ''} 
            transition-colors`}
          onClick={() => setPropertyType('plots')}
        >
          Plots/Land
        </motion.button>
        <motion.button
          key="projects"
          whileHover={{ backgroundColor: 'rgba(29, 78, 216, 0.8)' }}
          className={`flex-1 px-4 py-4 text-center text-base font-medium whitespace-nowrap
            ${propertyType === 'projects' ? 'bg-blue-700' : ''} 
            transition-colors`}
          onClick={() => setPropertyType('projects')}
        >
          Projects
        </motion.button>
      </div>

      {/* Bottom Search Area */}
      <form onSubmit={handleSubmit} className="flex p-2 items-center gap-2">
        {/* Dropdown */}
        <div className="relative">
          <select 
            className="px-4 py-2 bg-white appearance-none focus:outline-none pr-8 text-base text-gray-700 border-r border-gray-200"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          >
            <option value="all">All Residential</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <AnimatePresence>
            {!searchTerm && !isFocused && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={dropdownVariants}
                className={`absolute left-10 top-1/2 pointer-events-none text-gray-400 text-sm
                  transition-all duration-1000 ease-in-out
                  ${isAnimatingOut ? 'translate-y-[200%] opacity-0' : '-translate-y-1/2 opacity-100'}`}
              >
                {searchSuggestions[currentSuggestionIndex]}
              </motion.div>
            )}
          </AnimatePresence>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full pl-10 pr-4 py-2 focus:outline-none bg-transparent text-base text-black
              ${isFocused ? 'caret-blue-500 animate-caret' : ''}`}
          />
        </div>

        {/* Search Button */}
        <button 
          type="submit"
          className="px-6 py-2 bg-blue-400 text-white text-base font-medium hover:bg-blue-500 transition-colors rounded-md cursor-pointer"
        >
          Search
        </button>
      </form>
    </div>
  );
}