'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home, Search, Building2, Heart, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

export const BottomNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
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

  // Don't show navigation on non-mobile devices or excluded paths
  const excludedPaths = [
    '/broker',
    '/broker/dashboard',
    '/admin',
    '/admin/dashboard',
  ];

  const isExcludedPath = excludedPaths.some(path => pathname.startsWith(path));

  if (!isMobile || isExcludedPath) {
    return null;
  }

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  const handleProtectedRoute = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
    } else {
      router.push(path);
    }
  };

  const navItems = [
    {
      icon: <Home size={20} strokeWidth={1.5} />,
      label: 'Home',
      href: '/',
      isActive: pathname === '/'
    },
    {
      icon: <Search size={20} strokeWidth={1.5} />,
      label: 'Search',
      href: '/search',
      isActive: pathname === '/search'
    },
    {
      icon: <Building2 size={20} strokeWidth={1.5} />,
      label: 'Properties',
      href: '/properties',
      isActive: pathname.includes('/properties')
    },
    {
      icon: <Heart size={20} strokeWidth={1.5} />,
      label: 'Favorites',
      href: '/favorites',
      isActive: pathname === '/favorites',
      protected: true
    },
    {
      icon: <User size={20} strokeWidth={1.5} />,
      label: isLoading ? 'Loading...' : user ? 'Dashboard' : 'Login',
      href: user ? '/dashboard' : '/login',
      isActive: pathname === '/dashboard' || pathname === '/login',
      isUser: true
    }
  ];

  const getItemClass = (isActive: boolean) => `
    flex flex-col items-center justify-center
    transition-all duration-300 ease-in-out
    ${isActive ? 'text-white' : 'text-gray-400'}
    relative w-full h-16
  `;

  const getIconWrapperClass = (isActive: boolean) => `
    relative flex flex-col items-center justify-center w-full
    ${isActive ? `
      after:content-[""]
      after:absolute
      after:top-[-13px]
      after:left-[50%]
      after:-translate-x-[50%]
      after:w-[52px]
      after:h-[61px]
      after:bg-[url('/bottom-nav/Icons-BG.svg')]
      after:bg-no-repeat
      after:bg-center
      after:bg-contain
      after:opacity-100
      after:transition-all
      after:duration-300
      after:pointer-events-none
      after:z-[-1]
    ` : ''}
  `;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t h-16 z-[999]">
      <div className="flex justify-around items-end h-full">
        {navItems.map((item, index) => (
          <div key={index} className="relative">
            {item.protected || item.isUser ? (
              <button
                onClick={item.protected ? (e) => handleProtectedRoute(e, item.href) : handleUserClick}
                disabled={item.isUser && isLoading}
                className={getItemClass(item.isActive)}
              >
                <div className={getIconWrapperClass(item.isActive)}>
                  <div className="flex flex-col items-center">
                    {item.icon}
                    <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                  </div>
                </div>
              </button>
            ) : (
              <Link href={item.href} className={getItemClass(item.isActive)}>
                <div className={getIconWrapperClass(item.isActive)}>
                  <div className="flex flex-col items-center">
                    {item.icon}
                    <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                  </div>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

const style = `
  <style jsx global>
    {
      @keyframes slideUp {
        0% {
          transform: translateY(100%);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .nav-item-active::before {
        animation: slideUp 0.3s ease-out;
      }
    }
  </style>
`;




















