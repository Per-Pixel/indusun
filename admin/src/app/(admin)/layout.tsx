'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAdminAuth();
  const pathname = usePathname();
  
  // Don't show navbar on login page
  const isLoginPage = pathname === '/admin/auth/login';
  
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user && !isLoginPage) {
    // This should not happen due to middleware, but just in case
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <main className="py-6">
        {children}
      </main>
    </div>
  );
}
