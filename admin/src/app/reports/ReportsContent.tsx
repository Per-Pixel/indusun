'use client';

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Users, DollarSign, Building2, Award } from 'lucide-react';
import { MasterDataSummary } from '@/types/masterData';

const GOLD = '#C9A84C';
const COLORS = [GOLD, '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6'];

function fmtINR(n: number) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

interface Props {
  summary: MasterDataSummary | null;
  topBrokers: { name: string; deals: number; revenue: number; paid: number }[];
  error: Error | null;
}

const TABS = ['Overview', 'Sales Funnel', 'Broker Performance', 'Society Analysis'];

export default function ReportsContent({ summary, topBrokers, error }: Props) {
  const [activeTab, setActiveTab] = useState('Overview');

  const funnelData = summary
    ? [
        { stage: 'Total Records', count: summary.totalRecords, fill: '#3B82F6' },
        { stage: 'Active Clients', count: summary.totalClients, fill: '#8B5CF6' },
        { stage: 'Listed', count: summary.listedProperties, fill: GOLD },
        { stage: 'Paid / Booked', count: summary.soldProperties, fill: '#10B981' },
      ]
    : [];

  return (
    <div className="page-container space-y-5">
      <div className="page-header">
        <div>
          <p className="breadcrumb"><span>System</span><span className="sep">/</span><span className="current">Reports & Analytics</span></p>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Comprehensive insights from your real estate data</p>
        </div>
      </div>

      {error && (
        <div className="card p-4" style={{ borderColor: 'var(--danger)', background: 'var(--danger-bg)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>{error.message}</p>
        </div>
      )}

      {/* Tab switcher */}
      <div className="tabs">
        {TABS.map((tab) => (
          <button key={tab} className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'Overview' && summary && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Records',  value: summary.totalRecords.toLocaleString('en-IN'),   icon: <BarChart3 size={18} style={{ color: GOLD }} />, bg: 'bg-amber-50' },
              { label: 'Total Clients',  value: summary.totalClients.toLocaleString('en-IN'),   icon: <Users size={18} style={{ color: '#3B82F6' }} />, bg: 'bg-blue-50' },
              { label: 'Total Revenue',  value: fmtINR(summary.totalPlotAmount),  icon: <DollarSign size={18} style={{ color: '#8B5CF6' }} />, bg: 'bg-purple-50' },
              { label: 'Amount Paid',    value: fmtINR(summary.totalPaidAmount),  icon: <TrendingUp size={18} style={{ color: '#10B981' }} />, bg: 'bg-emerald-50' },
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monthly Trend */}
            <div className="card p-5">
              <h3 className="text-h3 mb-4">Monthly Listings Trend</h3>
              {summary.monthlyListings.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={summary.monthlyListings} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="repGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={GOLD} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Area type="monotone" dataKey="count" stroke={GOLD} strokeWidth={2} fill="url(#repGold)" dot={{ r: 3, fill: GOLD }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state h-[220px]"><p>No data</p></div>
              )}
            </div>

            {/* Property Status Pie */}
            <div className="card p-5">
              <h3 className="text-h3 mb-4">Property Status Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Available', value: summary.listedProperties - summary.soldProperties },
                      { name: 'Sold/Paid', value: summary.soldProperties },
                      { name: 'Cancelled', value: summary.cancelledProperties },
                    ]}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {COLORS.slice(0, 3).map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Sales Funnel Tab */}
      {activeTab === 'Sales Funnel' && (
        <div className="card p-5">
          <h3 className="text-h3 mb-4">Sales Pipeline Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData} layout="vertical" margin={{ top: 4, right: 30, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={80} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {funnelData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Conversion rates */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Client Reach Rate', value: summary ? `${((summary.totalClients / summary.totalRecords) * 100).toFixed(1)}%` : '—', color: '#8B5CF6' },
              { label: 'Listing Rate', value: summary ? `${((summary.listedProperties / summary.totalRecords) * 100).toFixed(1)}%` : '—', color: GOLD },
              { label: 'Booking Conversion', value: summary ? `${((summary.soldProperties / summary.totalRecords) * 100).toFixed(1)}%` : '—', color: '#10B981' },
            ].map((m) => (
              <div key={m.label} className="card p-4 text-center">
                <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Broker Performance Tab */}
      {activeTab === 'Broker Performance' && (
        <div className="card overflow-hidden">
          <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <Award size={18} style={{ color: GOLD }} />
              <h3 className="text-h3">Top Performing Brokers</h3>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Ranked by number of deals closed</p>
          </div>
          <div className="overflow-x-auto">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Broker Name</th>
                  <th>Total Deals</th>
                  <th>Total Revenue</th>
                  <th>Amount Collected</th>
                  <th>Collection Rate</th>
                </tr>
              </thead>
              <tbody>
                {topBrokers.map((broker, idx) => (
                  <tr key={broker.name}>
                    <td>
                      <span className={`avatar avatar-sm font-bold text-xs ${idx < 3 ? '' : ''}`}
                        style={idx === 0 ? { background: '#FEF3C7', color: '#B45309' } : idx === 1 ? { background: '#F1F5F9', color: '#475569' } : idx === 2 ? { background: '#FEF0E8', color: '#9A3412' } : { background: 'var(--surface-2)', color: 'var(--text-muted)' }}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="avatar avatar-sm">{(broker.name || 'B').charAt(0).toUpperCase()}</div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{broker.name}</p>
                      </div>
                    </td>
                    <td className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{broker.deals}</td>
                    <td className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>{fmtINR(broker.revenue)}</td>
                    <td className="text-sm font-semibold" style={{ color: 'var(--success)' }}>{fmtINR(broker.paid)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar" style={{ width: '80px' }}>
                          <div className="progress-fill success" style={{ width: `${broker.revenue > 0 ? Math.round((broker.paid / broker.revenue) * 100) : 0}%` }} />
                        </div>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                          {broker.revenue > 0 ? `${Math.round((broker.paid / broker.revenue) * 100)}%` : '—'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Society Analysis Tab */}
      {activeTab === 'Society Analysis' && summary && (
        <div className="card p-5">
          <h3 className="text-h3 mb-4">Properties by Society / Project</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={summary.propertiesBySociety} margin={{ top: 4, right: 4, left: -20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} angle={-40} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [v, 'Properties']} />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {summary.propertiesBySociety.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Total Societies', value: summary.uniqueSocieties, icon: <Building2 size={16} /> },
              { label: 'Avg per Society', value: Math.round(summary.totalRecords / summary.uniqueSocieties), icon: <BarChart3 size={16} /> },
              { label: 'Total Brokers', value: summary.uniqueBrokers, icon: <Users size={16} /> },
              { label: 'Total Clients', value: summary.totalClients, icon: <Users size={16} /> },
            ].map((s) => (
              <div key={s.label} className="card p-3 flex items-center gap-2">
                <span style={{ color: GOLD }}>{s.icon}</span>
                <div>
                  <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
