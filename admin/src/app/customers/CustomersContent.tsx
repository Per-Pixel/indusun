'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  AlertCircle,
  Building2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  Home,
  Phone,
  Plus,
  Search,
  Square,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
  XCircle,
  UploadCloud,
} from 'lucide-react';
import { MasterDataOfGurukrupa, MasterDataSummary } from '@/types/masterData';
import { parseAmount } from '@/utils/dataUtils';

const PAGE_SIZE = 25;

interface Filters {
  search: string;
  society: string;
  broker: string;
  status: string;
  sort: string;
}

interface Props {
  customers: MasterDataOfGurukrupa[];
  totalCount: number;
  page: number;
  societies: string[];
  brokers: string[];
  filters: Filters;
  summary?: MasterDataSummary | null;
  error: Error | null;
}

function classNames(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

function fmtINR(n: number) {
  return `₹${(Number(n) || 0).toLocaleString('en-IN')}`;
}

function deriveStatus(row: MasterDataOfGurukrupa) {
  const cancelled = !!row.cancel_date;
  const emi = parseAmount(row.emi_amount);
  const paid = parseAmount(row.paid_amount);

  if (cancelled) return { label: 'Cancelled', tone: 'danger' as const, icon: <X size={12} /> };
  if (emi > 0) return { label: 'Installment', tone: 'info' as const, icon: <Clock size={12} /> };
  if (paid > 0) return { label: 'Active', tone: 'success' as const, icon: <TrendingUp size={12} /> };
  return { label: 'Prospect', tone: 'gold' as const, icon: <User size={12} /> };
}

const STATUS_OPTIONS = [
  { key: '', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'installment', label: 'Installment' },
  { key: 'prospect', label: 'Prospect' },
  { key: 'cancelled', label: 'Cancelled' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'name_asc', label: 'Name A-Z' },
  { key: 'name_desc', label: 'Name Z-A' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function CustomersContent({
  customers,
  totalCount,
  page,
  societies,
  brokers,
  filters,
  summary,
  error,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [rows, setRows] = useState<MasterDataOfGurukrupa[]>(customers);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<MasterDataOfGurukrupa | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setRows(customers);
    setSelectedIds(new Set());
  }, [customers]);

  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllOnPage = () => {
    const pageIds = rows.map((r) => r.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageIds));
    }
  };

  const handleSingleDelete = async (target: MasterDataOfGurukrupa, scope: 'record' | 'customer') => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/customers/${target.id}?scope=${scope}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete');
      }
      if (scope === 'customer' && target.client_name) {
        const lower = target.client_name.trim().toLowerCase();
        setRows((prev) => prev.filter((r) => (r.client_name || '').trim().toLowerCase() !== lower));
        toast.success(`Deleted all records for ${target.client_name}`);
      } else {
        setRows((prev) => prev.filter((r) => r.id !== target.id));
        toast.success(`Deleted record #${target.id}`);
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(target.id);
        return next;
      });
      setDeleteTarget(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async (scope: 'record' | 'customer') => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    const msg =
      scope === 'customer'
        ? `Delete ALL installment/plot records for the ${ids.length} selected customer(s)? This cannot be undone.`
        : `Delete the ${ids.length} selected installment/plot record(s)? This cannot be undone.`;

    if (!window.confirm(msg)) return;

    try {
      setIsDeleting(true);
      const res = await fetch('/api/customers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, scope }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Bulk delete failed');
      }

      if (scope === 'customer') {
        const selectedNames = new Set(
          rows
            .filter((r) => selectedIds.has(r.id) && r.client_name)
            .map((r) => r.client_name!.trim().toLowerCase())
        );
        setRows((prev) =>
          prev.filter(
            (r) =>
              !selectedIds.has(r.id) &&
              !(r.client_name && selectedNames.has(r.client_name.trim().toLowerCase()))
          )
        );
        toast.success(`Deleted all records for ${data.deletedClients || ids.length} customer(s)`);
      } else {
        setRows((prev) => prev.filter((r) => !selectedIds.has(r.id)));
        toast.success(`Deleted ${ids.length} record(s)`);
      }
      setSelectedIds(new Set());
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Bulk delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const updateUrl = (updates: Partial<Filters & { page?: string }>) => {
    const next = { ...filters, page: String(page), ...updates };
    const params = new URLSearchParams();

    if (next.search) params.set('search', next.search);
    if (next.society) params.set('society', next.society);
    if (next.broker) params.set('broker', next.broker);
    if (next.status) params.set('status', next.status);
    if (next.sort && next.sort !== 'newest') params.set('sort', next.sort);
    if (next.page && next.page !== '1') params.set('page', next.page);

    startTransition(() => {
      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ''}`);
    });
  };

  const activeFilters = [
    filters.search && { key: 'search', label: `Search: "${filters.search}"` },
    filters.society && { key: 'society', label: `Society: ${filters.society}` },
    filters.broker && { key: 'broker', label: `Broker: ${filters.broker}` },
    filters.status && { key: 'status', label: `Status: ${STATUS_OPTIONS.find((s) => s.key === filters.status)?.label}` },
  ].filter(Boolean) as { key: string; label: string }[];

  const clearFilters = () => {
    setLocalSearch('');
    updateUrl({ search: '', society: '', broker: '', status: '', page: '1' });
  };

  const allPageSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));

  return (
    <div className="page-container space-y-5">
      {/* Header */}
      <div className="page-header items-center">
        <div>
          <p className="breadcrumb">
            <span>CRM</span>
            <span className="sep">/</span>
            <span className="current">Customers</span>
          </p>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">
            {(summary?.totalClients ?? 5401).toLocaleString('en-IN')} unique customers · {totalCount.toLocaleString('en-IN')} installment/plot records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/data-import?entity=customer"
            className="btn btn-secondary btn-sm flex items-center gap-2 shadow-sm"
          >
            <UploadCloud size={16} />
            Import Excel
          </Link>
          <Link
            href="/customers/add"
            className="btn btn-primary btn-sm flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            Add Customer
          </Link>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 flex items-center gap-3 border-l-4"
          style={{ borderColor: 'var(--danger)', background: 'var(--danger-bg)' }}
        >
          <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>
            {error.message}
          </p>
        </motion.div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Unique Customers', value: (summary?.totalClients ?? 0).toLocaleString('en-IN'), tone: 'gold' },
          { label: 'Total Records', value: (summary?.totalRecords ?? totalCount).toLocaleString('en-IN'), tone: 'info' },
          { label: 'Active / Paid Records', value: (summary?.soldProperties ?? 0).toLocaleString('en-IN'), tone: 'success' },
          { label: 'Cancelled Records', value: (summary?.cancelledProperties ?? 0).toLocaleString('en-IN'), tone: 'danger' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="card p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-xs-label" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </p>
              <p className="text-h2 mt-0.5">{stat.value}</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background:
                  stat.tone === 'gold'
                    ? 'var(--gold-muted)'
                    : stat.tone === 'success'
                    ? 'var(--success-bg)'
                    : stat.tone === 'info'
                    ? 'var(--info-bg)'
                    : 'var(--danger-bg)',
              }}
            >
              <Users
                size={18}
                style={{
                  color:
                    stat.tone === 'gold'
                      ? 'var(--gold-dark)'
                      : stat.tone === 'success'
                      ? 'var(--success)'
                      : stat.tone === 'info'
                      ? 'var(--info)'
                      : 'var(--danger)',
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4 space-y-4"
      >
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateUrl({ search: localSearch, page: '1' });
            }}
            className="search-wrapper flex-1 min-w-[220px] flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, Reg/R. No., bill #, phone, society, plot or broker…"
                className="input input-sm pl-9 pr-8"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    updateUrl({ search: '', page: '1' });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" disabled={isPending} className="btn btn-primary btn-sm">
              {isPending ? 'Searching…' : 'Search'}
            </button>
          </form>

          {/* Society */}
          <select
            className="input input-sm select lg:w-56"
            value={filters.society}
            onChange={(e) => updateUrl({ society: e.target.value, page: '1' })}
          >
            <option value="">All Societies</option>
            {societies.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Broker */}
          <select
            className="input input-sm select lg:w-56"
            value={filters.broker}
            onChange={(e) => updateUrl({ broker: e.target.value, page: '1' })}
          >
            <option value="">All Brokers</option>
            {brokers.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            className="input input-sm select lg:w-48"
            value={filters.sort}
            onChange={(e) => updateUrl({ sort: e.target.value })}
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Filter size={12} /> Status
          </span>
          {STATUS_OPTIONS.map((s) => {
            const active = filters.status === s.key;
            return (
              <button
                key={s.key}
                onClick={() => updateUrl({ status: s.key, page: '1' })}
                className={classNames(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  active
                    ? 'text-white'
                    : 'bg-white border hover:bg-gray-50'
                )}
                style={
                  active
                    ? {
                        background:
                          s.key === 'active'
                            ? 'var(--success)'
                            : s.key === 'installment'
                            ? 'var(--info)'
                            : s.key === 'cancelled'
                            ? 'var(--danger)'
                            : s.key === 'prospect'
                            ? 'var(--gold)'
                            : 'var(--text-primary)',
                        borderColor: 'transparent',
                      }
                    : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                }
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Active filters:
            </span>
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ background: 'var(--gold-muted)', color: 'var(--gold-dark)' }}
              >
                {f.label}
                <button
                  onClick={() => updateUrl({ [f.key]: '', page: '1' } as any)}
                  className="hover:text-[#0F172A]"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="text-xs font-medium flex items-center gap-1 hover:text-red-500 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <XCircle size={12} /> Clear all
            </button>
          </div>
        )}
        {/* Selection & Bulk Actions */}
        {rows.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAllOnPage}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded border hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                {allPageSelected ? <CheckSquare size={14} className="text-amber-600" /> : <Square size={14} />}
                Select All on Page ({rows.length})
              </button>
              {selectedIds.size > 0 && (
                <span className="text-xs font-semibold" style={{ color: 'var(--gold-dark)' }}>
                  {selectedIds.size} selected
                </span>
              )}
            </div>

            {selectedIds.size > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleBulkDelete('record')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  Delete Selected Records ({selectedIds.size})
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleBulkDelete('customer')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  Delete Entire Customer Profiles
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs px-2 py-1 text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Customer grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {rows.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="col-span-full"
          >
            <div className="empty-state card py-14">
              <div className="empty-state-icon">
                <Users size={24} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                No customers found
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Try adjusting filters or{' '}
                <Link href="/customers/add" className="text-blue-600 hover:underline font-medium">
                  add a new customer
                </Link>
              </p>
            </div>
          </motion.div>
        ) : (
          rows.map((c) => {
            const plotAmt = parseAmount(c.plot_amount);
            const paidAmt = parseAmount(c.paid_amount);
            const pct = plotAmt > 0 ? Math.round((paidAmt / plotAmt) * 100) : 0;
            const status = deriveStatus(c);
            const isSelected = selectedIds.has(c.id);

            return (
              <motion.div
                key={c.id}
                variants={itemVariants}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                onClick={() => router.push(`/customers/${c.id}`)}
                className={classNames(
                  'card p-5 cursor-pointer relative overflow-hidden group transition-shadow',
                  isSelected && 'ring-2 ring-amber-500'
                )}
              >
                {/* subtle gold accent on hover */}
                <div className="absolute inset-y-0 left-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'var(--gold)' }} />

                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(c.id);
                      }}
                      className="text-gray-400 hover:text-amber-600 shrink-0"
                      title="Select record"
                    >
                      {isSelected ? (
                        <CheckSquare size={18} className="text-amber-600" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                    <div className="avatar avatar-md font-bold shrink-0">
                      {(c.client_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold break-words" style={{ color: 'var(--text-primary)' }}>
                        {c.client_name || '—'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span
                          className="flex items-center gap-1 text-xs truncate"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Phone size={10} className="shrink-0" />
                          {c.contact_no || '—'}
                        </span>
                        {(c.registration_no || c.r_no) && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200">
                            Reg #{c.registration_no || c.r_no}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={classNames('badge shrink-0', `badge-${status.tone}`)}>
                      {status.icon}
                      {status.label}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(c);
                      }}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete customer or record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-1.5 min-w-0 truncate" style={{ color: 'var(--text-muted)' }}>
                      <Building2 size={13} className="shrink-0" />
                      <span className="truncate">{c.society_name || '—'}</span>
                    </span>
                    <span className="font-medium shrink-0 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                      Plot {c.plot_no || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                    {c.plot_size ? (
                      <span className="flex items-center gap-1.5">
                        <Home size={12} />
                        {c.plot_size}
                      </span>
                    ) : (
                      <span>Record #{c.id}</span>
                    )}
                    {c.emi_no && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                        EMI #{c.emi_no}
                      </span>
                    )}
                  </div>

                  {plotAmt > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span style={{ color: 'var(--text-muted)' }}>Receipt / Plot Ratio</span>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {pct}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(100, pct)}%`,
                            background:
                              pct >= 80
                                ? 'var(--success)'
                                : pct >= 40
                                ? 'var(--gold)'
                                : 'var(--warning)',
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1.5">
                        <span style={{ color: 'var(--text-muted)' }}>
                          Paid: <strong>{fmtINR(paidAmt)}</strong>
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Plot: <strong>{fmtINR(plotAmt)}</strong>
                        </span>
                      </div>
                    </div>
                  )}

                  {c["broker's_name"] && (
                    <p className="text-xs flex items-center gap-1.5 flex-wrap" style={{ color: 'var(--text-muted)' }}>
                      <User size={11} />
                      Broker:{' '}
                      <a
                        href={`/brokers/${encodeURIComponent(c.broker_code || c.ba_code || c["broker's_name"])}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium hover:underline"
                        style={{ color: 'var(--gold)' }}
                      >
                        {c.broker_name_clean || c["broker's_name"]}
                      </a>
                      {(c.broker_code || c.ba_code) && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200">
                          {c.broker_code || c.ba_code}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div
                  className="flex items-center justify-between mt-4 pt-3 border-t"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    #{c.id}
                  </span>
                  <span className="btn btn-ghost btn-sm pointer-events-none">
                    <Eye size={14} /> View Profile
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 max-w-md w-full space-y-4 bg-white shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Delete Customer / Record</h3>
                    <p className="text-xs text-gray-500">
                      {deleteTarget.client_name || 'Unnamed'} · Plot {deleteTarget.plot_no || '—'} ({deleteTarget.society_name || '—'})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-600">
                Choose whether to delete only this single installment/plot receipt row or remove all records for this customer across the entire database:
              </p>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleSingleDelete(deleteTarget, 'record')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50/50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Delete this installment/plot record (#{deleteTarget.id})
                    </p>
                    <p className="text-xs text-gray-500">
                      Paid: {fmtINR(parseAmount(deleteTarget.paid_amount))} · Plot {deleteTarget.plot_no || '—'}
                    </p>
                  </div>
                  <Trash2 size={16} className="text-red-500 shrink-0" />
                </button>

                {deleteTarget.client_name && (
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleSingleDelete(deleteTarget, 'customer')}
                    className="w-full text-left p-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        Delete all records for customer &ldquo;{deleteTarget.client_name}&rdquo;
                      </p>
                      <p className="text-xs text-red-600">
                        Removes every plot &amp; EMI receipt for this customer permanently
                      </p>
                    </div>
                    <Trash2 size={16} className="text-red-700 shrink-0" />
                  </button>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteTarget(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of{' '}
            {totalCount.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => updateUrl({ page: String(page - 1) })}
              disabled={page <= 1}
              className="btn btn-secondary btn-sm btn-icon"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  onClick={() => updateUrl({ page: String(p) })}
                  className={classNames(
                    'btn btn-sm btn-icon',
                    p === page ? 'btn-primary' : 'btn-secondary'
                  )}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => updateUrl({ page: String(page + 1) })}
              disabled={page >= totalPages}
              className="btn btn-secondary btn-sm btn-icon"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
