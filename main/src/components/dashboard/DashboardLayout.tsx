'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Bell } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Custom Hamburger Menu Component
const HamburgerMenu = () => {
  return (
    <button className="text-white hover:text-gray-200 transition-colors p-2 relative w-6 h-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 flex flex-col gap-[6px]">
        <span className="w-6.5 h-[4px] bg-current filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"></span>
        <span className="w-5 h-[3px] bg-current filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"></span>
        <span className="w-6.5 h-[4px] bg-current filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"></span>
      </div>
    </button>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(true);

  const handleProfileClick = () => {
    router.push('/user/profile');
  };
  return (
    <div className="flex h-screen bg-gray-50 overflow-x-hidden">
      {/* Sidebar - Desktop only */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden md:ml-64">
        {/* Top Header - Desktop */}
        <div className="hidden md:flex items-center justify-end py-2 px-4 border-b" style={{ backgroundColor: 'rgba(57, 56, 56, 0.35)' }}>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mr-4 px-5 py-2 border border-white rounded-lg text-white text-base bg-transparent hover:bg-white hover:text-gray-800 transition-colors"
              onClick={() => router.push('/broker/dashboard')}
            >
              For Brokers
            </motion.button>
            <button className="text-white hover:text-gray-200">
              <Bell size={24} />
            </button>
            <div className="h-10 w-10 rounded-full overflow-hidden cursor-pointer" onClick={handleProfileClick}>
              <Image
                src="/auth/User Profile/Profile Placehlder.png"
                alt="User Profile"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between py-2 px-4 border-b" style={{ background: 'linear-gradient(to right, rgba(186,185,191,0.9), rgba(57,56,56,0.35))' }}>
          <div className="flex items-center gap-2">
            <HamburgerMenu />
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/navbar/logo.png"
                alt="Indusun Logo"
                width={32}
                height={32}
              />
              <span className="font-bold text-white text-lg">Indusun</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-white hover:text-gray-200">
              <Bell size={24} />
            </button>
            <div className="h-10 w-10 rounded-full overflow-hidden cursor-pointer" onClick={handleProfileClick}>
              <Image
                src="/auth/User Profile/Profile Placehlder.png"
                alt="User Profile"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-full overflow-x-hidden">
          <div className="w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center p-2 z-50">
          <Link href="/user/dashboard" className="flex flex-col items-center justify-center text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link href="/user/search" className="flex flex-col items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="text-xs mt-1">Search</span>
          </Link>

          <Link href="/user/favorites" className="flex flex-col items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span className="text-xs mt-1">Favorite</span>
          </Link>

          <Link href="/user/profile" className="flex flex-col items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-xs mt-1">User</span>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
