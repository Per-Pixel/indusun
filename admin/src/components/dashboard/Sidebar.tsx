'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Database,
  Users,
  UserCheck,
  Calendar,
  BookOpen,
  Building2,
  Image as ImageIcon,
  Globe,
  Bell,
  BarChart3,
  Activity,
  Settings,
  ChevronDown,
  TrendingUp,
  DollarSign,
  MessageSquare,
  Layers,
  ClipboardList,
  Lock,
  UploadCloud,
  Briefcase,
  Shield,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { isBillingDesk } from '@/lib/staffNav';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar?: () => void;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  badge?: number;
  permission?: string;
  children?: { label: string; path: string }[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Main',
    items: [
      { icon: <LayoutDashboard size={17} />, label: 'Dashboard', path: '/dashboard' },
      { icon: <Database size={17} />, label: 'Master Data', path: '/master-data', permission: 'property_management' },
      { icon: <UploadCloud size={17} />, label: 'Excel Import', path: '/data-import', permission: 'property_management' },
    ],
  },
  {
    title: 'CRM',
    items: [
      { icon: <Users size={17} />, label: 'Lead Management', path: '/leads', permission: 'lead_management' },
      { icon: <Calendar size={17} />, label: 'Site Visits', path: '/site-visits', permission: 'booking_management' },
      { icon: <BookOpen size={17} />, label: 'Bookings', path: '/bookings', permission: 'booking_management' },
      { icon: <UserCheck size={17} />, label: 'Customer Profiles', path: '/customers', permission: 'lead_management' },
      { icon: <Briefcase size={17} />, label: 'Brokers & Codes', path: '/brokers', permission: 'broker_management' },
    ],
  },
  {
    title: 'Properties',
    items: [
      { icon: <Layers size={17} />, label: 'Projects', path: '/projects', permission: 'property_management' },
      { icon: <Building2 size={17} />, label: 'Properties', path: '/properties', permission: 'property_management' },
      { icon: <ImageIcon size={17} />, label: 'Media Library', path: '/media-library', permission: 'cms_management' },
    ],
  },
  {
    title: 'Sales',
    items: [
      { icon: <TrendingUp size={17} />, label: 'Sales Overview', path: '/sales', permission: 'financial_reports' },
      {
        icon: <DollarSign size={17} />, label: 'Billing & Invoices', path: '/billing', permission: 'billing_management',
        children: [
          { label: 'Billing', path: '/billing' },
          { label: 'Invoices', path: '/invoices' },
        ],
      },
    ],
  },
  {
    title: 'Communications',
    items: [
      { icon: <Bell size={17} />, label: 'Notifications', path: '/notifications' },
      { icon: <MessageSquare size={17} />, label: 'Messages', path: '/messages', permission: 'messaging' },
      { icon: <Lock size={17} />, label: 'Internal Comms', path: '/internal-comms', permission: 'internal_comms' },
    ],
  },
  {
    title: 'CMS',
    items: [
      { icon: <Globe size={17} />, label: 'Website CMS', path: '/website-cms', permission: 'cms_management' },
    ],
  },
  {
    title: 'System',
    items: [
      { icon: <BarChart3 size={17} />, label: 'Reports & Analytics', path: '/reports', permission: 'financial_reports' },
      { icon: <Activity size={17} />, label: 'Activity Logs', path: '/activity-logs', permission: 'audit_logs' },
      { icon: <ClipboardList size={17} />, label: 'Admin Users', path: '/admin-users', permission: 'user_management' },
      { icon: <Shield size={17} />, label: 'Roles', path: '/roles', permission: 'role_management' },
      { icon: <Settings size={17} />, label: 'Settings', path: '/settings' },
    ],
  },
  {
    title: 'Help & Docs',
    items: [
      { icon: <BookOpen size={17} />, label: 'Docs', path: '/guide' },
    ],
  },
];

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, hasPermission } = useAdminAuth();
  const billingDesk = isBillingDesk(user);

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (billingDesk && item.path === '/dashboard') return false;
      if (isLoading || !user || !item.permission) return true;
      return hasPermission(item.permission);
    }),
  })).filter((section) => section.items.length > 0);

  // Track which sections with children are expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          const isActive = item.children.some((c) => pathname.startsWith(c.path))
            || (item.path && pathname.startsWith(item.path));
          init[item.label] = !!isActive;
        }
      });
    });
    return init;
  });

  const toggleExpand = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const navigate = (path: string) => {
    if (closeSidebar && window.innerWidth < 1024) closeSidebar();
    router.push(path);
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname === path || pathname.startsWith(path + '/');
  };

  const isParentActive = (item: NavItem): boolean => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) return item.children.some((c) => isActive(c.path));
    return false;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar sidebar-scroll ${isOpen ? '' : 'hidden lg:flex'} flex-col`}
        style={{ transform: isOpen ? 'translateX(0)' : undefined }}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden">
            <Image
              src="/indusun-logo.png"
              alt="Indusun"
              width={40}
              height={40}
              className="object-contain w-full h-full"
            />
          </div>
          <div className="overflow-hidden">
            <p className="font-extrabold text-base leading-tight tracking-wide" style={{ color: '#0F172A' }}>INDUSUN</p>
            <p className="text-xs font-medium" style={{ color: '#334155', letterSpacing: '0.08em' }}>
              Real Estate CRM
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>
          {visibleSections.map((section) => (
            <div key={section.title}>
              <div className="sidebar-section-label">{section.title}</div>
              {section.items.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const parentActive = isParentActive(item);
                const isExpanded = expanded[item.label];

                return (
                  <div key={item.label}>
                    {hasChildren ? (
                      <div
                        className={`sidebar-item ${parentActive ? 'font-semibold' : ''}`}
                        onClick={() => toggleExpand(item.label)}
                      >
                        <span className="item-icon">{item.icon}</span>
                        <span className="item-label">{item.label}</span>
                        {item.badge && (
                          <span className="item-badge">{item.badge}</span>
                        )}
                        <ChevronDown
                          size={15}
                          style={{
                            transition: 'transform 0.2s',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            color: '#475569',
                            flexShrink: 0,
                          }}
                        />
                      </div>
                    ) : (
                      <Link
                        href={item.path || '/dashboard'}
                        prefetch={true}
                        onClick={() => {
                          if (closeSidebar && typeof window !== 'undefined' && window.innerWidth < 1024) {
                            closeSidebar();
                          }
                        }}
                        className={`sidebar-item ${parentActive ? 'active' : ''}`}
                      >
                        <span className="item-icon">{item.icon}</span>
                        <span className="item-label">{item.label}</span>
                        {item.badge && (
                          <span className="item-badge">{item.badge}</span>
                        )}
                      </Link>
                    )}

                    {/* Sub-menu */}
                    {hasChildren && (
                      <div
                        className="sidebar-submenu"
                        style={{
                          maxHeight: isExpanded ? `${item.children!.length * 44}px` : '0px',
                        }}
                      >
                        {item.children!.map((child) => (
                          <Link
                            key={child.path}
                            href={child.path}
                            prefetch={true}
                            onClick={() => {
                              if (closeSidebar && typeof window !== 'undefined' && window.innerWidth < 1024) {
                                closeSidebar();
                              }
                            }}
                            className={`sidebar-item ${isActive(child.path) ? 'active' : ''}`}
                          >
                            <span className="item-label">{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

      </aside>
    </>
  );
};

export default Sidebar;
