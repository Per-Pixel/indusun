'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Activity, Search, ChevronLeft, ChevronRight, Clock, User, Building2, DollarSign, FileText } from 'lucide-react';
import { MasterDataOfGurukrupa } from '@/types/masterData';

const PAGE_SIZE = 50;

function formatDate(d: string | null | undefined) {
  if (!d) return 'Unknown date';
  try { return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return d; }
}

function parseAmt(v: string | null) { return parseFloat(v?.replace(/[^0-9.]/g, '') || '0') || 0; }
function fmtINR(n: number) {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function getActivityType(row: MasterDataOfGurukrupa): { type: string; color: string; icon: React.ReactNode } {
  if (row.cancel_date) return { type: 'Booking Cancelled', color: 'var(--danger)', icon: <FileText size={14} /> };
  if (parseAmt(row.paid_amount) > 0) return { type: 'Payment Recorded', color: 'var(--success)', icon: <DollarSign size={14} /> };
  if (row.plot_no) return { type: 'Plot Assigned', color: 'var(--gold)', icon: <Building2 size={14} /> };
  return { type: 'Client Record Created', color: 'var(--info)', icon: <User size={14} /> };
}

interface Props {
  records: MasterDataOfGurukrupa[];
  totalCount: number;
  page: number;
  search: string;
  error: Error | null;
}

export default function ActivityLogsContent({ records, totalCount, page, search, error }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [localSearch, setLocalSearch] = useState(search);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const updateUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams({ search, page: String(page), ...updates });
    if (!params.get('search')) params.delete('search');
    if (params.get('page') === '1') params.delete('page');
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  return (
    <div className="page-container space-y-5">
      <div className="page-header">
        <div>
          <p className="breadcrumb"><span>System</span><span className="sep">/</span><span className="current">Activity Logs</span></p>
          <h1 className="page-title">Activity Logs</h1>
          <p className="page-subtitle">Complete audit trail of all data events — {totalCount.toLocaleString('en-IN')} records</p>
        </div>
      </div>

      {error && (
        <div className="card p-4" style={{ borderColor: 'var(--danger)', background: 'var(--danger-bg)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>{error.message}</p>
        </div>
      )}

      {/* Search */}
      <div className="card p-4 flex items-center gap-3">
        <form
          onSubmit={(e) => { e.preventDefault(); updateUrl({ search: localSearch, page: '1' }); }}
          className="search-wrapper flex-1"
        >
          <Search size={16} className="search-icon" />
          <input
            type="text" placeholder="Search by client name..."
            className="input input-sm" value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </form>
      </div>

      {/* Activity Timeline */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
          <Activity size={16} style={{ color: 'var(--gold)' }} />
          <h3 className="text-h3">Data Activity Timeline</h3>
          <span className="badge badge-gold ml-auto">{totalCount.toLocaleString('en-IN')} events</span>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {records.length === 0 ? (
            <div className="empty-state py-10">
              <div className="empty-state-icon"><Activity size={22} style={{ color: 'var(--text-muted)' }} /></div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No activity logs found</p>
            </div>
          ) : (
            records.map((row) => {
              const actType = getActivityType(row);
              const date = row.created_at ?? row.date_of_form ?? row.date;
              return (
                <div key={row.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  {/* Icon */}
                  <div
                    className="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${actType.color}18`, color: actType.color }}
                  >
                    {actType.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {actType.type}
                      </p>
                      <span className="badge" style={{ background: `${actType.color}18`, color: actType.color, fontSize: '0.65rem' }}>
                        #{row.id}
                      </span>
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      <strong>{row.client_name || 'Unknown Client'}</strong>
                      {row.society_name && <> — <span style={{ color: 'var(--text-muted)' }}>{row.society_name}</span></>}
                      {row.plot_no && <> Plot <span style={{ color: 'var(--text-muted)' }}>{row.plot_no}</span></>}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {parseAmt(row.plot_amount) > 0 && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Plot: <strong style={{ color: 'var(--gold)' }}>{fmtINR(parseAmt(row.plot_amount))}</strong>
                        </span>
                      )}
                      {parseAmt(row.paid_amount) > 0 && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Paid: <strong style={{ color: 'var(--success)' }}>{fmtINR(parseAmt(row.paid_amount))}</strong>
                        </span>
                      )}
                      {row["broker's_name"] && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Broker: {row["broker's_name"]}
                        </span>
                      )}
                      {row.cancel_date && (
                        <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Cancelled {formatDate(row.cancel_date)}</span>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                    <Clock size={11} style={{ color: 'var(--text-disabled)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>{formatDate(date)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => updateUrl({ page: String(page - 1) })} disabled={page <= 1} className="btn btn-secondary btn-sm btn-icon">
                <ChevronLeft size={16} />
              </button>
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
