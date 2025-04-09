'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SummaryCard from '@/components/dashboard/SummaryCard';
import PaymentHistory from '@/components/dashboard/PaymentHistory';
import RemainingAmount from '@/components/dashboard/RemainingAmount';
import TransactionList from '@/components/dashboard/TransactionList';
import { FileText, CreditCard } from 'lucide-react';

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
    price: '98',
    image: '/auth/User Profile/Profile Placehlder.png',
    details: 'St. Peter - 10:00AM'
  },
  {
    id: '2',
    name: 'Sabda Hot Tummy',
    price: '23',
    image: '/auth/User Profile/Profile Placehlder.png',
    details: 'St. Peter - 11:30AM'
  },
  {
    id: '3',
    name: 'Kurapak Kuit',
    price: '33',
    image: '/auth/User Profile/Profile Placehlder.png',
    details: 'St. Peter - 01:30PM'
  },
  {
    id: '4',
    name: 'Kurapak Kuit',
    price: '33',
    image: '/auth/User Profile/Profile Placehlder.png',
    details: 'St. Peter - 01:45PM'
  },
];

const Dashboard = () => {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(true);

  const handlePayNow = () => {
    // Handle payment logic
    console.log('Pay now clicked');
  };

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold mb-1 text-black">Hello, Chotu</h1>
        <p className="text-gray-500 text-sm">Your current summary and activity.</p>
      </div>

      {/* Desktop Summary Cards */}
      <div className="hidden md:grid grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title="Overdue Invoices"
          amount="INR 6,947.00"
          icon={<FileText size={20} />}
          onClick={() => router.push('/invoices')}
        />

        <SummaryCard
          title="Upcoming Payments"
          amount="INR 6,947.00"
          icon={<CreditCard size={20} />}
          onClick={() => router.push('/payments')}
        />

        <SummaryCard
          title="Your Agent"
          image={
            <div className="flex items-center">
              <span className="mr-2 text-black">Arshir Patel</span>
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
          title="Upcoming Payments"
          amount="INR 6,947.00"
          onClick={() => router.push('/payments')}
        />

        <SummaryCard
          title="Your Agent"
          image={
            <div className="flex items-center">
              <span className="mr-2 text-sm text-black">Arshir Patel</span>
              <div className="h-8 w-8 rounded-full overflow-hidden">
                <Image
                  src="/auth/Agents/agent-03.jpg"
                  alt="Agent Profile"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
            </div>
          }
          onClick={() => router.push('/agent')}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <RemainingAmount amount="6,071.00" onPayNow={handlePayNow} />
        </div>

        <div className="md:col-span-2">
          <PaymentHistory payments={mockPayments} />
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden mb-6">
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative overflow-hidden">
            <div className="z-10">
              <h3 className="text-sm font-medium text-gray-500">Remaining Amount</h3>
              <p className="text-xl font-semibold mt-1 text-black">INR 6,071.00</p>
            </div>
            <div className="absolute right-0 top-0 w-20 h-20">
              <Image
                src="/auth/Stars BG.png"
                alt="Decoration"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={handlePayNow}
              className="w-full py-2.5 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors text-sm"
            >
              Pay Now
            </button>
          </div>
        </div>

        <div className="md:hidden">
          <TransactionList transactions={mockTransactions} />
        </div>
      </div>

      {/* New Features Notification */}
      {showNotification && (
        <div className="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-md border border-gray-200 p-4 z-10">
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