'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, Filter, Plus, Download, Users, CheckCircle,
  XCircle, Flame, Thermometer, Snowflake, Eye, Phone,
  Building2, ChevronLeft, ChevronRight, SlidersHorizontal,
} from 'lucide-react';
import { LeadRecord, LeadStatus } from '@/services/leadService';

const PAGE_SIZE = 25;

const STATUS_CONFIG: Record<LeadStatus, { label: string; class: string }> = {
  new:         { label: 'New',          class: 'badge-info' },
  contacted:   { label: 'Contacted',    class: 'badge-neutral' },
  interested:  { label: 'Interested',   class: 'badge-warning' },
  site_visit:  { label: 'Site Visit',   class: 'badge-gold' },
  negotiation: { label: 'Negotiation',  class: 'badge-warning' },
  booked:      { label: 'Booked',       class: 'badge-success' },
  cancelled:   { label: 'Cancelled',    class: 'badge-danger' },
};

const SCORE_CONFIG = {
  hot:  { label: 'Hot',  class: 'badge-hot',  icon: <Flame size={10} /> },
  warm: { label: 'Warm', class: 'badge-warm', icon: <Thermometer size={10} /> },
  cold: { label: 'Cold', class: 'badge-cold', icon: <Snowflake size={10} /> },
};

function parseAmt(val: string | null): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
}

