'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users, Building2, DollarSign, TrendingUp, CheckCircle, XCircle,
  Calendar, ArrowRight, ArrowUpRight, ArrowDownRight, BarChart2,
  Building, RefreshCcw, ClipboardList, Plus, Eye,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { MasterDataSummary } from '@/types/masterData';

interface DashboardContentProps {
  summary: MasterDataSummary | null;
  societies: string[];
  error: Error | null;
}

const GOLD = '#C9A84C';
const SLATE = '#0F172A';
const PIE_COLORS = [GOLD, '#10B981', '#EF4444', '#3B82F6', '#8B5CF6'];
const STATUS_COLORS = ['#C9A84C', '#10B981', '#EF4444'];

function StatCard({
  label, value, sub, icon, iconBg, trend, trendValue,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; iconBg: string;
  trend?: 'up' | 'down' | 'neutral'; trendValue?: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
        {trend && trendValue && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
            {trend === 'up' ? <ArrowUpRight size={13} /> : trend === 'down' ? <ArrowDownRight size={13} /> : null}
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-disabled)' }}>{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card px-3 py-2 text-xs" style={{ border: '1px solid var(--gold-border)' }}>
        <p style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="font-bold" style={{ color: GOLD }}>{payload[0].value} properties</p>
      </div>
    );
  }
  return null;
};

