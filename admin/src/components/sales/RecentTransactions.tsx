'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ExportDropdown from '@/components/ui/ExportDropdown';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Building,
  User,
  Users,
  Home,
  FileText,
  FileX
} from 'lucide-react';

// Define types for transactions
interface Client {
  id: number;
  name: string;
  type: 'Individual' | 'Company';
}

interface Broker {
  id: string;
  name: string;
}

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  source: 'Property Sale' | 'Broker Commission' | 'Service Fee' | 'Rental Income';
  reference: string;
  clientId?: number;
  brokerId?: number;
  propertyId?: number;
  client?: Client;
  broker?: Broker;
}

interface FilterOptions {
  brokers: Broker[];
}

interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

interface RecentTransactionsProps {
  className?: string;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ className }) => {
  const router = useRouter();

  // State for transactions data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ brokers: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterSource, setFilterSource] = useState<string>('All');
  const [selectedBrokerName, setSelectedBrokerName] = useState<string | null>(null);
  const [showBrokerDropdown, setShowBrokerDropdown] = useState<boolean>(false);
  const [brokerSearchTerm, setBrokerSearchTerm] = useState<string>('');
  const brokerDropdownRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState<{ startDate: string | null, endDate: string | null }>({ startDate: null, endDate: null });
  


  // Fetch transactions data
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'All') params.append('status', filterStatus);
      if (filterSource !== 'All') params.append('source', filterSource);
      if (selectedBrokerName) params.append('brokerName', selectedBrokerName);
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      const response = await fetch(`/api/transactions?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update state with fetched data
      setTransactions(data.transactions || []);
      setFilterOptions(data.filterOptions || { brokers: [] });
      
      // Update pagination info
      if (data.pagination) {
        setTotalItems(data.pagination.totalItems);
        setTotalPages(data.pagination.totalPages);
        setItemsPerPage(data.pagination.itemsPerPage);
      }
      
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data on initial load and when dependencies change
  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchTerm, filterStatus, filterSource, selectedBrokerName, dateRange.startDate, dateRange.endDate]);

  // Close broker dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (brokerDropdownRef.current && !brokerDropdownRef.current.contains(e.target as Node)) {
        setShowBrokerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };
  
  // Handle filter changes
  const handleFilterChange = (type: 'status' | 'source' | 'broker', value: string) => {
    if (type === 'status') {
      setFilterStatus(value);
    } else if (type === 'source') {
      setFilterSource(value);
    } else if (type === 'broker') {
      setSelectedBrokerName(value === 'All' ? null : value);
    }
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Handle date filter changes
  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: value
    }));
    setCurrentPage(1); // Reset to first page when date changes
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('All');
    setFilterSource('All');
    setSelectedBrokerName(null);
    setBrokerSearchTerm('');
    setDateRange({ startDate: null, endDate: null });
    setCurrentPage(1);
  };
  
  // Format amount as Indian currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Get status color for UI
  const getStatusColor = (status: string): string => {
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

  // Get source icon and color for UI
  const getSourceStyle = (source: string): { color: string; icon: React.ReactNode } => {
    switch (source) {
      case 'Property Sale':
        return { color: 'text-blue-600', icon: <Home size={14} /> };
      case 'Broker Commission':
        return { color: 'text-purple-600', icon: <Users size={14} /> };
      case 'Service Fee':
        return { color: 'text-green-600', icon: <FileText size={14} /> };
      case 'Rental Income':
        return { color: 'text-orange-600', icon: <Home size={14} /> };
      default:
        return { color: 'text-gray-600', icon: <FileText size={14} /> };
    }
  };
  
  // Render status with appropriate styling
  const renderStatus = (status: string) => {
    const statusClass = getStatusColor(status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
        {status}
      </span>
    );
  };
  
  // Render source with appropriate styling
  const renderSource = (source: string) => {
    const { color, icon } = getSourceStyle(source);
    return (
      <span className={`inline-flex items-center ${color}`}>
        <span className="mr-1">{icon}</span>
        {source}
      </span>
    );
  };


  
  // Handle transaction deletion
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Refresh data after deletion
      fetchTransactions();
      
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      alert(`Failed to delete transaction: ${err.message}`);
    }
  };

  // Calculate display indexes for UI
  const indexOfFirstTransaction = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastTransaction = Math.min(currentPage * itemsPerPage, totalItems);
  


  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Header with title and add button */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="font-medium">Recent Transactions</h2>
        <div className="flex items-center gap-2">
          <ExportDropdown
            label="Export"
            filename="transactions"
            disabled={transactions.length === 0}
            columns={[
              { header: 'Date',        key: 'date' },
              { header: 'Client',      key: '_client' },
              { header: 'Description', key: 'description' },
              { header: 'Amount',      key: '_amount' },
              { header: 'Status',      key: 'status' },
              { header: 'Reference',   key: 'reference' },
              { header: 'Broker',      key: '_broker' },
            ]}
            rows={transactions.map(t => ({
              date:        t.date || '',
              _client:     t.client?.name || '',
              description: t.description,
              _amount:     `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(t.amount)}`,
              status:      t.status,
              reference:   t.reference,
              _broker:     t.broker?.name || '',
            }))}
          />
          <button
            onClick={() => router.push('/transactions/add')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white border border-blue-700 rounded hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">Add Transaction</span>
          </button>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="relative">
              <select
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8"
                value={filterStatus}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown size={16} />
              </div>
            </div>

            <div className="relative">
              <select
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8"
                value={filterSource}
                onChange={(e) => handleFilterChange('source', e.target.value)}
              >
                <option value="All">All Sources</option>
                <option value="Property Sale">Property Sale</option>
                <option value="Broker Commission">Broker Commission</option>
                <option value="Rental Income">Rental Income</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown size={16} />
              </div>
            </div>

            <div className="relative" ref={brokerDropdownRef}>
              <button
                type="button"
                onClick={() => setShowBrokerDropdown(prev => !prev)}
                className="flex items-center justify-between w-44 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm hover:bg-gray-50"
              >
                <span className="truncate text-gray-700">{selectedBrokerName || 'All Brokers'}</span>
                <ChevronDown size={16} className="ml-2 flex-shrink-0 text-gray-500" />
              </button>

              {showBrokerDropdown && (
                <div className="absolute z-50 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search size={13} className="absolute left-2 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search broker..."
                        className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={brokerSearchTerm}
                        onChange={(e) => setBrokerSearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                  <ul className="max-h-52 overflow-y-auto py-1">
                    <li>
                      <button
                        type="button"
                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between ${
                          selectedBrokerName === null ? 'text-blue-700 font-medium bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => { setSelectedBrokerName(null); setShowBrokerDropdown(false); setBrokerSearchTerm(''); setCurrentPage(1); }}
                      >
                        All Brokers
                        {selectedBrokerName === null && <span className="text-blue-600 text-base">✓</span>}
                      </button>
                    </li>
                    {filterOptions.brokers
                      .filter(b => !brokerSearchTerm || b.name.toLowerCase().includes(brokerSearchTerm.toLowerCase()))
                      .map(broker => (
                        <li key={broker.id}>
                          <button
                            type="button"
                            className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between ${
                              selectedBrokerName === broker.id ? 'text-blue-700 font-medium bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            onClick={() => { setSelectedBrokerName(broker.id); setShowBrokerDropdown(false); setBrokerSearchTerm(''); setCurrentPage(1); }}
                          >
                            <span className="truncate">{broker.name}</span>
                            {selectedBrokerName === broker.id && <span className="text-blue-600 ml-2 text-base flex-shrink-0">✓</span>}
                          </button>
                        </li>
                      ))}
                    {filterOptions.brokers.filter(b => !brokerSearchTerm || b.name.toLowerCase().includes(brokerSearchTerm.toLowerCase())).length === 0 && (
                      <li className="px-3 py-2 text-sm text-gray-400 text-center">No brokers found</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={resetFilters}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={dateRange.startDate || ''}
              onChange={(e) => handleDateChange('start', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={dateRange.endDate || ''}
              onChange={(e) => handleDateChange('end', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Transactions table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
            <p>Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <div className="mb-4">
              <FileX size={32} className="mx-auto text-red-400" />
            </div>
            <p className="mb-2 font-medium">Failed to load transactions</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4">
              <FileX size={32} className="mx-auto text-gray-400" />
            </div>
            <p className="mb-2">No transactions found</p>
            <p className="text-sm">Try adjusting your filters or add a new transaction.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.reference}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {renderSource(transaction.source)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatus(transaction.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatAmount(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => router.push(`/transactions/edit/${transaction.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pagination controls */}
      {!isLoading && transactions.length > 0 && (
        <div className="px-6 py-4 bg-white border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstTransaction}</span> to{' '}
              <span className="font-medium">{indexOfLastTransaction}</span> of{' '}
              <span className="font-medium">{totalItems}</span> transactions
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded-md text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Previous
              </button>
              
              {/* Page number buttons */}
              <div className="hidden sm:flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 border rounded-md text-sm ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 border rounded-md text-sm ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;

// Confirmation dialog for delete action
const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this transaction? This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end p-4 space-x-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
