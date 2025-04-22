'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Property } from '../types';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    // Filter properties based on search query
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
        <h1 className="text-2xl font-bold mb-2">Search Results</h1>
        <p className="text-gray-600 mb-6">Showing results for "{searchQuery}"</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map((property) => (
            // Your property card component
          ))}
        </div>
      </div>

      {/* Let's make it happen section */}
      {/* Footer */}
    </div>
  );
}
