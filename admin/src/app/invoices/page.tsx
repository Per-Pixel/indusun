'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  ChevronDown,
  Download,
  Plus,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  ChevronLeft,
  ChevronRight,
  Building,
  User,
  Users,
  CheckCircle,
  AlertCircle,
  Clock4
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';

// Types for invoices
interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  client: {
    name: string;
    type: 'Individual' | 'Company';
    id: string;
  };
  property?: {
    id: string;
    title: string;
  };
  generatedBy: 'System' | 'Admin' | 'Broker';
  generatorName?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }[];
}

// Mock data for invoices
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2023-001',
    date: '2023-12-15',
    dueDate: '2023-12-30',
    amount: '₹1.5 Cr',
    status: 'Paid',
    client: {
      name: 'Priya Patel',
      type: 'Individual',
      id: 'c1'
    },
    property: {
      id: '1',
      title: 'Luxury Villa in Whitefield'
    },
    generatedBy: 'System',
    items: [
      {
        description: 'Property Purchase - Luxury Villa in Whitefield',
        quantity: 1,
        unitPrice: '₹1.5 Cr',
        total: '₹1.5 Cr'
      }
    ]
  },
  {
    id: '2',
    invoiceNumber: 'INV-2023-002',
    date: '2023-12-10',
    dueDate: '2023-12-25',
    amount: '₹14 Lakhs',
    status: 'Paid',
    client: {
      name: 'Amit Kumar',
      type: 'Individual',
      id: 'b2'
    },
    generatedBy: 'Admin',
    generatorName: 'Rajesh Admin',
    items: [
      {
        description: 'Broker Commission - Commercial Space Sale',
        quantity: 1,
        unitPrice: '₹14 Lakhs',
        total: '₹14 Lakhs'
      }
    ]
  },
  {
    id: '3',
    invoiceNumber: 'INV-2023-003',
    date: '2023-12-05',
    dueDate: '2023-12-20',
    amount: '₹25,000',
    status: 'Paid',
    client: {
      name: 'TechSoft Solutions',
      type: 'Company',
      id: 'c3'
    },
    generatedBy: 'Broker',
    generatorName: 'Neha Gupta',
    items: [
      {
        description: 'Property Valuation Service',
        quantity: 1,
        unitPrice: '₹25,000',
        total: '₹25,000'
      }
    ]
  },
  {
    id: '4',
    invoiceNumber: 'INV-2023-004',
    date: '2023-12-01',
    dueDate: '2023-12-16',
    amount: '₹3.5 Lakhs',
    status: 'Paid',
    client: {
      name: 'Global Systems Ltd',
      type: 'Company',
      id: 'c4'
    },
    property: {
      id: '5',
      title: 'Office Space in Central Business District'
    },
    generatedBy: 'System',
    items: [
      {
        description: 'Monthly Rental - Office Space in CBD',
        quantity: 1,
        unitPrice: '₹3.5 Lakhs',
        total: '₹3.5 Lakhs'
      }
    ]
  },
  {
    id: '5',
    invoiceNumber: 'INV-2023-005',
    date: '2023-11-28',
    dueDate: '2023-12-13',
    amount: '₹85 Lakhs',
    status: 'Pending',
    client: {
      name: 'Ananya Reddy',
      type: 'Individual',
      id: 'c5'
    },
    property: {
      id: '3',
      title: 'Residential Plot in Sarjapur'
    },
    generatedBy: 'Admin',
    generatorName: 'Rajesh Admin',
    items: [
      {
        description: 'Property Purchase - Residential Plot in Sarjapur',
        quantity: 1,
        unitPrice: '₹85 Lakhs',
        total: '₹85 Lakhs'
      }
    ]
  },
  {
    id: '6',
    invoiceNumber: 'INV-2023-006',
    date: '2023-11-25',
    dueDate: '2023-12-10',
    amount: '₹7.5 Lakhs',
    status: 'Overdue',
    client: {
      name: 'Rahul Sharma',
      type: 'Individual',
      id: 'b1'
    },
    generatedBy: 'Broker',
    generatorName: 'Suresh Menon',
    items: [
      {
        description: 'Broker Commission - Villa Sale',
        quantity: 1,
        unitPrice: '₹7.5 Lakhs',
        total: '₹7.5 Lakhs'
      }
    ]
  },
  {
    id: '7',
    invoiceNumber: 'INV-2023-007',
    date: '2023-11-20',
    dueDate: '2023-12-05',
    amount: '₹15,000',
    status: 'Paid',
    client: {
      name: 'Vikram Singh',
      type: 'Individual',
      id: 'c2'
    },
    generatedBy: 'System',
    items: [
      {
        description: 'Property Documentation Service',
        quantity: 1,
        unitPrice: '₹15,000',
        total: '₹15,000'
      }
    ]
  },
  {
    id: '8',
    invoiceNumber: 'INV-2023-008',
    date: '2023-11-15',
    dueDate: '2023-11-30',
    amount: '₹2.8 Lakhs',
    status: 'Overdue',
    client: {
      name: 'Fashion Trends Ltd',
      type: 'Company',
      id: 'c8'
    },
    property: {
      id: '8',
      title: 'Retail Space in Commercial Complex'
    },
    generatedBy: 'Admin',
    generatorName: 'Rajesh Admin',
    items: [
      {
        description: 'Monthly Rental - Retail Space',
        quantity: 1,
        unitPrice: '₹2.8 Lakhs',
        total: '₹2.8 Lakhs'
      }
    ]
  },
];

