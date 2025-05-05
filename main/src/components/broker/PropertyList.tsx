'use client';

import React from 'react';
import Image from 'next/image';

interface PropertyItem {
  id: number;
  image: string;
  title: string;
  price: string;
  type: string;
}

interface PropertyListProps {
  data: PropertyItem[];
}

const PropertyList = ({ data }: PropertyListProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Property List</h2>
        <button className="text-xs text-gray-500">See All Listing</button>
      </div>
      
      <div className="space-y-4">
        {data.map((property) => (
          <div key={property.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="relative">
              <Image 
                src={property.image} 
                alt={property.title} 
                width={400} 
                height={200} 
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-md">
                {property.type}
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-medium">{property.title}</h3>
              <p className="text-lg font-bold mt-1">{property.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyList;
