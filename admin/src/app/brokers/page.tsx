'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Plus, Edit, Trash2, Users, Briefcase,
  ChevronLeft, ChevronRight, Upload, Phone, Mail,
  MapPin, BadgePercent, ShieldCheck, X,
} from 'lucide-react';
import CRMLayout from '@/components/CRMLayout';
import { toast } from 'react-hot-toast';

interface Broker {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  commission_rate: number | null;
  rera_number: string | null;
  source: 'directory' | 'records';
  createdAt: string | null;
}

interface BrokerFormData {
  name: string;
  phone: string;
  email: string;
  location: string;
  commission_rate: string;
  rera_number: string;
}

const emptyForm: BrokerFormData = {
  name: '', phone: '', email: '', location: '', commission_rate: '', rera_number: '',
};

interface PaginationData {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

interface SummaryData {
  totalBrokers: number;
  directoryCount: number;
  recordsCount: number;
  newThisMonth: number;
}

const inputCls =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const labelCls = 'block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide';

function BrokerFormFields({ form, setForm }: {
  form: BrokerFormData;
  setForm: (f: BrokerFormData) => void;
}) {
  const set = (k: keyof BrokerFormData, v: string) => setForm({ ...form, [k]: v });
  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          className={inputCls}
          placeholder="e.g. Sunil Broker"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            className={inputCls}
            placeholder="9876543210"
          />
        </div>
        <div>
          <label className={labelCls}>Commission %</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={form.commission_rate}
            onChange={(e) => set('commission_rate', e.target.value)}
            className={inputCls}
            placeholder="2.5"
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          className={inputCls}
          placeholder="broker@example.com"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            className={inputCls}
            placeholder="Pune West"
          />
        </div>
        <div>
          <label className={labelCls}>RERA No.</label>
          <input
            type="text"
            value={form.rera_number}
            onChange={(e) => set('rera_number', e.target.value)}
            className={inputCls}
            placeholder="A52100…"
          />
        </div>
      </div>
    </div>
  );
}

