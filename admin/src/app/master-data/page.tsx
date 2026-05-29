'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MasterDataOfGurukrupa } from '@/types/masterData';
import DataTable from '@/components/ui/DataTable';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import ExportDropdown from '@/components/ui/ExportDropdown';
import {
  Database,
  Users,
  Building2,
  FileText,
  TrendingUp,
  RefreshCw,
  Copy,
  X,
  Search,
  Star,
  CheckCircle2,
  AlertCircle,
  Hash,
} from 'lucide-react';

/* ─── Stat Card ─────────────────────────────────────────────────────────── */
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  badge?: string;
}

const StatCard = ({ title, value, icon, gradient, badge }: StatCardProps) => (
  <div
    className={`relative overflow-hidden rounded-xl p-5 shadow-sm border border-white/60 ${gradient}`}
  >
    {/* decorative circle */}
    <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10" />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70 mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {badge && (
          <span className="mt-2 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white">
            {badge}
          </span>
        )}
      </div>
      <div className="rounded-xl bg-white/20 p-2.5">{icon}</div>
    </div>
  </div>
);

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function MasterDataPage() {
  /* ── layout ─────────────────────────────── */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ── data ───────────────────────────────── */
  const [data, setData] = useState<MasterDataOfGurukrupa[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [societies, setSocieties] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  /* ── filters ────────────────────────────── */
  const [searchInput, setSearchInput] = useState('');          // raw input
  const [clientNameFilter, setClientNameFilter] = useState(''); // debounced
  const [societyFilter, setSocietyFilter] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pageSize = 50;

  /* ── debounce search ─────────────────────── */
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setClientNameFilter(val);
      setCurrentPage(1);
    }, 400);
  };

  const clearSearch = () => {
    setSearchInput('');
    setClientNameFilter('');
    setCurrentPage(1);
  };

  /* ── fetch societies ─────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/master-data/societies');
        if (!res.ok) throw new Error('Failed to fetch societies');
        const json = await res.json();
        setSocieties(json.societies || []);
      } catch (err) {
        console.error('Error fetching societies:', err);
      }
    })();
  }, []);

  /* ── fetch table data ────────────────────── */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: String(pageSize),
        clientNameFilter,
        societyFilter,
      });
      const res = await fetch(`/api/master-data?${params}`);
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to fetch data');
      }
      const json = await res.json();
      setData(json.data || []);
      setTotalCount(json.count || 0);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, clientNameFilter, societyFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── quick actions ───────────────────────── */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  /* ── export rows shape (for ExportDropdown) ─ */
  const exportColumns = [
    { header: 'ID',          key: 'id' },
    { header: 'Client Name', key: 'client_name' },
    { header: 'Society',     key: 'society_name' },
    { header: 'Plot No',     key: 'plot_no' },
    { header: 'Plot Size',   key: 'plot_size' },
    { header: 'Plot Amount', key: 'plot_amount' },
    { header: 'Paid Amount', key: 'paid_amount' },
    { header: 'Broker',      key: "broker's_name" },
    { header: 'Contact',     key: 'contact_no' },
  ];

  const handleCopy = async () => {
    if (data.length === 0) return;
    const text = data
      .map((r) => `${r.client_name ?? ''} | ${r.society_name ?? ''} | ${r.plot_no ?? ''} | ${r.plot_amount ?? ''}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('success');
    } catch {
      setCopyStatus('error');
    }
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  /* ── active filters count ────────────────── */
  const activeFilters = [
    clientNameFilter && `Client: "${clientNameFilter}"`,
    societyFilter && `Society: "${societyFilter}"`,
  ].filter(Boolean) as string[];

  /* ── stat values ─────────────────────────── */
  const totalPages = Math.ceil(totalCount / pageSize);
  const showingCount = Math.min(pageSize, totalCount - (currentPage - 1) * pageSize);

  /* ── error screen ────────────────────────── */
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
          <AdminTopNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-2xl">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h1 className="text-xl font-bold text-red-700">Error Loading Data</h1>
              </div>
              <p className="text-red-600 mb-4">{error.message}</p>
              <div className="bg-white rounded-lg p-4 text-sm mb-4">
                <p className="font-semibold text-gray-700 mb-2">Troubleshooting:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Make sure <code className="bg-gray-100 px-1 rounded">.env.local</code> has both Publishable Key AND Service Role Key</li>
                  <li>Get Service Role Key from: Supabase Dashboard → Project Settings → API</li>
                  <li>Check that the table &quot;Master Data Of Gurukrupa&quot; exists in Supabase</li>
                  <li>Restart the dev server after adding environment variables</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  <RefreshCw className="h-4 w-4" /> Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── main render ─────────────────────────── */
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      {/* Content area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[200px]' : 'ml-0'} flex flex-col`}>
        {/* Top Navbar */}
        <AdminTopNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Breadcrumb strip */}
        <div className="flex items-center gap-2 px-6 py-3 bg-white border-b border-gray-200 text-sm text-gray-500">
          <Star className="h-4 w-4" />
          <span>Admin</span>
          <span className="text-gray-300">/</span>
          <span className="font-medium text-gray-800 flex items-center gap-1.5">
            <Database className="h-4 w-4 text-blue-600" />
            Master Database
          </span>
        </div>

        {/* Page body */}
        <main className="flex-1 p-6 space-y-6">

          {/* ── Header + Quick Actions ────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Master Database — Gurukrupa</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Browse, search and export all master data records.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Export dropdown */}
              <ExportDropdown
                label="Export"
                filename={`master-data-page-${currentPage}`}
                disabled={data.length === 0}
                columns={exportColumns}
                rows={data.map((r) => ({ ...r, id: String(r.id) }))}
              />

              {/* Copy */}
              <button
                onClick={handleCopy}
                disabled={data.length === 0}
                title="Copy page data to clipboard"
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition ${
                  copyStatus === 'success'
                    ? 'border-green-400 bg-green-50 text-green-700'
                    : copyStatus === 'error'
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {copyStatus === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4 text-purple-600" />
                )}
                {copyStatus === 'success' ? 'Copied!' : copyStatus === 'error' ? 'Failed' : 'Copy'}
              </button>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                title="Refresh data"
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* ── Stat Cards ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              title="Total Records"
              value={totalCount.toLocaleString('en-IN')}
              icon={<Database className="h-5 w-5 text-white" />}
              gradient="bg-gradient-to-br from-blue-500 to-blue-700"
              badge="All time"
            />
            <StatCard
              title="This Page"
              value={showingCount}
              icon={<FileText className="h-5 w-5 text-white" />}
              gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
              badge={`Pg ${currentPage}`}
            />
            <StatCard
              title="Societies"
              value={societies.length}
              icon={<Building2 className="h-5 w-5 text-white" />}
              gradient="bg-gradient-to-br from-purple-500 to-purple-700"
            />
            <StatCard
              title="Total Pages"
              value={totalPages}
              icon={<Hash className="h-5 w-5 text-white" />}
              gradient="bg-gradient-to-br from-cyan-500 to-cyan-700"
              badge={`${pageSize} / page`}
            />
            <StatCard
              title="Active Filters"
              value={activeFilters.length}
              icon={<TrendingUp className="h-5 w-5 text-white" />}
              gradient={
                activeFilters.length > 0
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                  : 'bg-gradient-to-br from-gray-400 to-gray-600'
              }
              badge={activeFilters.length > 0 ? 'Filtered' : 'Unfiltered'}
            />
            <StatCard
              title="Shown Clients"
              value={data.filter((r) => r.client_name).length}
              icon={<Users className="h-5 w-5 text-white" />}
              gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
            />
          </div>

          {/* ── Search + Filter bar ───────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Debounced search */}
              <div className="flex-1 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="client-search"
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by client name…"
                  className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {searchInput && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Society select */}
              <div className="sm:w-64">
                <select
                  id="society-filter"
                  value={societyFilter}
                  onChange={(e) => { setSocietyFilter(e.target.value); setCurrentPage(1); }}
                  className="block w-full rounded-lg border border-gray-300 py-2.5 px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">All Societies</option>
                  {societies.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-medium text-gray-500">Active:</span>
                {clientNameFilter && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    Client: &quot;{clientNameFilter}&quot;
                    <button onClick={clearSearch} className="hover:text-blue-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {societyFilter && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                    Society: &quot;{societyFilter}&quot;
                    <button onClick={() => { setSocietyFilter(''); setCurrentPage(1); }} className="hover:text-purple-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => { clearSearch(); setSocietyFilter(''); setCurrentPage(1); }}
                  className="text-xs text-gray-400 hover:text-red-500 underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* ── Data Table ───────────────────────────────────────────── */}
          <DataTable
            data={data}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onClientNameFilter={(val) => { setClientNameFilter(val); setSearchInput(val); }}
            onSocietyFilter={(val) => { setSocietyFilter(val); }}
            clientNameFilter={clientNameFilter}
            societyFilter={societyFilter}
            societies={societies}
            isLoading={isLoading}
          />

          {/* ── Footer ───────────────────────────────────────────────── */}
          <p className="text-center text-xs text-gray-400">
            {clientNameFilter && `Searching for "${clientNameFilter}" · `}
            {societyFilter && `Filtered by society "${societyFilter}" · `}
            {!clientNameFilter && !societyFilter && 'Showing all records · '}
            Data fetched server-side with pagination.
          </p>
        </main>
      </div>
    </div>
  );
}
