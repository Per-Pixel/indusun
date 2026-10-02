'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
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
  const router = useRouter();

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;
    const debouncedRefresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        router.refresh();
      }, 300);
    };

    const supabase = createClient();
    const tables = ['Master Data Of Gurukrupa', 'clients', 'messages', 'bills', 'admin_users', 'page_content', 'internal_messages', 'internal_message_reads'];
    const channels = tables.map((table) =>
      supabase
        .channel(`crm-${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, debouncedRefresh)
        .subscribe()
    );

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      channels.forEach((channel) => { void supabase.removeChannel(channel); });
    };
  }, [router]);

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
