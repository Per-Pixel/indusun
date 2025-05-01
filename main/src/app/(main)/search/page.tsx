'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, X, MapPin, Building, Home, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Recent searches (would be stored in localStorage in a real app)
const recentSearches = [
  "2 BHK in Mumbai",
  "Villa in Pune",
  "Commercial space in Delhi",
  "Apartment near metro"
];

// Popular searches
const popularSearches = [
  "Apartments in Mumbai",
  "Villas in Bangalore",
  "Plots in Hyderabad",
  "Commercial in Delhi NCR",
  "Flats in Pune",
  "Houses in Chennai"
];

// Property types
const propertyTypes = [
  { name: "Apartment", icon: <Building size={20} /> },
  { name: "House", icon: <Home size={20} /> },
  { name: "Villa", icon: <Home size={20} /> },
  { name: "Plot", icon: <MapPin size={20} /> },
  { name: "Commercial", icon: <Building size={20} /> },
  { name: "PG/Co-living", icon: <Building size={20} /> }
];

// Popular locations
const popularLocations = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad"
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/properties/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Clear search input
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Handle clicking on a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/properties/search?q=${encodeURIComponent(suggestion)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Search Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center">
              <SearchIcon className="absolute left-3 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder="Search for properties, locations..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button 
                  type="button" 
                  onClick={clearSearch}
                  className="absolute right-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            <button 
              type="submit"
              className="mt-3 w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Search Properties
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Recent Searches */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Recent Searches</h2>
            <button className="text-blue-500 text-sm">Clear All</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(search)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm flex items-center gap-2 hover:bg-gray-50"
              >
                <SearchIcon size={14} className="text-gray-400" />
                {search}
              </button>
            ))}
          </div>
        </div>

        {/* Property Types */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Property Types</h2>
          <div className="grid grid-cols-3 gap-3">
            {propertyTypes.map((type, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(type.name)}
                className="p-4 bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
              >
                <div className="p-2 bg-blue-50 rounded-full text-blue-500">
                  {type.icon}
                </div>
                <span className="text-sm font-medium">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Locations */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Popular Locations</h2>
          <div className="grid grid-cols-2 gap-3">
            {popularLocations.map((location, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(location)}
                className="p-3 bg-white border border-gray-200 rounded-lg flex justify-between items-center hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-sm">{location}</span>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Popular Searches */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Popular Searches</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {popularSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(search)}
                className={`w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 ${
                  index < popularSearches.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <SearchIcon size={16} className="text-gray-400" />
                  <span>{search}</span>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
