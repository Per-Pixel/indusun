'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { SearchLoadingOverlay } from './SearchLoadingOverlay';

export function SearchForm() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Show loading overlay
    setIsLoading(true);
    
    // Navigate to search results page after a small delay
    setTimeout(() => {
      router.push(`/properties/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }, 100);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative">
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-10 pr-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <button type="submit" className="sr-only">Search</button>
      </form>
      
      {/* Loading overlay using portal */}
      <SearchLoadingOverlay isLoading={isLoading} />
    </>
  );
}


