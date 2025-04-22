'use client';

import Link from 'next/link';
import { Bed, Bath } from 'lucide-react';
import { Property } from '@/types/property';

export const PropertyCard = ({ property }: { property: Property }) => {
  return (
    <Link href={`/properties/${property.id}`}>
      <div className="relative overflow-hidden">
        {/* Property Image */}
        <div className="relative rounded-lg overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
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

        {/* Price and Details - Flex container for desktop alignment */}
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
            <span className="text-blue-600 font-medium text-xl md:text-2xl md:text-right mt-2 md:mt-0">{property.price}</span>
          </div>

          {/* Property Features Boxes - Centered */}
          <div className="flex justify-center gap-12 mt-4">
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





