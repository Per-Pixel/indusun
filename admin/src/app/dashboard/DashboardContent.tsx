'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Users, Building2, IndianRupee, CheckCircle,
  Calendar, ArrowRight, BarChart2, PhoneCall, Layers,
  RefreshCcw, ClipboardList, Plus, Eye,
  MessageSquare, Bell, Lock, Wallet,
  Inbox, LayoutGrid,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { MasterDataSummary } from '@/types/masterData';
import { LeadRecord, LeadStatus } from '@/services/leadService';
import { normalizeDate } from '@/utils/dataUtils';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface DashboardContentProps {
  summary: MasterDataSummary | null;
  societies: string[];
  leads: LeadRecord[];
  pipelineCounts: Record<LeadStatus, number>;
  error: Error | null;
}

const BLUE = '#2563EB';
const BLUE_SOFT = '#60A5FA';
const BLUE_DEEP = '#1E40AF';
const GREEN = '#059669';
const RED = '#DC2626';
const STATUS_COLORS = [BLUE, GREEN, RED];

const fmt = (n: number) => (Number(n) || 0).toLocaleString('en-IN');
const fmtLakh = (n: number) => {
  const v = Number(n) || 0;
  if (v >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(2)} Cr`;
  if (v >= 1_00_000) return `₹${(v / 1_00_000).toFixed(2)} L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

function recordAge(row: LeadRecord): string {
  const iso = normalizeDate(row.created_at ?? row.date ?? row.date_of_form);
  if (!iso) return 'Added recently';
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
  if (days === 0) return 'Added today';
  if (days === 1) return 'Added yesterday';
  if (days < 30) return `Added ${days}d ago`;
  const months = Math.floor(days / 30);
  return `Added ${months}mo ago`;
}

function StatCard({
  label, value, sub, icon, iconBg,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; iconBg: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card px-3 py-2 text-xs" style={{ border: '1px solid var(--primary-border)' }}>
        <p style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="font-bold" style={{ color: BLUE }}>{payload[0].value} properties</p>
      </div>
    );
  }
  return null;
};

type FocusKey = 'overview' | 'sales' | 'portfolio' | 'finance' | 'comms';

const FOCUS_TABS: { key: FocusKey; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Overview', icon: <LayoutGrid size={14} /> },
  { key: 'sales', label: 'Sales desk', icon: <PhoneCall size={14} /> },
  { key: 'portfolio', label: 'Portfolio', icon: <Building2 size={14} /> },
  { key: 'finance', label: 'Finance', icon: <Wallet size={14} /> },
  { key: 'comms', label: 'Comms', icon: <MessageSquare size={14} /> },
];

