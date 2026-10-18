'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  ChevronDown,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import CRMLayout from '@/components/CRMLayout';

interface ExportRow {
  invoiceNumber: string;
  client: string;
  property: string;
  date: string | null;
  dueDate: string | null;
  amount: string;
  status: string;
  broker: string;
  source: 'Bill' | 'Record';
}

function rangeBounds(range: string, customStart: string, customEnd: string): [Date | null, Date | null] {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  switch (range) {
    case 'last7days': {
      const s = new Date(now); s.setDate(s.getDate() - 7);
      return [startOfDay(s), null];
    }
    case 'last30days': {
      const s = new Date(now); s.setDate(s.getDate() - 30);
      return [startOfDay(s), null];
    }
    case 'last90days': {
      const s = new Date(now); s.setDate(s.getDate() - 90);
      return [startOfDay(s), null];
    }
    case 'thisMonth':
      return [new Date(now.getFullYear(), now.getMonth(), 1), null];
    case 'lastMonth': {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      return [s, e];
    }
    case 'thisYear':
      return [new Date(now.getFullYear(), 0, 1), null];
    case 'lastYear': {
      const s = new Date(now.getFullYear() - 1, 0, 1);
      const e = new Date(now.getFullYear() - 1, 11, 31);
      return [s, e];
    }
    case 'custom':
      return [
        customStart ? new Date(customStart + 'T00:00:00') : null,
        customEnd ? new Date(customEnd + 'T23:59:59') : null,
      ];
    default:
      return [null, null];
  }
}

