'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GlobalLoadingProps {
  isLoading: boolean;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ isLoading }) => {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    if (isLoading) {
      // Show immediately
      setShow(true);
    } else {
      // Delay hiding to prevent flashing
      const timer = setTimeout(() => {
        setShow(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  if (!show) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-white z-[9999] flex items-center justify-center"
      style={{ height: '100vh', width: '100vw' }}
    >
      <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
    </div>
  );
};

export default GlobalLoading;