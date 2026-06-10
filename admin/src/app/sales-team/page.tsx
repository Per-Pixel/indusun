'use client';

import React, { useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import {
  Users, TrendingUp, Target, Star, Phone, Mail,
  Award, BarChart2, Plus, Search, Filter, Edit,
  CheckCircle, Clock, XCircle, Crown, Shield, UserCog,
} from 'lucide-react';

type MemberRole = 'sales_manager' | 'sales_executive' | 'telecaller' | 'admin';
type MemberStatus = 'active' | 'on_leave' | 'inactive';

interface SalesMember {
  id: string;
  name: string;
  role: MemberRole;
  status: MemberStatus;
  phone: string;
  email: string;
  joinedDate: string;
  leadsAssigned: number;
  leadsConverted: number;
  revenueGenerated: number;
  monthlyTarget: number;
  visitsScheduled: number;
  visitsCompleted: number;
  projects: string[];
  rating: number;
}

const MOCK_TEAM: SalesMember[] = [
  { id: '1', name: 'Amit Verma',       role: 'admin',           status: 'active',    phone: '+91 98765 43210', email: 'amit.verma@indusun.com',      joinedDate: 'Jan 2022', leadsAssigned: 0,   leadsConverted: 0,  revenueGenerated: 0,           monthlyTarget: 0,           visitsScheduled: 0,  visitsCompleted: 0,  projects: ['All Projects'],                                             rating: 5.0 },
  { id: '2', name: 'Sneha Patel',      role: 'sales_manager',   status: 'active',    phone: '+91 98765 43211', email: 'sneha.patel@indusun.com',      joinedDate: 'Mar 2022', leadsAssigned: 145, leadsConverted: 38, revenueGenerated: 4_20_00_000,  monthlyTarget: 5_00_00_000, visitsScheduled: 52, visitsCompleted: 47, projects: ['Gurukrupa Heights', 'Indusun Greens'],                      rating: 4.8 },
  { id: '3', name: 'Ravi Kumar',       role: 'sales_executive', status: 'active',    phone: '+91 98765 43212', email: 'ravi.kumar@indusun.com',       joinedDate: 'Jun 2022', leadsAssigned: 98,  leadsConverted: 22, revenueGenerated: 2_40_00_000,  monthlyTarget: 2_50_00_000, visitsScheduled: 38, visitsCompleted: 32, projects: ['Gurukrupa Heights'],                                        rating: 4.5 },
  { id: '4', name: 'Pooja Sharma',     role: 'sales_executive', status: 'active',    phone: '+91 98765 43213', email: 'pooja.sharma@indusun.com',     joinedDate: 'Aug 2022', leadsAssigned: 112, leadsConverted: 31, revenueGenerated: 3_10_00_000,  monthlyTarget: 2_50_00_000, visitsScheduled: 45, visitsCompleted: 40, projects: ['Indusun Greens', 'Gurukrupa Residency'],                    rating: 4.7 },
  { id: '5', name: 'Vikram Singh',     role: 'sales_executive', status: 'active',    phone: '+91 98765 43214', email: 'vikram.singh@indusun.com',     joinedDate: 'Oct 2022', leadsAssigned: 87,  leadsConverted: 18, revenueGenerated: 1_95_00_000,  monthlyTarget: 2_50_00_000, visitsScheduled: 30, visitsCompleted: 24, projects: ['Gurukrupa Residency'],                                      rating: 4.2 },
  { id: '6', name: 'Meera Joshi',      role: 'telecaller',      status: 'active',    phone: '+91 98765 43215', email: 'meera.joshi@indusun.com',      joinedDate: 'Jan 2023', leadsAssigned: 220, leadsConverted: 42, revenueGenerated: 0,            monthlyTarget: 0,           visitsScheduled: 0,  visitsCompleted: 0,  projects: ['All Projects'],                                             rating: 4.6 },
  { id: '7', name: 'Arjun Mehta',      role: 'telecaller',      status: 'active',    phone: '+91 98765 43216', email: 'arjun.mehta@indusun.com',      joinedDate: 'Mar 2023', leadsAssigned: 180, leadsConverted: 35, revenueGenerated: 0,            monthlyTarget: 0,           visitsScheduled: 0,  visitsCompleted: 0,  projects: ['All Projects'],                                             rating: 4.3 },
  { id: '8', name: 'Deepa Nair',       role: 'sales_executive', status: 'on_leave',  phone: '+91 98765 43217', email: 'deepa.nair@indusun.com',       joinedDate: 'May 2023', leadsAssigned: 65,  leadsConverted: 14, revenueGenerated: 1_50_00_000,  monthlyTarget: 2_50_00_000, visitsScheduled: 22, visitsCompleted: 18, projects: ['Gurukrupa Heights'],                                        rating: 4.1 },
  { id: '9', name: 'Suresh Rao',       role: 'sales_executive', status: 'inactive',  phone: '+91 98765 43218', email: 'suresh.rao@indusun.com',       joinedDate: 'Sep 2022', leadsAssigned: 43,  leadsConverted: 8,  revenueGenerated: 80_00_000,    monthlyTarget: 2_50_00_000, visitsScheduled: 14, visitsCompleted: 10, projects: ['Indusun Greens'],                                           rating: 3.8 },
];

const ROLE_CONFIG: Record<MemberRole, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  admin:           { label: 'Admin',            color: '#C9A84C', bg: 'bg-amber-50',   icon: <Crown size={12} /> },
  sales_manager:   { label: 'Sales Manager',    color: '#8B5CF6', bg: 'bg-purple-50',  icon: <Shield size={12} /> },
  sales_executive: { label: 'Sales Executive',  color: '#3B82F6', bg: 'bg-blue-50',    icon: <TrendingUp size={12} /> },
  telecaller:      { label: 'Telecaller',        color: '#10B981', bg: 'bg-emerald-50', icon: <Phone size={12} /> },
};

