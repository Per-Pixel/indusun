'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import CRMLayout from '@/components/CRMLayout';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Unlink,
  Mail,
  Phone,
  MapPin,
  Users,
  Building2,
  IndianRupee,
  Briefcase,
  Copy,
  Check,
  Search,
  Eye,
  Hash,
  BadgePercent,
  X,
} from 'lucide-react';
import { parseAmount } from '@/utils/dataUtils';

interface BrokerDetail {
  id: string;
  name: string;
  broker_code: string | null;
  raw_identifier: string | null;
  deal_count: number;
  total_revenue: number;
  email: string | null;
  phone: string | null;
  location: string | null;
  commission_rate: number | null;
  rera_number: string | null;
  source: 'directory' | 'records';
  createdAt: string | null;
}

interface BrokerStats {
  totalDeals: number;
  totalRevenue: number;
  sampleBookedAmount: number;
  samplePaidAmount: number;
  activeInSample: number;
  cancelledInSample: number;
  societiesCount: number;
  societies: string[];
}

function fmtINR(n: number | null | undefined) {
  return `₹${(Number(n) || 0).toLocaleString('en-IN')}`;
}

export default function BrokerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const brokerId = params.id as string;

  const [broker, setBroker] = useState<BrokerDetail | null>(null);
  const [stats, setStats] = useState<BrokerStats | null>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dealSearch, setDealSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'unlink' | 'delete_deals'>('unlink');
  const [processingDealId, setProcessingDealId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    broker_code: '',
    raw_identifier: '',
    phone: '',
    email: '',
    location: '',
    commission_rate: '',
    rera_number: '',
  });

  const loadBroker = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/brokers/${encodeURIComponent(brokerId)}`);
      if (!res.ok) {
        throw new Error('Broker not found');
      }
      const data = await res.json();
      setBroker(data.broker);
      setStats(data.stats || null);
      setDeals(data.deals || []);
      setFormData({
        name: data.broker.name || '',
        broker_code: data.broker.broker_code || '',
        raw_identifier: data.broker.raw_identifier || '',
        phone: data.broker.phone || '',
        email: data.broker.email || '',
        location: data.broker.location || '',
        commission_rate: data.broker.commission_rate != null ? String(data.broker.commission_rate) : '',
        rera_number: data.broker.rera_number || '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Broker not found');
    } finally {
      setIsLoading(false);
    }
  }, [brokerId]);

  useEffect(() => {
    loadBroker();
  }, [loadBroker]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const handleSaveEdit = async () => {
    if (!broker || !formData.name.trim()) {
      toast.error('Broker name is required');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(`/api/brokers/${encodeURIComponent(broker.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update broker');
      toast.success('Broker details updated');
      setShowEditModal(false);
      await loadBroker();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update broker');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBroker = async () => {
    if (!broker) return;
    try {
      setSubmitting(true);
      const res = await fetch(
        `/api/brokers/${encodeURIComponent(broker.id)}?mode=${deleteMode}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: deleteMode }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete broker');
      toast.success(
        deleteMode === 'delete_deals'
          ? 'Broker and associated deals deleted'
          : 'Broker removed and unlinked from deals'
      );
      setShowDeleteModal(false);
      router.push('/brokers');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete broker');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDealAction = async (
    dealId: number,
    action: 'unlink_deal' | 'delete_deal',
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!broker) return;
    try {
      setProcessingDealId(dealId);
      const res = await fetch(`/api/brokers/${encodeURIComponent(broker.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, dealId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update deal');

      toast.success(
        action === 'delete_deal'
          ? 'Deal record deleted from Master Data'
          : 'Deal unlinked from broker'
      );

      setDeals((prev) => prev.filter((item) => item.id !== dealId));
      setStats((prev) =>
        prev
          ? {
              ...prev,
              totalDeals: Math.max(0, prev.totalDeals - 1),
            }
          : prev
      );
      setBroker((prev) =>
        prev
          ? {
              ...prev,
              deal_count: Math.max(0, (prev.deal_count || 0) - 1),
            }
          : prev
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update deal');
    } finally {
      setProcessingDealId(null);
    }
  };

  const filteredDeals = useMemo(() => {
    const q = dealSearch.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter(
      (d) =>
        String(d.client_name || '').toLowerCase().includes(q) ||
        String(d.society_name || '').toLowerCase().includes(q) ||
        String(d.plot_no || '').toLowerCase().includes(q) ||
        String(d.registration_no || d.r_no || '').toLowerCase().includes(q) ||
        String(d.contact_no || '').toLowerCase().includes(q)
    );
  }, [deals, dealSearch]);

  if (isLoading) {
    return (
      <CRMLayout>
        <div className="page-container flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </CRMLayout>
    );
  }

  if (!broker) {
    return (
      <CRMLayout>
        <div className="page-container">
          <div className="max-w-3xl mx-auto card p-10 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Broker Not Found</h2>
            <p className="text-gray-500 mb-4">The broker you requested could not be found.</p>
            <button
              onClick={() => router.push('/brokers')}
              className="btn btn-primary btn-sm"
            >
              Back to Brokers Directory
            </button>
          </div>
        </div>
      </CRMLayout>
    );
  }

  const customerFilterParam = broker.raw_identifier || broker.broker_code || broker.name;

  return (
    <CRMLayout>
      <div className="page-container">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top navigation */}
          <div>
            <Link
              href="/brokers"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-3"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Brokers &amp; Codes
            </Link>

            {/* Broker Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                    style={{ background: 'var(--gold-muted)', color: 'var(--gold-dark)' }}
                  >
                    {broker.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="text-2xl font-bold text-gray-900">{broker.name}</h1>
                      {broker.broker_code ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300">
                          Code: {broker.broker_code}
                          <button
                            type="button"
                            onClick={() => copyText(broker.broker_code!)}
                            className="hover:text-amber-700"
                            title="Copy Broker Code"
                          >
                            {copiedCode === broker.broker_code ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          </button>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Direct / Named Broker
                        </span>
                      )}
                    </div>

                    {broker.raw_identifier && (
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-600">
                        <span className="font-medium text-gray-500">Master Data Record Code:</span>
                        <code className="px-2 py-0.5 bg-gray-100 rounded border border-gray-200 font-mono text-gray-800">
                          {broker.raw_identifier}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyText(broker.raw_identifier!)}
                          className="text-gray-400 hover:text-gray-700"
                          title="Copy Full Record Identifier"
                        >
                          {copiedCode === broker.raw_identifier ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                      {broker.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone size={14} className="text-gray-400" /> {broker.phone}
                        </span>
                      )}
                      {broker.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail size={14} className="text-gray-400" /> {broker.email}
                        </span>
                      )}
                      {broker.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-gray-400" /> {broker.location}
                        </span>
                      )}
                      {broker.commission_rate != null && (
                        <span className="flex items-center gap-1 text-purple-700 font-medium">
                          <BadgePercent size={14} /> {broker.commission_rate}% Commission
                        </span>
                      )}
                      {broker.rera_number && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                          RERA: {broker.rera_number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/customers?broker=${encodeURIComponent(customerFilterParam)}`}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5"
                  >
                    <Users size={15} />
                    Open in Customer Profiles
                  </Link>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="btn btn-primary btn-sm flex items-center gap-1.5"
                  >
                    <Edit size={15} />
                    Edit Broker &amp; Code
                  </button>
                  <button
                    onClick={() => {
                      setDeleteMode('unlink');
                      setShowDeleteModal(true);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Trash2 size={15} />
                    Delete Broker
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Deals / Plots</span>
                <Briefcase size={18} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {(stats?.totalDeals ?? broker.deal_count ?? 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total plots associated in Master Data</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Collected Revenue</span>
                <IndianRupee size={18} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-700">
                {fmtINR(stats?.totalRevenue ?? broker.total_revenue ?? 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total paid across brokered plots</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Broker / BA Code</span>
                <Hash size={18} className="text-amber-600" />
              </div>
              <p className="text-lg font-mono font-bold text-amber-900 truncate">
                {broker.broker_code || 'Direct / Named'}
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                Record: {broker.raw_identifier || broker.name}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Societies Active</span>
                <Building2 size={18} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.societiesCount ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {stats?.societies?.slice(0, 2).join(', ') || 'Across Gurukrupa projects'}
              </p>
            </div>
          </div>

          {/* Deals / Customers Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Customers &amp; Plots Handled ({filteredDeals.length.toLocaleString('en-IN')} shown)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Recent customer bookings and plots linked to {broker.raw_identifier || broker.name}
                </p>
              </div>
              <div className="relative sm:w-72">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={dealSearch}
                  onChange={(e) => setDealSearch(e.target.value)}
                  placeholder="Filter by client, Reg #, society, plot..."
                  className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {dealSearch && (
                  <button
                    type="button"
                    onClick={() => setDealSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredDeals.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  No customer deals found matching your filter.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-5 py-3">Reg / R. No.</th>
                      <th className="px-5 py-3">Customer Name</th>
                      <th className="px-5 py-3">Society &amp; Block</th>
                      <th className="px-5 py-3">Plot &amp; Size</th>
                      <th className="px-5 py-3">Plot Amount</th>
                      <th className="px-5 py-3">Paid Amount</th>
                      <th className="px-5 py-3">Code on Record</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDeals.map((d) => {
                      const plotAmt = parseAmount(d.plot_amount);
                      const paidAmt = parseAmount(d.paid_amount);
                      return (
                        <tr
                          key={d.id}
                          onClick={() => router.push(`/customers/${d.id}`)}
                          className="hover:bg-blue-50/40 cursor-pointer"
                        >
                          <td className="px-5 py-3 whitespace-nowrap text-xs font-mono text-amber-900">
                            {d.registration_no || d.r_no ? (
                              <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 font-semibold">
                                #{d.registration_no || d.r_no}
                              </span>
                            ) : (
                              <span className="text-gray-400">#{d.id}</span>
                            )}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{d.client_name || '—'}</div>
                            {d.contact_no && <div className="text-xs text-gray-500">{d.contact_no}</div>}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-800">{d.society_name || '—'}</div>
                            {d.block_name && <div className="text-xs text-blue-600">{d.block_name}</div>}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700">
                            Plot {d.plot_no || '—'}
                            {d.plot_size && <span className="text-xs text-gray-500 block">{d.plot_size}</span>}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {plotAmt > 0 ? fmtINR(plotAmt) : '—'}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-sm font-semibold text-emerald-700">
                            {paidAmt > 0 ? fmtINR(paidAmt) : '—'}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-800 border border-gray-200">
                              {d.broker_code || d.ba_code || d["broker's_name"] || '—'}
                            </span>
                          </td>
                          <td
                            className="px-5 py-3 whitespace-nowrap text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center justify-end gap-2">
                              <Link
                                href={`/customers/${d.id}`}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                              >
                                <Eye size={13} /> Profile
                              </Link>
                              <button
                                type="button"
                                disabled={processingDealId === d.id}
                                onClick={(e) => handleDealAction(d.id, 'unlink_deal', e)}
                                title="Unlink this deal from broker (keep customer record)"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 disabled:opacity-50"
                              >
                                <Unlink size={13} /> Unlink
                              </button>
                              <button
                                type="button"
                                disabled={processingDealId === d.id}
                                onClick={(e) => handleDealAction(d.id, 'delete_deal', e)}
                                title="Permanently delete this deal record"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Broker &amp; Code</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Broker Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Broker / BA Code</label>
                  <input
                    type="text"
                    value={formData.broker_code}
                    onChange={(e) => setFormData({ ...formData, broker_code: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Full Record Identifier</label>
                <input
                  type="text"
                  value={formData.raw_identifier}
                  onChange={(e) => setFormData({ ...formData, raw_identifier: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Commission %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">RERA No.</label>
                  <input
                    type="text"
                    value={formData.rera_number}
                    onChange={(e) => setFormData({ ...formData, rera_number: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Broker Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900">Delete Broker</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Choose how you want to remove{' '}
              <strong>{broker.name}</strong>{' '}
              {broker.broker_code ? `(${broker.broker_code})` : ''}
              {stats?.totalDeals ?? broker.deal_count
                ? ` — ${(stats?.totalDeals ?? broker.deal_count ?? 0).toLocaleString('en-IN')} associated deal(s)`
                : ''}
              :
            </p>

            <div className="space-y-3 mb-6">
              <label
                onClick={() => setDeleteMode('unlink')}
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                  deleteMode === 'unlink'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="deleteBrokerMode"
                  value="unlink"
                  checked={deleteMode === 'unlink'}
                  onChange={() => setDeleteMode('unlink')}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    Remove broker &amp; unlink from deals
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    Keeps customer/plot records in Master Data and clears the broker assignment.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setDeleteMode('delete_deals')}
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                  deleteMode === 'delete_deals'
                    ? 'border-red-600 bg-red-50/50 ring-1 ring-red-600'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="deleteBrokerMode"
                  value="delete_deals"
                  checked={deleteMode === 'delete_deals'}
                  onChange={() => setDeleteMode('delete_deals')}
                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="text-sm font-semibold text-red-700">
                    Delete broker &amp; delete all associated deal records
                  </div>
                  <div className="text-xs text-red-600/80 mt-0.5">
                    Permanently deletes their Master Data deal rows along with the broker entry.
                  </div>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBroker}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium inline-flex items-center gap-1.5"
              >
                <Trash2 size={15} />
                {submitting
                  ? 'Processing...'
                  : deleteMode === 'delete_deals'
                  ? 'Delete Broker & Deals'
                  : 'Remove & Unlink'}
              </button>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
