'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Search, Bed, Bath } from 'lucide-react';
import Image from 'next/image';

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
const mockProperties: Property[] = [
  {
    id: 1,
    title: 'Modern Villa with Garden',
    type: 'Villa',
    location: 'Whitefield, Bangalore',
    price: '₹1.2 Cr',
    priceNumeric: 12000000,
    beds: 3,
    baths: 2,
    area: '2100 sq ft',
    areaNumeric: 2100,
    featured: true,
    new: false,
    description: 'Beautiful modern villa with spacious garden and premium amenities.',
    amenities: ['Swimming Pool', 'Garden', 'Security', 'Parking', 'Gym'],
    postedDate: '2 days ago'
  },
  {
    id: 2,
    title: 'Luxury Apartment',
    type: 'Apartment',
    location: 'Indiranagar, Bangalore',
    price: '₹85 Lac',
    priceNumeric: 8500000,
    beds: 2,
    baths: 2,
    area: '1200 sq ft',
    areaNumeric: 1200,
    featured: true,
    new: true,
    description: 'Premium apartment with modern amenities in a prime location.',
    amenities: ['24/7 Security', 'Parking', 'Gym', 'Club House'],
    postedDate: '1 week ago'
  },
  {
    id: 3,
    title: 'Premium House',
    type: 'House',
    location: 'HSR Layout, Bangalore',
    price: '₹1.5 Cr',
    priceNumeric: 15000000,
    beds: 4,
    baths: 3,
    area: '2800 sq ft',
    areaNumeric: 2800,
    featured: false,
    new: false,
    description: 'Spacious house with modern design and premium finishes.',
    amenities: ['Garden', 'Parking', 'Security'],
    postedDate: '3 days ago'
  },
  {
    id: 4,
    title: 'Commercial Space',
    type: 'Commercial',
    location: 'MG Road, Bangalore',
    price: '₹2.5 Cr',
    priceNumeric: 25000000,
    area: '3500 sq ft',
    areaNumeric: 3500,
    featured: false,
    new: true,
    description: 'Prime commercial space suitable for office or retail.',
    amenities: ['24/7 Access', 'Parking', 'Security', 'Power Backup'],
    postedDate: '1 day ago'
  },
  {
    id: 5,
    title: 'Residential Plot',
    type: 'Plot',
    location: 'Electronic City, Bangalore',
    price: '₹70 Lac',
    priceNumeric: 7000000,
    area: '1800 sq ft',
    areaNumeric: 1800,
    featured: false,
    new: false,
    description: 'BMRDA approved residential plot in a gated community.',
    amenities: ['Gated Community', 'Park', 'Water Supply'],
    postedDate: '2 weeks ago'
  },
  {
    id: 6,
    title: 'Penthouse Apartment',
    type: 'Apartment',
    location: 'Koramangala, Bangalore',
    price: '₹2.8 Cr',
    priceNumeric: 28000000,
    beds: 4,
    baths: 4,
    area: '3200 sq ft',
    areaNumeric: 3200,
    featured: true,
    new: false,
    description: 'Luxurious penthouse with panoramic city views and premium amenities.',
    amenities: ['Terrace Garden', 'Private Elevator', 'Swimming Pool', 'Gym', 'Spa'],
    postedDate: '5 days ago'
  },
  {
    id: 7,
    title: 'Budget Apartment',
    type: 'Apartment',
    location: 'Marathahalli, Bangalore',
    price: '₹45 Lac',
    priceNumeric: 4500000,
    beds: 1,
    baths: 1,
    area: '650 sq ft',
    areaNumeric: 650,
    featured: false,
    new: true,
    description: 'Affordable apartment perfect for first-time buyers or investors.',
    amenities: ['Security', 'Parking', 'Park'],
    postedDate: '1 week ago'
  },
  {
    id: 8,
    title: 'Luxury Villa',
    type: 'Villa',
    location: 'Sarjapur Road, Bangalore',
    price: '₹3.5 Cr',
    priceNumeric: 35000000,
    beds: 5,
    baths: 5,
    area: '4500 sq ft',
    areaNumeric: 4500,
    featured: true,
    new: false,
    description: 'Exquisite villa with premium finishes and extensive landscaped garden.',
    amenities: ['Private Pool', 'Garden', 'Home Theater', 'Smart Home', 'Security'],
    postedDate: '3 days ago'
  },
  {
    id: 9,
    title: 'Office Space',
    type: 'Commercial',
    location: 'Whitefield, Bangalore',
    price: '₹1.8 Cr',
    priceNumeric: 18000000,
    area: '2200 sq ft',
    areaNumeric: 2200,
    featured: false,
    new: false,
    description: 'Ready-to-move office space in a premium business park.',
    amenities: ['24/7 Access', 'Conference Room', 'Cafeteria', 'Parking'],
    postedDate: '1 month ago'
  },
  {
    id: 10,
    title: 'Farm House',
    type: 'House',
    location: 'Kanakapura Road, Bangalore',
    price: '₹4.2 Cr',
    priceNumeric: 42000000,
    beds: 4,
    baths: 4,
    area: '10000 sq ft',
    areaNumeric: 10000,
    featured: true,
    new: true,
    description: 'Spacious farm house with organic garden and modern amenities.',
    amenities: ['Swimming Pool', 'Organic Garden', 'Guest House', 'Parking'],
    postedDate: '2 days ago'
  },
  {
    id: 11,
    title: 'Premium Apartment',
    type: 'Apartment',
    location: 'JP Nagar, Bangalore',
    price: '₹95 Lac',
    priceNumeric: 9500000,
    beds: 3,
    baths: 2,
    area: '1500 sq ft',
    areaNumeric: 1500,
    featured: false,
    new: false,
    description: 'Well-designed apartment with modern amenities in a prime location.',
    amenities: ['Swimming Pool', 'Gym', 'Club House', 'Children\'s Play Area'],
    postedDate: '1 week ago'
  },
  {
    id: 12,
    title: 'Commercial Plot',
    type: 'Plot',
    location: 'Hebbal, Bangalore',
    price: '₹3.2 Cr',
    priceNumeric: 32000000,
    area: '5000 sq ft',
    areaNumeric: 5000,
    featured: false,
    new: false,
    description: 'Prime commercial plot suitable for retail or office development.',
    amenities: ['Main Road Access', 'Commercial Zone', 'All Utilities'],
    postedDate: '2 weeks ago'
  }
];

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

