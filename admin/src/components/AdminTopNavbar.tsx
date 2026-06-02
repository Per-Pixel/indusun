'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  CreditCard,
  Activity,
  Lock,
  HelpCircle,
  ExternalLink,
  Shield,
  Crown
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface AdminTopNavbarProps {
  toggleSidebar: () => void;
}

const AdminTopNavbar: React.FC<AdminTopNavbarProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAdminAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: 'New sale completed',
      description: 'Amount: ₹1.5 Cr',
      time: '2 hours ago',
      type: 'sale'
    },
    {
      id: 2,
      title: 'New user registered',
      description: 'Vikram Singh joined as a client',
      time: '3 hours ago',
      type: 'user'
    },
    {
      id: 3,
      title: 'New broker application',
      description: 'Neha Gupta applied to be a broker',
      time: '5 hours ago',
      type: 'broker'
    },
    {
      id: 4,
      title: 'Payment received',
      description: 'Amount: ₹85 Lakhs',
      time: '1 day ago',
      type: 'payment'
    }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Bell className="h-4 w-4 text-blue-500" />
        </div>;
      case 'user':
        return <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
          <User className="h-4 w-4 text-green-500" />
        </div>;
      case 'broker':
        return <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
          <User className="h-4 w-4 text-purple-500" />
        </div>;
      case 'payment':
        return <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
          <Bell className="h-4 w-4 text-yellow-500" />
        </div>;
      default:
        return <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Bell className="h-4 w-4 text-gray-500" />
        </div>;
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      {/* Left side - Menu toggle and search */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
        >
          <Menu size={20} />
        </button>

        <div className="ml-4 relative">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-dark focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="ml-2 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Notifications and profile */}
      <div className="flex items-center">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none relative"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {showNotifications && (
            <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-2">
                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  <button className="text-xs text-blue-600 hover:text-blue-800">
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                      <div className="flex items-start">
                        {getNotificationIcon(notification.type)}
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500">{notification.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-100">
                  <button
                    onClick={() => router.push('/notifications')}
                    className="text-sm text-center w-full text-blue-600 hover:text-blue-800"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="relative ml-3" ref={profileMenuRef}>
          {/* Trigger Button */}
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none group"
          >
            {/* Avatar circle with initials */}
            <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white text-sm font-bold leading-none select-none">
                {(user?.name || 'AU').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white"></span>
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">{user?.name || 'Admin User'}</span>
              <span className="text-[11px] text-gray-500 capitalize">{user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
            </div>
            <ChevronDown
              size={15}
              className={`hidden md:block text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Rich Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl bg-white ring-1 ring-black/10 z-50 overflow-hidden">

              {/* ── Header: dark navy ── */}
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 px-5 pt-5 pb-4">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="relative mb-3">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl font-bold select-none">
                        {(user?.name || 'AU').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-slate-800"></span>
                  </div>
                  {/* Name */}
                  <p className="text-white font-bold text-base leading-tight">{user?.name || 'Admin User'}</p>
                  {/* Email */}
                  <p className="text-slate-400 text-xs mt-0.5">{user?.email || 'admin@indusun.com'}</p>
                  {/* Role badge */}
                  <span className={`mt-2 inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold ${
                    user?.role === 'super_admin'
                      ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-400/30'
                      : 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30'
                  }`}>
                    {user?.role === 'super_admin' ? <Crown size={11} /> : <Shield size={11} />}
                    {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </div>

                {/* Stats row */}
                <div className="mt-4 grid grid-cols-3 divide-x divide-slate-700 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="flex flex-col items-center py-2.5">
                    <span className="text-white font-bold text-sm">—</span>
                    <span className="text-slate-400 text-[10px] mt-0.5">Properties</span>
                  </div>
                  <div className="flex flex-col items-center py-2.5">
                    <span className="text-white font-bold text-sm">—</span>
                    <span className="text-slate-400 text-[10px] mt-0.5">Clients</span>
                  </div>
                  <div className="flex flex-col items-center py-2.5">
                    <span className="text-white font-bold text-sm">—</span>
                    <span className="text-slate-400 text-[10px] mt-0.5">Revenue</span>
                  </div>
                </div>
              </div>

              {/* ── Menu Items ── */}
              <div className="py-1.5 bg-white">
                {[
                  {
                    icon: <User size={16} className="text-slate-500" />,
                    iconBg: 'bg-slate-100',
                    label: 'My Profile',
                    sub: 'View & edit profile',
                    path: '/profile',
                  },
                  {
                    icon: <Settings size={16} className="text-blue-500" />,
                    iconBg: 'bg-blue-50',
                    label: 'Account Settings',
                    sub: 'Preferences & config',
                    path: '/settings',
                  },
                  {
                    icon: <CreditCard size={16} className="text-amber-500" />,
                    iconBg: 'bg-amber-50',
                    label: 'Billing & Plans',
                    sub: 'Subscription & invoices',
                    path: '/billing',
                  },
                  {
                    icon: <Activity size={16} className="text-cyan-500" />,
                    iconBg: 'bg-cyan-50',
                    label: 'Activity Log',
                    sub: 'Recent actions',
                    path: '/activity',
                  },
                  {
                    icon: <Lock size={16} className="text-violet-500" />,
                    iconBg: 'bg-violet-50',
                    label: 'Privacy & Security',
                    sub: '2FA & passwords',
                    path: '/security',
                  },
                ].map((item) => (
                  <button
                    key={item.path}
                    onClick={() => { setShowProfileMenu(false); router.push(item.path); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left group/item"
                  >
                    <div className={`h-8 w-8 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 leading-tight">{item.label}</p>
                      <p className="text-xs text-gray-400 leading-tight mt-0.5">{item.sub}</p>
                    </div>
                  </button>
                ))}

                {/* Divider */}
                <div className="my-1 border-t border-gray-100" />

                {/* Help Center */}
                <button
                  onClick={() => { setShowProfileMenu(false); window.open('/help', '_blank'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <HelpCircle size={16} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Help Center</p>
                  </div>
                  <ExternalLink size={13} className="text-gray-400 flex-shrink-0" />
                </button>
              </div>

              {/* ── Sign Out ── */}
              <div className="px-3 pb-3 pt-1 bg-white border-t border-gray-100">
                <button
                  onClick={() => { setShowProfileMenu(false); logout(); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm transition-colors"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTopNavbar;
