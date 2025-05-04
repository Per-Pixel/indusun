'use client';

import Link from 'next/link';
import { Bed, Bath, Clock, MapPin, Heart } from 'lucide-react';
import { Property } from '@/types/property';
import { formatTimeAgo } from '@/utils/dateUtils';
import { useState } from 'react';

interface PropertyCardDesktopProps {
  property: Property & {
    views?: number;
    listedDate: string;
    featured?: boolean;
  };
  onFavoriteToggle?: (propertyId: number) => void;
}

export const PropertyCardDesktop = ({ property, onFavoriteToggle }: PropertyCardDesktopProps) => {
  const isHighlyViewed = property.views && property.views > 1000;
  // Only show featured tag if property is featured AND not highly viewed
  const showFeatured = property.featured && !isHighlyViewed;
  const hasTags = showFeatured || isHighlyViewed;
  
  // Local state for favorite status
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Handle favorite button click
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to property detail
    e.stopPropagation(); // Stop event propagation
    
    setIsFavorite(!isFavorite);
    
    // Call the parent component's handler if provided
    if (onFavoriteToggle) {
      onFavoriteToggle(property.id);
    }
  };

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="relative overflow-hidden group cursor-pointer bg-white rounded-lg transition-transform hover:scale-[1.02] duration-300">
        {/* Property Image */}
        <div className="relative overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-48 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105 rounded-lg"
          />
          
          {/* Tags Container - Only render if there are tags */}
          {hasTags && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {showFeatured && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  Featured
                </span>
              )}
              {isHighlyViewed && (
                <span className="bg-[#00C951] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  Most Viewed
                </span>
              )}
            </div>
          )}

          {/* Heart Button */}
          <button 
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white"
            onClick={handleFavoriteClick}
          >
            <Heart 
              className={`h-4 w-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
              strokeWidth={1.5}
            />
          </button>
        </div>

        {/* Property Details */}
        <div className="p-4">
          {/* Title and Price Row */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-base font-medium text-green-500 truncate text-left">
                {property.title}
              </h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="h-3.5 w-3.5 text-amber-500 mr-1 flex-shrink-0" />
                <span className="truncate">{property.location}</span>
              </div>
            </div>
            
            {/* Price and Time */}
            <div className="flex flex-col items-end">
              <div className="text-blue-600 font-medium text-base">
                {property.price}
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Clock className="h-3.5 w-3.5 text-gray-400 mr-1" />
                <span>{formatTimeAgo(property.listedDate)}</span>
              </div>
            </div>
          </div>

          {/* Property Features - Horizontal layout with B4AFAF background */}
          <div className="flex justify-center gap-4 mt-4">
            {property.beds && (
              <div className="flex items-center bg-[#B4AFAF] text-white rounded-2xl px-6 py-1.5">
                <Bed className="h-4 w-4 text-white mr-1.5" />
                <span className="font-medium">{property.beds} Bedroom</span>
              </div>
            )}
            {property.baths && (
              <div className="flex items-center bg-[#B4AFAF] text-white rounded-2xl px-6 py-1.5">
                <Bath className="h-4 w-4 text-white mr-1.5" />
                <span className="font-medium">{property.baths} Bathroom</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};




