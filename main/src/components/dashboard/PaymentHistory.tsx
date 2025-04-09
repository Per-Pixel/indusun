'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

type PaymentStatus = 'Success' | 'Rejected' | 'Pending';

interface Payment {
  id: string;
  date: string;
  amount: number;
  totalQuestions: number;
  status: PaymentStatus;
}

interface PaymentHistoryProps {
  payments: Payment[];
}

const PaymentHistory = ({ payments }: PaymentHistoryProps) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Complete' | 'Pending' | 'Rejected'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter payments based on active tab
  const filteredPayments = payments.filter(payment => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Complete') return payment.status === 'Success';
    if (activeTab === 'Pending') return payment.status === 'Pending';
    if (activeTab === 'Rejected') return payment.status === 'Rejected';
    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'Success':
        return 'text-green-500';
      case 'Rejected':
        return 'text-red-500';
      case 'Pending':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-base font-medium text-black">Payment History</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['All', 'Complete', 'Pending', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'text-green-950 border-b-2 border-green-950'
                : 'text-gray-500 hover:text-green-950'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full" style={{ minWidth: '650px' }}>
          <thead>
            <tr className="text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Total Questions</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-xs font-medium text-gray-900">
                  #{payment.id}
                </td>
                <td className="px-4 py-2 text-xs text-gray-500">
                  {payment.date}
                </td>
                <td className="px-4 py-2 text-xs text-gray-500">
                  {payment.amount}
                </td>
                <td className="px-4 py-2 text-xs text-gray-500">
                  {payment.totalQuestions}
                </td>
                <td className="px-4 py-2 text-xs">
                  <span className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200">
          <div className="flex items-center">
            <span className="text-xs text-gray-500">
              Showing {itemsPerPage} per page
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              of {totalPages} pages
            </span>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