// Summary cards data
const summaryData = [
  {
    title: 'Total Invoices',
    value: '₹2.58 Cr',
    icon: <FileText size={20} className="text-blue-600" />,
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Paid Invoices',
    value: '₹1.65 Cr',
    icon: <DollarSign size={20} className="text-green-600" />,
    bgColor: 'bg-green-50'
  },
  {
    title: 'Pending Invoices',
    value: '₹85 Lakhs',
    icon: <Clock size={20} className="text-yellow-600" />,
    bgColor: 'bg-yellow-50'
  },
  {
    title: 'Overdue Invoices',
    value: '₹10.3 Lakhs',
    icon: <Calendar size={20} className="text-red-600" />,
    bgColor: 'bg-red-50'
  }
];

export default function InvoicesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterGenerator, setFilterGenerator] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const invoicesPerPage = 5;

  // Filter invoices based on search term and filters
  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.property?.title.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesStatus = filterStatus === 'All' || invoice.status === filterStatus;
    const matchesGenerator = filterGenerator === 'All' || invoice.generatedBy === filterGenerator;

    return matchesSearch && matchesStatus && matchesGenerator;
  });

  // Calculate pagination
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

  const getStatusColor = (status: Invoice['status']) => {
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

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle size={16} className="mr-1" />;
      case 'Pending':
        return <Clock size={16} className="mr-1" />;
      case 'Overdue':
        return <AlertCircle size={16} className="mr-1" />;
      default:
        return null;
    }
  };

  const getGeneratorIcon = (generator: Invoice['generatedBy']) => {
    switch (generator) {
      case 'System':
        return <Building size={16} className="mr-1" />;
      case 'Admin':
        return <User size={16} className="mr-1" />;
      case 'Broker':
        return <Users size={16} className="mr-1" />;
      default:
        return null;
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        {/* Top Navbar */}
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/invoices/create')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={16} />
                  <span>Create Invoice</span>
                </button>
                <button
                  onClick={() => router.push('/invoices/export')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Download size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search invoices by number, client, or property..."
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
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>

                <div className="relative">
                  <select
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8"
                    value={filterGenerator}
                    onChange={(e) => setFilterGenerator(e.target.value)}
                  >
                    <option value="All">All Generators</option>
                    <option value="System">System</option>
                    <option value="Admin">Admin</option>
                    <option value="Broker">Broker</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Invoice #</th>
                      <th className="px-6 py-3">Client</th>
                      <th className="px-6 py-3">Issue Date</th>
                      <th className="px-6 py-3">Due Date</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Generated By</th>
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
                          {invoice.client.name}
                          <span className="ml-1 text-xs text-gray-400">
                            ({invoice.client.type})
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="inline-flex items-center">
                            {getGeneratorIcon(invoice.generatedBy)}
                            {invoice.generatedBy}
                            {invoice.generatorName && (
                              <span className="ml-1 text-xs text-gray-400">
                                ({invoice.generatorName})
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => router.push(`/invoices/${invoice.id}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                            <button
                              onClick={() => router.push(`/invoices/${invoice.id}/download`)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Download size={16} />
                            </button>
                          </div>
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
                        Showing <span className="font-medium">{indexOfFirstInvoice + 1}</span> to{' '}
                        <span className="font-medium">
                          {indexOfLastInvoice > filteredInvoices.length
                            ? filteredInvoices.length
                            : indexOfLastInvoice}
                        </span>{' '}
                        of <span className="font-medium">{filteredInvoices.length}</span> results
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
