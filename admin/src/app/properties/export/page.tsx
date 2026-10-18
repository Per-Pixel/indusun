'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, ChevronDown, RefreshCw } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import ExportDropdown from '@/components/ui/ExportDropdown';
import toast from 'react-hot-toast';

interface ExportRow {
  title: string;
  client: string;
  society: string;
  plotNo: string;
  size: string;
  plotAmount: string;
  paidAmount: string;
  emi: string;
  status: string;
  regNo: string;
  broker: string;
  dateAdded: string;
}

const PROPERTY_COLUMNS = [
  { header: 'Property',       key: 'title' },
  { header: 'Client',         key: 'client' },
  { header: 'Society',        key: 'society' },
  { header: 'Plot No',        key: 'plotNo' },
  { header: 'Plot Size',      key: 'size' },
  { header: 'Plot Amount',    key: 'plotAmount' },
  { header: 'Paid Amount',    key: 'paidAmount' },
  { header: 'EMI',            key: 'emi' },
  { header: 'Status',         key: 'status' },
  { header: 'Reg/R. No.',     key: 'regNo' },
  { header: 'Broker',         key: 'broker' },
  { header: 'Form Date',      key: 'dateAdded' },
];

function toIsoDate(val: string | undefined): string | null {
  if (!val) return null;
  const s = val.trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  return null;
}

export default function PropertiesExportPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ExportRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [societies, setSocieties] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [societyFilter, setSocietyFilter] = useState('');
  const [includeOptions, setIncludeOptions] = useState({
    active: true,
    cancelled: false,
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', pageSize: '500' });
      if (societyFilter) params.set('society', societyFilter);
      const res = await fetch(`/api/properties?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch properties');
      const json = await res.json();
      const mapped: ExportRow[] = (json.data || []).map((p: any) => ({
        title: p.title || '',
        client: p._clientName || '',
        society: p.targetedLocation || '',
        plotNo: p._plotNo || '',
        size: p.squareFootage || '',
        plotAmount: p.price || '',
        paidAmount: p._paidAmount && p._paidAmount !== '—' ? `₹${p._paidAmount}` : '',
        emi: p._emiAmount && p._emiAmount !== '—' ? `₹${p._emiAmount}` : '',
        status: p.status === 'Unlisted' ? 'Cancelled' : 'Active',
        regNo: p._rNo || '',
        broker: p.listedBy?.name || '',
        dateAdded: p.dateAdded || '',
      }));
      setRows(mapped);
      setTotalCount(json.count ?? mapped.length);
    } catch (err: any) {
      console.error('Export fetch error:', err);
      toast.error(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, [societyFilter]);

  const fetchSocieties = useCallback(async () => {
    try {
      const res = await fetch('/api/master-data/societies');
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json)) setSocieties(json);
      else if (Array.isArray(json.societies)) setSocieties(json.societies);
    } catch { /* optional */ }
  }, []);

  useEffect(() => {
    fetchSocieties();
  }, [fetchSocieties]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filteredRows = rows.filter((r) => {
    if (!includeOptions.active && r.status === 'Active') return false;
    if (!includeOptions.cancelled && r.status === 'Cancelled') return false;

    const iso = toIsoDate(r.dateAdded);
    if (dateRange !== 'all' && iso) {
      const d = new Date(iso);
      const now = new Date();
      let start: Date | null = null;
      let end: Date | null = null;
      if (dateRange === 'last7days') start = new Date(now.getTime() - 7 * 86400000);
      else if (dateRange === 'last30days') start = new Date(now.getTime() - 30 * 86400000);
      else if (dateRange === 'last90days') start = new Date(now.getTime() - 90 * 86400000);
      else if (dateRange === 'thisMonth') start = new Date(now.getFullYear(), now.getMonth(), 1);
      else if (dateRange === 'lastMonth') {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
      } else if (dateRange === 'thisYear') start = new Date(now.getFullYear(), 0, 1);
      else if (dateRange === 'lastYear') {
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
      } else if (dateRange === 'custom') {
        if (customStart) start = new Date(customStart);
        if (customEnd) end = new Date(customEnd);
      }
      if (start && d < start) return false;
      if (end && d > end) return false;
    } else if (dateRange !== 'all' && !iso) {
      return false;
    }
    return true;
  });

  const filenameSuffix = dateRange === 'all' ? 'all' : dateRange.replace(/([A-Z])/g, '-$1').toLowerCase();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[260px]' : 'ml-0'}`}>
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6 overflow-y-auto h-[calc(100vh-64px)]">
          <div className="max-w-3xl mx-auto">
            {/* Back + Title */}
            <div className="mb-6">
              <button
                onClick={() => router.push('/properties')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeft size={16} className="mr-1" />
                <span>Back to Properties</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Export Properties Data</h1>
              <p className="text-gray-500 mt-1">
                Live export from <code>Master Data Of Gurukrupa</code> — {totalCount.toLocaleString('en-IN')} records (exports up to 500 per batch).
              </p>
            </div>

            {/* Export Form */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 space-y-6">

                {/* Society Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Society</label>
                  <div className="relative w-full sm:w-96">
                    <select
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-10 text-gray-700"
                      value={societyFilter}
                      onChange={(e) => setSocietyFilter(e.target.value)}
                    >
                      <option value="">All Societies</option>
                      {societies.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Form Date Range
                  </label>
                  <div className="relative w-full sm:w-72">
                    <select
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-10 text-gray-700"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                    >
                      <option value="all">All Dates</option>
                      <option value="last7days">Last 7 Days</option>
                      <option value="last30days">Last 30 Days</option>
                      <option value="last90days">Last 90 Days</option>
                      <option value="thisMonth">This Month</option>
                      <option value="lastMonth">Last Month</option>
                      <option value="thisYear">This Year</option>
                      <option value="lastYear">Last Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDown size={16} />
                    </div>
                  </div>

                  {dateRange === 'custom' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Include Status Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Include Record Status
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeOptions.active}
                        onChange={() => setIncludeOptions({ ...includeOptions, active: !includeOptions.active })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Active / Listed Properties</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeOptions.cancelled}
                        onChange={() => setIncludeOptions({ ...includeOptions, cancelled: !includeOptions.cancelled })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Cancelled / Unlisted Properties</span>
                    </label>
                  </div>
                </div>

                {/* Export Action */}
                <div className="pt-2 border-t border-gray-100 flex items-center gap-4 flex-wrap">
                  <ExportDropdown
                    label="Export Properties"
                    filename={`gurukrupa-properties-${filenameSuffix}`}
                    columns={PROPERTY_COLUMNS}
                    rows={filteredRows}
                    disabled={loading || filteredRows.length === 0}
                  />
                  <button
                    onClick={fetchProperties}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                  </button>
                  <p className="text-xs text-gray-400">
                    {loading ? 'Loading…' : `${filteredRows.length.toLocaleString('en-IN')} of ${rows.length.toLocaleString('en-IN')} rows selected`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
