'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  ChevronDown,
  Download,
  Calendar,
  DollarSign,
  CreditCard,
  TrendingUp,
  FileText,
  ChevronLeft,
  ChevronRight,
  Building,
  User,
  Users,
  Home
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// Mock data for billing sources
const billingSourcesData = [
  { name: 'Property Sales', value: 65 },
  { name: 'Broker Commissions', value: 15 },
  { name: 'Service Fees', value: 10 },
  { name: 'Rental Income', value: 10 },
];

// Mock data for billing trends
const billingTrendsData = [
  { name: 'Jan', value: 400000 },
  { name: 'Feb', value: 300000 },
  { name: 'Mar', value: 550000 },
  { name: 'Apr', value: 450000 },
  { name: 'May', value: 650000 },
  { name: 'Jun', value: 400000 },
  { name: 'Jul', value: 700000 },
];

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Summary cards data
const summaryData = [
  {
    title: 'Total Revenue',
    value: '₹3.45 Cr',
    icon: <DollarSign size={20} className="text-blue-600" />,
    bgColor: 'bg-blue-50',
    change: '+12% from last month'
  },
  {
    title: 'Pending Payments',
    value: '₹45 Lakhs',
    icon: <CreditCard size={20} className="text-yellow-600" />,
    bgColor: 'bg-yellow-50',
    change: '-5% from last month'
  },
  {
    title: 'Total Transactions',
    value: '245',
    icon: <TrendingUp size={20} className="text-green-600" />,
    bgColor: 'bg-green-50',
    change: '+8% from last month'
  },
  {
    title: 'Invoices Generated',
    value: '128',
    icon: <FileText size={20} className="text-purple-600" />,
    bgColor: 'bg-purple-50',
    change: '+15% from last month'
  }
];

// Mock data for transactions
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: 'Completed' | 'Pending' | 'Failed';
  source: 'Property Sale' | 'Broker Commission' | 'Service Fee' | 'Rental Income';
  reference: string;
  client?: {
    name: string;
    type: 'Individual' | 'Company';
  };
}

const mockTransactions: Transaction[] = [
  {
    id: 'TRX001',
    date: '2023-12-15',
    description: 'Payment for Luxury Villa in Whitefield',
    amount: '₹1.5 Cr',
    status: 'Completed',
    source: 'Property Sale',
    reference: 'INV-2023-001',
    client: {
      name: 'Priya Patel',
      type: 'Individual'
    }
  },
  {
    id: 'TRX002',
    date: '2023-12-10',
    description: 'Commission for Commercial Space Sale',
    amount: '₹14 Lakhs',
    status: 'Completed',
    source: 'Broker Commission',
    reference: 'INV-2023-002',
    client: {
      name: 'Amit Kumar',
      type: 'Individual'
    }
  },
  {
    id: 'TRX003',
    date: '2023-12-05',
    description: 'Property Valuation Service Fee',
    amount: '₹25,000',
    status: 'Completed',
    source: 'Service Fee',
    reference: 'INV-2023-003',
    client: {
      name: 'TechSoft Solutions',
      type: 'Company'
    }
  },
  {
    id: 'TRX004',
    date: '2023-12-01',
    description: 'Monthly Rental Income - Office Space',
    amount: '₹3.5 Lakhs',
    status: 'Completed',
    source: 'Rental Income',
    reference: 'INV-2023-004',
    client: {
      name: 'Global Systems Ltd',
      type: 'Company'
    }
  },
  {
    id: 'TRX005',
    date: '2023-11-28',
    description: 'Payment for Residential Plot',
    amount: '₹85 Lakhs',
    status: 'Pending',
    source: 'Property Sale',
    reference: 'INV-2023-005',
    client: {
      name: 'Ananya Reddy',
      type: 'Individual'
    }
  },
  {
    id: 'TRX006',
    date: '2023-11-25',
    description: 'Commission for Villa Sale',
    amount: '₹7.5 Lakhs',
    status: 'Failed',
    source: 'Broker Commission',
    reference: 'INV-2023-006',
    client: {
      name: 'Rahul Sharma',
      type: 'Individual'
    }
  },
  {
    id: 'TRX007',
    date: '2023-11-20',
    description: 'Property Documentation Service',
    amount: '₹15,000',
    status: 'Completed',
    source: 'Service Fee',
    reference: 'INV-2023-007',
    client: {
      name: 'Vikram Singh',
      type: 'Individual'
    }
  },
  {
    id: 'TRX008',
    date: '2023-11-15',
    description: 'Monthly Rental Income - Retail Space',
    amount: '₹2.8 Lakhs',
    status: 'Completed',
    source: 'Rental Income',
    reference: 'INV-2023-008',
    client: {
      name: 'Fashion Trends Ltd',
      type: 'Company'
    }
  },
];

