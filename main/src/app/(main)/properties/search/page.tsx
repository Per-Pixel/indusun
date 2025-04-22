'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Property } from '../types';
import { mockProperties } from '../mockData';
import { Building2 } from 'lucide-react';
import Link from 'next/link';
import { PropertyCard } from '../components/PropertyCard';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [properties, setProperties] = useState<Property[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter properties based on search query
  useEffect(() => {
    if (!mockProperties) return;
    
    const filtered = mockProperties.filter(property =>
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setProperties(filtered);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Results</h1>
            <p className="text-gray-600">
              {properties.length === 0 
                ? 'No properties found' 
                : `Found ${properties.length} ${properties.length === 1 ? 'property' : 'properties'} for "${searchQuery}"`}
            </p>
          </div>
          <Link 
            href="/properties" 
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Back to Properties
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h2>
            <p className="text-gray-500 text-center mb-4">
              Try adjusting your search criteria or browse all properties
            </p>
          </div>
        ) : (
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}





