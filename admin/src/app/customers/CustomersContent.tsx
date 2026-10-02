'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  Home,
  MapPin,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { MasterDataOfGurukrupa } from '@/types/masterData';
import { parseAmount } from '@/utils/dataUtils';
import { formatIndianNumber } from '@/utils/format';

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
  error: Error | null;
}

function classNames(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

function fmtINR(n: number) {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
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
  error,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [localSearch, setLocalSearch] = useState(filters.search);

  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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

  const visibleStats = useMemo(() => {
    const counts = { Active: 0, Installment: 0, Prospect: 0, Cancelled: 0 };
    customers.forEach((c) => {
      const { label } = deriveStatus(c);
      counts[label as keyof typeof counts] = (counts[label as keyof typeof counts] || 0) + 1;
    });
    return counts;
  }, [customers]);

  const clearFilters = () => {
    setLocalSearch('');
    updateUrl({ search: '', society: '', broker: '', status: '', page: '1' });
  };

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
            {totalCount.toLocaleString('en-IN')} customer{totalCount === 1 ? '' : 's'} in the system
          </p>
        </div>
        <Link
          href="/customers/add"
          className="btn btn-primary btn-sm flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} />
          Add Customer
        </Link>
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
          { label: 'Total', value: totalCount.toLocaleString('en-IN'), tone: 'gold' },
          { label: 'Active', value: visibleStats.Active.toLocaleString('en-IN'), tone: 'success' },
          { label: 'Installment', value: visibleStats.Installment.toLocaleString('en-IN'), tone: 'info' },
          { label: 'Cancelled', value: visibleStats.Cancelled.toLocaleString('en-IN'), tone: 'danger' },
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
            className="search-wrapper flex-1 min-w-[220px]"
          >
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, phone, society, plot or broker…"
              className="input input-sm"
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
      </motion.div>

      {/* Customer grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {customers.length === 0 ? (
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
          customers.map((c) => {
            const plotAmt = parseAmount(c.plot_amount);
            const paidAmt = parseAmount(c.paid_amount);
            const pct = plotAmt > 0 ? Math.round((paidAmt / plotAmt) * 100) : 0;
            const status = deriveStatus(c);

            return (
              <motion.div
                key={c.id}
                variants={itemVariants}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                onClick={() => router.push(`/customers/${c.id}`)}
                className="card p-5 cursor-pointer relative overflow-hidden group"
              >
                {/* subtle gold accent on hover */}
                <div className="absolute inset-y-0 left-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'var(--gold)' }} />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar avatar-md font-bold">
                      {(c.client_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {c.client_name || '—'}
                      </p>
                      <span
                        className="flex items-center gap-1 text-xs mt-0.5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Phone size={10} />
                        {c.contact_no || '—'}
                      </span>
                    </div>
                  </div>
                  <span className={classNames('badge', `badge-${status.tone}`)}>
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                      <Building2 size={13} />
                      {c.society_name || '—'}
                    </span>
                    <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Plot {c.plot_no || '—'}
                    </span>
                  </div>

                  {c.plot_size && (
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Home size={12} />
                      {c.plot_size}
                    </div>
                  )}

                  {plotAmt > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span style={{ color: 'var(--text-muted)' }}>Payment Progress</span>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {pct}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${pct}%`,
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
                          Total: <strong>{fmtINR(plotAmt)}</strong>
                        </span>
                      </div>
                    </div>
                  )}

                  {c["broker's_name"] && (
                    <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                      <User size={11} />
                      Broker:{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{c["broker's_name"]}</span>
                    </p>
                  )}
                </div>

                <div
                  className="flex items-center justify-end mt-4 pt-3 border-t"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span className="btn btn-ghost btn-sm pointer-events-none">
                    <Eye size={14} /> View Profile
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

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