function fmtINR(n: number): string {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(2)}Cr`;
  if (n >= 1_00_000)  return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1000)      return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

const PIPELINE_STAGES: { key: LeadStatus; label: string; color: string }[] = [
  { key: 'new',         label: 'New',         color: '#3B82F6' },
  { key: 'contacted',   label: 'Contacted',   color: '#8B5CF6' },
  { key: 'interested',  label: 'Interested',  color: '#F59E0B' },
  { key: 'site_visit',  label: 'Site Visit',  color: '#C9A84C' },
  { key: 'negotiation', label: 'Negotiation', color: '#F97316' },
  { key: 'booked',      label: 'Booked',      color: '#10B981' },
  { key: 'cancelled',   label: 'Cancelled',   color: '#EF4444' },
];

interface LeadsContentProps {
  leads: LeadRecord[];
  totalCount: number;
  page: number;
  pipeline: Record<LeadStatus, number>;
  societies: string[];
  filters: { search: string; society: string; status: string };
  error: Error | null;
}

export default function LeadsContent({
  leads, totalCount, page, pipeline, societies, filters, error,
}: LeadsContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const updateUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams({
      search: filters.search,
      society: filters.society,
      status: filters.status,
      page: String(page),
      ...updates,
    });
    // Remove empty params
    ['search', 'society', 'status'].forEach((k) => {
      if (!params.get(k)) params.delete(k);
    });
    if (params.get('page') === '1') params.delete('page');
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: localSearch, page: '1' });
  };

  const handleStatusFilter = (status: string) => {
    updateUrl({ status: filters.status === status ? '' : status, page: '1' });
  };

  const totalBooked = pipeline.booked || 0;
  const totalActive = Object.values(pipeline).reduce((s, v) => s + v, 0) - (pipeline.cancelled || 0);

  return (
    <div className="page-container space-y-5">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="breadcrumb">
            <span>CRM</span><span className="sep">/</span>
            <span className="current">Lead Management</span>
          </p>
          <h1 className="page-title">Lead Management</h1>
          <p className="page-subtitle">
            {totalCount.toLocaleString('en-IN')} total leads · Track and convert your real estate pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-sm">
            <Download size={14} /> Export
          </button>
          <button className="btn btn-primary btn-sm">
            <Plus size={14} /> Add Lead
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-4" style={{ borderColor: 'var(--danger)', background: 'var(--danger-bg)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>Failed to load leads: {error.message}</p>
        </div>
      )}

      {/* Pipeline Stage Summary */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        {PIPELINE_STAGES.map((stage) => (
          <button
            key={stage.key}
            onClick={() => handleStatusFilter(stage.key)}
            className={`card p-3 text-center cursor-pointer transition-all hover:shadow-md ${filters.status === stage.key ? 'ring-2' : ''}`}
            style={filters.status === stage.key ? { borderColor: stage.color, outline: `2px solid ${stage.color}`, outlineOffset: '-1px' } : {}}
          >
            <p className="text-xl font-bold" style={{ color: stage.color }}>
              {(pipeline[stage.key] || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>{stage.label}</p>
          </button>
        ))}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50"><Users size={18} style={{ color: '#3B82F6' }} /></div>
          <div>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalActive.toLocaleString('en-IN')}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Active Leads</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50"><CheckCircle size={18} style={{ color: '#10B981' }} /></div>
          <div>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalBooked.toLocaleString('en-IN')}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Booked</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50"><XCircle size={18} style={{ color: '#EF4444' }} /></div>
          <div>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{(pipeline.cancelled || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cancelled</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <form onSubmit={handleSearch} className="search-wrapper flex-1 min-w-[220px]">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by client name or contact..."
              className="input input-sm"
              value={localSearch}
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

          <select
            className="input input-sm select w-auto"
            value={filters.status}
            onChange={(e) => updateUrl({ status: e.target.value, page: '1' })}
          >
            <option value="">All Statuses</option>
            {PIPELINE_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary btn-sm"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>

          {(filters.search || filters.society || filters.status) && (
            <button
              className="btn btn-ghost btn-sm text-red-500"
              onClick={() => { setLocalSearch(''); updateUrl({ search: '', society: '', status: '', page: '1' }); }}
            >
              <XCircle size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Leads Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="crm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Contact</th>
                <th>Society</th>
                <th>Plot No.</th>
                <th>Plot Amount</th>
                <th>Paid Amount</th>
                <th>Broker</th>
                <th>Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12">
                    <div className="empty-state">
                      <div className="empty-state-icon"><Users size={22} style={{ color: 'var(--text-muted)' }} /></div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No leads found</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead, idx) => {
                  const plotAmt = parseAmt(lead.plot_amount);
                  const paidAmt = parseAmt(lead.paid_amount);
                  const score = SCORE_CONFIG[lead.lead_score];
                  const statusCfg = STATUS_CONFIG[lead.lead_status];
                  return (
                    <tr key={lead.id}>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="avatar avatar-sm">
                            {(lead.client_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {lead.client_name || '—'}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ID #{lead.id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <Phone size={12} />
                          {lead.contact_no || '—'}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <Building2 size={12} />
                          {lead.society_name || '—'}
                        </div>
                      </td>
                      <td className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {lead.plot_no || '—'}
                      </td>
                      <td className="text-sm font-semibold" style={{ color: '#C9A84C' }}>
                        {plotAmt > 0 ? fmtINR(plotAmt) : '—'}
                      </td>
                      <td>
                        {paidAmt > 0 ? (
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>{fmtINR(paidAmt)}</p>
                            {plotAmt > 0 && (
                              <div className="progress-bar mt-1" style={{ width: '80px' }}>
                                <div className="progress-fill success" style={{ width: `${Math.min(100, (paidAmt / plotAmt) * 100)}%` }} />
                              </div>
                            )}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {lead["broker's_name"] || '—'}
                      </td>
                      <td>
                        <span className={`badge ${score.class}`}>
                          {score.icon} {score.label}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${statusCfg.class}`}>{statusCfg.label}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            title="View details"
                            onClick={() => router.push(`/master-data?id=${lead.id}`)}
                          >
                            <Eye size={14} />
                          </button>
                          <button className="btn btn-ghost btn-icon btn-sm" title="Call client">
                            <Phone size={14} />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount.toLocaleString('en-IN')} leads
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
                    className={`btn btn-sm btn-icon ${p === page ? 'btn-primary' : 'btn-secondary'}`}
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

      {/* Filter panel placeholder */}
      {showFilters && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-h3 flex items-center gap-2"><Filter size={16} /> Advanced Filters</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters(false)}>Close</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="label">Lead Score</label>
              <select className="input input-sm select">
                <option value="">All Scores</option>
                <option value="hot">🔥 Hot</option>
                <option value="warm">🌡 Warm</option>
                <option value="cold">❄️ Cold</option>
              </select>
            </div>
            <div>
              <label className="label">Date Range</label>
              <input type="date" className="input input-sm" />
            </div>
            <div>
              <label className="label">Min Plot Amount</label>
              <input type="number" placeholder="₹0" className="input input-sm" />
            </div>
            <div>
              <label className="label">Max Plot Amount</label>
              <input type="number" placeholder="No limit" className="input input-sm" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
