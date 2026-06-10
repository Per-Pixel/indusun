'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  BookOpen, Search, DollarSign, CheckCircle, Clock, XCircle,
  ChevronLeft, ChevronRight, Eye, Phone, Building2, TrendingUp,
} from 'lucide-react';
import { BookingRecord, BookingStatus } from '@/services/bookingService';

const STATUS_MAP: Record<BookingStatus, { label: string; class: string }> = {
  token:      { label: 'Token',      class: 'badge-info' },
  agreement:  { label: 'Agreement',  class: 'badge-warning' },
  registered: { label: 'Registered', class: 'badge-gold' },
  possession: { label: 'Possession', class: 'badge-success' },
  cancelled:  { label: 'Cancelled',  class: 'badge-danger' },
};

function fmtINR(n: number) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)}Cr`;
  if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000)       return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

const PAGE_SIZE = 25;

interface Props {
  bookings: BookingRecord[];
  totalCount: number;
  page: number;
  summary: { totalBookings: number; totalRevenue: number; totalPaid: number; totalBalance: number; error: Error | null };
  societies: string[];
  filters: { search: string; society: string };
  error: Error | null;
}

export default function BookingsContent({ bookings, totalCount, page, summary, societies, filters, error }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [localSearch, setLocalSearch] = useState(filters.search);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const updateUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams({ search: filters.search, society: filters.society, page: String(page), ...updates });
    ['search', 'society'].forEach((k) => { if (!params.get(k)) params.delete(k); });
    if (params.get('page') === '1') params.delete('page');
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  return (
    <div className="page-container space-y-5">
      <div className="page-header">
        <div>
          <p className="breadcrumb"><span>CRM</span><span className="sep">/</span><span className="current">Bookings</span></p>
          <h1 className="page-title">Booking Management</h1>
          <p className="page-subtitle">Track all property bookings and payment progress</p>
        </div>
      </div>

      {error && (
        <div className="card p-4" style={{ borderColor: 'var(--danger)', background: 'var(--danger-bg)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>{error.message}</p>
        </div>
      )}

      {/* Financial Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: summary.totalBookings.toLocaleString('en-IN'), icon: <BookOpen size={18} style={{ color: '#C9A84C' }} />, bg: 'bg-amber-50' },
          { label: 'Total Revenue', value: fmtINR(summary.totalRevenue), icon: <DollarSign size={18} style={{ color: '#8B5CF6' }} />, bg: 'bg-purple-50' },
          { label: 'Amount Collected', value: fmtINR(summary.totalPaid), icon: <CheckCircle size={18} style={{ color: '#10B981' }} />, bg: 'bg-emerald-50' },
          { label: 'Balance Pending', value: fmtINR(summary.totalBalance), icon: <Clock size={18} style={{ color: '#F59E0B' }} />, bg: 'bg-yellow-50' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${s.bg}`}>{s.icon}</div>
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="card p-4 flex items-center gap-3 flex-wrap">
        <form
          onSubmit={(e) => { e.preventDefault(); updateUrl({ search: localSearch, page: '1' }); }}
          className="search-wrapper flex-1 min-w-[200px]"
        >
          <Search size={16} className="search-icon" />
          <input
            type="text" placeholder="Search client name..."
            className="input input-sm" value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </form>
        <select
          className="input input-sm select w-auto"
          value={filters.society}
          onChange={(e) => updateUrl({ society: e.target.value, page: '1' })}
        >
          <option value="">All Societies</option>
          {societies.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Bookings Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="crm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Society / Plot</th>
                <th>Plot Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Progress</th>
                <th>EMI</th>
                <th>Broker</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={11}>
                    <div className="empty-state py-10">
                      <div className="empty-state-icon"><BookOpen size={22} style={{ color: 'var(--text-muted)' }} /></div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No bookings found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((b, idx) => {
                  const st = STATUS_MAP[b.booking_status];
                  return (
                    <tr key={b.id}>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="avatar avatar-sm">{(b.client_name || 'U').charAt(0).toUpperCase()}</div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{b.client_name || '—'}</p>
                            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                              <Phone size={10} />{b.contact_no || '—'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <Building2 size={12} />{b.society_name || '—'}
                          </span>
                          <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Plot: {b.plot_no || '—'}</span>
                        </div>
                      </td>
                      <td className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>
                        {b.plot_amount > 0 ? fmtINR(b.plot_amount) : '—'}
                      </td>
                      <td className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
                        {b.paid_amount > 0 ? fmtINR(b.paid_amount) : '—'}
                      </td>
                      <td className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>
                        {b.balance_amount > 0 ? fmtINR(b.balance_amount) : '—'}
                      </td>
                      <td style={{ minWidth: '100px' }}>
                        <div className="flex items-center gap-2">
                          <div className="progress-bar flex-1">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${b.payment_pct}%`,
                                background: b.payment_pct >= 90 ? 'var(--success)' : b.payment_pct >= 50 ? 'var(--gold)' : 'var(--warning)',
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{b.payment_pct}%</span>
                        </div>
                      </td>
                      <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {b.emi_amount > 0 ? fmtINR(b.emi_amount) : '—'}
                        {b.emi_time ? <span className="block" style={{ color: 'var(--text-muted)' }}>{b.emi_time}</span> : null}
                      </td>
                      <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{b.broker || '—'}</td>
                      <td><span className={`badge ${st.class}`}>{st.label}</span></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => router.push(`/master-data?id=${b.id}`)}>
                            <Eye size={14} />
                          </button>
                          <button className="btn btn-ghost btn-icon btn-sm" title="Payment history">
                            <TrendingUp size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount.toLocaleString('en-IN')}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => updateUrl({ page: String(page - 1) })} disabled={page <= 1} className="btn btn-secondary btn-sm btn-icon">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={p} onClick={() => updateUrl({ page: String(p) })} className={`btn btn-sm btn-icon ${p === page ? 'btn-primary' : 'btn-secondary'}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => updateUrl({ page: String(page + 1) })} disabled={page >= totalPages} className="btn btn-secondary btn-sm btn-icon">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
