'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Share2, Filter, ChevronDown, X } from 'lucide-react';
import Link from 'next/link';
import { mockProperties } from '../properties/mockData';
import { Property } from '../properties/types';
import { PropertyCard } from '../properties/components/PropertyCard';

export default function FavoritesPage() {
  // In a real app, this would come from a database or localStorage
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [propertyType, setPropertyType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest');

  // Simulate loading favorites
  useEffect(() => {
    // In a real app, this would fetch from an API or localStorage
    // For demo, we'll just use some random properties from mockData
    const randomFavorites = [...mockProperties]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
    
    setTimeout(() => {
      setFavorites(randomFavorites);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Apply filters
  const filteredFavorites = favorites.filter(property => {
    if (propertyType === 'all') return true;
    return property.type === propertyType;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.priceNumeric - b.priceNumeric;
    if (sortBy === 'price-desc') return b.priceNumeric - a.priceNumeric;
    return 0; // newest (default order)
  });

  // Remove from favorites
  const removeFromFavorites = (id: number) => {
    setFavorites(favorites.filter(property => property.id !== id));
  };

  // Clear all favorites
  const clearAllFavorites = () => {
    setFavorites([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-black">My Favorites</h1>
            {favorites.length > 0 && (
              <button 
                onClick={clearAllFavorites}
                className="text-red-500 flex items-center gap-1 text-sm"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Shortlists heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black">Shortlists</h2>
          <p className="text-black mt-1">Find all your shortlists at one place...</p>
        </div>

        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Heart size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-black mb-2">No favorites yet</h2>
            <p className="text-black mb-6 max-w-md">
              Start adding properties to your favorites list by clicking the heart icon on properties you like.
            </p>
            <Link 
              href="/properties" 
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          // Favorites list
          <>
            {/* Filters */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-black">
                  {filteredFavorites.length} {filteredFavorites.length === 1 ? 'property' : 'properties'}
                </p>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1 text-black text-sm font-medium"
                >
                  <Filter size={16} />
                  Filter & Sort
                  <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Filter options */}
              {showFilters && (
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Property Type</label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="all" className="text-black">All Types</option>
                      <option value="apartment" className="text-black">Apartment</option>
                      <option value="house" className="text-black">House</option>
                      <option value="villa" className="text-black">Villa</option>
                      <option value="Plot" className="text-black">Plot</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="newest" className="text-black">Newest</option>
                      <option value="price-asc" className="text-black">Price: Low to High</option>
                      <option value="price-desc" className="text-black">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Properties grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {filteredFavorites.map((property) => (
                <div key={property.id} className="relative">
                  <PropertyCard property={property} />
                  <button
                    onClick={() => removeFromFavorites(property.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  >
                    <Heart size={18} className="text-red-500 fill-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}



