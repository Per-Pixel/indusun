'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, MapPin, Building, Home, ArrowRight, ChevronDown, Bed, Bath, Square, Mail, Sparkles, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PropertyCard } from '../properties/components/PropertyCard';
import { DesktopSearchForm } from '../components/DesktopSearchForm';
import { MobileSearchForm } from '../components/MobileSearchForm';

// Property types with icons and counts
const propertyTypes = [
  { name: "Residential", icon: <Home size={24} />, count: "245 Properties", bgColor: "bg-red-50" },
  { name: "Vacation Home", icon: <Home size={24} />, count: "145 Properties", bgColor: "bg-blue-50" },
  { name: "Apartment", icon: <Building size={24} />, count: "378 Properties", bgColor: "bg-pink-50" },
  { name: "Warehouse", icon: <Building size={24} />, count: "52 Properties", bgColor: "bg-yellow-50" },
  { name: "Land", icon: <MapPin size={24} />, count: "112 Properties", bgColor: "bg-green-50" },
  { name: "Office", icon: <Building size={24} />, count: "89 Properties", bgColor: "bg-purple-50" }
];

// Popular locations
const popularLocations = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune"
];

// Mock properties data
const recentProperties = [
  {
    id: 1,
    title: "Modern Apartment with Ocean View",
    location: "Mumbai, Maharashtra",
    price: "₹1.2 Cr",
    beds: 3,
    baths: 2,
    area: "1,200 sq ft",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1973&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Luxury Villa in Gated Community",
    location: "Bangalore, Karnataka",
    price: "₹3.5 Cr",
    beds: 4,
    baths: 3,
    area: "2,500 sq ft",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1973&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Spacious Family Home with Garden",
    location: "Delhi, NCR",
    price: "₹2.8 Cr",
    beds: 5,
    baths: 4,
    area: "3,200 sq ft",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1973&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Cozy Studio Apartment",
    location: "Pune, Maharashtra",
    price: "₹65 Lac",
    beds: 1,
    baths: 1,
    area: "650 sq ft",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1973&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "Penthouse with Rooftop Terrace",
    location: "Hyderabad, Telangana",
    price: "₹4.2 Cr",
    beds: 4,
    baths: 3,
    area: "3,000 sq ft",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1973&auto=format&fit=crop"
  },
  {
    id: 6,
    title: "Commercial Space in Business District",
    location: "Chennai, Tamil Nadu",
    price: "₹1.8 Cr",
    beds: null,
    baths: 2,
    area: "1,800 sq ft",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1973&auto=format&fit=crop"
  }
];

// Articles data
const articles = [
  {
    id: 1,
    title: "Top 10 Tips for First-Time Home Buyers",
    excerpt: "Navigating the real estate market for the first time can be overwhelming...",
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1973&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Investment Properties: What to Look For",
    excerpt: "Investing in real estate can be a lucrative opportunity if you know what to look for...",
    image: "https://images.unsplash.com/photo-1626178793926-22b28830aa30?q=80&w=1973&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "How to Stage Your Home for a Quick Sale",
    excerpt: "Properly staging your home can significantly increase its appeal to potential buyers...",
    image: "https://images.unsplash.com/photo-1560440021-33f9b867899d?q=80&w=1973&auto=format&fit=crop"
  }
];

// Search suggestions
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

// Animation variants for dropdown
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