const PropertiesPage = () => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]); // 0 to 5 Cr
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'area-asc' | 'area-desc' | 'newest'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimatingOut(true);
      setTimeout(() => {
        setCurrentSuggestionIndex((prev) => (prev + 1) % searchSuggestions.length);
        setIsAnimatingOut(false);
      }, 800); // Increased duration for smoother transition
    }, 4000); // Increased interval to give more time to read

    return () => clearInterval(interval);
  }, []);

  // State for filtered and paginated properties
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties);
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 6;

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
      <section className="relative h-[600px]">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop"
          alt="Hero Image"
          fill
          priority
          className="object-cover"
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
            <button className="border-2 border-white text-white px-6 py-2 rounded-full hover:bg-white hover:text-blue-600 transition-colors">
              LET US GUIDE YOUR HOME
            </button>
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
        <div className="flex p-2 items-center gap-2">
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
            {!searchTerm && (
              <div 
                className={`absolute left-10 top-1/2 pointer-events-none text-gray-400 text-sm
                  transition-all duration-1000 ease-in-out
                  ${isAnimatingOut 
                    ? 'translate-y-[200%] opacity-0' 
                    : '-translate-y-1/2 opacity-100'}`}
              >
                {searchSuggestions[currentSuggestionIndex]}
              </div>
            )}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder=""
            />
          </div>

          {/* Search Button */}
          <button 
            className="px-6 py-2 bg-blue-400 text-white font-medium hover:bg-blue-500 transition-colors rounded-md"
            onClick={() => {/* handle search */}}
          >
            Search
          </button>
        </div>
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
            {[
              { id: 1, image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=1470&auto=format&fit=crop", price: "$499", name: "Harmony House", location: "16558 Romaguera Inlet", bedrooms: 2, bathrooms: 2 },
              { id: 2, image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1470&auto=format&fit=crop", price: "$699", name: "Blissful Abode", location: "51066 Luettgen Mission", bedrooms: 4, bathrooms: 3 },
              { id: 3, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop", price: "$899", name: "Enchanted Villa", location: "33925 Trantow Creek", bedrooms: 6, bathrooms: 4 },
              { id: 4, image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1470&auto=format&fit=crop", price: "$499", name: "Harmony House", location: "16558 Romaguera Inlet", bedrooms: 2, bathrooms: 2 },
              { id: 5, image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=1470&auto=format&fit=crop", price: "$699", name: "Blissful Abode", location: "51066 Luettgen Mission", bedrooms: 4, bathrooms: 3 },
              { id: 6, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1470&auto=format&fit=crop", price: "$899", name: "Enchanted Villa", location: "33925 Trantow Creek", bedrooms: 6, bathrooms: 4 },
            ].map((property) => (
              <div key={property.id} className="relative overflow-hidden">
                {/* Property Image */}
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={property.image}
                    alt="Property"
                    className="w-full h-64 object-cover"
                  />
                  <button className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  {/* Plus Button */}
                  <button className="absolute bottom-2 right-2 p-3 bg-blue-500 rounded-lg shadow-sm hover:bg-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>

                {/* Price and Details - Left aligned */}
                <div className="mt-4 text-left">
                  <span className="text-gray-900 font-medium">{property.price}</span>
                  <h3 className="text-xl font-medium text-green-500">{property.name}</h3>
                  <div className="flex items-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {property.location}
                  </div>

                  {/* Property Features Boxes - Centered */}
                  <div className="flex justify-center gap-12 mt-4">
                    <div className="flex items-center px-12 py-2 bg-[#E5E5E5] rounded-full">
                      <Bed className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-black">{property.bedrooms} Bedrooms</span>
                    </div>
                    <div className="flex items-center px-12 py-2 bg-[#E5E5E5] rounded-full">
                      <Bath className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-black">{property.bathrooms} Bathrooms</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-6">
            <button className="px-12 py-4 bg-[#333333] text-white rounded-3xl hover:bg-transparent hover:border-[#333333] hover:border-2 hover:text-[#333333] transition-all text-sm">
              Load More
            </button>
          </div>
        </div>
      </section>

      {/* Featured Lands Properties Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-1">Featured Lands Properties</h2>
          <p className="text-gray-600 mb-6 text-sm">Discover Your Dreams Today</p>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 1, image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1632&auto=format&fit=crop", price: "$299", name: "Sarjapur Land", location: "Sarjapur, Bangalore", area: "1200 sqft" },
              { id: 2, image: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?q=80&w=1470&auto=format&fit=crop", price: "$399", name: "Whitefield Plot", location: "Whitefield, Bangalore", area: "1800 sqft" },
              { id: 3, image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1632&auto=format&fit=crop", price: "$299", name: "Sarjapur Land", location: "Sarjapur, Bangalore", area: "1200 sqft" },
              { id: 4, image: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?q=80&w=1470&auto=format&fit=crop", price: "$399", name: "Whitefield Plot", location: "Whitefield, Bangalore", area: "1800 sqft" },
            ].map((property) => (
              <div key={property.id} className="relative overflow-hidden">
                {/* Property Image */}
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={property.image}
                    alt="Land Property"
                    className="w-full h-64 object-cover"
                  />
                  <button className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  {/* Plus Button */}
                  <button className="absolute bottom-2 right-2 p-3 bg-blue-500 rounded-lg shadow-sm hover:bg-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>

                {/* Price */}
                <div className="mt-2">
                  <span className="text-gray-900 font-medium">{property.price}</span>
                </div>

                {/* Property Details */}
                <div>
                  <h3 className="text-xl font-medium text-green-500">{property.name}</h3>
                  <div className="flex items-center text-gray-500 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{property.location}</span>
                  </div>

                  {/* Property Features */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-center bg-gray-200 rounded-full py-2 px-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>{property.area}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-6">
            <button className="px-12 py-4 bg-[#333333] text-white rounded-3xl hover:bg-transparent hover:border-[#333333] hover:border-2 hover:text-[#333333] transition-all text-sm">
              Load More
            </button>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-8 bg-pink-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Let's make it happen!</h2>
            <p className="text-gray-600 text-sm mb-6 text-center">Fill out the form below and our team will get back to you as soon as possible</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column - Form */}
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    className="w-full p-2 border border-pink-200 rounded-md focus:outline-none bg-white text-sm"
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    className="w-full p-2 border border-pink-200 rounded-md focus:outline-none bg-white text-sm"
                    placeholder="Last Name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="email"
                    className="w-full p-2 border border-pink-200 rounded-md focus:outline-none bg-white text-sm"
                    placeholder="Email Address"
                  />
                  <input
                    type="tel"
                    className="w-full p-2 border border-pink-200 rounded-md focus:outline-none bg-white text-sm"
                    placeholder="Phone Number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select className="w-full p-2 border border-pink-200 rounded-md focus:outline-none bg-white text-sm">
                    <option>Contact Method</option>
                    <option>Email</option>
                    <option>Phone</option>
                  </select>
                  <select className="w-full p-2 border border-pink-200 rounded-md focus:outline-none bg-white text-sm">
                    <option>Property Type</option>
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Land</option>
                  </select>
                </div>

                <textarea
                  className="w-full p-2 border border-pink-200 rounded-md focus:outline-none bg-white h-24 text-sm"
                  placeholder="Message"
                ></textarea>

                <button className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 transition-colors text-sm">
                  Send Message
                </button>
              </div>

              {/* Right Column - Contact Info */}
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  className="w-full p-2 border border-pink-200 rounded-md focus:outline-none bg-white text-sm"
                  placeholder="Address"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    className="w-full p-2 border border-pink-200 rounded-md focus:outline-none bg-white text-sm"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    className="w-full p-2 border border-pink-200 rounded-md focus:outline-none bg-white text-sm"
                    placeholder="State"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    className="w-full p-2 border border-pink-200 rounded-md focus:outline-none bg-white text-sm"
                    placeholder="Zip Code"
                  />
                  <input
                    type="text"
                    className="w-full p-2 border border-pink-200 rounded-md focus:outline-none bg-white text-sm"
                    placeholder="Country"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-2 pl-8 border border-pink-200 rounded-md focus:outline-none bg-white text-sm"
                    placeholder="Search for location"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-2 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="h-32 bg-gray-200 rounded-md"></div>
              </div>
            </div>
          </div>
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
`}</style>

















