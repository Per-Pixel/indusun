'use client';

import Link from 'next/link';
import { Home, Search, Heart, User, Building2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const BottomNavigation = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center p-3 z-50">
      <Link 
        href="/" 
        className={`flex flex-col items-center justify-center ${pathname === '/' ? 'text-blue-600' : 'text-gray-500'}`}
      >
        <Home size={24} />
        <span className="text-xs mt-1">Home</span>
      </Link>
      
      <Link 
        href="/properties" 
        className={`flex flex-col items-center justify-center ${pathname.includes('/properties') ? 'text-blue-600' : 'text-gray-500'}`}
      >
        <Building2 size={24} />
        <span className="text-xs mt-1">Properties</span>
      </Link>

      <Link 
        href="/search" 
        className={`flex flex-col items-center justify-center ${pathname === '/search' ? 'text-blue-600' : 'text-gray-500'}`}
      >
        <Search size={24} />
        <span className="text-xs mt-1">Search</span>
      </Link>

      <Link 
        href="/favorites" 
        className={`flex flex-col items-center justify-center ${pathname === '/favorites' ? 'text-blue-600' : 'text-gray-500'}`}
      >
        <Heart size={24} />
        <span className="text-xs mt-1">Favorites</span>
      </Link>

      <Link 
        href="/profile" 
        className={`flex flex-col items-center justify-center ${pathname === '/profile' ? 'text-blue-600' : 'text-gray-500'}`}
      >
        <User size={24} />
        <span className="text-xs mt-1">Profile</span>
      </Link>
    </div>
  );
};