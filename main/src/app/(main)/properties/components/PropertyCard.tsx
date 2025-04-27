'use client';

import Link from 'next/link';
import { Bed, Bath, Clock } from 'lucide-react';
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
      <div className="relative overflow-hidden group cursor-pointer">
        {/* Property Image */}
        <div className="relative rounded-lg overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Tags Container - Only render if there are tags */}
          {hasTags && (
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {showFeatured && (
                <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                  Featured
                </span>
              )}
              {isHighlyViewed && (
                <span className="bg-[#00C951] text-white text-xs px-3 py-1 rounded-full font-medium">
                  Most Viewed
                </span>
              )}
            </div>
          )}

          {/* Heart Button */}
          <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Price and Details */}
        <div className="mt-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <h3 className="text-xl font-medium text-green-500">{property.title}</h3>
              <div className="flex items-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {property.location}
              </div>
            </div>
            <span className="text-blue-600 font-medium text-xl md:text-2xl md:text-right mt-2 md:mt-0">
              {property.price}
            </span>
          </div>

          {/* Listed Time */}
          <div className="flex items-center justify-end mt-4 mb-3 text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>Listed {formatTimeAgo(property.listedDate)}</span>
          </div>

          {/* Property Features Boxes */}
          <div className="flex justify-center gap-12">
            {property.beds && (
              <div className="flex items-center px-12 py-2 bg-[#E5E5E5] rounded-full">
                <Bed className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-black">{property.beds} Bedrooms</span>
              </div>
            )}
            {property.baths && (
              <div className="flex items-center px-12 py-2 bg-[#E5E5E5] rounded-full">
                <Bath className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-black">{property.baths} Bathrooms</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};











