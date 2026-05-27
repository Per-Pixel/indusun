'use client';

import React, { useState } from 'react';
import { 
  RotateCcw, Menu, Star, Users, Building, TrendingUp, DollarSign, Home
} from 'lucide-react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import Sidebar from '@/components/dashboard/Sidebar';
import { MasterDataSummary } from '@/types/masterData';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatsCard = ({ title, value, icon, color }: StatsCardProps) => {
  return (
    <div className={`${color} p-6 rounded-lg shadow-sm border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-white rounded-full shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
};

interface DashboardContentProps {
  summary: MasterDataSummary | null;
  societies: string[];
  error: Error | null;
}

export default function DashboardContent({ summary, societies, error }: DashboardContentProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        {/* Top Navigation */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-gray-100">
              <Menu className="h-5 w-5 text-gray-500" />
            </button>
            <Star className="h-5 w-5 text-gray-500" />
            <span className="text-gray-500">Dashboards</span>
            <span className="text-gray-400">/</span>
            <span className="font-medium text-black">Default</span>
          </div>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-md hover:bg-gray-100 ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RotateCcw className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
          
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Data</h3>
              <p className="text-red-600">{error.message}</p>
              <p className="text-sm text-red-500 mt-2">
                Make sure you have created the `.env.local` file with your Supabase credentials.
              </p>
            </div>
          ) : summary ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                <StatsCard
                  title="Total Records"
                  value={summary.totalRecords}
                  icon={<Home className="h-6 w-6 text-blue-600" />}
                  color="bg-blue-50 border-blue-200"
                />
                <StatsCard
                  title="Total Clients"
                  value={summary.totalClients}
                  icon={<Users className="h-6 w-6 text-green-600" />}
                  color="bg-green-50 border-green-200"
                />
                <StatsCard
                  title="Societies"
                  value={summary.uniqueSocieties}
                  icon={<Building className="h-6 w-6 text-purple-600" />}
                  color="bg-purple-50 border-purple-200"
                />
                <StatsCard
                  title="Brokers"
                  value={summary.uniqueBrokers}
                  icon={<TrendingUp className="h-6 w-6 text-orange-600" />}
                  color="bg-orange-50 border-orange-200"
                />
                <StatsCard
                  title="Plot Amount"
                  value={`₹${(summary.totalPlotAmount / 100000).toFixed(1)}L`}
                  icon={<DollarSign className="h-6 w-6 text-cyan-600" />}
                  color="bg-cyan-50 border-cyan-200"
                />
                <StatsCard
                  title="Paid Amount"
                  value={`₹${(summary.totalPaidAmount / 100000).toFixed(1)}L`}
                  icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
                  color="bg-emerald-50 border-emerald-200"
                />
              </div>

              {/* Societies Section */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Societies ({societies.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {societies.map((society) => (
                    <span
                      key={society}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {society}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Link */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
                <h3 className="text-xl font-bold mb-2">View Master Data</h3>
                <p className="text-blue-100 mb-4">Access all records from the Gurukrupa Master Data table.</p>
                <a
                  href="/master-data"
                  className="inline-block px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  View All Records →
                </a>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[50vh]">
              <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-2xl w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">No Data Available</h2>
                <p className="text-gray-600">No records found in the &quot;Master Data Of Gurukrupa&quot; table.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
