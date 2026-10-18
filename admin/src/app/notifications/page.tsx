'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CRMLayout from '@/components/CRMLayout';
import toast from 'react-hot-toast';
import {
  Bell, CheckCheck, Search, Trash2, Users, Calendar,
  DollarSign, Building2, AlertCircle, Info, CheckCircle,
  Clock, ArrowRight, RefreshCw,
} from 'lucide-react';

type NotifType = 'lead' | 'visit' | 'payment' | 'booking' | 'system' | 'alert';
type NotifPriority = 'high' | 'medium' | 'low';

interface Notification {
  id: string;
  type: NotifType;
  priority: NotifPriority;
  title: string;
  description: string;
  time: string;
  read: boolean;
  action?: { label: string; href: string };
}

const TYPE_CONFIG: Record<NotifType, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  lead:    { icon: <Users size={16} />,       color: '#3B82F6', bg: 'bg-blue-50',    label: 'Lead' },
  visit:   { icon: <Calendar size={16} />,    color: '#C9A84C', bg: 'bg-amber-50',   label: 'Visit' },
  payment: { icon: <DollarSign size={16} />,  color: '#10B981', bg: 'bg-emerald-50', label: 'Payment' },
  booking: { icon: <Building2 size={16} />,   color: '#8B5CF6', bg: 'bg-purple-50',  label: 'Booking' },
  system:  { icon: <Info size={16} />,        color: '#6B7280', bg: 'bg-gray-100',   label: 'System' },
  alert:   { icon: <AlertCircle size={16} />, color: '#EF4444', bg: 'bg-red-50',     label: 'Alert' },
};

const PRIORITY_BADGE: Record<NotifPriority, string> = {
  high:   'badge-danger',
  medium: 'badge-warning',
  low:    'badge-neutral',
};

function NotificationCard({ notif, onToggleRead, onDelete }: {
  notif: Notification;
  onToggleRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
  return (
    <div
      className={`card p-4 flex items-start gap-4 transition-all ${notif.read ? 'opacity-70' : ''}`}
      style={notif.read ? undefined : { borderColor: cfg.color }}
    >
      <div className={`p-2.5 rounded-xl flex-shrink-0 ${cfg.bg}`} style={{ color: cfg.color }}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {notif.title}
            </p>
            {!notif.read && (
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
            )}
            <span className={`badge ${PRIORITY_BADGE[notif.priority]}`} style={{ fontSize: '0.6rem' }}>
              {notif.priority}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onToggleRead(notif.id)}
              className="btn btn-ghost btn-icon btn-sm"
              title={notif.read ? 'Mark unread' : 'Mark read'}
            >
              <CheckCircle size={14} style={{ color: notif.read ? 'var(--text-muted)' : 'var(--success)' }} />
            </button>
            <button
              onClick={() => onDelete(notif.id)}
              className="btn btn-ghost btn-icon btn-sm"
              title="Delete"
            >
              <Trash2 size={14} style={{ color: 'var(--danger)' }} />
            </button>
          </div>
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{notif.description}</p>
        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Clock size={11} /> {notif.time}
          </span>
          {notif.action && (
            <a
              href={notif.action.href}
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: 'var(--gold)' }}
            >
              {notif.action.label} <ArrowRight size={11} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<NotifType | 'all'>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [search, setSearch] = useState('');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to load notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Notifications fetch error:', err);
      toast.error('Failed to load live notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    const allIds = notifications.map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_all_read', allIds }),
    });
    toast.success('All notifications marked as read');
  };

  const toggleRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_read', id }),
    });
  };

  const deleteNotif = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
  };

  const filtered = notifications.filter((n) => {
    if (filterType !== 'all' && n.type !== filterType) return false;
    if (filterRead === 'unread' && n.read) return false;
    if (filterRead === 'read' && !n.read) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const typeCounts: Record<string, number> = { all: notifications.length };
  notifications.forEach((n) => { typeCounts[n.type] = (typeCounts[n.type] || 0) + 1; });

  return (
    <CRMLayout>
      <div className="page-container space-y-5">
        {/* Header */}
        <div className="page-header">
          <div>
            <p className="breadcrumb">
              <span>Communications</span><span className="sep">/</span>
              <span className="current">Notifications</span>
            </p>
            <div className="flex items-center gap-2">
              <h1 className="page-title">Notifications</h1>
              {unreadCount > 0 && (
                <span className="badge badge-danger">{unreadCount.toLocaleString('en-IN')} unread</span>
              )}
            </div>
            <p className="page-subtitle">
              Live activity feed aggregated from Supabase bills, new customer applications, EMI receipts, cancellations, and messages
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchNotifications} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="btn btn-secondary btn-sm">
                <CheckCheck size={14} /> Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex gap-2 flex-wrap">
          {([
            { key: 'all',     label: 'All' },
            { key: 'payment', label: 'Payments & Bills' },
            { key: 'booking', label: 'Bookings & Forms' },
            { key: 'lead',    label: 'Leads & SMS' },
            { key: 'alert',   label: 'Alerts & Cancellations' },
            { key: 'system',  label: 'Internal Comms' },
          ] as { key: NotifType | 'all'; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setFilterType(t.key)}
              className={`btn btn-sm ${filterType === t.key ? 'btn-primary' : 'btn-secondary'}`}
            >
              {t.label}
              <span
                className="ml-1 px-1.5 py-0.5 rounded-full text-xs"
                style={{
                  background: filterType === t.key ? 'rgba(0,0,0,0.15)' : 'var(--surface-2)',
                  color: filterType === t.key ? 'var(--text-inverse)' : 'var(--text-muted)',
                }}
              >
                {(typeCounts[t.key] ?? 0).toLocaleString('en-IN')}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Read Filter */}
        <div className="card p-4 flex items-center gap-3 flex-wrap">
          <div className="search-wrapper flex-1 min-w-[200px]">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search notifications by client, bill #, society or plot..."
              className="input input-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'unread', 'read'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterRead(r)}
                className={`btn btn-sm capitalize ${filterRead === r ? 'btn-primary' : 'btn-secondary'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading && notifications.length === 0 ? (
          <div className="card p-12 text-center text-sm text-gray-500">Loading live notifications…</div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state py-16">
              <div className="empty-state-icon">
                <Bell size={28} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="font-semibold mt-2" style={{ color: 'var(--text-secondary)' }}>No notifications</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {filterRead === 'unread' ? 'You are all caught up — no unread notifications!' : 'Try adjusting your filters'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => (
              <NotificationCard
                key={n.id}
                notif={n}
                onToggleRead={toggleRead}
                onDelete={deleteNotif}
              />
            ))}
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