export default function InvoicesExportPage() {
  const router = useRouter();
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('last30days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [includeOptions, setIncludeOptions] = useState({
    paid: true,
    pending: true,
    overdue: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleCheckboxChange = (option: keyof typeof includeOptions) => {
    setIncludeOptions({
      ...includeOptions,
      [option]: !includeOptions[option],
    });
  };

  async function fetchAllInvoices(): Promise<ExportRow[]> {
    const rows: ExportRow[] = [];
    const limit = 500;
    let page = 1;
    // Page through the merged invoices API (bills + records)
    for (;;) {
      const res = await fetch(`/api/invoices?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to load invoices');
      const data = await res.json();
      for (const inv of data.invoices || []) {
        rows.push({
          invoiceNumber: inv.invoiceNumber,
          client: inv.client?.name || '',
          property: inv.property?.title || '',
          date: inv.date || null,
          dueDate: inv.dueDate || null,
          amount: inv.amount,
          status: inv.status,
          broker: inv.broker || '',
          source: String(inv.id).startsWith('b') ? 'Bill' : 'Record',
        });
      }
      const total = data.pagination?.totalPages || 1;
      if (page >= total) break;
      page += 1;
      if (page > 50) break; // safety cap
    }
    return rows;
  }

  function applyFilters(rows: ExportRow[]): ExportRow[] {
    const [start, end] = rangeBounds(dateRange, customStart, customEnd);
    const today = new Date();
    return rows.filter((r) => {
      // Status filter — "overdue" = pending bill past its due date
      const isOverdue = r.status === 'Pending' && r.dueDate && new Date(r.dueDate) < today && r.source === 'Bill';
      const statusOk =
        (r.status === 'Paid' && includeOptions.paid) ||
        (r.status === 'Pending' && (includeOptions.pending || (isOverdue && includeOptions.overdue)));
      if (!statusOk) return false;
      // Date filter — undated rows pass only when no range is applied
      if (start || end) {
        if (!r.date) return false;
        const d = new Date(r.date);
        if (isNaN(d.getTime())) return false;
        if (start && d < start) return false;
        if (end && d > end) return false;
      }
      return true;
    });
  }

  function downloadCSV(rows: ExportRow[]) {
    const headers = ['Invoice Number', 'Client', 'Property', 'Date', 'Amount', 'Status', 'Broker', 'Source'];
    const body = rows.map((r) => [
      r.invoiceNumber, r.client, r.property, r.date || '', r.amount, r.status, r.broker, r.source,
    ]);
    const csv = [headers, ...body]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadExcel(rows: ExportRow[]) {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(
      rows.map((r) => ({
        'Invoice Number': r.invoiceNumber,
        'Client': r.client,
        'Property': r.property,
        'Date': r.date || '',
        'Amount': r.amount,
        'Status': r.status,
        'Broker': r.broker,
        'Source': r.source,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
    XLSX.writeFile(wb, `invoices_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async function downloadPDF(rows: ExportRow[]) {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(13);
    doc.text('Invoices Export', 14, 15);
    doc.setFontSize(9);
    doc.text(`Exported: ${new Date().toLocaleString()} · ${rows.length} records`, 14, 22);
    autoTable(doc, {
      head: [['Invoice #', 'Client', 'Property', 'Date', 'Amount', 'Status', 'Broker', 'Source']],
      body: rows.map((r) => [
        r.invoiceNumber, r.client, r.property, r.date || '', r.amount, r.status, r.broker, r.source,
      ]),
      startY: 27,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
    });
    doc.save(`invoices_export_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const all = await fetchAllInvoices();
      const rows = applyFilters(all);
      if (rows.length === 0) {
        setExportError('No invoices match the selected filters.');
        return;
      }
      if (exportFormat === 'excel') await downloadExcel(rows);
      else if (exportFormat === 'pdf') await downloadPDF(rows);
      else downloadCSV(rows);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (e: any) {
      setExportError(e.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const formats = [
    { key: 'csv', label: 'CSV', desc: 'Comma-separated values file' },
    { key: 'excel', label: 'Excel', desc: 'Microsoft Excel .xlsx spreadsheet' },
    { key: 'pdf', label: 'PDF', desc: 'Portable Document Format' },
  ];

  return (
    <CRMLayout>
      <div className="page-container">
        <div className="max-w-3xl mx-auto">
          {/* Back Button and Title */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/invoices')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span>Back to Invoices</span>
            </button>
            <h1 className="page-title">Export Invoices</h1>
            <p className="page-subtitle">
              Export real invoice and bill records for reporting and record-keeping.
            </p>
          </div>

          {/* Export Form */}
          <div className="card p-6">
            {/* Export Format */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {formats.map((f) => (
                  <div
                    key={f.key}
                    className={`border rounded-lg p-4 cursor-pointer transition ${
                      exportFormat === f.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setExportFormat(f.key)}
                  >
                    <div className="flex items-center">
                      <FileText size={20} className={exportFormat === f.key ? 'text-blue-500' : 'text-gray-400'} />
                      <span className={`ml-2 font-medium ${exportFormat === f.key ? 'text-blue-700' : 'text-gray-700'}`}>
                        {f.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="relative">
                <select
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-10"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="last90days">Last 90 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisYear">This Year</option>
                  <option value="lastYear">Last Year</option>
                  <option value="all">All Time</option>
                  <option value="custom">Custom Range</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown size={16} />
                </div>
              </div>

              {dateRange === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Start Date
                    </label>
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
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      End Date
                    </label>
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

            {/* Include Options */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Include Invoice Status
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="paid"
                    checked={includeOptions.paid}
                    onChange={() => handleCheckboxChange('paid')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="paid" className="ml-2 block text-sm text-gray-700">
                    Paid Invoices
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pending"
                    checked={includeOptions.pending}
                    onChange={() => handleCheckboxChange('pending')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="pending" className="ml-2 block text-sm text-gray-700">
                    Pending Invoices
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="overdue"
                    checked={includeOptions.overdue}
                    onChange={() => handleCheckboxChange('overdue')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="overdue" className="ml-2 block text-sm text-gray-700">
                    Overdue Bills <span className="text-xs text-gray-400">(pending bills past due date)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Error */}
            {exportError && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle size={16} className="shrink-0" />
                {exportError}
              </div>
            )}

            {/* Export Button */}
            <div className="flex items-center">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className={`flex items-center px-4 py-2 rounded-lg text-white ${
                  isExporting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    <span>Export Invoices</span>
                  </>
                )}
              </button>

              {exportSuccess && (
                <div className="ml-4 flex items-center text-green-600">
                  <CheckCircle size={16} className="mr-1" />
                  <span>Export successful!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
