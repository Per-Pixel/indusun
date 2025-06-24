'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SummaryCard from '@/components/dashboard/SummaryCard';
import PaymentHistory from '@/components/dashboard/PaymentHistory';
import RemainingAmount from '@/components/dashboard/RemainingAmount';
import TransactionList from '@/components/dashboard/TransactionList';
import { FileText, CreditCard, Loader2 } from 'lucide-react';

// Mock data
const mockPayments = [
  { id: '15267', date: 'Mar 1, 2023', amount: 100, totalQuestions: 1, status: 'Success' as const },
  { id: '15357', date: 'Jan 28, 2023', amount: 100, totalQuestions: 1, status: 'Success' as const },
  { id: '15436', date: 'Feb 12, 2023', amount: 100, totalQuestions: 1, status: 'Success' as const },
  { id: '15879', date: 'Feb 12, 2023', amount: 100, totalQuestions: 5, status: 'Success' as const },
  { id: '15378', date: 'Feb 28, 2023', amount: 100, totalQuestions: 5, status: 'Rejected' as const },
  { id: '15609', date: 'March 12, 2023', amount: 100, totalQuestions: 1, status: 'Success' as const },
  { id: '15707', date: 'March 18, 2023', amount: 100, totalQuestions: 1, status: 'Pending' as const },
];

const mockTransactions = [
  {
    id: '1',
    name: 'Shopping product',
    price: '54',
    image: '/auth/User Profile/Profile Placehlder.png',
    details: '05 August, 10:00AM'
  },
  {
    id: '2',
    name: 'Seblak Hot Yummy',
    price: '23',
    image: '/auth/User Profile/Profile Placehlder.png',
    details: '12 August, 11:00 PM'
  },
  {
    id: '3',
    name: 'Kurupuk Kulit',
    price: '33',
    image: '/auth/User Profile/Profile Placehlder.png',
    details: '13 August, 02:00 AM'
  },
  {
    id: '4',
    name: 'Kurupuk Kulit',
    price: '33',
    image: '/auth/User Profile/Profile Placehlder.png',
    details: '13 August, 02:00 AM'
  },
];

const Dashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [showNotification, setShowNotification] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user-specific dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const response = await fetch('/api/customer/dashboard');

        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          console.error('Failed to fetch dashboard data');
          // Fallback to mock data for now
          setDashboardData({
            user: user,
            summary: {
              totalProperties: 1,
              totalPaid: 250000,
              totalOutstanding: 150000,
              overdueAmount: 75000,
              overdueCount: 2,
              nextPaymentDue: {
                amount: 75000,
                dueDate: '2024-04-15',
                propertyName: 'Sample Property'
              }
            },
            recentTransactions: mockTransactions,
            properties: [{
              id: 'prop_1',
              name: 'Sample Property',
              type: 'apartment',
              location: 'Sample Location',
              completionPercentage: 65
            }],
            broker: {
              name: 'Arshir Patel',
              phone: '+91 98765 43210',
              email: 'arshir.p@indusun.com'
            }
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handlePayNow = () => {
    // Handle payment logic
    console.log('Pay now clicked');
    router.push('/payments');
  };

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  // Show login prompt if no user
  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Please log in to view your dashboard</h2>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-4 w-full">
        <h1 className="text-2xl font-semibold mb-1 text-black">
          Hello, {dashboardData?.user?.name || user?.name || 'User'}
        </h1>
        <p className="text-gray-500 text-sm">Your current summary and activity.</p>
      </div>

      {/* Desktop Summary Cards */}
      <div className="hidden md:grid grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title="Overdue Invoices"
          amount={`INR ${dashboardData?.summary?.overdueAmount?.toLocaleString() || '0'}.00`}
          badge={dashboardData?.summary?.overdueCount ? `${dashboardData.summary.overdueCount} overdue` : undefined}
          icon={<FileText size={20} />}
          onClick={() => router.push('/invoices')}
        />

        <SummaryCard
          title="Next Payment Due"
          amount={`INR ${dashboardData?.summary?.nextPaymentDue?.amount?.toLocaleString() || '0'}.00`}
          badge={dashboardData?.summary?.nextPaymentDue?.dueDate ? `Due ${new Date(dashboardData.summary.nextPaymentDue.dueDate).toLocaleDateString()}` : undefined}
          icon={<CreditCard size={20} />}
          onClick={() => router.push('/payments')}
        />

        <SummaryCard
          title="Your Agent"
          image={
            <div className="flex items-center">
              <span className="mr-2 text-black">{dashboardData?.broker?.name || 'Arshir Patel'}</span>
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <Image
                  src="/auth/Agents/agent-03.jpg"
                  alt="Agent Profile"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
            </div>
          }
          onClick={() => router.push('/agent')}
        />
      </div>

      {/* Mobile Summary Cards */}
      <div className="grid md:hidden grid-cols-2 gap-4 mb-6">
        <SummaryCard
          title="Next Payment"
          amount={`INR ${dashboardData?.summary?.nextPaymentDue?.amount?.toLocaleString() || '0'}.00`}
          badge={dashboardData?.summary?.overdueCount ? `${dashboardData.summary.overdueCount} overdue` : undefined}
          onClick={() => router.push('/payments')}
          viewAlign="left"
        />

        <SummaryCard
          title="Your Agent"
          badge={dashboardData?.properties?.length ? `${dashboardData.properties.length} property` : undefined}
          customContent={
            <div className="flex items-center justify-between mt-3 mb-1">
              <div className="text-sm font-medium text-black">{dashboardData?.broker?.name || 'Arshir Patel'}</div>
              <div className="h-7 w-7 rounded-full overflow-hidden">
                <Image
                  src="/auth/Agents/agent-03.jpg"
                  alt="Agent Profile"
                  width={28}
                  height={28}
                  className="object-cover"
                />
              </div>
            </div>
          }
          onClick={() => router.push('/agent')}
          viewAlign="left"
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-3 gap-4 mt-6">
        <div>
          <RemainingAmount
            amount={dashboardData?.summary?.totalOutstanding?.toLocaleString() || '0'}
            onPayNow={handlePayNow}
          />
        </div>

        <div className="md:col-span-2">
          <PaymentHistory payments={mockPayments} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-6 mt-6 w-full max-w-full">
        {/* Remaining Amount Card */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-sm font-medium text-gray-500">Remaining Amount</h3>
              <p className="text-lg font-semibold mt-1 text-black">
                INR {dashboardData?.summary?.totalOutstanding?.toLocaleString() || '0'}.00
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {dashboardData?.summary?.nextPaymentDue?.propertyName || 'Your property investment'} - Outstanding balance
              </p>
            </div>
            <div className="absolute right-0 top-0 w-20 h-20 rounded-bl-3xl overflow-hidden bg-black">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 relative">
                  {/* Star pattern created with CSS */}
                  <div className="absolute top-1 left-1 w-2 h-2 bg-yellow-300 rounded-full opacity-70"></div>
                  <div className="absolute top-3 left-8 w-1 h-1 bg-yellow-300 rounded-full opacity-60"></div>
                  <div className="absolute top-6 left-3 w-1.5 h-1.5 bg-yellow-300 rounded-full opacity-80"></div>
                  <div className="absolute top-8 left-10 w-2 h-2 bg-yellow-300 rounded-full opacity-70"></div>
                  <div className="absolute top-10 left-5 w-1 h-1 bg-yellow-300 rounded-full opacity-60"></div>
                  <div className="absolute top-12 left-12 w-1.5 h-1.5 bg-yellow-300 rounded-full opacity-80"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={handlePayNow}
              className="w-full py-3 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors"
            >
              Pay Now
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div>
          <TransactionList transactions={mockTransactions} />
        </div>

        {/* Payment History */}
        <div>
          <PaymentHistory payments={mockPayments} />
        </div>
      </div>

      {/* New Features Notification */}
      {showNotification && (
        <div className="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-md border border-gray-200 p-4 z-40">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-950 rounded-l-lg"></div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-green-950 text-base">New features available!</h3>
              <p className="text-xs text-gray-600 mt-1">Check out the new dashboard now.</p>
            </div>
            <button
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
              onClick={() => setShowNotification(false)}
            >
              Dismiss
            </button>
          </div>
          <div className="mt-2">
            <button className="text-xs font-medium text-green-950 hover:text-green-900 underline">
              What's new?
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;