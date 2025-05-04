'use client';

import Link from 'next/link';
import { Bed, Bath, Clock, MapPin } from 'lucide-react';
import { Property } from '@/types/property';
import { formatTimeAgo } from '@/utils/dateUtils';

interface PropertyCardProps {
  property: Property & {
    views?: number;
    listedDate: string;
    featured?: boolean;
  };
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const isHighlyViewed = property.views && property.views > 1000;
  // Only show featured tag if property is featured AND not highly viewed
  const showFeatured = property.featured && !isHighlyViewed;
  const hasTags = showFeatured || isHighlyViewed;

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="relative overflow-hidden group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
        {/* Property Image */}
        <div className="relative overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-40 sm:h-48 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
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
          <button className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Property Details - More compact for mobile */}
        <div className="p-2 sm:p-3">
          <h3 className="text-sm sm:text-base font-medium text-green-500 truncate">{property.title}</h3>
          <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
            <MapPin className="h-3 w-3 text-amber-500 mr-1 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
          
          {/* Price */}
          <div className="text-blue-600 font-medium text-sm sm:text-base mb-1 sm:mb-2">
            {property.price}
          </div>

          {/* Property Features - Compact Row */}
          <div className="flex items-center justify-between text-xs">
            {property.beds && (
              <div className="flex items-center">
                <Bed className="h-3 w-3 text-gray-500 mr-0.5" />
                <span className="text-gray-700">{property.beds}</span>
              </div>
            )}
            {property.baths && (
              <div className="flex items-center">
                <Bath className="h-3 w-3 text-gray-500 mr-0.5" />
                <span className="text-gray-700">{property.baths}</span>
              </div>
            )}
            <div className="flex items-center">
              <Clock className="h-3 w-3 text-gray-500 mr-0.5" />
              <span className="text-gray-700 text-[10px] sm:text-xs">{formatTimeAgo(property.listedDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};