// Function to get reliable location images
const getLocationImage = (index: number): string => {
  // Array of verified working Unsplash image IDs for locations
  const locationImageIds = [
    "1582407947304-fd86f028f716", // Mumbai
    "1600585154340-be6161a56a0c", // Delhi
    "1564013799919-ab600027ffc6", // Bangalore
    "1600607687939-ce8a6c25118c", // Hyderabad
    "1512917774080-9991f1c4c750", // Chennai
    "1600047509807-ba8f99d2cdde"  // Pune
  ];

  // Use the index to get an image, or fallback to the first one if index is out of bounds
  const imageId = locationImageIds[index] || locationImageIds[0];
  return `https://images.unsplash.com/photo-${imageId}?q=80&w=1973&auto=format&fit=crop`;
};

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [location, setLocation] = useState('All India');
  const [priceRange, setPriceRange] = useState('Budget - Maximum');
  const [activeTab, setActiveTab] = useState('Buy');
  const router = useRouter();
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [visibleProperties, setVisibleProperties] = useState(3);

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
  }, [isFocused]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (searchTerm) params.append('q', searchTerm);
    if (propertyType !== 'all') params.append('type', propertyType);
    if (location !== 'All India') params.append('location', location);
    if (priceRange !== 'Budget - Maximum') params.append('price', priceRange);
    params.append('purpose', activeTab.toLowerCase());

    router.push(`/properties/search?${params.toString()}`);
  };

  // Handle search from components
  const handleComponentSearch = (query: string, type: string) => {
    setSearchTerm(query);
    setPropertyType(type);
    
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (type !== 'all') params.append('type', type);
    if (location !== 'All India') params.append('location', location);
    if (priceRange !== 'Budget - Maximum') params.append('price', priceRange);
    params.append('purpose', activeTab.toLowerCase());

    router.push(`/properties/search?${params.toString()}`);
  };

  // Load more properties
  const handleLoadMore = () => {
    setVisibleProperties(prev => prev + 3);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[500px]">
        <Image
          src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1973&auto=format&fit=crop"
          alt="Real Estate Hero"
          fill
          priority
          className="object-cover rounded-bl-[30px] rounded-br-[30px]"
        />

        <div className="absolute inset-0 bg-blue-500/30 rounded-bl-[30px] rounded-br-[30px]"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-3xl">
            Find perfect home with real estate property
          </h1>
          <p className="text-white text-lg mb-8 max-w-2xl">
            Welcome to our real estate website, where we aim to provide you with the best possible experience in buying or selling your property.
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div className="relative z-10 max-w-3xl mx-auto -mt-[-8px] px-4">
        {/* Mobile Search Form */}
        <div className="md:hidden">
          <MobileSearchForm 
            onSearch={(query, type, tab) => {
              setSearchTerm(query);
              setPropertyType(type);
              setActiveTab(tab);
              handleComponentSearch(query, type);
            }}
          />
        </div>

        {/* Desktop Search Form */}
        <div className="hidden md:block">
          <DesktopSearchForm 
            onSearch={handleComponentSearch}
            initialPropertyType={propertyType}
            initialSearchTerm={searchTerm}
          />
        </div>
      </div>

      {/* Property Categories Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center text-black">Take right home, anytime</h2>
          <p className="text-gray-600 mb-10 text-center max-w-2xl mx-auto">
            With this feature, you can easily filter your search by selecting a specific category that matches your interests.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {propertyTypes.map((type, index) => (
              <div
                key={index}
                className={`${type.bgColor} hover:bg-opacity-80 transition-colors p-6 rounded-lg flex flex-col items-center text-center cursor-pointer`}
                onClick={() => router.push(`/properties/search?type=${type.name}`)}
              >
                <div className="p-3 bg-white rounded-full mb-3 text-black">
                  {type.icon}
                </div>
                <h3 className="font-medium mb-1 text-black">{type.name}</h3>
                <p className="text-sm text-gray-500">{type.count}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <motion.button
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              View More
            </motion.button>
          </div>
        </div>
      </div>

      {/* Recent Properties Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-black">Recent Properties</h2>
          <p className="text-gray-600 mb-8">
            Explore our latest properties added to our platform
          </p>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {recentProperties.slice(0, visibleProperties).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {recentProperties.length > visibleProperties && (
            <div className="text-center mt-6">
              <motion.button
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                onClick={handleLoadMore}
                className="px-8 py-3 bg-[#333333] text-white rounded-3xl hover:bg-transparent hover:border-[#333333] hover:border-2 hover:text-[#333333] transition-all text-sm"
              >
                Load More
              </motion.button>
            </div>
          )}
        </div>
      </section>

      {/* Popular Regions Section */}
      <div className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-black">Popular regions in India</h2>
          <p className="text-gray-600 mb-10">
            Explore the most sought-after regions in India, including the most vibrant cities and neighborhoods.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularLocations.slice(0, 3).map((location, index) => (
              <div
                key={index}
                className="relative h-64 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => router.push(`/properties/search?location=${location}`)}
              >
                <Image
                  src={getLocationImage(index)}
                  alt={location}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{location}</h3>
                  <p className="text-white/80 text-sm">
                    {Math.floor(Math.random() * 500) + 100} Properties
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center text-black">How does it work</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon size={24} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">Search for properties</h3>
              <p className="text-gray-600">
                Browse through our extensive collection of properties across India.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building size={24} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">Find your perfect match</h3>
              <p className="text-gray-600">
                Use our advanced filters to narrow down properties that match your requirements.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home size={24} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">Make it your home</h3>
              <p className="text-gray-600">
                Contact the seller or agent directly and proceed with your purchase.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Section */}
      <div className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-black">Articles for property sharing</h2>
            <Link href="/articles" className="text-blue-500 hover:text-blue-600 flex items-center">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-black">{article.title}</h3>
                  <p className="text-gray-500 text-sm">{article.excerpt}</p>
                  <Link href={`/articles/${article.id}`} className="mt-4 inline-block text-blue-500 hover:text-blue-600">
                    Read more
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="py-16 px-4 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Subscribe for daily updates</h2>
                <p className="text-white/80">
                  Get the latest properties and real estate news delivered to your inbox
                </p>
              </div>
              
              <form className="w-full md:w-auto">
                <div className="flex flex-col md:flex-row gap-3">
                  <div>
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/20 text-white placeholder:text-white/60 md:w-64"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

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
}