export default function DashboardContent({ summary, societies, leads, pipelineCounts, error }: DashboardContentProps) {
  const { hasPermission } = useAdminAuth();
  const reduceMotion = useReducedMotion();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const allowedFocus = useMemo<FocusKey[]>(() => {
    const tabs: FocusKey[] = ['overview'];
    if (hasPermission('lead_management')) tabs.push('sales');
    if (hasPermission('property_management')) tabs.push('portfolio');
    if (hasPermission('billing_management') || hasPermission('financial_reports')) tabs.push('finance');
    if (hasPermission('messaging') || hasPermission('internal_comms')) tabs.push('comms');
    return tabs;
  }, [hasPermission]);

  const [focus, setFocus] = useState<FocusKey | null>(null);
  const activeFocus: FocusKey = focus && allowedFocus.includes(focus) ? focus : allowedFocus[0];

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const pct = (a: number, b: number) => (b > 0 ? `${((a / b) * 100).toFixed(1)}%` : '0%');

  // Derived enquiry queue — "new" leads awaiting a first touch.
  // Rows named like "CANCELLED RECIEPT" are data placeholders, not prospects.
  const enquiryQueue = useMemo(
    () => leads
      .filter((l) => l.lead_status === 'new' && !/cancel/i.test(l.client_name ?? ''))
      .slice(0, 7),
    [leads],
  );
  const newLeadCount = pipelineCounts.new ?? enquiryQueue.length;

  const pipelineData = summary
    ? [
        { name: 'Available', value: Math.max(0, summary.listedProperties - summary.soldProperties) },
        { name: 'Sold', value: summary.soldProperties },
        { name: 'Cancelled', value: summary.cancelledProperties },
      ]
    : [];

  const societyBar = summary?.propertiesBySociety.slice(0, 6) ?? [];
  const collectedPct = summary && summary.totalPlotAmount > 0
    ? Math.min(100, Math.round((summary.totalPaidAmount / summary.totalPlotAmount) * 100))
    : 0;

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const reveal = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } };

  const QUICK_LINKS = [
    { label: 'Lead board', href: '/leads', icon: <Users size={15} /> },
    { label: 'Properties', href: '/properties', icon: <Building2 size={15} /> },
    { label: 'Site visits', href: '/site-visits', icon: <Calendar size={15} /> },
    { label: 'Bookings', href: '/bookings', icon: <ClipboardList size={15} /> },
    { label: 'Billing', href: '/billing', icon: <Wallet size={15} /> },
    { label: 'Reports', href: '/reports', icon: <BarChart2 size={15} /> },
  ];

  return (
    <div className="page-container space-y-5">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="breadcrumb">
            <span>Home</span>
            <span className="sep">/</span>
            <span className="current">Dashboard</span>
          </p>
          <h1 className="page-title">Operations overview</h1>
          <p className="page-subtitle">{today} · Live snapshot of the Indusun workspace.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/leads" className="btn btn-secondary btn-sm">
            <Plus size={15} /> Add Lead
          </Link>
          <Link href="/site-visits" className="btn btn-secondary btn-sm">
            <Calendar size={15} /> Schedule Visit
          </Link>
          <button
            onClick={handleRefresh}
            className={`btn btn-primary btn-sm ${isRefreshing ? 'opacity-60' : ''}`}
            disabled={isRefreshing}
          >
            <RefreshCcw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="card p-4" style={{ borderColor: 'var(--danger)', background: 'var(--danger-bg)' }}>
          <p className="font-semibold text-sm" style={{ color: 'var(--danger)' }}>Failed to load data</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{error.message}</p>
        </div>
      )}

      {!summary && !error && (
        <div className="empty-state card">
          <div className="empty-state-icon"><Building2 size={24} style={{ color: 'var(--text-muted)' }} /></div>
          <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No data available</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No records found in the Master Data table.</p>
        </div>
      )}

      {summary && (
        <>
          {/* ── Hero ─────────────────────────────────────────────────── */}
          <motion.section {...reveal} className="hero-card p-6 lg:p-7">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-xl">
                <p className="ops-eyebrow">Indusun Operations</p>
                <h2 className="mt-2 text-2xl lg:text-[1.7rem] font-extrabold text-white leading-tight tracking-tight">
                  {fmt(summary.totalClients)} clients · {fmt(summary.totalRecords)} records
                </h2>
                <p className="mt-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
                  {summary.uniqueSocieties} societies · {summary.uniqueBrokers} brokers ·{' '}
                  {newLeadCount > 0 ? `${fmt(newLeadCount)} new enquiries waiting` : 'enquiry queue is clear'}
                </p>
                <div className="flex flex-wrap gap-3 mt-5">
                  <Link href="/leads" className="btn btn-sm" style={{ background: '#FFFFFF', color: BLUE_DEEP, border: 'none', fontWeight: 750 }}>
                    Open lead board <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/master-data"
                    className="btn btn-sm"
                    style={{ background: 'rgba(255,255,255,0.12)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.24)' }}
                  >
                    Master data
                  </Link>
                </div>
              </div>

              <div className="metric-rail">
                <div className="metric-tile">
                  <p className="metric-value">{fmt(summary.soldProperties)}</p>
                  <p className="metric-label">Sold</p>
                </div>
                <div className="metric-tile">
                  <p className="metric-value">{fmt(Math.max(0, summary.listedProperties - summary.soldProperties))}</p>
                  <p className="metric-label">Available</p>
                </div>
                <div className="metric-tile">
                  <p className="metric-value">{fmtLakh(summary.totalPaidAmount)}</p>
                  <p className="metric-label">Collected</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── Focus tabs ───────────────────────────────────────────── */}
          {allowedFocus.length > 1 && (
            <motion.div {...reveal} className="focus-strip">
              <div className="focus-tabs" role="tablist" aria-label="Workspace focus">
                {FOCUS_TABS.filter((t) => allowedFocus.includes(t.key)).map((tab) => (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={activeFocus === tab.key}
                    onClick={() => setFocus(tab.key)}
                    className={`focus-tab ${activeFocus === tab.key ? 'active' : ''}`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="hidden sm:flex items-center gap-2 pr-2">
                <span className="status-dot live" style={{ background: 'var(--success)', color: 'var(--success)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Synced with Supabase</span>
              </div>
            </motion.div>
          )}

          {/* ── KPI Cards ────────────────────────────────────────────── */}
          <motion.div {...reveal} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Records"
              value={fmt(summary.totalRecords)}
              sub="All master data entries"
              icon={<ClipboardList size={20} style={{ color: BLUE }} />}
              iconBg="bg-blue-50"
            />
            <StatCard
              label="Active Clients"
              value={fmt(summary.totalClients)}
              sub={`${summary.uniqueSocieties} societies`}
              icon={<Users size={20} style={{ color: BLUE_SOFT }} />}
              iconBg="bg-blue-50"
            />
            <StatCard
              label="Sold Properties"
              value={fmt(summary.soldProperties)}
              sub={`${pct(summary.soldProperties, summary.totalRecords)} of records`}
              icon={<CheckCircle size={20} style={{ color: GREEN }} />}
              iconBg="bg-emerald-50"
            />
            <StatCard
              label="Total Revenue"
              value={fmtLakh(summary.totalPlotAmount)}
              sub={`Collected: ${fmtLakh(summary.totalPaidAmount)}`}
              icon={<IndianRupee size={20} style={{ color: BLUE_DEEP }} />}
              iconBg="bg-blue-50"
            />
          </motion.div>

          {/* ── Spotlight row ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Focus panel (2 cols) */}
            <motion.div {...reveal} className="card p-5 xl:col-span-2">
              {(activeFocus === 'overview' || activeFocus === 'sales') && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h3 className="panel-title flex items-center gap-2">
                        <Inbox size={16} style={{ color: BLUE }} />
                        New enquiries to contact
                        <span className="badge badge-gold">{newLeadCount}</span>
                      </h3>
                      <p className="panel-subtitle">No plot or payment on file — longest waiting first.</p>
                    </div>
                    <Link href="/leads" className="btn btn-ghost btn-sm">
                      Lead board <ArrowRight size={14} />
                    </Link>
                  </div>
                  {enquiryQueue.length > 0 ? (
                    <div className="action-list mt-2">
                      {enquiryQueue.map((lead) => (
                        <div key={lead.id} className="action-item">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="avatar avatar-sm">
                              {(lead.client_name || '?').trim().charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="action-name truncate">{lead.client_name || 'Unnamed enquiry'}</p>
                              <p className="action-meta truncate">
                                {lead.society_name || 'No society'} · {recordAge(lead)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {lead.contact_no && (
                              <a href={`tel:${lead.contact_no}`} className="btn btn-ghost btn-icon btn-sm" aria-label={`Call ${lead.client_name}`}>
                                <PhoneCall size={14} />
                              </a>
                            )}
                            <Link href="/leads" className="btn btn-secondary btn-sm">Follow up</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state py-8">
                      <div className="empty-state-icon"><CheckCircle size={22} style={{ color: 'var(--success)' }} /></div>
                      <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Queue is clear</p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Every recent enquiry has a plot or payment on file.</p>
                    </div>
                  )}

                  {activeFocus === 'sales' && (
                    <>
                      <div className="divider" />
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {([
                          { label: 'New', value: pipelineCounts.new, cls: 'badge-info' },
                          { label: 'Interested', value: pipelineCounts.interested, cls: 'badge-gold' },
                          { label: 'Negotiation', value: pipelineCounts.negotiation, cls: 'badge-warning' },
                          { label: 'Booked', value: pipelineCounts.booked, cls: 'badge-success' },
                        ] as const).map((s) => (
                          <div key={s.label} className="card-premium p-3 text-center">
                            <span className={`badge ${s.cls}`}>{s.label}</span>
                            <p className="text-xl font-extrabold mt-1.5" style={{ color: 'var(--text-primary)' }}>{fmt(s.value)}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {activeFocus === 'portfolio' && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h3 className="panel-title flex items-center gap-2">
                        <Layers size={16} style={{ color: BLUE }} />
                        Portfolio footprint
                      </h3>
                      <p className="panel-subtitle">Societies ranked by record count.</p>
                    </div>
                    <Link href="/projects" className="btn btn-ghost btn-sm">
                      Projects <ArrowRight size={14} />
                    </Link>
                  </div>
                  <div className="action-list mt-2">
                    {summary.propertiesBySociety.slice(0, 6).map((s, i) => (
                      <div key={s.name} className="action-item">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-extrabold w-5" style={{ color: 'var(--text-disabled)' }}>{i + 1}</span>
                          <p className="action-name truncate">{s.name}</p>
                        </div>
                        <span className="badge badge-neutral">{fmt(s.count)} records</span>
                      </div>
                    ))}
                  </div>
                  <div className="divider" />
                  <div className="flex flex-wrap gap-2">
                    <Link href="/properties" className="quick-link-card"><Building2 size={15} style={{ color: BLUE }} /> Properties</Link>
                    <Link href="/media-library" className="quick-link-card"><Eye size={15} style={{ color: BLUE }} /> Media library</Link>
                    <Link href="/master-data" className="quick-link-card"><ClipboardList size={15} style={{ color: BLUE }} /> Master data</Link>
                  </div>
                </>
              )}

              {activeFocus === 'finance' && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h3 className="panel-title flex items-center gap-2">
                        <Wallet size={16} style={{ color: BLUE }} />
                        Collections snapshot
                      </h3>
                      <p className="panel-subtitle">Amount received vs total booking value.</p>
                    </div>
                    <Link href="/billing" className="btn btn-ghost btn-sm">
                      Billing <ArrowRight size={14} />
                    </Link>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-end justify-between mb-2">
                      <p className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{fmtLakh(summary.totalPaidAmount)}</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>of {fmtLakh(summary.totalPlotAmount)} · {collectedPct}%</p>
                    </div>
                    <div className="progress-bar" style={{ height: '10px' }}>
                      <div className="progress-fill" style={{ width: `${collectedPct}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-5">
                    <div className="card-premium p-3">
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Outstanding</p>
                      <p className="text-lg font-extrabold mt-0.5" style={{ color: BLUE_DEEP }}>{fmtLakh(Math.max(0, summary.totalPlotAmount - summary.totalPaidAmount))}</p>
                    </div>
                    <div className="card-premium p-3">
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Booked</p>
                      <p className="text-lg font-extrabold mt-0.5" style={{ color: 'var(--success)' }}>{fmt(pipelineCounts.booked)}</p>
                    </div>
                    <div className="card-premium p-3">
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Cancelled</p>
                      <p className="text-lg font-extrabold mt-0.5" style={{ color: 'var(--danger)' }}>{fmt(summary.cancelledProperties)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Link href="/invoices" className="quick-link-card"><IndianRupee size={15} style={{ color: BLUE }} /> Invoices</Link>
                    <Link href="/reports" className="quick-link-card"><BarChart2 size={15} style={{ color: BLUE }} /> Reports</Link>
                  </div>
                </>
              )}

              {activeFocus === 'comms' && (
                <>
                  <div className="mb-1">
                    <h3 className="panel-title flex items-center gap-2">
                      <MessageSquare size={16} style={{ color: BLUE }} />
                      Communications hub
                    </h3>
                    <p className="panel-subtitle">Jump into the channels your team uses every day.</p>
                  </div>
                  <div className="action-list mt-2">
                    {[
                      { label: 'Client messages', sub: 'Conversations with customers', href: '/messages', icon: <MessageSquare size={15} /> },
                      { label: 'Notifications', sub: 'Workspace alerts and updates', href: '/notifications', icon: <Bell size={15} /> },
                      { label: 'Internal comms', sub: 'Private team threads and files', href: '/internal-comms', icon: <Lock size={15} /> },
                    ].map((item) => (
                      <div key={item.href} className="action-item">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg" style={{ background: 'var(--primary-muted)', color: BLUE }}>{item.icon}</div>
                          <div className="min-w-0">
                            <p className="action-name">{item.label}</p>
                            <p className="action-meta">{item.sub}</p>
                          </div>
                        </div>
                        <Link href={item.href} className="btn btn-secondary btn-sm">Open</Link>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            {/* Right rail: status donut + quick links */}
            <motion.div {...reveal} className="space-y-4">
              <div className="card p-5">
                <h3 className="panel-title">Property status</h3>
                <p className="panel-subtitle mb-3">Distribution across all records</p>
                <div className="flex flex-col items-center">
                  <PieChart width={160} height={160}>
                    <Pie
                      data={pipelineData}
                      cx={75} cy={75}
                      innerRadius={50} outerRadius={72}
                      dataKey="value"
                      startAngle={90} endAngle={-270}
                      strokeWidth={2}
                    >
                      {STATUS_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}
                      formatter={(v: number) => [fmt(v), '']}
                    />
                  </PieChart>
                  <div className="space-y-2 w-full mt-2">
                    {pipelineData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[i] }} />
                          <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                        </div>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="panel-title mb-3">Quick actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_LINKS.map((a) => (
                    <Link key={a.href} href={a.href} className="quick-link-card">
                      <span style={{ color: BLUE }}>{a.icon}</span>
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Charts row ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div {...reveal} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="panel-title">Monthly listings</h3>
                  <p className="panel-subtitle">Recorded activity by month</p>
                </div>
                <Link href="/reports" className="btn btn-ghost btn-sm">
                  <Eye size={14} /> Report
                </Link>
              </div>
              {summary.monthlyListings.length > 1 ? (
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={summary.monthlyListings} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={BLUE} stopOpacity={0.22} />
                        <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone" dataKey="count" stroke={BLUE} strokeWidth={2.5}
                      fill="url(#blueGrad)" dot={{ r: 3, fill: BLUE, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state h-[210px]"><p className="text-sm">No monthly data available</p></div>
              )}
            </motion.div>

            <motion.div {...reveal} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="panel-title">Top societies</h3>
                  <p className="panel-subtitle">Record count by project</p>
                </div>
                <BarChart2 size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              {societyBar.length > 0 ? (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={societyBar} margin={{ top: 4, right: 8, left: -12, bottom: 52 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      tickFormatter={(v: string) => (v && v.length > 14 ? `${v.slice(0, 13)}…` : v)}
                    />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={(v: number) => fmt(v)} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}
                      formatter={(v: number) => [fmt(v), 'Records']}
                    />
                    <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                      {societyBar.map((_, i) => (
                        <Cell key={i} fill={i % 2 === 0 ? BLUE : BLUE_SOFT} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state h-[210px]"><p className="text-sm">No society data</p></div>
              )}
            </motion.div>
          </div>

          {/* ── Societies tag cloud ──────────────────────────────────── */}
          <motion.div {...reveal} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="panel-title">
                Active societies
                <span className="ml-2 badge badge-gold">{societies.length}</span>
              </h3>
              <Link href="/projects" className="btn btn-ghost btn-sm">
                Manage projects <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {societies.map((s) => (
                <Link
                  key={s}
                  href={`/master-data?society=${encodeURIComponent(s)}`}
                  className="badge badge-gold transition-transform hover:-translate-y-0.5 cursor-pointer"
                  style={{ fontSize: '0.7rem', padding: '0.3rem 0.8rem' }}
                >
                  {s}
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
