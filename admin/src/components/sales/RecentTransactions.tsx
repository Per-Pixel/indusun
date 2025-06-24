'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  X,
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
  id: number;
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
  const [selectedBrokerId, setSelectedBrokerId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<{ startDate: string | null, endDate: string | null }>({ startDate: null, endDate: null });
  
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  
  // Form state for adding/editing transactions
  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    status: 'Pending',
    source: 'Property Sale',
    reference: '',
    clientId: undefined,
    brokerId: undefined
  });

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
      if (selectedBrokerId) params.append('brokerId', selectedBrokerId.toString());
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
  }, [currentPage, searchTerm, filterStatus, filterSource, selectedBrokerId, dateRange.startDate, dateRange.endDate]);
  
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
      setSelectedBrokerId(value === 'All' ? null : parseInt(value));
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
    setSelectedBrokerId(null);
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

  // Open modal for adding a new transaction
  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      status: 'Pending',
      source: 'Property Sale',
      reference: '',
      clientId: undefined,
      brokerId: undefined
    });
    setIsModalOpen(true);
  };
  
  // Open modal for editing an existing transaction
  const openEditModal = (transaction: Transaction) => {
    setModalMode('edit');
    setCurrentTransaction(transaction);
    setFormData({
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      status: transaction.status,
      source: transaction.source,
      reference: transaction.reference,
      clientId: transaction.clientId,
      brokerId: transaction.brokerId
    });
    setIsModalOpen(true);
  };
  
  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTransaction(null);
  };
  
  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === 'amount') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'clientId' || name === 'brokerId') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'add') {
        // Create new transaction
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
      } else if (modalMode === 'edit' && currentTransaction) {
        // Update existing transaction
        const response = await fetch(`/api/transactions/${currentTransaction.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
      }
      
      // Close modal and refresh data
      closeModal();
      fetchTransactions();
      
    } catch (err: any) {
      console.error('Error saving transaction:', err);
      alert(`Failed to save transaction: ${err.message}`);
    }
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
  
  // These functions are already defined above, so we're removing the duplicates
  
  // Modal for adding/editing transactions
  const renderModal = () => {
    if (!isModalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">
              {modalMode === 'add' ? 'Add New Transaction' : 'Edit Transaction'}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date || ''}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount || 0}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status || 'Pending'}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select
                  name="source"
                  value={formData.source || 'Property Sale'}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Property Sale">Property Sale</option>
                  <option value="Broker Commission">Broker Commission</option>
                  <option value="Service Fee">Service Fee</option>
                  <option value="Rental Income">Rental Income</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference
                </label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference || ''}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Broker
                </label>
                <select
                  name="brokerId"
                  value={formData.brokerId?.toString() || ''}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Broker</option>
                  {filterOptions.brokers.map((broker) => (
                    <option key={broker.id} value={broker.id.toString()}>
                      {broker.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleFormChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                {modalMode === 'add' ? 'Add Transaction' : 'Update Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Header with title and add button */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="font-medium">Recent Transactions</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>Add Transaction</span>
        </button>
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
                onChange={(e) => handleFilterChange('source', e.target.value)}
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

            <div className="relative">
              <select
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8"
                value={selectedBrokerId?.toString() || 'All'}
                onChange={(e) => handleFilterChange('broker', e.target.value)}
              >
                <option value="All">All Brokers</option>
                {filterOptions.brokers.map((broker) => (
                  <option key={broker.id} value={broker.id.toString()}>
                    {broker.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown size={16} />
              </div>
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
                        onClick={() => openEditModal(transaction)}
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
