'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Search, Bed, Bath, Square, MapPin, Phone, Mail, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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

import { PropertyCard } from './components/PropertyCard';

const PropertiesPage = () => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]); // 0 to 5 Cr
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'area-asc' | 'area-desc' | 'newest'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties);

  // New states
  const [isSearchView, setIsSearchView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
  const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop"
          alt="Hero Image"
          fill
          priority
          className="object-cover rounded-bl-[50px]"
        />
        
        {/* Gradient overlay positioned absolutely */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent rounded-bl-[50px]"></div>

        <div className="absolute inset-0">
          {/* Title positioned absolutely */}
          <div className="absolute bottom-28 right-0 container mx-auto px-4">
            <div className="w-full md:w-1/2 ml-auto text-right">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                Enjoy The Finest Homes
              </h1>
            </div>
          </div>

          {/* Button positioned absolutely */}
          <div className="absolute bottom-8 left-0 container mx-auto px-4">
            <Link 
              href="/contact" 
              className="inline-block border-2 border-white text-white px-6 py-2 rounded-full hover:bg-white hover:text-blue-600 transition-colors"
            >
              LET US GUIDE YOUR HOME
            </Link>
          </div>
        </div>

        {/* Stats positioned absolutely */}
        <div className="absolute bottom-0 right-0 w-1/2 pl-30">
          <div className="relative">
            {/* Diagonal white background positioned absolutely */}
            <div 
              className="absolute bottom-0 right-0 w-full bg-white h-32 rounded-tl-3xl"
              style={{
                transform: 'skew(-45deg)',
                transformOrigin: 'bottom right'
              }}
            ></div>
            
            {/* Stats content positioned absolutely */}
            <div className="container mx-auto relative py-12 pl-20"> {/* reduced py-4 to py-2 and added pr-8 */}
              <div className="grid grid-cols-3 gap-12 text-center"> {/* reduced gap-2 to gap-1 */}
                <div>
                  <div className="text-2xl font-bold text-blue-600">680</div> {/* changed to blue-600 */}
                  <div className="text-black text-xs -mt-1"> {/* changed from text-gray-600 to text-black */}
                    Awward Winning
                  </div>
                </div>

                <div>
                  <div className="text-2xl font-bold text-blue-600">8K+</div> {/* changed to blue-600 */}
                  <div className="text-black text-xs -mt-1"> {/* changed from text-gray-600 to text-black */}
                    Happy Customer
                  </div>
                </div>

                <div>
                  <div className="text-2xl font-bold text-blue-600">500+</div> {/* changed to blue-600 */}
                  <div className="text-black text-xs -mt-1"> {/* changed from text-gray-600 to text-black */}
                    Property Ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Container */}
      <div className="bg-white shadow-md rounded-lg max-w-2xl mx-auto -mt-7 relative z-10 overflow-hidden">
        {/* Top Navigation Area */}
        <div className="flex justify-between bg-blue-600 text-white">
          <button 
            className={`flex-1 px-4 py-4 text-center text-base font-medium ${propertyType === 'buy' ? 'bg-blue-700' : ''} hover:bg-blue-700 transition-colors`}
            onClick={() => setPropertyType('buy')}
          >
            Buy
          </button>
          <button 
            className={`flex-1 px-4 py-4 text-center text-base font-medium ${propertyType === 'new' ? 'bg-blue-700' : ''} hover:bg-blue-700 transition-colors flex items-center justify-center`}
          >
            New Launch<span className="text-red-500 text-xs ml-1">*</span>
          </button>
          <button 
            className={`flex-1 px-4 py-4 text-center text-base font-medium ${propertyType === 'commercial' ? 'bg-blue-700' : ''} hover:bg-blue-700 transition-colors`}
          >
            Commercials
          </button>
          <button 
            className={`flex-1 px-4 py-4 text-center text-base font-medium ${propertyType === 'plots' ? 'bg-blue-700' : ''} hover:bg-blue-700 transition-colors`}
          >
            Plots/Land
          </button>
          <button 
            className={`flex-1 px-4 py-4 text-center text-base font-medium ${propertyType === 'projects' ? 'bg-blue-700' : ''} hover:bg-blue-700 transition-colors`}
          >
            Projects
          </button>
        </div>

        {/* Bottom Search Area */}
        <form onSubmit={handleSearch} className="flex p-2 items-center gap-2">
          {/* Dropdown */}
          <div className="relative">
            <select 
              className="px-4 py-2 bg-white appearance-none focus:outline-none pr-8 text-gray-700 border-r border-gray-200"
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
            {!searchTerm && !isFocused && (
              <div className={`absolute left-10 top-1/2 pointer-events-none text-gray-400 text-sm
                transition-all duration-1000 ease-in-out
                ${isAnimatingOut ? 'translate-y-[200%] opacity-0' : '-translate-y-1/2 opacity-100'}`}
              >
                {searchSuggestions[currentSuggestionIndex]}
              </div>
            )}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`w-full pl-10 pr-4 py-2 focus:outline-none bg-transparent text-black
                ${isFocused ? 'caret-blue-500 animate-caret' : ''}`}
            />
          </div>

          {/* Search Button */}
          <button 
            type="submit"
            className="px-6 py-2 bg-blue-400 text-white font-medium hover:bg-blue-500 transition-colors rounded-md cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProperties
                  .filter(property => property.type !== 'Plot') // Filter out plots for regular properties
                  .slice(0, visibleProperties)
                  .map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
              </div>

          {/* Load More Button */}
          <div className="text-center mt-6">
            <button 
              onClick={handleLoadMore}
              className="px-12 py-4 bg-[#333333] text-white rounded-3xl hover:bg-transparent hover:border-[#333333] hover:border-2 hover:text-[#333333] transition-all text-sm"
            >
              Load More
            </button>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProperties
              .filter(property => property.type === 'Plot') // Only show plots
              .slice(0, visibleLandProperties)
              .map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
          </div>

          {/* Load More Button for Lands */}
          <div className="text-center mt-6">
            <button 
              onClick={handleLoadMoreLands}
              className="px-12 py-4 bg-[#333333] text-white rounded-3xl hover:bg-transparent hover:border-[#333333] hover:border-2 hover:text-[#333333] transition-all text-sm"
            >
              Load More
            </button>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-gray-800" />
            <h2 className="text-4xl font-bold text-black">Let's make it happen!</h2>
            <Sparkles className="h-6 w-6 text-gray-800" />
          </div>
          <p className="text-gray-600 mb-12">
            Ready to take the first step toward your dream property? Fill out the form below, and our real estate wizards will work their magic to find your perfect match. Don't wait; let's embark on this exciting journey together.
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





















