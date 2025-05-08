'use client';

import React, { useState } from 'react';
import BrokerSidebar from './BrokerSidebar';
import { Bell, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface BrokerDashboardLayoutProps {
  children: React.ReactNode;
}

const BrokerDashboardLayout = ({ children }: BrokerDashboardLayoutProps) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleProfileClick = () => {
    router.push('/broker/profile');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-x-hidden">
      {/* Sidebar - Desktop only */}
      <div className="hidden md:block">
        <BrokerSidebar />
      </div>

      {/* Mobile Sidebar - Slide from left */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black z-20"
              onClick={toggleSidebar}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="md:hidden fixed top-0 left-0 h-full z-30 w-64"
            >
              <BrokerSidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden md:ml-64">
        {/* Top Header - Desktop */}
        <div className="hidden md:flex items-center justify-end py-2 px-4 border-b" style={{ backgroundColor: 'rgba(57, 56, 56, 0.35)' }}>
          <div className="flex items-center gap-4">
            <button className="text-white hover:text-gray-200">
              <Bell size={24} />
            </button>
            <div className="h-10 w-10 rounded-full overflow-hidden cursor-pointer" onClick={handleProfileClick}>
              <Image
                src="/auth/Agents/agent-03.jpg"
                alt="User Profile"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between py-2 px-4 border-b" style={{ backgroundColor: 'rgba(57, 56, 56, 0.35)' }}>
          <button 
            onClick={toggleSidebar}
            className="text-white hover:text-gray-200 p-1"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-3">
            <button className="text-white hover:text-gray-200">
              <Bell size={20} />
            </button>
            <div className="h-8 w-8 rounded-full overflow-hidden cursor-pointer" onClick={handleProfileClick}>
              <Image
                src="/auth/Agents/agent-03.jpg"
                alt="User Profile"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default BrokerDashboardLayout;

