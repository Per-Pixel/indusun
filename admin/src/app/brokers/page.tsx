'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Plus, Edit, Trash2, Users, Briefcase,
  ChevronLeft, ChevronRight, Upload, Phone, Mail,
  MapPin, BadgePercent, X, Copy, Check,
  Eye, IndianRupee, Hash, ArrowUpDown, Filter,
} from 'lucide-react';
import CRMLayout from '@/components/CRMLayout';
import { toast } from 'react-hot-toast';

interface Broker {
  id: string;
  name: string;
  broker_code?: string | null;
  raw_identifier?: string | null;
  deal_count?: number;
  total_revenue?: number;
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
  broker_code: string;
  raw_identifier: string;
  phone: string;
  email: string;
  location: string;
  commission_rate: string;
  rera_number: string;
}

const emptyForm: BrokerFormData = {
  name: '',
  broker_code: '',
  raw_identifier: '',
  phone: '',
  email: '',
  location: '',
  commission_rate: '',
  rera_number: '',
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
  codedCount?: number;
  uncodedCount?: number;
  totalDeals?: number;
  totalRevenue?: number;
  newThisMonth: number;
}

const inputCls =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const labelCls = 'block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide';

function fmtINR(n: number | null | undefined) {
  const val = Number(n) || 0;
  return `₹${val.toLocaleString('en-IN')}`;
}