// Custom tooltip for line chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-md">
        <p className="text-sm font-medium">{`${label}`}</p>
        <p className="text-sm text-gray-600">{`Revenue: ₹${(payload[0].value / 100000).toFixed(2)} Lakhs`}</p>
      </div>
    );
  }
  return null;
};

export default function BillingPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterSource, setFilterSource] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const transactionsPerPage = 5;

  // Filter transactions based on search term and filters
  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesStatus = filterStatus === 'All' || transaction.status === filterStatus;
    const matchesSource = filterSource === 'All' || transaction.source === filterSource;

    return matchesSearch && matchesStatus && matchesSource;
  });

  // Calculate pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: Transaction['source']) => {
    switch (source) {
      case 'Property Sale':
        return <Building size={16} className="mr-1" />;
      case 'Broker Commission':
        return <Users size={16} className="mr-1" />;
      case 'Service Fee':
        return <FileText size={16} className="mr-1" />;
      case 'Rental Income':
        return <Home size={16} className="mr-1" />;
      default:
        return null;
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 bg-gray-50 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        {/* Top Navbar */}
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
              <button
                onClick={() => router.push('/billing/export')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {summaryData.map((item, index) => (
                <div key={index} className={`p-4 rounded-lg border border-gray-200 ${item.bgColor}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-sm text-gray-600">{item.title}</p>
                      <p className="text-xl font-semibold mt-1 text-black">{item.value}</p>
                    </div>
                    <div className="p-2 rounded-full bg-white">
                      {item.icon}
                    </div>
                  </div>
                  <p className="text-xs text-green-600">{item.change}</p>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Billing Trends Chart */}
              <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium mb-4">Billing Trends</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={billingTrendsData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickFormatter={(value) => `₹${value / 100000}L`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#0088FE"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Billing Sources Chart */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium mb-4">Billing Sources</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={billingSourcesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {billingSourcesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <div className="relative">
                  <select
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>

                <div className="relative">
                  <select
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8"
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                  >
                    <option value="All">All Sources</option>
                    <option value="Property Sale">Property Sale</option>
                    <option value="Broker Commission">Broker Commission</option>
                    <option value="Service Fee">Service Fee</option>
                    <option value="Rental Income">Rental Income</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="font-medium">Billing Transactions</h2>
                <button
                  onClick={() => router.push('/billing/transactions')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Transaction ID</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3">Client</th>
                      <th className="px-6 py-3">Source</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.client?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="inline-flex items-center">
                            {getSourceIcon(transaction.source)}
                            {transaction.source}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <button
                            onClick={() => router.push(`/billing/transactions/${transaction.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
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
                      onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstTransaction + 1}</span> to{' '}
                        <span className="font-medium">
                          {indexOfLastTransaction > filteredTransactions.length
                            ? filteredTransactions.length
                            : indexOfLastTransaction}
                        </span>{' '}
                        of <span className="font-medium">{filteredTransactions.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                          }`}
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
          </div>
        </div>
      </div>
    </div>
  );
}
