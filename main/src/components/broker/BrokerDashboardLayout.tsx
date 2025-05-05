'use client';

import React from 'react';
import BrokerSidebar from './BrokerSidebar';
import { Bell } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface BrokerDashboardLayoutProps {
  children: React.ReactNode;
}

const BrokerDashboardLayout = ({ children }: BrokerDashboardLayoutProps) => {
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/broker/profile');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-x-hidden">
      {/* Sidebar - Desktop only */}
      <div className="hidden md:block">
        <BrokerSidebar />
      </div>

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

        {/* Page Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default BrokerDashboardLayout;
