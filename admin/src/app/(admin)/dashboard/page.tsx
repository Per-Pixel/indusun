'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminDashboard() {
  const { user, isLoading } = useAdminAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingBrokerApplications: 0,
    recentPayments: 0
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      router.push('/admin/auth/login');
    } else if (user) {
      // Fetch dashboard stats
      fetchDashboardStats();
    }
  }, [user, isLoading, router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/admin/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {user.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
          <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">Total Properties</h2>
          <p className="text-3xl font-bold mt-2">{stats.totalProperties}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">Pending Broker Applications</h2>
          <p className="text-3xl font-bold mt-2">{stats.pendingBrokerApplications}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">Recent Payments</h2>
          <p className="text-3xl font-bold mt-2">{stats.recentPayments}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => router.push('/admin/users')}
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700"
          >
            Manage Users
          </button>
          <button 
            onClick={() => router.push('/admin/broker/applications')}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700"
          >
            Review Broker Applications
          </button>
          <button 
            onClick={() => router.push('/admin/properties')}
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700"
          >
            Manage Properties
          </button>
        </div>
      </div>
    </div>
  );
}
