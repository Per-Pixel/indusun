'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  UserCog,
  Layers,
  ClipboardList,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar?: () => void;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  badge?: number;
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
      { icon: <Database size={17} />, label: 'Master Data', path: '/master-data' },
    ],
  },
  {
    title: 'CRM',
    items: [
      { icon: <Users size={17} />, label: 'Lead Management', path: '/leads' },
      { icon: <Calendar size={17} />, label: 'Site Visits', path: '/site-visits' },
      { icon: <BookOpen size={17} />, label: 'Bookings', path: '/bookings' },
      { icon: <UserCheck size={17} />, label: 'Customer Profiles', path: '/customers' },
    ],
  },
  {
    title: 'Properties',
    items: [
      { icon: <Layers size={17} />, label: 'Projects', path: '/projects' },
      { icon: <Building2 size={17} />, label: 'Properties', path: '/properties' },
      { icon: <ImageIcon size={17} />, label: 'Media Library', path: '/media-library' },
    ],
  },
  {
    title: 'Sales',
    items: [
      { icon: <TrendingUp size={17} />, label: 'Sales Overview', path: '/sales' },
      { icon: <UserCog size={17} />, label: 'Sales Team', path: '/sales-team' },
      {
        icon: <DollarSign size={17} />, label: 'Billing & Invoices', path: '/billing',
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
      { icon: <Bell size={17} />, label: 'Notifications', path: '/notifications', badge: 3 },
      { icon: <MessageSquare size={17} />, label: 'Messages', path: '/messages' },
    ],
  },
  {
    title: 'CMS',
    items: [
      { icon: <Globe size={17} />, label: 'Website CMS', path: '/website-cms' },
    ],
  },
  {
    title: 'System',
    items: [
      { icon: <BarChart3 size={17} />, label: 'Reports & Analytics', path: '/reports' },
      { icon: <Activity size={17} />, label: 'Activity Logs', path: '/activity-logs' },
      { icon: <ClipboardList size={17} />, label: 'Admin Users', path: '/admin-users' },
      { icon: <Settings size={17} />, label: 'Settings', path: '/settings' },
    ],
  },
];

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

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
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="sidebar-section-label">{section.title}</div>
              {section.items.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const parentActive = isParentActive(item);
                const isExpanded = expanded[item.label];

                return (
                  <div key={item.label}>
                    <div
                      className={`sidebar-item ${parentActive && !hasChildren ? 'active' : ''} ${parentActive && hasChildren ? 'font-semibold' : ''}`}
                      onClick={() => {
                        if (hasChildren) {
                          toggleExpand(item.label);
                        } else if (item.path) {
                          navigate(item.path);
                        }
                      }}
                    >
                      <span className="item-icon">{item.icon}</span>
                      <span className="item-label">{item.label}</span>
                      {item.badge && (
                        <span className="item-badge">{item.badge}</span>
                      )}
                      {hasChildren && (
                        <ChevronDown
                          size={15}
                          style={{
                            transition: 'transform 0.2s',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            color: '#475569',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>

                    {/* Sub-menu */}
                    {hasChildren && (
                      <div
                        className="sidebar-submenu"
                        style={{
                          maxHeight: isExpanded ? `${item.children!.length * 44}px` : '0px',
                        }}
                      >
                        {item.children!.map((child) => (
                          <div
                            key={child.path}
                            className={`sidebar-item ${isActive(child.path) ? 'active' : ''}`}
                            onClick={() => navigate(child.path)}
                          >
                            <span className="item-label">{child.label}</span>
                          </div>
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