function BrokerFormFields({ form, setForm }: {
  form: BrokerFormData;
  setForm: (f: BrokerFormData) => void;
}) {
  const set = (k: keyof BrokerFormData, v: string) => setForm({ ...form, [k]: v });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Broker / Associate Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className={inputCls}
            placeholder="e.g. JUBER / BS / Sunil"
          />
        </div>
        <div>
          <label className={labelCls}>Broker / BA Code</label>
          <input
            type="text"
            value={form.broker_code}
            onChange={(e) => set('broker_code', e.target.value)}
            className={inputCls}
            placeholder="e.g. GKC/10/RS or BS"
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Full Record Code / Identifier (Optional)</label>
        <input
          type="text"
          value={form.raw_identifier}
          onChange={(e) => set('raw_identifier', e.target.value)}
          className={inputCls}
          placeholder="e.g. GKC/10/RS/JUBER"
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
            placeholder="Umbergam / Valsad"
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
  const [filterType, setFilterType] = useState<'all' | 'coded' | 'uncoded'>('all');
  const [sortBy, setSortBy] = useState<'deals_desc' | 'revenue_desc' | 'code_asc' | 'name_asc'>('deals_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1, limit: 25, totalItems: 0, totalPages: 0,
  });
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalBrokers: 0,
    directoryCount: 0,
    recordsCount: 0,
    codedCount: 0,
    uncodedCount: 0,
    totalDeals: 0,
    totalRevenue: 0,
    newThisMonth: 0,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [formData, setFormData] = useState<BrokerFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBrokers = useCallback(async (
    page: number = 1,
    search: string = '',
    filter: string = 'all',
    sort: string = 'deals_desc'
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
        filter,
        sort,
        ...(search && { search }),
      });

      const response = await fetch(`/api/brokers?${params}`);
      if (!response.ok) throw new Error('Failed to fetch brokers');

      const data = await response.json();
      setBrokers(data.brokers || []);
      setPagination(data.pagination || { page: 1, limit: 25, totalItems: 0, totalPages: 0 });
      if (data.summary) setSummaryData(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch brokers');
      toast.error('Failed to fetch brokers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let initialSearch = '';
    let initialFilter: 'all' | 'coded' | 'uncoded' = 'all';
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      initialSearch = sp.get('search') || '';
      const f = sp.get('filter');
      if (f === 'coded' || f === 'uncoded') initialFilter = f;
      if (initialSearch) setSearchTerm(initialSearch);
      if (initialFilter !== 'all') setFilterType(initialFilter);
    }
    fetchBrokers(1, initialSearch, initialFilter, 'deals_desc');
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [fetchBrokers]);

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
      fetchBrokers(currentPage, searchTerm, filterType, sortBy);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create broker');
    } finally {
      setSubmitting(false);
    }
  }, [formData, currentPage, searchTerm, filterType, sortBy, fetchBrokers]);

  const updateBroker = useCallback(async () => {
    if (!selectedBroker || !formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      setSubmitting(true);
      const response = await fetch(`/api/brokers/${encodeURIComponent(selectedBroker.id)}`, {
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
      fetchBrokers(currentPage, searchTerm, filterType, sortBy);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update broker');
    } finally {
      setSubmitting(false);
    }
  }, [selectedBroker, formData, currentPage, searchTerm, filterType, sortBy, fetchBrokers]);

  const deleteBroker = useCallback(async () => {
    if (!selectedBroker) return;
    try {
      setSubmitting(true);
      const response = await fetch(`/api/brokers/${encodeURIComponent(selectedBroker.id)}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete broker');

      toast.success('Broker removed from directory');
      setShowDeleteModal(false);
      setSelectedBroker(null);
      fetchBrokers(currentPage, searchTerm, filterType, sortBy);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete broker');
    } finally {
      setSubmitting(false);
    }
  }, [selectedBroker, currentPage, searchTerm, filterType, sortBy, fetchBrokers]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchBrokers(1, value, filterType, sortBy);
    }, 300);
  }, [fetchBrokers, filterType, sortBy]);

  const handleFilterChange = useCallback((nextFilter: 'all' | 'coded' | 'uncoded') => {
    setFilterType(nextFilter);
    setCurrentPage(1);
    fetchBrokers(1, searchTerm, nextFilter, sortBy);
  }, [fetchBrokers, searchTerm, sortBy]);

  const handleSortChange = useCallback((nextSort: 'deals_desc' | 'revenue_desc' | 'code_asc' | 'name_asc') => {
    setSortBy(nextSort);
    setCurrentPage(1);
    fetchBrokers(1, searchTerm, filterType, nextSort);
  }, [fetchBrokers, searchTerm, filterType]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchBrokers(page, searchTerm, filterType, sortBy);
  }, [searchTerm, filterType, sortBy, fetchBrokers]);

  const copyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied code: ${code}`);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const openCreateModal = useCallback(() => {
    setFormData(emptyForm);
    setShowCreateModal(true);
  }, []);

  const openEditModal = useCallback((broker: Broker) => {
    setSelectedBroker(broker);
    setFormData({
      name: broker.name,
      broker_code: broker.broker_code || '',
      raw_identifier: broker.raw_identifier || '',
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

  const summaryCards = [
    {
      title: 'Total Brokers',
      value: (summaryData.totalBrokers || 0).toLocaleString('en-IN'),
      sub: `${(summaryData.directoryCount || 0).toLocaleString('en-IN')} in directory`,
      icon: <Users size={20} className="text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      title: 'With Broker / BA Code',
      value: (summaryData.codedCount ?? summaryData.newThisMonth ?? 0).toLocaleString('en-IN'),
      sub: `${(summaryData.uncodedCount ?? 0).toLocaleString('en-IN')} direct / named`,
      icon: <Hash size={20} className="text-amber-600" />,
      bg: 'bg-amber-50',
    },
    {
      title: 'Total Brokered Plots',
      value: (summaryData.totalDeals || 0).toLocaleString('en-IN'),
      sub: 'Across all societies',
      icon: <Briefcase size={20} className="text-emerald-600" />,
      bg: 'bg-emerald-50',
    },
    {
      title: 'Collected Revenue',
      value: fmtINR(summaryData.totalRevenue || 0),
      sub: 'Total paid via brokers',
      icon: <IndianRupee size={20} className="text-purple-600" />,
      bg: 'bg-purple-50',
    },
  ];

  return (
    <CRMLayout>
      <div className="page-container">
        <div className="max-w-7xl mx-auto space-y-5">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="breadcrumb mb-1">
                <span>CRM</span>
                <span className="sep">/</span>
                <span className="current">Brokers &amp; Codes</span>
              </p>
              <h1 className="page-title">Brokers &amp; BA Codes Directory</h1>
              <p className="page-subtitle">
                Search all {(summaryData.totalBrokers || 0).toLocaleString('en-IN')} brokers, GKC / BA codes, plot deals, and customer portfolios
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => router.push('/data-import?entity=broker')}
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
              >
                <Upload size={15} />
                Import Excel
              </button>
              <button
                onClick={openCreateModal}
                className="btn btn-primary btn-sm flex items-center gap-1.5"
              >
                <Plus size={15} />
                Add Broker
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((item, index) => (
              <div key={index} className={`p-4 rounded-xl border border-gray-200 ${item.bg}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">{item.title}</p>
                    <p className="text-xl font-bold mt-1 text-gray-900">{item.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white shadow-sm">{item.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Search + Filter + Sort Bar */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={17} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by broker name (e.g. JUBER, RAJESH), GKC / BA code (e.g. GKC/10/RS, GKC/0013/FLY, BS), phone, or email..."
                  className="block w-full pl-10 pr-9 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => handleSearch('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown size={15} className="text-gray-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as any)}
                  className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="deals_desc">Sort: Most Deals</option>
                  <option value="revenue_desc">Sort: Highest Revenue</option>
                  <option value="code_asc">Sort: Broker Code (A–Z)</option>
                  <option value="name_asc">Sort: Broker Name (A–Z)</option>
                </select>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <Filter size={12} /> Filter:
                </span>
                {[
                  { key: 'all' as const, label: `All Brokers (${(summaryData.totalBrokers || 0).toLocaleString('en-IN')})` },
                  { key: 'coded' as const, label: `With GKC / BA Code (${(summaryData.codedCount ?? summaryData.newThisMonth ?? 0).toLocaleString('en-IN')})` },
                  { key: 'uncoded' as const, label: `Direct / Named (${(summaryData.uncodedCount ?? 0).toLocaleString('en-IN')})` },
                ].map((tab) => {
                  const active = filterType === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => handleFilterChange(tab.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        active
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {(searchTerm || filterType !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setCurrentPage(1);
                    fetchBrokers(1, '', 'all', sortBy);
                  }}
                  className="text-xs font-medium text-red-600 hover:underline flex items-center gap-1"
                >
                  <X size={12} /> Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Brokers Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-10 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  Loading brokers and codes...
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
              ) : brokers.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  <Users size={32} className="mx-auto mb-3 text-gray-400" />
                  <p className="font-medium text-gray-700">No brokers found matching your search.</p>
                  <p className="text-sm mt-1">Try searching a partial GKC code (e.g. GKC/10 or FLY) or add a new broker.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <th className="px-5 py-3.5">Broker / Associate Name</th>
                      <th className="px-5 py-3.5">Broker / BA Code</th>
                      <th className="px-5 py-3.5">Full Record Code</th>
                      <th className="px-5 py-3.5">Deals (Plots)</th>
                      <th className="px-5 py-3.5">Collected Revenue</th>
                      <th className="px-5 py-3.5">Contact</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {brokers.map((broker) => {
                      const codeToCopy = broker.broker_code || broker.raw_identifier || broker.name;
                      const customerFilterVal = broker.raw_identifier || broker.broker_code || broker.name;
                      return (
                        <tr
                          key={broker.id}
                          onClick={() => router.push(`/brokers/${encodeURIComponent(broker.id)}`)}
                          className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                        >
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                style={{ background: 'var(--gold-muted)', color: 'var(--gold-dark)' }}
                              >
                                {broker.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-semibold text-gray-900 hover:text-blue-600">
                                  {broker.name}
                                </div>
                                {broker.location && (
                                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <MapPin size={11} /> {broker.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {broker.broker_code ? (
                              <div className="inline-flex items-center gap-1.5">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300">
                                  {broker.broker_code}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => copyCode(broker.broker_code!, e)}
                                  title="Copy Broker Code"
                                  className="p-1 text-gray-400 hover:text-amber-700 rounded hover:bg-amber-50"
                                >
                                  {copiedCode === broker.broker_code ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                                </button>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                Direct / Named
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {broker.raw_identifier ? (
                              <div className="inline-flex items-center gap-1.5">
                                <span className="text-xs font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                  {broker.raw_identifier}
                                </span>
                                {broker.raw_identifier !== broker.broker_code && (
                                  <button
                                    type="button"
                                    onClick={(e) => copyCode(broker.raw_identifier!, e)}
                                    title="Copy Full Record Identifier"
                                    className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
                                  >
                                    {copiedCode === broker.raw_identifier ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {(broker.deal_count || 0).toLocaleString('en-IN')} plots
                            </span>
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="text-sm font-semibold text-emerald-700">
                              {fmtINR(broker.total_revenue || 0)}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-600">
                            {broker.phone && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <Phone size={12} className="text-gray-400" /> {broker.phone}
                              </div>
                            )}
                            {broker.email && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                <Mail size={12} className="text-gray-400" /> {broker.email}
                              </div>
                            )}
                            {broker.commission_rate != null && (
                              <div className="flex items-center gap-1 text-xs text-purple-700 font-medium mt-0.5">
                                <BadgePercent size={12} /> {broker.commission_rate}% comm.
                              </div>
                            )}
                            {!broker.phone && !broker.email && broker.commission_rate == null && (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>

                          <td
                            className="px-5 py-3.5 whitespace-nowrap text-right text-sm font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-end items-center gap-1.5">
                              <Link
                                href={`/brokers/${encodeURIComponent(broker.id)}`}
                                className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md inline-flex items-center gap-1"
                                title="View Broker Profile & Deals"
                              >
                                <Eye size={13} /> Deals
                              </Link>
                              <Link
                                href={`/customers?broker=${encodeURIComponent(customerFilterVal)}`}
                                className="px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md inline-flex items-center gap-1"
                                title="View Customers for this Broker"
                              >
                                <Users size={13} /> Clients
                              </Link>
                              <button
                                onClick={() => openEditModal(broker)}
                                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                                title="Edit Broker"
                              >
                                <Edit size={15} />
                              </button>
                              {broker.source === 'directory' && (
                                <button
                                  onClick={() => openDeleteModal(broker)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                  title="Delete Broker"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && !loading && (
              <div className="px-6 py-3.5 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-700">
                  Page <span className="font-semibold">{currentPage.toLocaleString('en-IN')}</span> of{' '}
                  <span className="font-semibold">{pagination.totalPages.toLocaleString('en-IN')}</span> —{' '}
                  <span className="font-semibold">{pagination.totalItems.toLocaleString('en-IN')}</span> brokers matching
                </p>
                <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2.5 py-1.5 rounded-l-md border border-gray-300 bg-white text-sm ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className={`relative inline-flex items-center px-2.5 py-1.5 rounded-r-md border border-gray-300 bg-white text-sm ${currentPage === pagination.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <ChevronRight className="h-4 w-4" />
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Broker &amp; Code</h2>
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
                {submitting ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedBroker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Delete Broker</h2>
            <p className="text-gray-600 mb-6">
              Remove <strong>{selectedBroker.name}</strong> {selectedBroker.broker_code ? `(${selectedBroker.broker_code})` : ''} from the directory?
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
