'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Search, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface Receipt {
  id: string;
  receiptNumber: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Failed';
  description: string;
}

const ReceiptsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  
  const receiptsPerPage = 8;
  
  const mockReceipts: Receipt[] = [
    {
      id: '1',
      receiptNumber: 'RCP-2023-001',
      date: '12 Apr 2023',
      amount: '₹2,500.00',
      status: 'Paid',
      description: 'Monthly subscription payment'
    },
    {
      id: '2',
      receiptNumber: 'RCP-2023-002',
      date: '15 Apr 2023',
      amount: '₹1,800.00',
      status: 'Paid',
      description: 'Service fee payment'
    },
    {
      id: '3',
      receiptNumber: 'RCP-2023-003',
      date: '22 Apr 2023',
      amount: '₹3,200.00',
      status: 'Paid',
      description: 'Consultation fee'
    },
    {
      id: '4',
      receiptNumber: 'RCP-2023-004',
      date: '01 May 2023',
      amount: '₹2,500.00',
      status: 'Paid',
      description: 'Monthly subscription payment'
    },
    {
      id: '5',
      receiptNumber: 'RCP-2023-005',
      date: '10 May 2023',
      amount: '₹4,500.00',
      status: 'Paid',
      description: 'Premium service upgrade'
    },
    {
      id: '6',
      receiptNumber: 'RCP-2023-006',
      date: '15 May 2023',
      amount: '₹1,200.00',
      status: 'Paid',
      description: 'Additional service fee'
    },
    {
      id: '7',
      receiptNumber: 'RCP-2023-007',
      date: '01 Jun 2023',
      amount: '₹2,500.00',
      status: 'Paid',
      description: 'Monthly subscription payment'
    },
    {
      id: '8',
      receiptNumber: 'RCP-2023-008',
      date: '12 Jun 2023',
      amount: '₹3,800.00',
      status: 'Paid',
      description: 'Consultation and service fee'
    },
    {
      id: '9',
      receiptNumber: 'RCP-2023-009',
      date: '20 Jun 2023',
      amount: '₹1,500.00',
      status: 'Paid',
      description: 'Additional service'
    },
    {
      id: '10',
      receiptNumber: 'RCP-2023-010',
      date: '01 Jul 2023',
      amount: '₹2,500.00',
      status: 'Paid',
      description: 'Monthly subscription payment'
    },
  ];
  
  // Filter receipts based on search term
  const filteredReceipts = mockReceipts.filter(receipt => 
    receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Paginate receipts
  const indexOfLastReceipt = currentPage * receiptsPerPage;
  const indexOfFirstReceipt = indexOfLastReceipt - receiptsPerPage;
  const currentReceipts = filteredReceipts.slice(indexOfFirstReceipt, indexOfLastReceipt);
  const totalPages = Math.ceil(filteredReceipts.length / receiptsPerPage);
  
  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
  };
  
  const handleDownload = (receipt: Receipt) => {
    // In a real app, this would trigger a download of the receipt
    console.log(`Downloading receipt: ${receipt.receiptNumber}`);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-black">Receipts</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search receipts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Receipt Number</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {receipt.receiptNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {receipt.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {receipt.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(receipt.status)}`}>
                        {receipt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {receipt.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleViewReceipt(receipt)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleDownload(receipt)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstReceipt + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastReceipt, filteredReceipts.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredReceipts.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === index + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Receipt Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Receipt Details</h2>
                  <button 
                    onClick={() => setSelectedReceipt(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Receipt Number</p>
                      <p className="font-medium">{selectedReceipt.receiptNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{selectedReceipt.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium">{selectedReceipt.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedReceipt.status)}`}>
                          {selectedReceipt.status}
                        </span>
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="font-medium">{selectedReceipt.description}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => handleDownload(selectedReceipt)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Download size={16} />
                    <span>Download Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReceiptsPage;
