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
  X
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

        {/* Profile dropdown */}
        <div className="relative ml-3" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:bg-gray-50 p-1 rounded-lg transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={16} className="text-gray-600" />
              )}
            </div>
            <div className="ml-2 hidden md:block">
              <div className="flex items-center space-x-2">
                <span className="text-gray-700 font-medium">{user?.name || 'Admin User'}</span>
                {user?.role === 'super_admin' && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    Super Admin
                  </span>
                )}
                {user?.role === 'admin' && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {user?.department || 'Administration'}
              </div>
            </div>
            <ChevronDown size={16} className="ml-1 text-gray-500 hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {user?.profile_picture ? (
                        <img
                          src={user.profile_picture}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User size={20} className="text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user?.name || 'Admin User'}</div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        {user?.role === 'super_admin' && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                            Super Admin
                          </span>
                        )}
                        {user?.role === 'admin' && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            Admin
                          </span>
                        )}
                        {user?.department && (
                          <span className="text-xs text-gray-500">
                            {user.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push('/profile');
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <User size={16} className="mr-2 text-gray-500" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push('/settings');
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Settings size={16} className="mr-2 text-gray-500" />
                  Settings
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100 w-full text-left"
                >
                  <LogOut size={16} className="mr-2 text-red-500" />
                  Logout
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
