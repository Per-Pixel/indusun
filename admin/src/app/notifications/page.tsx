'use client';

import React, { useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import {
  Bell, CheckCheck, Filter, Search, Trash2, Users, Calendar,
  DollarSign, Building2, AlertCircle, Info, CheckCircle, XCircle,
  Star, Clock, ArrowRight,
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

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1',  type: 'lead',    priority: 'high',   title: 'New Hot Lead Registered',           description: 'Rahul Sharma submitted an inquiry for Gurukrupa Heights Phase 2. Budget ₹85L.',                       time: '5 min ago',    read: false, action: { label: 'View Lead', href: '/leads' } },
  { id: '2',  type: 'visit',   priority: 'high',   title: 'Site Visit Confirmed — Today 3 PM',  description: 'Priya Mehta confirmed her site visit at Indusun Greens. Assigned to Sneha Patel.',                   time: '22 min ago',   read: false, action: { label: 'View Visit', href: '/site-visits' } },
  { id: '3',  type: 'payment', priority: 'high',   title: 'Payment Received ₹5.5L',             description: 'Vikram Patel cleared second instalment for Plot #A-42, Gurukrupa Residency.',                        time: '1 hour ago',   read: false, action: { label: 'View Booking', href: '/bookings' } },
  { id: '4',  type: 'booking', priority: 'medium', title: 'New Booking Confirmed',               description: 'Ananya Joshi booked Plot #B-17 at Indusun Greens. Token amount ₹2L received.',                       time: '2 hours ago',  read: false, action: { label: 'View Booking', href: '/bookings' } },
  { id: '5',  type: 'lead',    priority: 'medium', title: 'Lead Status Updated',                 description: '12 leads moved from "Contacted" to "Interested" stage by Amit Verma.',                               time: '3 hours ago',  read: true  },
  { id: '6',  type: 'visit',   priority: 'medium', title: 'Site Visit Completed',                description: 'Suresh Kumar completed his visit at Gurukrupa Heights. Feedback: Highly Interested.',                time: '4 hours ago',  read: true  },
  { id: '7',  type: 'system',  priority: 'low',    title: 'Weekly Report Generated',             description: 'Your weekly CRM performance report is ready. 47 new leads, 8 bookings this week.',                  time: '6 hours ago',  read: true,  action: { label: 'View Report', href: '/reports' } },
  { id: '8',  type: 'alert',   priority: 'high',   title: 'Follow-up Overdue — 5 Leads',         description: '5 leads have not been contacted in over 7 days. Take action to prevent lead drop-off.',              time: '1 day ago',    read: false, action: { label: 'View Leads', href: '/leads' } },
  { id: '9',  type: 'payment', priority: 'medium', title: 'Payment Reminder Sent',               description: 'Automated reminder sent to 3 clients for upcoming EMI due on 15th June.',                           time: '1 day ago',    read: true  },
  { id: '10', type: 'booking', priority: 'low',    title: 'Agreement Signed',                    description: 'Kavya Reddy signed the sale agreement for Plot #C-9. Document uploaded to system.',                  time: '2 days ago',   read: true  },
  { id: '11', type: 'system',  priority: 'low',    title: 'New Broker Onboarded',                description: 'Broker "Mehta Realty" has been added to the system by Admin Sneha Patel.',                          time: '2 days ago',   read: true  },
  { id: '12', type: 'lead',    priority: 'medium', title: 'Bulk Lead Import Completed',          description: '38 leads imported from portal CSV. Review and assign to sales executives.',                          time: '3 days ago',   read: true,  action: { label: 'View Leads', href: '/leads' } },
  { id: '13', type: 'alert',   priority: 'high',   title: 'Inventory Alert — Low Availability',  description: 'Only 3 plots remaining at Gurukrupa Heights Phase 1. Consider activating waitlist.',                 time: '3 days ago',   read: true  },
  { id: '14', type: 'visit',   priority: 'low',    title: '3 Visits Scheduled for Tomorrow',     description: 'Upcoming: Neha Singh 10AM, Ravi Tiwari 12PM, Sunita Rao 4PM. Confirm with sales team.',              time: '3 days ago',   read: true,  action: { label: 'View Schedule', href: '/site-visits' } },
  { id: '15', type: 'payment', priority: 'high',   title: 'Payment Failed — Auto Retry',         description: 'EMI deduction failed for Prakash Verma (Plot #D-22). Manual follow-up required.',                   time: '4 days ago',   read: true  },
];

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
  const cfg = TYPE_CONFIG[notif.type];
  return (
    <div
      className={`card p-4 flex items-start gap-4 transition-all ${notif.read ? 'opacity-70' : ''}`}
      style={{ borderLeft: notif.read ? undefined : `3px solid ${cfg.color}` }}
    >
      <div className={`p-2.5 rounded-xl flex-shrink-0 ${cfg.bg}`} style={{ color: cfg.color }}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-semibold ${notif.read ? '' : ''}`} style={{ color: 'var(--text-primary)' }}>
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
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filterType, setFilterType] = useState<NotifType | 'all'>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [search, setSearch] = useState('');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const toggleRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));

  const deleteNotif = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const filtered = notifications.filter((n) => {
    if (filterType !== 'all' && n.type !== filterType) return false;
    if (filterRead === 'unread' && n.read) return false;
    if (filterRead === 'read' && !n.read) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const typeGroups: NotifType[] = ['lead', 'visit', 'payment', 'booking', 'alert', 'system'];

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
            <h1 className="page-title flex items-center gap-2">
              Notifications Center
              {unreadCount > 0 && (
                <span className="badge badge-danger">{unreadCount} unread</span>
              )}
            </h1>
            <p className="page-subtitle">Stay updated with leads, visits, payments and system alerts</p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="btn btn-secondary btn-sm">
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {typeGroups.map((type) => {
            const cfg = TYPE_CONFIG[type];
            const count = notifications.filter((n) => n.type === type && !n.read).length;
            return (
              <button
                key={type}
                onClick={() => setFilterType(filterType === type ? 'all' : type)}
                className={`card p-3 text-center transition-all hover:shadow-md ${filterType === type ? 'ring-2' : ''}`}
                style={filterType === type ? { borderColor: cfg.color, outline: `2px solid ${cfg.color}`, outlineOffset: '-1px' } : {}}
              >
                <div className={`mx-auto mb-1.5 p-1.5 rounded-lg w-fit ${cfg.bg}`} style={{ color: cfg.color }}>
                  {cfg.icon}
                </div>
                <p className="text-xs font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{cfg.label}</p>
                {count > 0 && (
                  <span className="badge badge-danger mt-1" style={{ fontSize: '0.6rem' }}>{count} new</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="card p-4 flex items-center gap-3 flex-wrap">
          <div className="search-wrapper flex-1 min-w-[200px]">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search notifications..."
              className="input input-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="tabs">
            {(['all', 'unread', 'read'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setFilterRead(v)}
                className={`tab-item ${filterRead === v ? 'active' : ''}`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          {filterType !== 'all' && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setFilterType('all')}
            >
              <XCircle size={14} /> Clear filter
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="card">
              <div className="empty-state py-16">
                <div className="empty-state-icon">
                  <Bell size={28} style={{ color: 'var(--text-muted)' }} />
                </div>
                <p className="font-semibold mt-2" style={{ color: 'var(--text-secondary)' }}>No notifications found</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Try adjusting filters or check back later
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Showing {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
              </p>
              {filtered.map((notif) => (
                <NotificationCard
                  key={notif.id}
                  notif={notif}
                  onToggleRead={toggleRead}
                  onDelete={deleteNotif}
                />
              ))}
            </>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="card p-5">
          <h3 className="text-h3 mb-1 flex items-center gap-2">
            <Filter size={16} style={{ color: 'var(--gold)' }} /> Notification Preferences
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Choose which events trigger notifications
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'New lead registered',        icon: <Users size={14} />,      enabled: true  },
              { label: 'Site visit scheduled',        icon: <Calendar size={14} />,   enabled: true  },
              { label: 'Payment received',            icon: <DollarSign size={14} />, enabled: true  },
              { label: 'Booking confirmed',           icon: <Building2 size={14} />,  enabled: true  },
              { label: 'Follow-up reminders',         icon: <Bell size={14} />,       enabled: true  },
              { label: 'System reports',              icon: <Star size={14} />,        enabled: false },
            ].map((pref) => (
              <label
                key={pref.label}
                className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--gold)' }}>{pref.icon}</span>
                  {pref.label}
                </div>
                <div
                  className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${pref.enabled ? '' : 'bg-gray-200'}`}
                  style={{ background: pref.enabled ? 'var(--gold)' : undefined }}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${pref.enabled ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
