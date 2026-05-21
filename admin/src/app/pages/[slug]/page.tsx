'use client';

import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import PageEditor from '@/components/cms/PageEditor';
import { getPageDef } from '@/lib/cms-schema';

export default function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const def = getPageDef(slug);
  if (!def) notFound();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        <AdminTopNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-6 max-w-5xl mx-auto">
          <PageEditor page={def} />
        </main>
      </div>
    </div>
  );
}
