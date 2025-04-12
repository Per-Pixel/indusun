'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  MessageSquare,
  CreditCard,
  User,
  Settings
} from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = ({ href, icon, label, isActive }: NavItemProps) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-green-800 text-white'
          : 'text-white hover:bg-green-800/70'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard',
    },
    {
      href: '/invoices',
      icon: <FileText size={20} />,
      label: 'Invoices',
    },
    {
      href: '/receipts',
      icon: <Receipt size={20} />,
      label: 'Receipts',
    },
    {
      href: '/chat',
      icon: <MessageSquare size={20} />,
      label: 'Chat',
    },
    {
      href: '/payments',
      icon: <CreditCard size={20} />,
      label: 'Payments',
    },
  ];

  const bottomNavItems = [
    {
      href: '/profile',
      icon: <User size={20} />,
      label: 'Profile',
    },
    {
      href: '/settings',
      icon: <Settings size={20} />,
      label: 'Settings',
    },
  ];

  return (
    <aside className="text-white h-screen w-64 flex flex-col fixed left-0 top-0" style={{ backgroundColor: '#083830' }}>
      {/* Logo */}
      <div className="p-4 border-b border-green-800">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/navbar/logo.svg"
            alt="Indusun Logo"
            width={32}
            height={32}
          />
          <span className="text-xl font-bold">Indusun</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
            />
          ))}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-green-800">
        <div className="space-y-1">
          {bottomNavItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
