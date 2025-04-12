'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Search, Download, Filter, ChevronLeft, ChevronRight, Plus, FileText, Calendar, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  client: string;
}

const InvoicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  const invoicesPerPage = 8;
  
  const mockInvoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2023-001',
      date: '12 Apr 2023',
      dueDate: '12 May 2023',
      amount: '₹12,500.00',
      status: 'Paid',
      client: 'Rahul Sharma'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2023-002',
      date: '15 Apr 2023',
      dueDate: '15 May 2023',
      amount: '₹8,800.00',
      status: 'Paid',
      client: 'Priya Patel'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2023-003',
      date: '22 Apr 2023',
      dueDate: '22 May 2023',
      amount: '₹15,200.00',
      status: 'Pending',
      client: 'Amit Kumar'
    },
    {
      id: '4',
      invoiceNumber: 'INV-2023-004',
      date: '01 May 2023',
      dueDate: '01 Jun 2023',
      amount: '₹9,500.00',
      status: 'Pending',
      client: 'Neha Gupta'
    },
    {
      id: '5',
      invoiceNumber: 'INV-2023-005',
      date: '10 May 2023',
      dueDate: '10 Jun 2023',
      amount: '₹22,500.00',
      status: 'Overdue',
      client: 'Vikram Singh'
    },
    {
      id: '6',
      invoiceNumber: 'INV-2023-006',
      date: '15 May 2023',
      dueDate: '15 Jun 2023',
      amount: '₹7,200.00',
      status: 'Paid',
      client: 'Ananya Desai'
    },
    {
      id: '7',
      invoiceNumber: 'INV-2023-007',
      date: '01 Jun 2023',
      dueDate: '01 Jul 2023',
      amount: '₹18,500.00',
      status: 'Pending',
      client: 'Rajesh Khanna'
    },
    {
      id: '8',
      invoiceNumber: 'INV-2023-008',
      date: '12 Jun 2023',
      dueDate: '12 Jul 2023',
      amount: '₹13,800.00',
      status: 'Overdue',
      client: 'Meera Joshi'
    },
    {
      id: '9',
      invoiceNumber: 'INV-2023-009',
      date: '20 Jun 2023',
      dueDate: '20 Jul 2023',
      amount: '₹11,500.00',
      status: 'Paid',
      client: 'Sanjay Mehta'
    },
    {
      id: '10',
      invoiceNumber: 'INV-2023-010',
      date: '01 Jul 2023',
      dueDate: '01 Aug 2023',
      amount: '₹16,500.00',
      status: 'Pending',
      client: 'Kavita Reddy'
    },
  ];
  
  // Filter invoices based on search term and status
  const filteredInvoices = mockInvoices.filter(invoice => 
    (invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     invoice.client.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'All' || invoice.status === filterStatus)
  );
  
  // Paginate invoices
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);
  
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };
  
  const handleDownload = (invoice: Invoice) => {
    // In a real app, this would trigger a download of the invoice
    console.log(`Downloading invoice: ${invoice.invoiceNumber}`);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Summary cards data
  const summaryData = [
    {
      title: 'Total Invoices',
      value: '₹136,000.00',
      icon: <FileText size={20} className="text-blue-600" />,
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Paid Invoices',
      value: '₹40,000.00',
      icon: <DollarSign size={20} className="text-green-600" />,
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Invoices',
      value: '₹60,000.00',
      icon: <Clock size={20} className="text-yellow-600" />,
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Overdue Invoices',
      value: '₹36,000.00',
      icon: <Calendar size={20} className="text-red-600" />,
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-black">Invoices</h1>
          <Link 
            href="/invoices/create" 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>Create Invoice</span>
          </Link>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {summaryData.map((item, index) => (
            <div key={index} className={`p-4 rounded-lg border border-gray-200 ${item.bgColor}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{item.title}</p>
                  <p className="text-xl font-semibold mt-1 text-black">{item.value}</p>
                </div>
                <div className="p-2 rounded-full bg-white">
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <Filter size={18} />
              <span>More Filters</span>
            </button>
          </div>
        </div>
        
        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Issue Date</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.dueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleViewInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleDownload(invoice)}
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
                    Showing <span className="font-medium">{indexOfFirstInvoice + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastInvoice, filteredInvoices.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredInvoices.length}</span> results
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
        
        {/* Invoice Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Invoice Details</h2>
                  <button 
                    onClick={() => setSelectedInvoice(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Invoice Number</p>
                      <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium">{selectedInvoice.client}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Issue Date</p>
                      <p className="font-medium">{selectedInvoice.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="font-medium">{selectedInvoice.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium">{selectedInvoice.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                          {selectedInvoice.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDownload(selectedInvoice)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Download size={16} />
                    <span>Download Invoice</span>
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

export default InvoicesPage;
