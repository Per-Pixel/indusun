'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';

interface CRMLayoutProps {
  children: React.ReactNode;
}

/**
 * CRMLayout — shared layout used by all admin pages.
 * Renders the sidebar + top navbar + main content area.
 * No duplicate layout needed in individual page files.
 */
export default function CRMLayout({ children }: CRMLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="main-layout">
      <Sidebar
        isOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />

      <div
        className={`main-content ${sidebarOpen ? '' : 'collapsed'}`}
        style={{ marginLeft: sidebarOpen ? '260px' : '0px', transition: 'margin-left 0.3s ease' }}
      >
        <AdminTopNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main>{children}</main>
      </div>
    </div>
  );
}
