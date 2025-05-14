'use client';

import Link from 'next/link';
import { Bed, Bath, Clock, MapPin, Heart } from 'lucide-react';
import { Property } from '@/types/property';
import { formatTimeAgo } from '@/utils/dateUtils';
import { useState } from 'react';

interface PropertyCardProps {
  property: Property & {
    views?: number;
    listedDate: string;
    featured?: boolean;
  };
  onFavoriteToggle?: (propertyId: number) => void;
  initialFavorite?: boolean;
  hideHeart?: boolean;
}

export const PropertyCard = ({ 
  property, 
  onFavoriteToggle, 
  initialFavorite = false,
  hideHeart = false 
}: PropertyCardProps) => {
  const isHighlyViewed = property.views && property.views > 1000;
  // Only show featured tag if property is featured AND not highly viewed
  const showFeatured = property.featured && !isHighlyViewed;
  const hasTags = showFeatured || isHighlyViewed;
  
  // Local state for favorite status
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  
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
      <div className="relative overflow-hidden group cursor-pointer bg-white rounded-lg hover:shadow-sm transition-shadow">
        {/* Property Image */}
        <div className="relative overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-40 sm:h-48 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105 rounded-lg"
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

          {/* Heart Button - Only show if not hidden */}
          {!hideHeart && (
            <button 
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white"
              onClick={handleFavoriteClick}
            >
              <Heart 
                className={`h-4 w-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
                strokeWidth={1.5}
              />
            </button>
          )}
        </div>

        {/* Property Details - More compact for mobile, different for desktop */}
        <div className="p-2 sm:p-3">
          {/* Title and Price Row - Flex container for desktop */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div className="flex-1">
              <h3 className="text-sm sm:text-base font-medium text-green-500 truncate text-left">
                {property.title}
              </h3>
              <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1 text-left">
                <MapPin className="h-3 w-3 text-amber-500 mr-1 flex-shrink-0" />
                <span className="truncate">{property.location}</span>
              </div>
            </div>
            
            {/* Price - Right aligned on all screen sizes */}
            <div className="text-blue-600 font-medium text-sm sm:text-base mb-1 sm:mb-2 text-right self-end">
              {property.price}
            </div>
          </div>

          {/* Property Features - Centered on desktop with labels */}
          <div className="flex items-center justify-between text-xs md:justify-center md:gap-8 md:mt-2">
            {property.beds && (
              <div className="flex items-center md:flex-col md:items-center md:border md:border-gray-200 md:rounded-md md:px-3 md:py-1.5">
                <Bed className="h-3 w-3 text-gray-500 mr-0.5 md:h-4 md:w-4 md:mb-1" />
                <span className="text-gray-700 md:font-medium">{property.beds}</span>
                <span className="hidden md:block text-[10px] text-gray-500">Bedroom</span>
              </div>
            )}
            {property.baths && (
              <div className="flex items-center md:flex-col md:items-center md:border md:border-gray-200 md:rounded-md md:px-3 md:py-1.5">
                <Bath className="h-3 w-3 text-gray-500 mr-0.5 md:h-4 md:w-4 md:mb-1" />
                <span className="text-gray-700 md:font-medium">{property.baths}</span>
                <span className="hidden md:block text-[10px] text-gray-500">Bathroom</span>
              </div>
            )}
            <div className="flex items-center md:hidden">
              <Clock className="h-3 w-3 text-gray-500 mr-0.5" />
              <span className="text-gray-700 text-[10px] sm:text-xs">{formatTimeAgo(property.listedDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};


















