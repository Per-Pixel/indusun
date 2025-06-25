'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Search, Phone, Mail, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { PropertyCard } from './components/PropertyCard';
import { PropertyCardDesktop } from './components/PropertyCardDesktop';
import { MobileSearchForm } from '@/app/(main)/components/MobileSearchForm';

// Types
interface Property {
  id: number;
  title: string;
  type: 'Apartment' | 'Villa' | 'House' | 'Plot' | 'Commercial';
  location: string;
  price: string;
  priceNumeric: number; // For sorting
  beds?: number;
  baths?: number;
  area: string;
  areaNumeric: number; // For sorting
  featured: boolean;
  new: boolean;
  image?: string;
  description: string;
  amenities: string[];
  postedDate: string;
}

// Mock data
import { mockProperties } from './mockData';

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

const buttonVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 }
};

const PropertiesPage = () => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState<string>('all');
  const [priceRange] = useState<[number, number]>([0, 50000000]); // 0 to 5 Cr
  const [sortBy] = useState<'price-asc' | 'price-desc' | 'area-asc' | 'area-desc' | 'newest'>('newest');
  const [showFilters] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties);

  // New states
  const [, setIsSearchView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

  // Handle search button click
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Search clicked!');
    
    if (isMobile) {
      // For mobile: redirect to search page
      window.location.href = `/properties/search?q=${searchTerm}`;
    } else {
      // For desktop: show search results in current page
      setIsSearchView(true);
      const filtered = mockProperties.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProperties(filtered);
    }
  };

  // Animation effect
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
  }, [isFocused]);

  // State for filtered and paginated properties
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 6;

  // Add these state variables at the top of your component
  const [visibleProperties, setVisibleProperties] = useState(6);
  const [visibleLandProperties, setVisibleLandProperties] = useState(6);
  const [, setFavorites] = useState<number[]>([]);

  // Add this function to handle favorite toggling
  const handleFavoriteToggle = (propertyId: number) => {
    setFavorites(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
    
    // In a real app, you would save this to localStorage or a database
    // For example:
    // localStorage.setItem('favorites', JSON.stringify([...favorites, propertyId]));
  };

  // Add these handler functions
  const handleLoadMore = () => {
    setVisibleProperties(prev => prev + 6);
  };

  const handleLoadMoreLands = () => {
    setVisibleLandProperties(prev => prev + 6);
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...mockProperties];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(property =>
        property.title.toLowerCase().includes(term) ||
        property.location.toLowerCase().includes(term) ||
        property.description.toLowerCase().includes(term)
      );
    }

    // Apply property type filter
    if (propertyType !== 'all') {
      result = result.filter(property => property.type === propertyType);
    }

    // Apply price range filter
    result = result.filter(property =>
      property.priceNumeric >= priceRange[0] && property.priceNumeric <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.priceNumeric - b.priceNumeric);
        break;
      case 'price-desc':
        result.sort((a, b) => b.priceNumeric - a.priceNumeric);
        break;
      case 'area-asc':
        result.sort((a, b) => a.areaNumeric - b.areaNumeric);
        break;
      case 'area-desc':
        result.sort((a, b) => b.areaNumeric - a.areaNumeric);
        break;
      case 'newest':
        // For mock data, we'll just use the original order
        // In a real app, you would sort by date
        break;
    }

    setFilteredProperties(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, propertyType, priceRange, sortBy]);

  // Get current properties for pagination
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;

  // Format price range for display
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} Lac`;
    } else {
      return `₹${price}`;
    }
  };

  // Add these animation variants
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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[600px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop"
          alt="Hero Image"
          fill
          priority
          className="object-cover rounded-bl-[30px] md:rounded-bl-[50px]"
        />
        
        {/* Gradient overlay positioned absolutely */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent rounded-bl-[30px] md:rounded-bl-[50px]"></div>

        <div className="absolute inset-0">
          {/* Title positioned absolutely - hidden on mobile */}
          <div className="absolute bottom-28 right-0 container mx-auto px-4 hidden md:block">
            <div className="w-full md:w-1/2 ml-auto text-right">
              <h1 className="text-3xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                Enjoy The Finest Homes
              </h1>
            </div>
          </div>

          {/* Button positioned absolutely - hidden on mobile */}
          <div className="absolute bottom-8 left-0 container mx-auto px-4 hidden md:block">
            <Link 
              href="/contact" 
              className="inline-block border-2 border-white text-white px-4 py-1.5 md:px-6 md:py-2 rounded-full hover:bg-white hover:text-blue-600 transition-colors text-sm md:text-base"
            >
              LET US GUIDE YOUR HOME
            </Link>
          </div>
          
          {/* Mobile-only title and button - hidden on desktop */}
          <div className="absolute inset-0 flex flex-col items-start justify-center px-6 md:hidden">
            <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
              Enjoy The Finest Homes
            </h1>
            <Link 
              href="/contact" 
              className="inline-block border-2 border-white text-white px-4 py-1.5 rounded-full hover:bg-white hover:text-blue-600 transition-colors text-sm drop-shadow-md"
            >
              LET US GUIDE YOUR HOME
            </Link>
          </div>
        </div>

        {/* Stats background only - visible on all devices */}
        <div className="absolute bottom-0 right-0 w-1/2 sm:w-3/5 md:w-1/2">
          <div className="relative">
            {/* Diagonal white background positioned absolutely */}
            <div 
              className="absolute bottom-0 right-0 w-full bg-white h-32 rounded-tl-3xl"
              style={{
                transform: 'skew(-45deg)',
                transformOrigin: 'bottom right'
              }}
            ></div>
            
            {/* Stats content - only visible on desktop */}
            <div className="container mx-auto relative py-12 sm:pl-10 md:pl-20 hidden md:block"> 
              <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-12 text-center"> 
                <div>
                  <div className="text-sm sm:text-lg md:text-2xl font-bold text-blue-600">680</div>
                  <div className="text-black text-[10px] sm:text-xs -mt-1">
                    Awward Winning
                  </div>
                </div>

                <div>
                  <div className="text-sm sm:text-lg md:text-2xl font-bold text-blue-600">8K+</div>
                  <div className="text-black text-[10px] sm:text-xs -mt-1">
                    Happy Customer
                  </div>
                </div>

                <div>
                  <div className="text-sm sm:text-lg md:text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-black text-[10px] sm:text-xs -mt-1">
                    Property Ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Search Form */}
      <div className="md:hidden">
        <MobileSearchForm 
          onSearch={(query, type) => {
            setSearchTerm(query);
            setPropertyType(type);
            // Handle the search with the existing function
            const e = { preventDefault: () => {} } as React.FormEvent;
            handleSearch(e);
          }}
          className="-mt-7"
        />
      </div>

      {/* Desktop Search Container - only visible on md and up */}
      <div className="hidden md:block bg-white shadow-md rounded-lg max-w-2xl mx-auto -mt-7 relative z-10 overflow-hidden">
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
        <form onSubmit={handleSearch} className="flex p-2 items-center gap-2">
          {/* Dropdown */}
          <div className="relative">
            <select 
              className="px-2 md:px-4 py-1.5 md:py-2 bg-white appearance-none focus:outline-none pr-6 md:pr-8 text-xs md:text-base text-gray-700 border-r border-gray-200"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="all">All Residential</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
            </select>
            <ChevronDown className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-3 w-3 md:h-5 md:w-5 text-gray-400" />
            <AnimatePresence>
              {!searchTerm && !isFocused && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                  className={`absolute left-6 md:left-10 top-1/2 pointer-events-none text-gray-400 text-xs md:text-sm
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
              className={`w-full pl-6 md:pl-10 pr-2 md:pr-4 py-1.5 md:py-2 focus:outline-none bg-transparent text-xs md:text-base text-black
                ${isFocused ? 'caret-blue-500 animate-caret' : ''}`}
            />
          </div>

          {/* Search Button */}
          <button 
            type="submit"
            className="px-3 md:px-6 py-1.5 md:py-2 bg-blue-400 text-white text-xs md:text-base font-medium hover:bg-blue-500 transition-colors rounded-md cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Dropdowns - Add motion */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={dropdownVariants}
            className="filter-dropdowns"
          >
            {/* Keep your existing filter content */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Properties Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-4 text-black">
            Featured Properties 
            Discover Your<br />
            <span className="relative inline-block">
              <span className="text-blue-600 relative z-10">Dream Home Today</span>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 100">
                <circle className="animate-circle" cx="20" cy="50" r="3" fill="#3B82F6" />
                <circle className="animate-circle" cx="40" cy="50" r="2" fill="#3B82F6" opacity="0.7" style={{ animationDelay: '0.2s' }} />
                <circle className="animate-circle" cx="60" cy="50" r="2" fill="#3B82F6" opacity="0.5" style={{ animationDelay: '0.4s' }} />
                <circle className="animate-circle" cx="80" cy="50" r="1" fill="#3B82F6" opacity="0.3" style={{ animationDelay: '0.6s' }} />
              </svg>
            </span>
          </h2>
          <p className="text-base text-gray-500 mb-8 max-w-3xl mx-auto line-clamp-2">
            Explore a curated selection of stunning homes tailored to your lifestyle. From cozy city apartments to spacious family houses, our featured listings offer something for everyone. Start your journey to the perfect home with the best properties on the market right now.
          </p>

              {/* Properties Grid */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {mockProperties
                  .filter(property => property.type !== 'Plot') // Filter out plots for regular properties
                  .slice(0, visibleProperties)
                  .map((property) => (
                    isDesktop ? (
                      <PropertyCardDesktop key={property.id} property={property} onFavoriteToggle={handleFavoriteToggle} />
                    ) : (
                      <PropertyCard key={property.id} property={property} onFavoriteToggle={handleFavoriteToggle} />
                    )
                  ))}
              </div>

          {/* Load More Button */}
          {mockProperties.filter(property => property.type !== 'Plot').length > visibleProperties && (
            <div className="text-center mt-6">
              <motion.button 
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                onClick={handleLoadMore}
                className="px-12 py-4 bg-[#333333] text-white rounded-3xl hover:bg-transparent hover:border-[#333333] hover:border-2 hover:text-[#333333] transition-all text-sm"
              >
                Load More
              </motion.button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Lands Properties Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold mb-4 text-black">
            Featured Lands Properties<br />
            <span className="relative inline-block">
              <span className="text-blue-600 relative z-10">Discover Your Dreams Today</span>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 100">
                <circle className="animate-circle" cx="20" cy="50" r="3" fill="#3B82F6" />
                <circle className="animate-circle" cx="40" cy="50" r="2" fill="#3B82F6" opacity="0.7" style={{ animationDelay: '0.2s' }} />
                <circle className="animate-circle" cx="60" cy="50" r="2" fill="#3B82F6" opacity="0.5" style={{ animationDelay: '0.4s' }} />
                <circle className="animate-circle" cx="80" cy="50" r="1" fill="#3B82F6" opacity="0.3" style={{ animationDelay: '0.6s' }} />
              </svg>
            </span>
          </h2>
          <p className="text-base text-gray-500 mb-8 max-w-3xl line-clamp-2">
            Explore a curated selection of premium land properties tailored to your investment needs. From residential plots to commercial lands, our featured listings offer the best opportunities in the market right now.
          </p>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {mockProperties
              .filter(property => property.type === 'Plot') // Only show plots
              .slice(0, visibleLandProperties)
              .map((property) => (
                isDesktop ? (
                  <PropertyCardDesktop key={property.id} property={property} onFavoriteToggle={handleFavoriteToggle} />
                ) : (
                  <PropertyCard key={property.id} property={property} onFavoriteToggle={handleFavoriteToggle} />
                )
              ))}
          </div>

          {/* Load More Button for Lands */}
          {mockProperties.filter(property => property.type === 'Plot').length > visibleLandProperties && (
            <div className="text-center mt-6">
              <motion.button 
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                onClick={handleLoadMoreLands}
                className="px-12 py-4 bg-[#333333] text-white rounded-3xl hover:bg-transparent hover:border-[#333333] hover:border-2 hover:text-[#333333] transition-all text-sm"
              >
                Load More
              </motion.button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-gray-800" />
            <h2 className="text-4xl font-bold text-black">Let&apos;s make it happen!</h2>
            <Sparkles className="h-6 w-6 text-gray-800" />
          </div>
          <p className="text-gray-600 mb-12">
            Ready to take the first step toward your dream property? Fill out the form below, and our real estate wizards will work their magic to find your perfect match. Don&apos;t wait; let&apos;s embark on this exciting journey together.
          </p>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm text-black mb-2">First Name</label>
                <input
                  type="text"
                  placeholder="Enter First Name"
                  className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black placeholder:text-gray-600/70 text-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-black mb-2">Last Name</label>
                <input
                  type="text"
                  placeholder="Enter Last Name"
                  className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black placeholder:text-gray-600/70 text-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-black mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Enter your Email"
                  className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black placeholder:text-gray-600/70 text-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-black mb-2">Phone</label>
                <input
                  type="tel"
                  placeholder="Enter Phone Number"
                  className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black placeholder:text-gray-600/70 text-black transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm text-black mb-2">Preferred Location</label>
                <select className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black text-black transition-colors">
                  <option value="">Select Location</option>
                  {/* Add location options */}
                </select>
              </div>
              <div>
                <label className="block text-sm text-black mb-2">Property Type</label>
                <select className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black text-black transition-colors">
                  <option value="">Select Property Type</option>
                  {/* Add property type options */}
                </select>
              </div>
              <div>
                <label className="block text-sm text-black mb-2">No. of Bathrooms</label>
                <select className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black text-black transition-colors">
                  <option value="">Select no. of Bathrooms</option>
                  {/* Add bathroom options */}
                </select>
              </div>
              <div>
                <label className="block text-sm text-black mb-2">No. of Bedrooms</label>
                <select className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black text-black transition-colors">
                  <option value="">Select no. of Bedrooms</option>
                  {/* Add bedroom options */}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-black mb-2">Budget</label>
              <select className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black text-black transition-colors">
                <option value="">Select Budget</option>
                {/* Add budget options */}
              </select>
            </div>

            <div>
              <label className="block text-sm text-black mb-2">Preferred Contact Method</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex items-center p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black">
                    <Phone className="h-5 w-5 text-gray-500 mr-2" />
                    <input
                      type="tel"
                      placeholder="Enter Your Number"
                      className="bg-transparent w-full focus:outline-none placeholder:text-gray-600/70 text-black"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black">
                    <Mail className="h-5 w-5 text-gray-500 mr-2" />
                    <input
                      type="email"
                      placeholder="Enter Your Email"
                      className="bg-transparent w-full focus:outline-none placeholder:text-gray-600/70 text-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-black mb-2">Message</label>
              <textarea
                placeholder="Enter your Message here."
                rows={6}
                className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black placeholder:text-gray-600/70 text-black transition-colors"
              ></textarea>
            </div>

            {/* Terms and Send Message button container */}
            <div className="flex items-center justify-between">
              {/* Terms agreement */}
              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <p className="text-sm text-black">
                  I agree with <a href="#" className="underline">Terms of Use</a> and <a href="#" className="underline">Privacy Policy</a>
                </p>
              </div>

              {/* Send Message button */}
              <button
                type="submit"
                className="px-8 py-3 bg-[#7C3AED] text-white rounded-lg font-medium hover:bg-[#6D28D9] transition-colors"
              >
                Send Your Message
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default PropertiesPage;

<style jsx>{`
  @keyframes moveCircle {
    0% {
      transform: translateX(0);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateX(300px);
      opacity: 0;
    }
  }

  .animate-circle {
    animation: moveCircle 3s infinite linear;
  }

  @keyframes caret {
    50% { opacity: 0; }
  }
  
  .animate-caret {
    caret-color: #3B82F6;
    caret-width: 2px;
  }
`}</style>















