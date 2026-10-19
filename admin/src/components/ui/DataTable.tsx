'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { MasterDataOfGurukrupa } from '@/types/masterData';

function formatCommaINR(val: string | number | null | undefined): string {
  if (val == null || val === '') return '-';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(num) || num === 0) return String(val).trim() || '-';
  return `₹${num.toLocaleString('en-IN')}`;
}

interface DataTableProps {
  data: MasterDataOfGurukrupa[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onClientNameFilter: (value: string) => void;
  onSocietyFilter: (value: string) => void;
  clientNameFilter: string;
  societyFilter: string;
  societies: string[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function DataTable({
  data,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onClientNameFilter,
  onSocietyFilter,
  clientNameFilter,
  societyFilter,
  societies,
  isLoading = false,
  onRefresh,
}: DataTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Edit modal state
  const [editingRecord, setEditingRecord] = useState<MasterDataOfGurukrupa | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Clear selection when page or data changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [currentPage, data]);

  // Reset page when filters change
  useEffect(() => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  }, [clientNameFilter, societyFilter]);

  const allOnPageSelected = data.length > 0 && data.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((r) => r.id)));
    }
  };

  const toggleSelectRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSingle = async (record: MasterDataOfGurukrupa) => {
    const label = record.client_name || `Record #${record.id}`;
    if (!window.confirm(`Delete master data record #${record.id} (${label})? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(record.id);
    setActionError(null);
    try {
      const res = await fetch(`/api/master-data?id=${record.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || 'Failed to delete record');
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(record.id);
        return next;
      });
      onRefresh?.();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete record');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected master data record(s)? This action cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    setActionError(null);
    try {
      const res = await fetch('/api/master-data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || 'Failed to delete selected records');
      }
      setSelectedIds(new Set());
      onRefresh?.();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete selected records');
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (record: MasterDataOfGurukrupa) => {
    setEditingRecord(record);
    setActionError(null);
    setEditForm({
      client_name: record.client_name || '',
      contact_no: record.contact_no || '',
      society_name: record.society_name || '',
      plot_no: record.plot_no || '',
      plot_size: record.plot_size || '',
      plot_amount: record.plot_amount || '',
      paid_amount: record.paid_amount || '',
      emi_amount: record.emi_amount || '',
      "broker's_name": record["broker's_name"] || '',
      broker_code: record.broker_code || '',
      r_no: record.r_no || '',
      remarks: record.remarks || '',
    });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setIsSaving(true);
    setActionError(null);
    try {
      const res = await fetch('/api/master-data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingRecord.id,
          ...editForm,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || 'Failed to update record');
      }
      setEditingRecord(null);
      onRefresh?.();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update record');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {actionError && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-200 flex items-center justify-between text-sm text-red-700">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Table Info & Bulk Actions */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm text-gray-700">
              Showing {startRecord.toLocaleString('en-IN')} to {endRecord.toLocaleString('en-IN')} of {totalCount.toLocaleString('en-IN')} entries
            </p>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Delete Selected ({selectedIds.size})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs text-gray-500 hover:text-gray-800 underline"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Page {currentPage.toLocaleString('en-IN')} of {Math.max(1, totalPages).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all on page"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Society
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plot No
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plot Size
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plot Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paid Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Broker Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Broker Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                    Loading data...
                  </div>
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((record) => (
                <tr key={record.id} className={`hover:bg-gray-50 ${selectedIds.has(record.id) ? 'bg-blue-50/40' : ''}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(record.id)}
                      onChange={() => toggleSelectRow(record.id)}
                      aria-label={`Select record ${record.id}`}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {record.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link href={`/customers/${record.id}`} className="hover:text-blue-600 hover:underline">
                      {record.client_name || '-'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    <div className="font-medium text-gray-800">{record.project_name || record.society_name || '-'}</div>
                    {record.block_name && record.block_name !== 'Main' && (
                      <div className="text-xs text-blue-600">{record.block_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {record.plot_no || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {record.plot_size || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCommaINR((record as any).plot_amount_num ?? record.plot_amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                    {formatCommaINR((record as any).paid_amount_num ?? record.paid_amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {record.broker_code ? (
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200">
                        {record.broker_code}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-medium">
                    {record.broker_name_clean || record["broker's_name"] || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {record.contact_no || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/customers/${record.id}`}
                        title="View Customer"
                        className="p-1.5 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEditModal(record)}
                        title="Edit Record"
                        className="p-1.5 rounded-md text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSingle(record)}
                        disabled={deletingId === record.id}
                        title="Delete Record"
                        className="p-1.5 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                      >
                        {deletingId === record.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                  No records found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit Record #{editingRecord.id}</h3>
                <p className="text-xs text-gray-500">Update master data fields for this entry</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={editForm.client_name || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, client_name: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contact No</label>
                  <input
                    type="text"
                    value={editForm.contact_no || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, contact_no: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Society Name</label>
                  <input
                    type="text"
                    value={editForm.society_name || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, society_name: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Plot No</label>
                  <input
                    type="text"
                    value={editForm.plot_no || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, plot_no: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Plot Size</label>
                  <input
                    type="text"
                    value={editForm.plot_size || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, plot_size: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Plot Amount</label>
                  <input
                    type="text"
                    value={editForm.plot_amount || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, plot_amount: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Paid Amount</label>
                  <input
                    type="text"
                    value={editForm.paid_amount || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, paid_amount: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">EMI Amount</label>
                  <input
                    type="text"
                    value={editForm.emi_amount || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, emi_amount: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Broker Name</label>
                  <input
                    type="text"
                    value={editForm["broker's_name"] || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, "broker's_name": e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Broker Code</label>
                  <input
                    type="text"
                    value={editForm.broker_code || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, broker_code: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Receipt / Reg No (r_no)</label>
                  <input
                    type="text"
                    value={editForm.r_no || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, r_no: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks</label>
                  <input
                    type="text"
                    value={editForm.remarks || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, remarks: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                className="ml-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {getPaginationNumbers().map((page, index) => (
                  <span key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-1 text-sm text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          currentPage === page
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </span>
                ))}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
