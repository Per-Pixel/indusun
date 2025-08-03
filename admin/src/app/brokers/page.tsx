'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Users, TrendingUp, MoreVertical, ChevronLeft, ChevronRight, Upload, Download } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import toast from 'react-hot-toast';

interface Broker {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  image: string;
  location: string;
  lastActive: string;
  createdAt: string;
}

interface BrokerFormData {
  name: string;
  phone: string;
}

interface PaginationData {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

interface SummaryData {
  totalBrokers: number;
  totalSales: number;
  activeBrokers: number;
  newBrokersThisMonth: number;
}

const BrokersPage = (): React.ReactElement => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalBrokers: 0,
    totalSales: 0,
    activeBrokers: 0,
    newBrokersThisMonth: 0
  });
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [formData, setFormData] = useState<BrokerFormData>({ name: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  // Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    message?: string;
    stats?: {
      imported: number;
      skipped: number;
      withCodes: number;
      withoutCodes: number;
    };
  } | null>(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Search debounce
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch brokers from API
  const fetchBrokers = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search })
      });
      
      const response = await fetch(`/api/brokers?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch brokers');
      }
      
      const data = await response.json();
      setBrokers(data.brokers);
      setPagination(data.pagination);
      
      // Update summary data
      setSummaryData(prev => ({
        ...prev,
        totalBrokers: data.pagination.totalItems,
        activeBrokers: data.brokers.filter((b: Broker) => b.status === 'active').length
      }));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch brokers');
      toast.error('Failed to fetch brokers');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create broker
  const createBroker = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await fetch('/api/brokers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create broker');
      }
      
      toast.success('Broker created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', phone: '' });
      fetchBrokers(currentPage, searchTerm);
    } catch (err) {
      toast.error('Failed to create broker');
    } finally {
      setSubmitting(false);
    }
  }, [formData, currentPage, searchTerm, fetchBrokers]);

  // Update broker
  const updateBroker = useCallback(async () => {
    if (!selectedBroker || !formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await fetch(`/api/brokers/${selectedBroker?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update broker');
      }
      
      toast.success('Broker updated successfully');
      setShowEditModal(false);
      setSelectedBroker(null);
      setFormData({ name: '', phone: '' });
      fetchBrokers(currentPage, searchTerm);
    } catch (err) {
      toast.error('Failed to update broker');
    } finally {
      setSubmitting(false);
    }
  }, [selectedBroker, formData, currentPage, searchTerm, fetchBrokers]);

  // Delete broker
  const deleteBroker = useCallback(async () => {
    if (!selectedBroker) return;
    
    try {
      setSubmitting(true);
      const response = await fetch(`/api/brokers/${selectedBroker.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete broker');
      }
      
      toast.success('Broker deleted successfully');
      setShowDeleteModal(false);
      setSelectedBroker(null);
      fetchBrokers(currentPage, searchTerm);
    } catch (err) {
      toast.error('Failed to delete broker');
    } finally {
      setSubmitting(false);
    }
  }, [selectedBroker, currentPage, searchTerm, fetchBrokers]);

  // Handle search with debouncing
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debouncing
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchBrokers(1, value);
    }, 500); // 500ms debounce delay
  }, [fetchBrokers]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchBrokers(page, searchTerm);
  }, [searchTerm, fetchBrokers]);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setFormData({ name: '', phone: '' });
    setShowCreateModal(true);
  }, []);

  const openEditModal = useCallback((broker: Broker) => {
    setSelectedBroker(broker);
    setFormData({ name: broker.name, phone: broker.phone });
    setShowEditModal(true);
  }, []);

  const openDeleteModal = useCallback((broker: Broker) => {
    setSelectedBroker(broker);
    setShowDeleteModal(true);
  }, []);

  // Import handlers
  const openImportModal = useCallback(() => {
    setImportStatus(null);
    setShowImportModal(true);
  }, []);

  const handleImport = useCallback(async () => {
    try {
      setImporting(true);
      setImportStatus(null);

      const response = await fetch('/api/brokers/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setImportStatus({
          success: true,
          message: result.message,
          stats: result.stats
        });
        toast.success('Broker import completed successfully!');
        // Refresh the brokers list
        fetchBrokers(currentPage, searchTerm);
      } else {
        setImportStatus({
          success: false,
          message: result.error || 'Import failed'
        });
        toast.error(result.error || 'Import failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      setImportStatus({
        success: false,
        message: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setImporting(false);
    }
  }, [currentPage, searchTerm, fetchBrokers]);

  // Fetch brokers on component mount
  useEffect(() => {
    fetchBrokers();
    
    // Cleanup function to cancel any pending debounced searches
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [fetchBrokers]);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <div className={`flex-1 transition-all duration-300 overflow-x-hidden ${sidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        <AdminTopNavbar toggleSidebar={toggleSidebar} />
        
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Brokers Management</h1>
            <p className="text-gray-600">Manage your real estate brokers and their information</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Brokers</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryData.totalBrokers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Brokers</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryData.activeBrokers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryData.totalSales}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryData.newBrokersThisMonth}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search brokers..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="h-4 w-4" />
                    Filter
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={openImportModal}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Upload className="h-4 w-4" />
                    Import Brokers
                  </button>
                  <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Broker
                  </button>
                </div>
              </div>
            </div>

            {/* Brokers List */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-4">Loading brokers...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">{error}</div>
              ) : brokers.length === 0 ? (
                <div className="text-center py-4">No brokers found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Broker</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {brokers.map((broker) => (
                        <tr key={broker.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={broker.image}
                                alt={broker.name}
                                className="w-12 h-12 rounded-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23f0f0f0"/><text x="50%" y="50%" font-size="20" text-anchor="middle" dominant-baseline="middle" font-family="Arial" fill="%23a0a0a0">?</text></svg>';
                                }}
                              />
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{broker.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="relative inline-block text-left group">
                              <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                                <MoreVertical size={16} />
                              </button>
                              <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                                <button
                                  onClick={() => openEditModal(broker)}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <div className="flex items-center">
                                    <Edit size={16} className="mr-2" />
                                    <span>Edit</span>
                                  </div>
                                </button>
                                <button
                                  onClick={() => openDeleteModal(broker)}
                                  className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                >
                                  <div className="flex items-center">
                                    <Trash2 size={16} className="mr-2" />
                                    <span>Delete</span>
                                  </div>
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {!loading && !error && brokers.length > 0 && (
          <div className="flex justify-center mt-6">
            {/* Previous button */}
            <button
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`mx-1 px-2 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              <ChevronLeft size={16} />
            </button>
            
            {/* Page numbers with ellipsis */}
            {(() => {
              const totalPages = pagination.totalPages;
              const currentPageNum = currentPage;
              const pageNumbers = [];
              
              if (totalPages <= 5) {
                // Show all pages if 5 or fewer
                for (let i = 1; i <= totalPages; i++) {
                  pageNumbers.push(i);
                }
              } else {
                // Always show first page
                pageNumbers.push(1);
                
                // Show ellipsis or pages
                if (currentPageNum > 3) {
                  pageNumbers.push('...');
                }
                
                // Show current page and neighbors
                const startPage = Math.max(2, currentPageNum - 1);
                const endPage = Math.min(totalPages - 1, currentPageNum + 1);
                
                for (let i = startPage; i <= endPage; i++) {
                  if (i < totalPages) {
                    pageNumbers.push(i);
                  }
                }
                
                // Show ellipsis if needed
                if (currentPageNum < totalPages - 2) {
                  pageNumbers.push('...');
                }
                
                // Always show last page
                if (totalPages > 1) {
                  pageNumbers.push(totalPages);
                }
              }
              
              return pageNumbers.map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="mx-1 px-3 py-1">
                      ...
                    </span>
                  );
                }
                
                return (
                  <button
                    key={`page-${page}`}
                    onClick={() => handlePageChange(page as number)}
                    className={`mx-1 px-3 py-1 rounded ${currentPageNum === page ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {page}
                  </button>
                );
              });
            })()} 
            
            {/* Next button */}
            <button
              onClick={() => currentPage < pagination.totalPages && handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className={`mx-1 px-2 py-1 rounded ${currentPage === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Broker</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter broker name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={createBroker}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedBroker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Broker</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter broker name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={updateBroker}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedBroker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Broker</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedBroker.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={deleteBroker}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Import Brokers</h2>

            {!importStatus ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900">Import from Excel</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        This will import broker data from the Excel file located at:
                        <br />
                        <code className="text-xs bg-blue-100 px-1 rounded">scripts/data/ALL BROKERS NAME.xlsx</code>
                      </p>
                      <p className="text-sm text-blue-700 mt-2">
                        The system will automatically handle duplicates and preserve brokers with alphanumeric codes as separate entries.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={importing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {importing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Start Import
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`border rounded-lg p-4 ${
                  importStatus.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {importStatus.success ? (
                      <div className="h-5 w-5 text-green-600 mt-0.5">✓</div>
                    ) : (
                      <div className="h-5 w-5 text-red-600 mt-0.5">✗</div>
                    )}
                    <div>
                      <h3 className={`font-medium ${
                        importStatus.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {importStatus.success ? 'Import Successful' : 'Import Failed'}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        importStatus.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {importStatus.message}
                      </p>

                      {importStatus.success && importStatus.stats && (
                        <div className="mt-3 text-sm text-green-700">
                          <div className="grid grid-cols-2 gap-2">
                            <div>Imported: <strong>{importStatus.stats.imported}</strong></div>
                            <div>Skipped: <strong>{importStatus.stats.skipped}</strong></div>
                            <div>With codes: <strong>{importStatus.stats.withCodes}</strong></div>
                            <div>Without codes: <strong>{importStatus.stats.withoutCodes}</strong></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokersPage;
