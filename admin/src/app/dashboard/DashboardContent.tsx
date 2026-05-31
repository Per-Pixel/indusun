'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  RotateCcw, Menu, Star, Users, Building, TrendingUp, DollarSign,
  Home, CheckCircle, XCircle, ArrowRight, BarChart2, Building2,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import { MasterDataSummary } from '@/types/masterData';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

interface DashboardContentProps {
  summary: MasterDataSummary | null;
  societies: string[];
  error: Error | null;
}

const DONUT_COLORS = ['#3B82F6', '#10B981', '#EF4444'];

export default function DashboardContent({ summary, societies, error }: DashboardContentProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => { setIsRefreshing(true); window.location.reload(); };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        {/* Top Navigation */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-md hover:bg-gray-100">
              <Menu className="h-5 w-5 text-gray-500" />
            </button>
            <Star className="h-5 w-5 text-gray-500" />
            <span className="text-gray-500">Dashboards</span>
            <span className="text-gray-400">/</span>
            <span className="font-medium text-black">Overview</span>
          </div>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-md hover:bg-gray-100 ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RotateCcw className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="text-base font-semibold text-red-700 mb-1">Error Loading Data</h3>
              <p className="text-sm text-red-600">{error.message}</p>
            </div>
          )}

          {summary && (
            <>
              {/* ── HERO OVERVIEW ROW ──────────────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

                {/* Card 1 – Welcome Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white flex flex-col justify-between min-h-[200px]">
                  {/* Decorative circles */}
                  <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/10" />
                  <div className="absolute -bottom-8 -right-2 h-48 w-48 rounded-full bg-white/5" />
                  <div className="absolute top-1/2 -left-8 h-24 w-24 rounded-full bg-blue-500/30" />

                  <div className="relative">
                    <p className="text-blue-200 text-sm font-medium mb-1">Welcome back</p>
                    <h2 className="text-2xl font-bold leading-tight">Indusun Admin</h2>
                    <p className="text-blue-200 text-sm mt-1">Real Estate Management Portal</p>
                  </div>

                  <div className="relative mt-4">
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-4xl font-extrabold">{summary.totalRecords.toLocaleString('en-IN')}</span>
                      <span className="text-blue-200 text-sm mb-1">/ Total Properties</span>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href="/properties"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        View Properties <ArrowRight size={14} />
                      </Link>
                      <Link
                        href="/master-data"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/15 text-white text-sm font-semibold rounded-lg hover:bg-white/25 transition-colors"
                      >
                        Master Data
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Card 2 – Total Properties (with status donut) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Properties</p>
                      <p className="text-3xl font-extrabold text-gray-900 mt-1">
                        {summary.listedProperties.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Active listings (not cancelled)</p>
                    </div>
                    <div className="p-2.5 bg-blue-50 rounded-xl">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>

                  {/* Status breakdown donut */}
                  <div className="flex items-center gap-4 mt-4">
                    <PieChart width={80} height={80}>
                      <Pie
                        data={[
                          { value: Math.max(0, summary.listedProperties - summary.soldProperties) },
                          { value: summary.soldProperties },
                          { value: summary.cancelledProperties },
                        ]}
                        cx={35} cy={35} innerRadius={24} outerRadius={38}
                        dataKey="value" startAngle={90} endAngle={-270}
                      >
                        {DONUT_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                      </Pie>
                    </PieChart>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
                        <span className="text-gray-600">Listed</span>
                        <span className="ml-auto font-semibold text-gray-800">{summary.listedProperties - summary.soldProperties}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                        <span className="text-gray-600">Sold</span>
                        <span className="ml-auto font-semibold text-gray-800">{summary.soldProperties}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-400 inline-block" />
                        <span className="text-gray-600">Cancelled</span>
                        <span className="ml-auto font-semibold text-gray-800">{summary.cancelledProperties}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3 – Sold Properties (with area sparkline) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sold Properties</p>
                      <p className="text-3xl font-extrabold text-gray-900 mt-1">
                        {summary.soldProperties.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {summary.totalRecords > 0
                          ? `${((summary.soldProperties / summary.totalRecords) * 100).toFixed(1)}% of total`
                          : '—'}
                      </p>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>

                  {/* Monthly sparkline */}
                  <div className="mt-4 -mx-1">
                    {summary.monthlyListings.length > 1 ? (
                      <ResponsiveContainer width="100%" height={60}>
                        <AreaChart data={summary.monthlyListings} margin={{ top: 2, right: 4, left: 4, bottom: 0 }}>
                          <defs>
                            <linearGradient id="soldGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} fill="url(#soldGrad)" dot={false} />
                          <Tooltip
                            contentStyle={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }}
                            formatter={(v: number) => [v, 'Listings']}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-xs text-gray-400 text-center mt-2">No monthly data</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Monthly listing trend</p>
                </div>

                {/* Card 4 – Properties List by Society (bar chart) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Properties List</p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">By Society</p>
                    </div>
                    <div className="p-2.5 bg-purple-50 rounded-xl">
                      <BarChart2 className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>

                  {summary.propertiesBySociety.length > 0 ? (
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart data={summary.propertiesBySociety} margin={{ top: 2, right: 4, left: -28, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#9CA3AF' }} interval={0} />
                        <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                        <Tooltip
                          contentStyle={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }}
                          formatter={(v: number) => [v, 'Properties']}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {summary.propertiesBySociety.map((_, i) => (
                            <Cell key={i} fill={i % 2 === 0 ? '#6366F1' : '#A5B4FC'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-xs text-gray-400 text-center mt-6">No society data</p>
                  )}
                </div>
              </div>

              {/* ── DETAIL STATS ROW ───────────────────────────────────────── */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                  { label: 'Total Clients', value: summary.totalClients, icon: <Users className="h-5 w-5 text-green-600" />, bg: 'bg-green-50', border: 'border-green-100' },
                  { label: 'Societies', value: summary.uniqueSocieties, icon: <Building className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-50', border: 'border-purple-100' },
                  { label: 'Brokers', value: summary.uniqueBrokers, icon: <TrendingUp className="h-5 w-5 text-orange-600" />, bg: 'bg-orange-50', border: 'border-orange-100' },
                  { label: 'Cancelled', value: summary.cancelledProperties, icon: <XCircle className="h-5 w-5 text-red-500" />, bg: 'bg-red-50', border: 'border-red-100' },
                  { label: 'Plot Amount', value: `₹${(summary.totalPlotAmount / 100000).toFixed(1)}L`, icon: <DollarSign className="h-5 w-5 text-cyan-600" />, bg: 'bg-cyan-50', border: 'border-cyan-100' },
                  { label: 'Paid Amount', value: `₹${(summary.totalPaidAmount / 100000).toFixed(1)}L`, icon: <Home className="h-5 w-5 text-emerald-600" />, bg: 'bg-emerald-50', border: 'border-emerald-100' },
                ].map((s) => (
                  <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4 flex items-center gap-3`}>
                    <div className="p-2 bg-white rounded-lg shadow-sm">{s.icon}</div>
                    <div>
                      <p className="text-xs text-gray-500">{s.label}</p>
                      <p className="text-lg font-bold text-gray-900">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── SOCIETIES TAG CLOUD ───────────────────────────────────── */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Available Societies <span className="text-gray-400 font-normal">({societies.length})</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {societies.map((s) => (
                    <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {!summary && !error && (
            <div className="flex items-center justify-center h-[50vh]">
              <div className="text-center p-8 bg-white rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-2">No Data Available</h2>
                <p className="text-gray-500 text-sm">No records found in the Master Data table.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
