'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface SearchLoadingOverlayProps {
  isLoading: boolean;
}

export const SearchLoadingOverlay: React.FC<SearchLoadingOverlayProps> = ({ isLoading }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !isLoading) return null;

  // Use portal to ensure the overlay is at the root level
  return createPortal(
    <div 
      className="fixed inset-0 bg-white z-[9999] flex items-center justify-center"
      style={{ 
        height: '100vh', 
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-700 font-medium">Loading search results...</p>
      </div>
    </div>,
    document.body
  );
};