export default function DashboardContent({ summary, societies, error }: DashboardContentProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const fmt = (n: number) => n.toLocaleString('en-IN');
  const fmtLakh = (n: number) => `₹${(n / 100_000).toFixed(1)}L`;

  const pct = (a: number, b: number) => (b > 0 ? `${((a / b) * 100).toFixed(1)}%` : '0%');

  // Pipeline data for donut
  const pipelineData = summary
    ? [
        { name: 'Available', value: Math.max(0, summary.listedProperties - summary.soldProperties) },
        { name: 'Sold', value: summary.soldProperties },
        { name: 'Cancelled', value: summary.cancelledProperties },
      ]
    : [];

  // Society bar data (top 6)
  const societyBar = summary?.propertiesBySociety.slice(0, 6) ?? [];

  // Lead source mock — integrated from master data broker counts
  const leadSourceData = summary
    ? [
        { name: 'Direct', value: Math.round(summary.totalClients * 0.35) },
        { name: 'Broker', value: summary.uniqueBrokers },
        { name: 'Referral', value: Math.round(summary.totalClients * 0.2) },
        { name: 'Portal', value: Math.round(summary.totalClients * 0.1) },
      ]
    : [];

  return (
    <div className="page-container space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="breadcrumb">
            <span>Home</span>
            <span className="sep">/</span>
            <span className="current">Dashboard</span>
          </p>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Welcome back! Here&apos;s what&apos;s happening today.</p>
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
          {/* ── Hero Banner ──────────────────────────────────────────── */}
          <div className="hero-card p-6 flex items-center justify-between gap-6">
            <div>
              <p className="text-xs font-medium tracking-wider mb-1" style={{ color: GOLD }}>INDUSUN REAL ESTATE CRM</p>
              <h2 className="text-2xl font-bold text-white mb-1">
                {fmt(summary.totalRecords)} Total Records
              </h2>
              <p className="text-sm text-slate-400">
                {fmt(summary.totalClients)} clients across {summary.uniqueSocieties} societies
              </p>
              <div className="flex gap-3 mt-4">
                <Link href="/master-data" className="btn btn-sm" style={{ background: GOLD, color: SLATE, border: 'none' }}>
                  View Master Data <ArrowRight size={14} />
                </Link>
                <Link href="/properties" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                  Properties
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-6">
              {[
                { label: 'Sold', value: fmt(summary.soldProperties), color: '#10B981' },
                { label: 'Available', value: fmt(summary.listedProperties - summary.soldProperties), color: GOLD },
                { label: 'Cancelled', value: fmt(summary.cancelledProperties), color: '#EF4444' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── KPI Cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Records"
              value={fmt(summary.totalRecords)}
              sub="All master data entries"
              icon={<ClipboardList size={20} style={{ color: GOLD }} />}
              iconBg="bg-amber-50"
              trend="up"
              trendValue="+12.4%"
            />
            <StatCard
              label="Active Clients"
              value={fmt(summary.totalClients)}
              sub={`${summary.uniqueSocieties} societies`}
              icon={<Users size={20} style={{ color: '#3B82F6' }} />}
              iconBg="bg-blue-50"
              trend="up"
              trendValue="+8.2%"
            />
            <StatCard
              label="Sold Properties"
              value={fmt(summary.soldProperties)}
              sub={`${pct(summary.soldProperties, summary.totalRecords)} conversion`}
              icon={<CheckCircle size={20} style={{ color: '#10B981' }} />}
              iconBg="bg-emerald-50"
              trend="up"
              trendValue="+22.1%"
            />
            <StatCard
              label="Total Revenue"
              value={fmtLakh(summary.totalPlotAmount)}
              sub={`Paid: ${fmtLakh(summary.totalPaidAmount)}`}
              icon={<DollarSign size={20} style={{ color: '#8B5CF6' }} />}
              iconBg="bg-purple-50"
              trend="up"
              trendValue="+18.7%"
            />
          </div>

          {/* ── Secondary KPIs ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Societies', value: summary.uniqueSocieties, icon: <Building size={17} style={{ color: '#8B5CF6' }} />, bg: 'bg-purple-50' },
              { label: 'Brokers / Agents', value: summary.uniqueBrokers, icon: <TrendingUp size={17} style={{ color: '#F59E0B' }} />, bg: 'bg-amber-50' },
              { label: 'Cancelled', value: summary.cancelledProperties, icon: <XCircle size={17} style={{ color: '#EF4444' }} />, bg: 'bg-red-50' },
              { label: 'Paid Amount', value: fmtLakh(summary.totalPaidAmount), icon: <DollarSign size={17} style={{ color: '#10B981' }} />, bg: 'bg-emerald-50' },
            ].map((s) => (
              <div key={s.label} className="card p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bg}`}>{s.icon}</div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Charts Row ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Monthly Trend Area Chart */}
            <div className="card p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-h3">Monthly Listings Trend</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Property activity over the past months</p>
                </div>
                <Link href="/reports" className="btn btn-ghost btn-sm">
                  <Eye size={14} /> View Report
                </Link>
              </div>
              {summary.monthlyListings.length > 1 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={summary.monthlyListings} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={GOLD} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone" dataKey="count" stroke={GOLD} strokeWidth={2.5}
                      fill="url(#goldGrad)" dot={{ r: 3, fill: GOLD, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state h-[200px]"><p className="text-sm">No monthly data available</p></div>
              )}
            </div>

            {/* Property Status Donut */}
            <div className="card p-5">
              <h3 className="text-h3 mb-1">Property Status</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Distribution of all properties</p>
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
          </div>

          {/* ── Bottom Row ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Properties by Society Bar Chart */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-h3">Top Societies</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Properties count by project</p>
                </div>
                <BarChart2 size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              {societyBar.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={societyBar} margin={{ top: 4, right: 4, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}
                      formatter={(v: number) => [fmt(v), 'Properties']}
                    />
                    <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                      {societyBar.map((_, i) => (
                        <Cell key={i} fill={i % 2 === 0 ? GOLD : '#D4AF37'} opacity={i % 2 === 0 ? 1 : 0.7} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state h-[220px]"><p className="text-sm">No society data</p></div>
              )}
            </div>

            {/* Lead Sources Pie + Quick Actions */}
            <div className="space-y-4">
              {/* Lead Sources */}
              <div className="card p-5">
                <h3 className="text-h3 mb-3">Lead Sources</h3>
                <div className="space-y-2">
                  {leadSourceData.map((s, i) => {
                    const total = leadSourceData.reduce((sum, x) => sum + x.value, 0);
                    const pctVal = total > 0 ? Math.round((s.value / total) * 100) : 0;
                    return (
                      <div key={s.name}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pctVal}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${pctVal}%`, background: PIE_COLORS[i] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card p-5">
                <h3 className="text-h3 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'View Properties', href: '/properties', icon: <Building2 size={15} /> },
                    { label: 'Master Data', href: '/master-data', icon: <ClipboardList size={15} /> },
                    { label: 'Clients', href: '/clients', icon: <Users size={15} /> },
                    { label: 'Reports', href: '/reports', icon: <BarChart2 size={15} /> },
                  ].map((a) => (
                    <Link
                      key={a.href}
                      href={a.href}
                      className="flex items-center gap-2 p-3 rounded-lg border text-sm font-medium hover:border-amber-300 hover:bg-amber-50 transition-all"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                    >
                      <span style={{ color: GOLD }}>{a.icon}</span>
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Societies Tag Cloud ───────────────────────────────────── */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-h3">
                Active Societies
                <span className="ml-2 badge badge-gold">{societies.length}</span>
              </h3>
              <Link href="/projects" className="btn btn-ghost btn-sm">
                Manage Projects <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {societies.map((s) => (
                <Link
                  key={s}
                  href={`/master-data?society=${encodeURIComponent(s)}`}
                  className="badge badge-gold hover:bg-amber-100 transition-colors cursor-pointer"
                  style={{ fontSize: '0.7rem', padding: '0.3rem 0.8rem' }}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
