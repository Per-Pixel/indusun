'use client';

import React, { useState } from 'react';
import { Building2, Users, DollarSign, TrendingUp, CheckCircle, XCircle, Search } from 'lucide-react';

function fmtINR(n: number) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

interface Project {
  name: string;
  totalUnits: number;
  soldUnits: number;
  cancelledUnits: number;
  availableUnits: number;
  totalRevenue: number;
  paidRevenue: number;
  brokerCount: number;
  clientCount: number;
}

interface Props {
  projects: Project[];
  totalSocieties: number;
  error: Error | null;
}

const STATUS_COLORS = ['#C9A84C', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

export default function ProjectsContent({ projects, totalSocieties, error }: Props) {
  const [search, setSearch] = useState('');

  const filtered = projects.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = projects.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalPaid    = projects.reduce((sum, p) => sum + p.paidRevenue, 0);
  const totalUnits   = projects.reduce((sum, p) => sum + p.totalUnits, 0);
  const totalSold    = projects.reduce((sum, p) => sum + p.soldUnits, 0);

  return (
    <div className="page-container space-y-5">
      <div className="page-header">
        <div>
          <p className="breadcrumb"><span>Properties</span><span className="sep">/</span><span className="current">Projects</span></p>
          <h1 className="page-title">Projects Management</h1>
          <p className="page-subtitle">{totalSocieties} active projects / societies</p>
        </div>
      </div>

      {error && (
        <div className="card p-4" style={{ borderColor: 'var(--danger)', background: 'var(--danger-bg)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>{error.message}</p>
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: totalSocieties, icon: <Building2 size={18} style={{ color: '#C9A84C' }} />, bg: 'bg-amber-50' },
          { label: 'Total Units', value: totalUnits.toLocaleString('en-IN'), icon: <TrendingUp size={18} style={{ color: '#3B82F6' }} />, bg: 'bg-blue-50' },
          { label: 'Total Revenue', value: fmtINR(totalRevenue), icon: <DollarSign size={18} style={{ color: '#8B5CF6' }} />, bg: 'bg-purple-50' },
          { label: 'Units Sold/Paid', value: totalSold.toLocaleString('en-IN'), icon: <CheckCircle size={18} style={{ color: '#10B981' }} />, bg: 'bg-emerald-50' },
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

      {/* Revenue Progress */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Overall Collection Progress</p>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {fmtINR(totalPaid)} / {fmtINR(totalRevenue)}
            <span className="ml-2 text-xs font-medium" style={{ color: 'var(--gold)' }}>
              {totalRevenue > 0 ? `${Math.round((totalPaid / totalRevenue) * 100)}%` : '0%'}
            </span>
          </p>
        </div>
        <div className="progress-bar" style={{ height: '10px' }}>
          <div className="progress-fill" style={{ width: `${totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0}%` }} />
        </div>
      </div>

      {/* Search */}
      <div className="search-wrapper">
        <Search size={16} className="search-icon" />
        <input
          type="text" placeholder="Search projects / societies..."
          className="input" value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((project, idx) => {
          const soldPct = project.totalUnits > 0 ? Math.round((project.soldUnits / project.totalUnits) * 100) : 0;
          const paidPct = project.totalRevenue > 0 ? Math.round((project.paidRevenue / project.totalRevenue) * 100) : 0;
          const color = STATUS_COLORS[idx % STATUS_COLORS.length];
          return (
            <div key={project.name} className="card overflow-hidden hover:shadow-lg transition-all">
              {/* Color header bar */}
              <div className="h-2" style={{ background: color }} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                      style={{ background: color }}
                    >
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{project.name}</h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{project.totalUnits} total units</p>
                    </div>
                  </div>
                  <span className="badge badge-gold text-xs">{soldPct}% sold</span>
                </div>

                {/* Unit breakdown */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 rounded-lg bg-emerald-50">
                    <p className="text-base font-bold" style={{ color: 'var(--success)' }}>{project.soldUnits}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sold</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-blue-50">
                    <p className="text-base font-bold" style={{ color: '#3B82F6' }}>{project.availableUnits}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Available</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-red-50">
                    <p className="text-base font-bold" style={{ color: 'var(--danger)' }}>{project.cancelledUnits}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cancelled</p>
                  </div>
                </div>

                {/* Revenue */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>Revenue Collection</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {fmtINR(project.paidRevenue)} / {fmtINR(project.totalRevenue)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${paidPct}%`, background: color }} />
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Users size={12} />{project.clientCount} clients
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <TrendingUp size={12} />{project.brokerCount} brokers
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--success)' }}>
                    <CheckCircle size={12} />{soldPct}% conversion
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state card py-12">
          <div className="empty-state-icon"><Building2 size={24} style={{ color: 'var(--text-muted)' }} /></div>
          <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No projects found</p>
        </div>
      )}
    </div>
  );
}
