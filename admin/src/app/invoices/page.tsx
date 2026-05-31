'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronDown,
  Plus,
  FileText,
  DollarSign,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import ExportDropdown from '@/components/ui/ExportDropdown';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string | null;
  amount: string;
  amountNum: number;
  status: 'Paid' | 'Pending';
  client: { name: string; type: string; id: string };
  property?: { id: string; title: string };
  broker?: string | null;
}

interface Summary {
  totalCount: number;
  paidCount: number;
  pendingCount: number;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalCount: 0, paidCount: 0, pendingCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const invoicesPerPage = 25;

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', invoicesPerPage.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'All') params.append('status', filterStatus);

      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();

      setInvoices(data.invoices || []);
      setSummary(data.summary || { totalCount: 0, paidCount: 0, pendingCount: 0 });
      if (data.pagination) {
        setTotalItems(data.pagination.totalItems);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, searchTerm, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':    return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default:        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':    return <CheckCircle size={14} className="mr-1" />;
      case 'Pending': return <Clock size={14} className="mr-1" />;
      default:        return null;
    }
  };

  const summaryCards = [
    { title: 'Total Invoices',   value: summary.totalCount.toLocaleString('en-IN'),      icon: <FileText size={20} className="text-blue-600" />,   bgColor: 'bg-blue-50' },
    { title: 'Paid',             value: summary.paidCount.toLocaleString('en-IN'),        icon: <DollarSign size={20} className="text-green-600" />, bgColor: 'bg-green-50' },
    { title: 'Pending',          value: summary.pendingCount.toLocaleString('en-IN'),     icon: <Clock size={20} className="text-yellow-600" />,    bgColor: 'bg-yellow-50' },
    { title: 'Showing',          value: `${totalItems.toLocaleString('en-IN')} records`,  icon: <FileText size={20} className="text-purple-600" />, bgColor: 'bg-purple-50' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      <div className={`flex-1 transition-all duration-300 bg-gray-50 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">

            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
              <div className="flex gap-2">
                <ExportDropdown
                  label="Export"
                  filename="invoices"
                  disabled={invoices.length === 0}
                  columns={[
                    { header: 'Invoice #', key: 'invoiceNumber' },
                    { header: 'Client',    key: '_client' },
                    { header: 'Property',  key: '_property' },
                    { header: 'Date',      key: '_date' },
                    { header: 'Amount',    key: 'amount' },
                    { header: 'Status',    key: 'status' },
                    { header: 'Broker',    key: '_broker' },
                  ]}
                  rows={invoices.map(inv => ({
                    invoiceNumber: inv.invoiceNumber,
                    _client:       inv.client.name,
                    _property:     inv.property?.title || '',
                    _date:         inv.date || '',
                    amount:        inv.amount,
                    status:        inv.status,
                    _broker:       inv.broker || '',
                  }))}
                />
                <button
                  onClick={() => router.push('/invoices/create')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={16} />
                  <span>Create Invoice</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {summaryCards.map((item, index) => (
                <div key={index} className={`p-4 rounded-lg border border-gray-200 ${item.bgColor}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">{item.title}</p>
                      <p className="text-xl font-semibold mt-1 text-black">{item.value}</p>
                    </div>
                    <div className="p-2 rounded-full bg-white">{item.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by client name or society..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div className="relative">
                <select
                  className="appearance-none block px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8 text-gray-700"
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                >
                  <option value="All">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="flex justify-center mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                    <p>Loading invoices...</p>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-red-500">
                    <AlertCircle size={32} className="mx-auto mb-4 text-red-400" />
                    <p className="font-medium">Failed to load invoices</p>
                    <p className="text-sm text-gray-500 mt-1">{error}</p>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FileText size={32} className="mx-auto mb-4 text-gray-400" />
                    <p>No invoices found matching your filters.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Invoice #</th>
                        <th className="px-6 py-3">Client</th>
                        <th className="px-6 py-3">Property</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {invoice.client.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {invoice.property?.title || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {invoice.date ? new Date(invoice.date).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">
                            {invoice.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                              {getStatusIcon(invoice.status)}
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <button
                              onClick={() => router.push(`/invoices/${invoice.id}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {totalPages > 1 && !isLoading && (
                <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span> —{' '}
                    <span className="font-medium">{totalItems.toLocaleString('en-IN')}</span> total
                  </p>
                  <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
