'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileSearchFormProps {
  onSearch?: (query: string, type: string, tab: string) => void;
  className?: string;
}

export function MobileSearchForm({ onSearch, className = '' }: MobileSearchFormProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [activeTab, setActiveTab] = useState('Buy');
  const [isFocused, setIsFocused] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);


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

  // Remove or comment out the useEffect for cycling through search suggestions
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setIsAnimatingOut(true);
  //     setTimeout(() => {
  //       setCurrentSuggestionIndex((prev) => (prev + 1) % searchSuggestions.length);
  //       setIsAnimatingOut(false);
  //     }, 500);
  //   }, 3000);
  //   return () => clearInterval(interval);
  // }, [searchSuggestions.length]);

  // Replace with a simple initialization
  useEffect(() => {
    // Just set initial suggestion without animation
    setCurrentSuggestionIndex(0);
  }, []);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    if (onSearch) {
      onSearch(searchTerm, propertyType, activeTab);
    } else {
      // Default behavior - redirect to search page
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (propertyType !== 'all') params.append('type', propertyType);
      params.append('purpose', activeTab.toLowerCase());

      router.push(`/properties/search?${params.toString()}`);
    }
  };

  return (
    <div className={`relative z-10 max-w-3xl mx-auto px-4 ${className}`}>
      {/* Search Container */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Top Navigation Area - Mobile version */}
        <div className="flex justify-between bg-blue-600 text-white md:hidden">
          <motion.button
            key="buy-mobile"
            whileHover={{ backgroundColor: 'rgba(29, 78, 216, 0.8)' }}
            className={`flex-1 px-3 py-2 text-center text-sm font-medium
              ${activeTab === 'Buy' ? 'bg-blue-700' : ''}
              transition-colors`}
            onClick={() => setActiveTab('Buy')}
          >
            Buy
          </motion.button>
          <motion.button
            key="new-mobile"
            whileHover={{ backgroundColor: 'rgba(29, 78, 216, 0.8)' }}
            className={`flex-1 px-3 py-2 text-center text-sm font-medium
              ${activeTab === 'New' ? 'bg-blue-700' : ''}
              transition-colors`}
            onClick={() => setActiveTab('New')}
          >
            New Launch<span className="text-red-500 text-xs ml-1">*</span>
          </motion.button>
          <motion.button
            key="commercial-mobile"
            whileHover={{ backgroundColor: 'rgba(29, 78, 216, 0.8)' }}
            className={`flex-1 px-3 py-2 text-center text-sm font-medium
              ${activeTab === 'Commercial' ? 'bg-blue-700' : ''}
              transition-colors`}
            onClick={() => setActiveTab('Commercial')}
          >
            Commercial
          </motion.button>
          <motion.button
            key="plots-mobile"
            whileHover={{ backgroundColor: 'rgba(29, 78, 216, 0.8)' }}
            className={`flex-1 px-3 py-2 text-center text-sm font-medium
              ${activeTab === 'Plots' ? 'bg-blue-700' : ''}
              transition-colors`}
            onClick={() => setActiveTab('Plots')}
          >
            Plots/Land
          </motion.button>
          <motion.button
            key="projects-mobile"
            whileHover={{ backgroundColor: 'rgba(29, 78, 216, 0.8)' }}
            className={`flex-1 px-3 py-2 text-center text-sm font-medium
              ${activeTab === 'Projects' ? 'bg-blue-700' : ''}
              transition-colors`}
            onClick={() => setActiveTab('Projects')}
          >
            Projects
          </motion.button>
        </div>

        {/* Bottom Search Area */}
        <form onSubmit={handleSubmit} className="flex p-2 items-center gap-1">
          {/* Dropdown */}
          <div className="relative">
            <select
              className="px-2 py-1.5 bg-white appearance-none focus:outline-none pr-6 text-xs text-gray-700 border-r border-gray-200"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="all">All Residential</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
            </select>
            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
          </div>

          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
            <AnimatePresence>
              {!searchTerm && !isFocused && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                  className="absolute left-6 top-1/2 pointer-events-none text-gray-400 text-xs transition-all duration-1000 ease-in-out -translate-y-1/2 opacity-100"
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
              className={`w-full pl-6 pr-2 py-1.5 focus:outline-none bg-transparent text-xs text-black
                ${isFocused ? 'caret-blue-500 animate-caret' : ''}`}
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-400 text-white text-xs font-medium hover:bg-blue-500 transition-colors rounded-md cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}


