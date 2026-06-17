'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Save, AlertCircle } from 'lucide-react';
import CRMLayout from '@/components/CRMLayout';

// ── helpers ─────────────────────────────────────────────────────────────────

function makeBillNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rnd = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BILL-${ymd}-${rnd}`;
}

function formatINR(raw: string): string {
  const n = parseFloat(raw.replace(/,/g, ''));
  if (isNaN(n)) return '—';
  return `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
}

function fmtDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const today = new Date().toISOString().split('T')[0];

const initForm = () => ({
  billNumber:    makeBillNumber(),
  clientName:    '',
  clientPhone:   '',
  clientAddress: '',
  description:   '',
  amount:        '',
  date:          today,
  notes:         '',
  status:        'Pending' as 'Pending' | 'Paid',
});

// ── InvoicePreview ───────────────────────────────────────────────────────────

function InvoicePreview({ form }: { form: ReturnType<typeof initForm> }) {
  const amountStr = formatINR(form.amount);

  return (
    <div
      id="invoice-print-area"
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 font-sans text-sm"
    >
      {/* Header */}
      <div className="flex justify-between items-start pb-6 border-b border-gray-200 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-800">INDUSUN</h1>
          <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-widest">Properties</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800 uppercase tracking-wider">Invoice</p>
          <p className="text-gray-500 text-xs mt-1">
            <span className="font-semibold">#</span>{form.billNumber || '—'}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">{fmtDate(form.date)}</p>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <p className="text-xs uppercase font-semibold text-gray-400 mb-2 tracking-wider">Bill To</p>
        <p className="font-semibold text-gray-900 text-base">
          {form.clientName || <span className="text-gray-300 font-normal italic">Client Name</span>}
        </p>
        {form.clientPhone   && <p className="text-gray-600 text-xs mt-0.5">{form.clientPhone}</p>}
        {form.clientAddress && <p className="text-gray-600 text-xs mt-0.5 whitespace-pre-line">{form.clientAddress}</p>}
      </div>

      {/* Items table */}
      <table className="w-full mb-6 text-sm">
        <thead>
          <tr className="bg-blue-50">
            <th className="py-2.5 px-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Description
            </th>
            <th className="py-2.5 px-4 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="py-4 px-4 text-gray-800">
              {form.description || <span className="text-gray-300 italic">Property / service description</span>}
            </td>
            <td className="py-4 px-4 text-right font-medium text-gray-900">{amountStr}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-gray-50">
            <td className="py-3 px-4 text-right text-sm font-semibold text-gray-600">Total</td>
            <td className="py-3 px-4 text-right font-bold text-blue-800 text-base">{amountStr}</td>
          </tr>
        </tfoot>
      </table>

      {/* Status badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          form.status === 'Paid'
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {form.status}
        </span>
      </div>

      {/* Notes */}
      {form.notes && (
        <div className="border-t border-gray-100 pt-4 text-xs text-gray-500">
          <p className="font-semibold mb-1 text-gray-600">Notes</p>
          <p className="whitespace-pre-line">{form.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
        Thank you for your business.
      </div>
    </div>
  );
}

// ── CreateInvoicePage ────────────────────────────────────────────────────────

export default function CreateInvoicePage() {
  const router = useRouter();
  const [form, setForm] = useState(initForm());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const set = (k: keyof ReturnType<typeof initForm>, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  async function saveToSupabase(): Promise<string> {
    const res = await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount.replace(/,/g, '')) || 0 }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Save failed');
    return data.id as string;
  }

  const handleSave = async () => {
    if (!form.clientName.trim()) { setSaveError('Client name is required'); return; }
    if (!form.amount || isNaN(parseFloat(form.amount.replace(/,/g, '')))) {
      setSaveError('Valid amount is required');
      return;
    }
    setSaveError(null);
    setIsSaving(true);
    try {
      const id = await saveToSupabase();
      router.push(`/invoices/b${id}`);
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndPrint = async () => {
    if (!form.clientName.trim()) { setSaveError('Client name is required'); return; }
    if (!form.amount || isNaN(parseFloat(form.amount.replace(/,/g, '')))) {
      setSaveError('Valid amount is required');
      return;
    }
    setSaveError(null);
    setIsSaving(true);
    try {
      const id = await saveToSupabase();
      window.print();
      router.push(`/invoices/b${id}`);
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide';

  return (
    <CRMLayout>
      <style>{`
        @media print {
          body > * { visibility: hidden !important; }
          #invoice-print-area, #invoice-print-area * { visibility: visible !important; }
          #invoice-print-area {
            position: fixed !important;
            top: 0 !important; left: 0 !important;
            width: 100% !important;
            padding: 24px !important;
            background: white !important;
          }
        }
      `}</style>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <button
                onClick={() => router.push('/invoices')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-1"
              >
                <ArrowLeft size={14} className="mr-1" />
                Back to Invoices
              </button>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Create New Invoice
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Printer size={16} />
                Print Preview
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={handleSaveAndPrint}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Printer size={16} />
                {isSaving ? 'Saving…' : 'Save & Print'}
              </button>
            </div>
          </div>

          {/* Error banner */}
          {saveError && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── Form ─── */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 space-y-5 h-fit">
              <h2 className="text-base font-semibold text-gray-800 border-b pb-3">Invoice Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Bill Number</label>
                  <input
                    className={inputCls}
                    value={form.billNumber}
                    onChange={e => set('billNumber', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelCls}>Date</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.date}
                    onChange={e => set('date', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    className={inputCls}
                    value={form.status}
                    onChange={e => set('status', e.target.value as 'Pending' | 'Paid')}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <h2 className="text-base font-semibold text-gray-800 border-b pb-3 pt-2">Client Information</h2>

              <div>
                <label className={labelCls}>Client Name <span className="text-red-500">*</span></label>
                <input
                  className={inputCls}
                  placeholder="e.g. Rahul Sharma"
                  value={form.clientName}
                  onChange={e => set('clientName', e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Phone</label>
                <input
                  className={inputCls}
                  placeholder="+91 98765 43210"
                  value={form.clientPhone}
                  onChange={e => set('clientPhone', e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Address</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  placeholder="Street, City, State"
                  value={form.clientAddress}
                  onChange={e => set('clientAddress', e.target.value)}
                />
              </div>

              <h2 className="text-base font-semibold text-gray-800 border-b pb-3 pt-2">Payment Details</h2>

              <div>
                <label className={labelCls}>Description <span className="text-red-500">*</span></label>
                <input
                  className={inputCls}
                  placeholder="e.g. Plot No 12, Green Valley Phase 2"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Amount (₹) <span className="text-red-500">*</span></label>
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Notes</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  placeholder="Optional notes or payment instructions"
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                />
              </div>
            </div>

            {/* ── Live Preview ─── */}
            <div className="lg:col-span-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Live Preview
              </p>
              <InvoicePreview form={form} />
            </div>

          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
