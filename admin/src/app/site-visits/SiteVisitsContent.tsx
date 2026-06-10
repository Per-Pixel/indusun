'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Calendar, Search, CheckCircle, Clock, XCircle, Eye, Phone,
  Building2, ChevronLeft, ChevronRight, Plus, MapPin,
} from 'lucide-react';
import { SiteVisitRecord } from '@/services/siteVisitService';

const STATUS_MAP = {
  scheduled:  { label: 'Scheduled',  class: 'badge-gold',    icon: <Clock size={10} /> },
  completed:  { label: 'Completed',  class: 'badge-success', icon: <CheckCircle size={10} /> },
  no_show:    { label: 'No Show',    class: 'badge-warning',  icon: <Clock size={10} /> },
  cancelled:  { label: 'Cancelled',  class: 'badge-danger',  icon: <XCircle size={10} /> },
};

const PAGE_SIZE = 25;

interface Props {
  visits: SiteVisitRecord[];
  totalCount: number;
  page: number;
  stats: { total: number; scheduled: number; completed: number; cancelled: number; noShow: number; error: Error | null };
  societies: string[];
  filters: { search: string; society: string };
  error: Error | null;
}

export default function SiteVisitsContent({ visits, totalCount, page, stats, societies, filters, error }: Props) {
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

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <div className="page-container space-y-5">
      <div className="page-header">
        <div>
          <p className="breadcrumb"><span>CRM</span><span className="sep">/</span><span className="current">Site Visits</span></p>
          <h1 className="page-title">Site Visit Scheduling</h1>
          <p className="page-subtitle">Track and manage all scheduled property visits</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-primary btn-sm"><Plus size={14} /> Schedule Visit</button>
        </div>
      </div>

      {error && (
        <div className="card p-4" style={{ borderColor: 'var(--danger)', background: 'var(--danger-bg)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>{error.message}</p>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Visits', value: stats.total, icon: <Calendar size={18} style={{ color: '#C9A84C' }} />, bg: 'bg-amber-50' },
          { label: 'Scheduled',   value: stats.scheduled,  icon: <Clock size={18} style={{ color: '#3B82F6' }} />, bg: 'bg-blue-50' },
          { label: 'Completed',   value: stats.completed,  icon: <CheckCircle size={18} style={{ color: '#10B981' }} />, bg: 'bg-emerald-50' },
          { label: 'Cancelled',   value: stats.cancelled,  icon: <XCircle size={18} style={{ color: '#EF4444' }} />, bg: 'bg-red-50' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${s.bg}`}>{s.icon}</div>
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value.toLocaleString('en-IN')}</p>
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

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="crm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Contact</th>
                <th>Project / Society</th>
                <th>Plot No.</th>
                <th>Visit Date</th>
                <th>Assigned Broker</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visits.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="empty-state py-10">
                      <div className="empty-state-icon"><Calendar size={22} style={{ color: 'var(--text-muted)' }} /></div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No visits found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                visits.map((visit, idx) => {
                  const st = STATUS_MAP[visit.status];
                  return (
                    <tr key={visit.id}>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="avatar avatar-sm">{(visit.client_name || 'U').charAt(0).toUpperCase()}</div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{visit.client_name || '—'}</p>
                        </div>
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <Phone size={12} />{visit.contact_no || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <MapPin size={12} />{visit.society_name || '—'}
                        </span>
                      </td>
                      <td className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{visit.plot_no || '—'}</td>
                      <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formatDate(visit.visit_date)}</td>
                      <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{visit.broker || '—'}</td>
                      <td><span className={`badge ${st.class}`}>{st.icon}{st.label}</span></td>
                      <td className="text-xs max-w-[150px] truncate" style={{ color: 'var(--text-muted)' }}>{visit.remarks || '—'}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => router.push(`/master-data?id=${visit.id}`)}>
                            <Eye size={14} />
                          </button>
                          <button className="btn btn-ghost btn-icon btn-sm"><Building2 size={14} /></button>
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
