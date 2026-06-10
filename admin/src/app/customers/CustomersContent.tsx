'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Users, Search, Phone, Building2, Eye, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import { MasterDataOfGurukrupa } from '@/types/masterData';

const PAGE_SIZE = 25;

function parseAmt(v: string | null) { return parseFloat(v?.replace(/[^0-9.]/g, '') || '0') || 0; }
function fmtINR(n: number) {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

interface Props {
  customers: MasterDataOfGurukrupa[];
  totalCount: number;
  page: number;
  societies: string[];
  filters: { search: string; society: string };
  error: Error | null;
}

export default function CustomersContent({ customers, totalCount, page, societies, filters, error }: Props) {
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
          <p className="breadcrumb"><span>CRM</span><span className="sep">/</span><span className="current">Customer Profiles</span></p>
          <h1 className="page-title">Customer Profiles</h1>
          <p className="page-subtitle">{totalCount.toLocaleString('en-IN')} customers in the system</p>
        </div>
      </div>

      {error && (
        <div className="card p-4" style={{ borderColor: 'var(--danger)', background: 'var(--danger-bg)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>{error.message}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="card p-4 flex items-center gap-3 flex-wrap">
        <form
          onSubmit={(e) => { e.preventDefault(); updateUrl({ search: localSearch, page: '1' }); }}
          className="search-wrapper flex-1 min-w-[200px]"
        >
          <Search size={16} className="search-icon" />
          <input
            type="text" placeholder="Search by client name..."
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
        {(filters.search || filters.society) && (
          <button
            className="btn btn-ghost btn-sm text-red-500"
            onClick={() => { setLocalSearch(''); updateUrl({ search: '', society: '', page: '1' }); }}
          >
            <XCircle size={14} /> Clear
          </button>
        )}
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {customers.length === 0 ? (
          <div className="col-span-full">
            <div className="empty-state card py-12">
              <div className="empty-state-icon"><Users size={24} style={{ color: 'var(--text-muted)' }} /></div>
              <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No customers found</p>
            </div>
          </div>
        ) : (
          customers.map((c) => {
            const plotAmt = parseAmt(c.plot_amount);
            const paidAmt = parseAmt(c.paid_amount);
            const pct = plotAmt > 0 ? Math.round((paidAmt / plotAmt) * 100) : 0;
            const isCancelled = !!c.cancel_date;
            return (
              <div key={c.id} className="card p-5 hover:shadow-md transition-all cursor-pointer" onClick={() => router.push(`/master-data?id=${c.id}`)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="avatar avatar-md font-bold">{(c.client_name || 'U').charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.client_name || '—'}</p>
                      <span className="flex items-center gap-1 text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        <Phone size={10} />{c.contact_no || '—'}
                      </span>
                    </div>
                  </div>
                  <span className={`badge ${isCancelled ? 'badge-danger' : paidAmt > 0 ? 'badge-success' : 'badge-gold'}`}>
                    {isCancelled ? 'Cancelled' : paidAmt > 0 ? 'Active' : 'Prospect'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Building2 size={12} />{c.society_name || '—'}
                    </span>
                    <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Plot {c.plot_no || '—'}</span>
                  </div>

                  {plotAmt > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span style={{ color: 'var(--text-muted)' }}>Payment Progress</span>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 80 ? 'var(--success)' : pct >= 40 ? 'var(--gold)' : 'var(--warning)' }} />
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span style={{ color: 'var(--text-muted)' }}>Paid: <strong>{fmtINR(paidAmt)}</strong></span>
                        <span style={{ color: 'var(--text-muted)' }}>Total: <strong>{fmtINR(plotAmt)}</strong></span>
                      </div>
                    </div>
                  )}

                  {c["broker's_name"] && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Broker: <span style={{ color: 'var(--text-secondary)' }}>{c["broker's_name"]}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button className="btn btn-ghost btn-sm">
                    <Eye size={14} /> View Profile
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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
  );
}