const STATUS_CONFIG: Record<MemberStatus, { label: string; class: string; icon: React.ReactNode }> = {
  active:   { label: 'Active',    class: 'badge-success', icon: <CheckCircle size={10} /> },
  on_leave: { label: 'On Leave',  class: 'badge-warning', icon: <Clock size={10} /> },
  inactive: { label: 'Inactive',  class: 'badge-danger',  icon: <XCircle size={10} /> },
};

function fmtINR(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          fill={i <= Math.round(rating) ? '#C9A84C' : 'none'}
          style={{ color: '#C9A84C' }}
        />
      ))}
      <span className="text-xs ml-1 font-medium" style={{ color: 'var(--text-secondary)' }}>{rating}</span>
    </div>
  );
}

function MemberCard({ member }: { member: SalesMember }) {
  const roleCfg = ROLE_CONFIG[member.role];
  const statusCfg = STATUS_CONFIG[member.status];
  const convRate = member.leadsAssigned > 0
    ? ((member.leadsConverted / member.leadsAssigned) * 100).toFixed(1)
    : '—';
  const targetPct = member.monthlyTarget > 0
    ? Math.min(100, Math.round((member.revenueGenerated / member.monthlyTarget) * 100))
    : null;

  return (
    <div className="card p-5 hover:shadow-md transition-all">
      {/* Avatar + Name */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="avatar avatar-lg font-bold text-lg" style={{ background: roleCfg.bg, color: roleCfg.color }}>
            {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
            <span className={`badge`} style={{ background: roleCfg.bg, color: roleCfg.color, fontSize: '0.65rem' }}>
              {roleCfg.icon} {roleCfg.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`badge ${statusCfg.class}`}>{statusCfg.icon} {statusCfg.label}</span>
          <button className="btn btn-ghost btn-icon btn-sm ml-1"><Edit size={14} /></button>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-1 mb-4">
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <Phone size={12} style={{ color: 'var(--text-muted)' }} /> {member.phone}
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <Mail size={12} style={{ color: 'var(--text-muted)' }} /> {member.email}
        </div>
      </div>

      {/* Rating */}
      <StarRating rating={member.rating} />

      <div className="divider my-3" />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div>
          <p className="text-base font-bold" style={{ color: '#3B82F6' }}>{member.leadsAssigned}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Assigned</p>
        </div>
        <div>
          <p className="text-base font-bold" style={{ color: '#10B981' }}>{member.leadsConverted}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Converted</p>
        </div>
        <div>
          <p className="text-base font-bold" style={{ color: '#C9A84C' }}>{convRate}{convRate !== '—' ? '%' : ''}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Conv. Rate</p>
        </div>
      </div>

      {/* Revenue vs Target */}
      {member.revenueGenerated > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: 'var(--text-muted)' }}>Revenue</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{fmtINR(member.revenueGenerated)}</span>
          </div>
          {targetPct !== null && (
            <>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${targetPct >= 100 ? 'success' : targetPct >= 70 ? '' : 'danger'}`}
                  style={{ width: `${targetPct}%` }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {targetPct}% of target ({fmtINR(member.monthlyTarget)})
              </p>
            </>
          )}
        </div>
      )}

      {/* Projects */}
      <div className="flex flex-wrap gap-1 mt-3">
        {member.projects.map((p) => (
          <span key={p} className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>{p}</span>
        ))}
      </div>
    </div>
  );
}

export default function SalesTeamPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<MemberRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all');

  const filtered = MOCK_TEAM.filter((m) => {
    if (roleFilter !== 'all' && m.role !== roleFilter) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalRevenue = MOCK_TEAM.reduce((s, m) => s + m.revenueGenerated, 0);
  const totalLeads = MOCK_TEAM.reduce((s, m) => s + m.leadsAssigned, 0);
  const totalConverted = MOCK_TEAM.reduce((s, m) => s + m.leadsConverted, 0);
  const activeCount = MOCK_TEAM.filter((m) => m.status === 'active').length;

  return (
    <CRMLayout>
      <div className="page-container space-y-5">
        {/* Header */}
        <div className="page-header">
          <div>
            <p className="breadcrumb">
              <span>Sales</span><span className="sep">/</span>
              <span className="current">Sales Team</span>
            </p>
            <h1 className="page-title">Sales Team Management</h1>
            <p className="page-subtitle">
              {activeCount} active team members · Monitor performance and assignments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm">
              <BarChart2 size={14} /> Performance Report
            </button>
            <button className="btn btn-primary btn-sm">
              <Plus size={14} /> Add Member
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Team Size',         value: MOCK_TEAM.length,                  icon: <Users size={18} style={{ color: '#3B82F6' }} />,      bg: 'bg-blue-50' },
            { label: 'Total Leads',        value: totalLeads.toLocaleString('en-IN'), icon: <Target size={18} style={{ color: '#F59E0B' }} />,      bg: 'bg-amber-50' },
            { label: 'Converted',          value: totalConverted.toLocaleString('en-IN'), icon: <Award size={18} style={{ color: '#10B981' }} />,  bg: 'bg-emerald-50' },
            { label: 'Total Revenue',      value: fmtINR(totalRevenue),              icon: <TrendingUp size={18} style={{ color: '#8B5CF6' }} />,   bg: 'bg-purple-50' },
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

        {/* Leaderboard */}
        <div className="card p-5">
          <h3 className="text-h3 mb-3 flex items-center gap-2">
            <Crown size={16} style={{ color: 'var(--gold)' }} /> Top Performers — June 2026
          </h3>
          <div className="overflow-x-auto">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Executive</th>
                  <th>Role</th>
                  <th>Leads Assigned</th>
                  <th>Converted</th>
                  <th>Conv. Rate</th>
                  <th>Revenue</th>
                  <th>Target %</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TEAM
                  .filter((m) => m.revenueGenerated > 0)
                  .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
                  .slice(0, 5)
                  .map((m, idx) => {
                    const roleCfg = ROLE_CONFIG[m.role];
                    const convRate = m.leadsAssigned > 0 ? ((m.leadsConverted / m.leadsAssigned) * 100).toFixed(1) : '0';
                    const targetPct = m.monthlyTarget > 0 ? Math.min(100, Math.round((m.revenueGenerated / m.monthlyTarget) * 100)) : 0;
                    return (
                      <tr key={m.id}>
                        <td>
                          <span className={`font-bold text-base ${idx === 0 ? 'text-gold' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : ''}`}
                            style={{ color: idx === 0 ? 'var(--gold)' : undefined }}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="avatar avatar-sm" style={{ background: roleCfg.bg, color: roleCfg.color }}>
                              {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Since {m.joinedDate}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge" style={{ background: roleCfg.bg, color: roleCfg.color }}>
                            {roleCfg.label}
                          </span>
                        </td>
                        <td className="font-semibold" style={{ color: 'var(--text-primary)' }}>{m.leadsAssigned}</td>
                        <td className="font-semibold" style={{ color: '#10B981' }}>{m.leadsConverted}</td>
                        <td>
                          <span className={`badge ${Number(convRate) >= 25 ? 'badge-success' : Number(convRate) >= 15 ? 'badge-warning' : 'badge-danger'}`}>
                            {convRate}%
                          </span>
                        </td>
                        <td className="font-semibold" style={{ color: 'var(--gold)' }}>{fmtINR(m.revenueGenerated)}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="progress-bar" style={{ width: '80px' }}>
                              <div
                                className={`progress-fill ${targetPct >= 100 ? 'success' : ''}`}
                                style={{ width: `${targetPct}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{targetPct}%</span>
                          </div>
                        </td>
                        <td><StarRating rating={m.rating} /></td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Toolbar */}
        <div className="card p-4 flex items-center gap-3 flex-wrap">
          <div className="search-wrapper flex-1 min-w-[200px]">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input input-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input input-sm select w-auto"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as MemberRole | 'all')}
          >
            <option value="all">All Roles</option>
            {(Object.keys(ROLE_CONFIG) as MemberRole[]).map((r) => (
              <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
            ))}
          </select>
          <select
            className="input input-sm select w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MemberStatus | 'all')}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3">
              <div className="card">
                <div className="empty-state py-16">
                  <div className="empty-state-icon"><Users size={28} style={{ color: 'var(--text-muted)' }} /></div>
                  <p className="font-semibold mt-2" style={{ color: 'var(--text-secondary)' }}>No team members found</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CRMLayout>
  );
}
