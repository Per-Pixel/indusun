'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu, Search, Bell, User, Settings, LogOut, ChevronDown,
  Activity, Shield, Crown, X, Home, Building2, Users, Calendar,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface AdminTopNavbarProps {
  toggleSidebar: () => void;
}

const QUICK_LINKS = [
  { icon: <Home size={14} />, label: 'Dashboard', path: '/dashboard' },
  { icon: <Users size={14} />, label: 'Leads', path: '/leads' },
  { icon: <Building2 size={14} />, label: 'Properties', path: '/properties' },
  { icon: <Calendar size={14} />, label: 'Site Visits', path: '/site-visits' },
];

const AdminTopNavbar: React.FC<AdminTopNavbarProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAdminAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (user?.name || 'IU').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/master-data?search=${encodeURIComponent(searchTerm)}`);
      setSearchOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <>
      {/* Main Topbar */}
      <header className="topbar">
        {/* Left: Menu toggle + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="btn btn-ghost btn-icon"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
            style={{ minWidth: '220px' }}
          >
            <Search size={15} />
            <span>Search anything...</span>
            <span className="ml-auto text-xs bg-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-mono">⌘K</span>
          </button>
        </div>

        {/* Right: Quick links + Actions */}
        <div className="flex items-center gap-1">
          {/* Quick nav pills — desktop only */}
          <div className="hidden xl:flex items-center gap-1 mr-3">
            {QUICK_LINKS.map((link) => (
              <button
                key={link.path}
                onClick={() => router.push(link.path)}
                className="btn btn-ghost btn-sm flex items-center gap-1.5 text-gray-500 hover:text-gray-800"
              >
                {link.icon}
                <span className="text-xs font-medium">{link.label}</span>
              </button>
            ))}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn btn-ghost btn-icon relative"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span
                className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
                style={{ background: 'var(--danger)' }}
              />
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl bg-white border z-50 overflow-hidden"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h4>
                  <button
                    onClick={() => { setShowNotifications(false); router.push('/notifications'); }}
                    className="text-xs font-medium"
                    style={{ color: 'var(--gold)' }}
                  >
                    View all
                  </button>
                </div>
                <div className="py-2">
                  {[
                    { title: 'New lead registered', desc: 'Rahul Sharma — Website inquiry', time: '5 min ago', dot: 'var(--gold)' },
                    { title: 'Site visit scheduled', desc: 'Priya Mehta — Gurukrupa Heights', time: '1 hour ago', dot: 'var(--success)' },
                    { title: 'Payment received', desc: '₹5.5L from Vikram Patel', time: '3 hours ago', dot: 'var(--info)' },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors">
                      <span className="mt-1.5 h-2 w-2 rounded-full flex-shrink-0" style={{ background: n.dot }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.desc}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-disabled)' }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t text-center" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => router.push('/notifications')}
                    className="text-xs font-medium"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    See all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative ml-1" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div
                className="avatar avatar-sm font-bold text-sm"
                style={{ background: 'var(--gold-muted)', color: 'var(--gold-dark)', border: '2px solid var(--gold-border)' }}
              >
                {initials}
              </div>
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {user?.name || 'Admin User'}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} className={`hidden md:block transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {showProfileMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl bg-white border z-50 overflow-hidden"
                style={{ borderColor: 'var(--border)' }}
              >
                {/* Profile Header */}
                <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="avatar avatar-lg font-bold"
                      style={{ background: 'var(--gold-muted)', color: 'var(--gold-dark)', border: '2px solid var(--gold-border)' }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Admin User'}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email || 'admin@indusun.com'}</p>
                      <span
                        className="badge badge-gold mt-1"
                        style={{ fontSize: '0.6rem' }}
                      >
                        {user?.role === 'super_admin' ? <Crown size={9} /> : <Shield size={9} />}
                        {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {[
                    { icon: <User size={15} />, label: 'My Profile', path: '/profile' },
                    { icon: <Settings size={15} />, label: 'Settings', path: '/settings' },
                    { icon: <Activity size={15} />, label: 'Activity Log', path: '/activity-logs' },
                  ].map((item) => (
                    <button
                      key={item.path}
                      onClick={() => { setShowProfileMenu(false); router.push(item.path); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span style={{ color: 'var(--text-muted)' }}>{item.icon}</span>
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="px-3 pb-3 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => { setShowProfileMenu(false); logout(); }}
                    className="btn btn-danger w-full"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="modal-overlay" onClick={() => setSearchOpen(false)}>
          <div
            className="modal-box modal-md"
            style={{ maxHeight: '60vh', padding: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search clients, properties, societies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-base outline-none"
                style={{ color: 'var(--text-primary)' }}
                autoFocus
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="btn btn-ghost btn-icon btn-sm">
                <X size={16} />
              </button>
            </form>
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Quick navigate</p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_LINKS.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => { router.push(link.path); setSearchOpen(false); }}
                    className="flex items-center gap-2 p-3 rounded-lg text-sm hover:bg-gray-50 border transition-colors text-left"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    {link.icon}
                    {link.label}
                  </button>
                ))}
              </div>
              {searchTerm && (
                <button
                  type="submit"
                  form="search-form"
                  onClick={handleSearch as unknown as React.MouseEventHandler}
                  className="btn btn-primary w-full mt-3"
                >
                  <Search size={15} />
                  Search for &ldquo;{searchTerm}&rdquo;
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminTopNavbar;