export default function BrokersPage() {
  const router = useRouter();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1, limit: 15, totalItems: 0, totalPages: 0,
  });
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalBrokers: 0, directoryCount: 0, recordsCount: 0, newThisMonth: 0,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [formData, setFormData] = useState<BrokerFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBrokers = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(search && { search }),
      });

      const response = await fetch(`/api/brokers?${params}`);
      if (!response.ok) throw new Error('Failed to fetch brokers');

      const data = await response.json();
      setBrokers(data.brokers);
      setPagination(data.pagination);
      if (data.summary) setSummaryData(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch brokers');
      toast.error('Failed to fetch brokers');
    } finally {
      setLoading(false);
    }
  }, []);

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
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create broker');

      toast.success('Broker added to directory');
      setShowCreateModal(false);
      setFormData(emptyForm);
      fetchBrokers(currentPage, searchTerm);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create broker');
    } finally {
      setSubmitting(false);
    }
  }, [formData, currentPage, searchTerm, fetchBrokers]);

  const updateBroker = useCallback(async () => {
    if (!selectedBroker || !formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      setSubmitting(true);
      const response = await fetch(`/api/brokers/${selectedBroker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update broker');

      toast.success('Broker updated');
      setShowEditModal(false);
      setSelectedBroker(null);
      setFormData(emptyForm);
      fetchBrokers(currentPage, searchTerm);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update broker');
    } finally {
      setSubmitting(false);
    }
  }, [selectedBroker, formData, currentPage, searchTerm, fetchBrokers]);

  const deleteBroker = useCallback(async () => {
    if (!selectedBroker) return;
    try {
      setSubmitting(true);
      const response = await fetch(`/api/brokers/${selectedBroker.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete broker');

      toast.success('Broker removed from directory');
      setShowDeleteModal(false);
      setSelectedBroker(null);
      fetchBrokers(currentPage, searchTerm);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete broker');
    } finally {
      setSubmitting(false);
    }
  }, [selectedBroker, currentPage, searchTerm, fetchBrokers]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchBrokers(1, value);
    }, 500);
  }, [fetchBrokers]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchBrokers(page, searchTerm);
  }, [searchTerm, fetchBrokers]);

  const openCreateModal = useCallback(() => {
    setFormData(emptyForm);
    setShowCreateModal(true);
  }, []);

  const openEditModal = useCallback((broker: Broker) => {
    setSelectedBroker(broker);
    setFormData({
      name: broker.name,
      phone: broker.phone || '',
      email: broker.email || '',
      location: broker.location || '',
      commission_rate: broker.commission_rate != null ? String(broker.commission_rate) : '',
      rera_number: broker.rera_number || '',
    });
    setShowEditModal(true);
  }, []);

  const openDeleteModal = useCallback((broker: Broker) => {
    setSelectedBroker(broker);
    setShowDeleteModal(true);
  }, []);

  useEffect(() => {
    fetchBrokers();
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [fetchBrokers]);

  const summaryCards = [
    { title: 'Total Brokers', value: summaryData.totalBrokers, icon: <Users size={20} className="text-blue-600" />, bg: 'bg-blue-50' },
    { title: 'In Directory', value: summaryData.directoryCount, icon: <ShieldCheck size={20} className="text-green-600" />, bg: 'bg-green-50' },
    { title: 'From Records', value: summaryData.recordsCount, icon: <Briefcase size={20} className="text-amber-600" />, bg: 'bg-amber-50' },
    { title: 'New This Month', value: summaryData.newThisMonth, icon: <Users size={20} className="text-purple-600" />, bg: 'bg-purple-50' },
  ];

  return (
    <CRMLayout>
      <div className="page-container">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="page-title">Brokers Management</h1>
              <p className="page-subtitle">
                Directory brokers are fully editable · records brokers come from imported data
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => router.push('/data-import?entity=broker')}
                className="btn btn-secondary btn-sm"
              >
                <Upload size={16} />
                Import Excel
              </button>
              <button
                onClick={openCreateModal}
                className="btn btn-primary btn-sm"
              >
                <Plus size={16} />
                Add Broker
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {summaryCards.map((item, index) => (
              <div key={index} className={`p-4 rounded-lg border border-gray-200 ${item.bg}`}>
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

          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Brokers Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  Loading brokers...
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
              ) : brokers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users size={32} className="mx-auto mb-4 text-gray-400" />
                  <p>No brokers found.</p>
                  <p className="text-sm mt-1">Add one to the directory or import from Excel.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Broker</th>
                      <th className="px-6 py-3">Contact</th>
                      <th className="px-6 py-3">Commission</th>
                      <th className="px-6 py-3">Source</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {brokers.map((broker) => (
                      <tr key={broker.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                              style={{ background: 'var(--gold-muted)', color: 'var(--gold-dark)' }}
                            >
                              {broker.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{broker.name}</div>
                              {broker.location && (
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <MapPin size={11} /> {broker.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {broker.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone size={12} className="text-gray-400" /> {broker.phone}
                            </div>
                          )}
                          {broker.email && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                              <Mail size={12} className="text-gray-400" /> {broker.email}
                            </div>
                          )}
                          {!broker.phone && !broker.email && <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {broker.commission_rate != null ? (
                            <span className="inline-flex items-center gap-1">
                              <BadgePercent size={14} className="text-gray-400" />
                              {broker.commission_rate}%
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {broker.source === 'directory' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              Directory
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                              title="Name referenced in imported records — read-only"
                            >
                              From records
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {broker.source === 'directory' ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditModal(broker)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                                title="Edit"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => openDeleteModal(broker)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Read-only</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && !loading && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span> —{' '}
                  <span className="font-medium">{pagination.totalItems}</span> brokers
                </p>
                <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm ${currentPage === pagination.totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Broker</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <BrokerFormFields form={formData} setForm={setFormData} />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={createBroker}
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? 'Creating...' : 'Add Broker'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedBroker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Broker</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <BrokerFormFields form={formData} setForm={setFormData} />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={updateBroker}
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedBroker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Delete Broker</h2>
            <p className="text-gray-600 mb-6">
              Remove <strong>{selectedBroker.name}</strong> from the directory? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={deleteBroker}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
