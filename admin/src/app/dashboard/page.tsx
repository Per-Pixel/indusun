'use client';
// This file is part of the admin dashboard for a real estate management system.
// It includes various charts and statistics related to client engagement, traffic, and notifications.
// The code uses React, Recharts for charting, and Heroicons for icons.
// The dashboard displays data such as total clients, plots, new clients, active brokers,
// website visits, lead conversion, plot enquiries, and top clients.

import {
  RotateCcw, Menu, Star
} from 'lucide-react';

import React, { useState, useRef, useEffect } from 'react';

import {
  XCircleIcon
} from '@heroicons/react/24/outline';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { RoleIndicator } from '@/components/common/PermissionGuard';

// Simple interface for error handling
interface DashboardData {}

interface NotificationItem {}

// Removed chart components

// Component props interfaces
interface TopNavigationProps {
  toggleSidebar: () => void;
  refreshData: () => void;
  sidebarOpen: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const cssAnimations = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .dashboard-card {
    animation: fadeIn 0.5s ease-in-out;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .rotate-animation {
    animation: rotate 1s linear;
  }
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeInUp 0.5s ease-out forwards;
  }
`;

// No mock data needed as we're using real data from PostgreSQL

// CSS animations are defined above

// Stats Card Component removed

// Top Navigation Component
const TopNavigation = ({ toggleSidebar, refreshData, sidebarOpen }: TopNavigationProps): JSX.Element => {
  const { user } = useAdminAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Handle refresh with animation
  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-200" style={{ backgroundColor: "#ffffff" }}>
      <div className="flex items-center space-x-4">
        <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-gray-100">
          <Menu className="h-5 w-5 text-gray-500" />
        </button>
        <Star className="h-5 w-5 text-gray-500" />
        <span className="text-gray-500">Dashboards</span>
        <span className="text-gray-400">/</span>
        <span className="font-medium text-black">Default</span>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Welcome, {user.name}</span>
            <RoleIndicator />
          </div>
        )}
      </div>
    </div>
  );
};


interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
}

interface TopNavigationProps {
  toggleSidebar: () => void;
  refreshData: () => void;
  sidebarOpen: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

// Helper functions removed

const DashboardPage = (): React.ReactElement => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const refreshData = () => {
    // Placeholder for future implementation
    console.log('Dashboard refresh requested');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <style>
        {`
          .dashboard-card {
            animation: fadeIn 0.5s ease-in-out;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .rotate-animation {
            animation: rotate 1s linear;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}
      </style>

      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        <TopNavigation toggleSidebar={toggleSidebar} refreshData={refreshData} sidebarOpen={sidebarOpen} />

        {loading && (
          <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
              <RotateCcw className="h-10 w-10 text-blue-500 animate-spin mb-2" />
              <p className="text-blue-500 font-medium">Refreshing dashboard data...</p>
            </div>
          </div>
        )}
        
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6 mx-6 mt-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-4 lg:p-6">
            {/* Temporary Message */}
            <div className="flex items-center justify-center h-[70vh]">
              <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-2xl w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Waiting for the website to go live to show realtime data</h2>
                <p className="text-gray-600">The dashboard will display real-time statistics and analytics once the website is fully operational.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
