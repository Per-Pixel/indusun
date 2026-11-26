'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Eye, Pencil, Plus, Printer, Trash2, X } from 'lucide-react';
import { MasterDataOfGurukrupa } from '@/types/masterData';
import { normalizeDate, parseAmount } from '@/utils/dataUtils';
import {
  GurukrupaReceipt,
  numberToIndianWords,
  paymentMethodToShortCode,
} from '@/components/invoices/GurukrupaReceipt';

export type BillAction =
  | { type: 'add' }
  | { type: 'edit'; id: number }
  | { type: 'view'; id: number };

interface SavedBill {
  id: number;
  bill_number?: string | null;
  client_name?: string | null;
  client_phone?: string | null;
  society_name?: string | null;
  plot_no?: string | null;
  plot_size?: string | null;
  plot_amount?: number | string | null;
  reference_by?: string | null;
  total_emi_no?: string | null;
  amount?: number | string | null;
  amount_in_words?: string | null;
  remarks?: string | null;
  date?: string | null;
  payment_method?: string | null;
  status?: string | null;
  description?: string | null;
}

interface LedgerDraft {
  source: 'ledger';
  mode: 'add' | 'edit';
  id?: number;
  receiptNo: string;
  date: string;
  rawDate: string;
  dateTouched: boolean;
  society: string;
  plot: string;
  size: string;
  plotAmount: string;
  emiNo: string;
  emiAmount: string;
  paidAmount: string;
  paymentMode: string;
  words: string;
  remarks: string;
  cancelled: boolean;
  cancelDate: string;
  block: string;
  emiTime: string;
  emiDate: string;
}

interface SavedDraft {
  source: 'saved';
  id: number;
  receiptNo: string;
  date: string;
  society: string;
  plot: string;
  size: string;
  plotAmount: string;
  emiNo: string;
  paidAmount: string;
  paymentMode: string;
  words: string;
  remarks: string;
  status: 'Paid' | 'Pending';
}

type Draft = LedgerDraft | SavedDraft;

type Viewer =
  | { source: 'ledger'; row: MasterDataOfGurukrupa }
  | { source: 'saved'; bill: SavedBill };

interface Props {
  showList: boolean;
  customer: MasterDataOfGurukrupa;
  portfolio: MasterDataOfGurukrupa[];
  setCustomer: (next: MasterDataOfGurukrupa) => void;
  setPortfolio: React.Dispatch<React.SetStateAction<MasterDataOfGurukrupa[]>>;
  onDeleteReceipt: (row: MasterDataOfGurukrupa) => void;
  externalAction: BillAction | null;
  onExternalActionHandled: () => void;
}

const PAYMENT_MODES = ['Cash', 'Cheque', 'UPI', 'Bank Transfer'];

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

function monthYearFromIso(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [year, month] = iso.split('-');
  return `${Number(month)}/${year}`;
}

function plotKey(society: string | null | undefined, plot: string | null | undefined) {
  return `${(society || '').trim()}||${(plot || '').trim()}`;
}

function fmtINR(n: number) {
  return `₹${(Number(n) || 0).toLocaleString('en-IN')}`;
}

function fmtDate(raw: string | null | undefined) {
  if (!raw) return '—';
  const iso = normalizeDate(raw);
  if (!iso) return String(raw);
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function receiptLabel(row: MasterDataOfGurukrupa) {
  return row.registration_no || row.r_no || `#${row.id}`;
}

function normalizeMode(raw: string | null | undefined) {
  const cur = String(raw || '').trim();
  if (!cur) return 'Cash';
  const exact = PAYMENT_MODES.find((mode) => mode.toLowerCase() === cur.toLowerCase());
  if (exact) return exact;
  const upper = cur.toUpperCase();
  if (upper.includes('CHQ') || upper.includes('CHEQUE')) return 'Cheque';
  if (upper.includes('UPI')) return 'UPI';
  if (upper.includes('NEFT') || upper.includes('RTGS') || upper.includes('BANK') || upper.includes('TRANSFER')) {
    return 'Bank Transfer';
  }
  if (upper.includes('CASH')) return 'Cash';
  return cur;
}

function modeOptions(current: string) {
  return PAYMENT_MODES.includes(current) ? PAYMENT_MODES : [current, ...PAYMENT_MODES];
}

function nextEmiNo(rows: MasterDataOfGurukrupa[]) {
  let max = 0;
  for (const row of rows) {
    const match = String(row.emi_no || '').match(/\d+/);
    if (match) max = Math.max(max, parseInt(match[0], 10));
  }
  return max > 0 ? String(max + 1) : '';
}

function samePlotRows(rows: MasterDataOfGurukrupa[], society: string, plot: string) {
  const soc = society.trim().toLowerCase();
  const plt = plot.trim().toLowerCase();
  return rows.filter(
    (row) =>
      (row.society_name || '').trim().toLowerCase() === soc &&
      (row.plot_no || '').trim().toLowerCase() === plt
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="input input-sm w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default function CustomerBills({
  showList,
  customer,
  portfolio,
  setCustomer,
  setPortfolio,
  onDeleteReceipt,
  externalAction,
  onExternalActionHandled,
}: Props) {
  const router = useRouter();
  const [plotFilter, setPlotFilter] = useState('all');
  const [savedBills, setSavedBills] = useState<SavedBill[]>([]);
  const [editor, setEditor] = useState<Draft | null>(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const name = (customer.client_name || '').trim();
    if (!name) {
      setSavedBills([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/bills?client=${encodeURIComponent(name)}&limit=100`)
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const rows = Array.isArray(data?.bills) ? data.bills : [];
        setSavedBills(rows.filter((bill: SavedBill) => bill && typeof bill.id === 'number'));
      })
      .catch(() => {
        if (!cancelled) setSavedBills([]);
      });
    return () => {
      cancelled = true;
    };
  }, [customer.client_name]);

  const sorted = useMemo(() => {
    return [...portfolio].sort((a, b) => {
      const aDate = normalizeDate(a.emi_paid_date || a.date || a.date_of_form) || '';
      const bDate = normalizeDate(b.emi_paid_date || b.date || b.date_of_form) || '';
      if (aDate !== bDate) return bDate.localeCompare(aDate);
      return b.id - a.id;
    });
  }, [portfolio]);

  const plotOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of portfolio) {
      const key = plotKey(row.society_name, row.plot_no);
      if (!map.has(key)) {
        map.set(key, `${row.society_name || '—'} · Plot ${row.plot_no || '—'}`);
      }
    }
    return Array.from(map, ([key, label]) => ({ key, label }));
  }, [portfolio]);

  const visible = plotFilter === 'all' ? sorted : sorted.filter((row) => plotKey(row.society_name, row.plot_no) === plotFilter);
  const visiblePaid = visible
    .filter((row) => !row.cancel_date)
    .reduce((sum, row) => sum + parseAmount(row.paid_amount), 0);

  const openAdd = () => {
    const template =
      samePlotRows(portfolio, customer.society_name || '', customer.plot_no || '')[0] || customer;
    const matches = samePlotRows(portfolio, template.society_name || '', template.plot_no || '');
    const emiAmount = template.emi_amount || '';
    const paidSeed = parseAmount(emiAmount) > 0 ? String(emiAmount) : '';
    const date = todayIso();
    setViewer(null);
    setEditor({
      source: 'ledger',
      mode: 'add',
      receiptNo: '',
      date,
      rawDate: '',
      dateTouched: true,
      society: template.society_name || '',
      plot: template.plot_no || '',
      size: template.plot_size || '',
      plotAmount: template.plot_amount || '',
      emiNo: nextEmiNo(matches),
      emiAmount,
      paidAmount: paidSeed,
      paymentMode: normalizeMode(template.cheque_cash),
      words: paidSeed ? numberToIndianWords(parseAmount(paidSeed)) : '',
      remarks: '',
      cancelled: false,
      cancelDate: '',
      block: template.block_name || '',
      emiTime: template.emi_time || '',
      emiDate: template.emi_date || '',
    });
  };

  const openEditLedger = (row: MasterDataOfGurukrupa) => {
    const iso = normalizeDate(row.emi_paid_date) || '';
    setViewer(null);
    setEditor({
      source: 'ledger',
      mode: 'edit',
      id: row.id,
      receiptNo: row.registration_no || row.r_no || '',
      date: iso,
      rawDate: row.emi_paid_date || '',
      dateTouched: false,
      society: row.society_name || '',
      plot: row.plot_no || '',
      size: row.plot_size || '',
      plotAmount: row.plot_amount || '',
      emiNo: row.emi_no || '',
      emiAmount: row.emi_amount || '',
      paidAmount: row.paid_amount || '',
      paymentMode: normalizeMode(row.cheque_cash),
      words: row.amount_in_word || numberToIndianWords(parseAmount(row.paid_amount)),
      remarks: row.remarks || '',
      cancelled: !!row.cancel_date,
      cancelDate: row.cancel_date || '',
      block: row.block_name || '',
      emiTime: row.emi_time || '',
      emiDate: row.emi_date || '',
    });
  };

  const openViewLedger = (row: MasterDataOfGurukrupa) => {
    setEditor(null);
    setViewer({ source: 'ledger', row });
  };

  const openEditSaved = (bill: SavedBill) => {
    const amount = bill.amount ?? '';
    setViewer(null);
    setEditor({
      source: 'saved',
      id: bill.id,
      receiptNo: bill.bill_number || '',
      date: normalizeDate(bill.date) || '',
      society: bill.society_name || '',
      plot: bill.plot_no || '',
      size: bill.plot_size || '',
      plotAmount: bill.plot_amount == null ? '' : String(bill.plot_amount),
      emiNo: bill.total_emi_no || '',
      paidAmount: amount === '' ? '' : String(amount),
      paymentMode: normalizeMode(bill.payment_method),
      words: bill.amount_in_words || numberToIndianWords(parseAmount(amount)),
      remarks: bill.remarks || '',
      status: bill.status === 'Paid' ? 'Paid' : 'Pending',
    });
  };

  const openViewSaved = (bill: SavedBill) => {
    setEditor(null);
    setViewer({ source: 'saved', bill });
  };

  useEffect(() => {
    if (!externalAction) return;
    if (externalAction.type === 'add') {
      openAdd();
    } else {
      const row = portfolio.find((item) => item.id === externalAction.id);
      if (!row) {
        toast.error('That bill is no longer on this customer.');
      } else if (externalAction.type === 'edit') {
        openEditLedger(row);
      } else {
        openViewLedger(row);
      }
    }
    onExternalActionHandled();
    // Open once per action from the profile header or another tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalAction]);

  const applyPlot = (key: string) => {
    if (!editor || editor.source !== 'ledger') return;
    const splitAt = key.indexOf('||');
    const society = key.slice(0, splitAt);
    const plot = key.slice(splitAt + 2);
    const matches = samePlotRows(portfolio, society, plot);
    const template = matches[0];
    if (!template) return;
    setEditor({
      ...editor,
      society: template.society_name || '',
      plot: template.plot_no || '',
      size: template.plot_size || '',
      plotAmount: template.plot_amount || '',
      emiAmount: template.emi_amount || editor.emiAmount,
      block: template.block_name || '',
      emiTime: template.emi_time || '',
      emiDate: template.emi_date || '',
      emiNo: editor.mode === 'add' ? nextEmiNo(matches) : editor.emiNo,
    });
  };

  const setPaidAmount = (value: string) => {
    if (!editor) return;
    setEditor({
      ...editor,
      paidAmount: value,
      words: numberToIndianWords(parseAmount(value)),
    });
  };

  const saveLedger = async (draft: LedgerDraft) => {
    const paid = parseAmount(draft.paidAmount);
    if (paid <= 0) {
      toast.error('Enter the amount received on this bill.');
      return;
    }
    if (draft.mode === 'add' && !(customer.client_name || '').trim()) {
      toast.error('This customer needs a name before a bill can be added.');
      return;
    }

    const paidDate = draft.dateTouched || draft.date ? draft.date : draft.rawDate;
    const isoDate = normalizeDate(paidDate);
    const words = draft.words.trim() || numberToIndianWords(paid);
    const billFields = {
      registration_no: draft.receiptNo,
      r_no: draft.receiptNo,
      society_name: draft.society,
      block_name: draft.block,
      plot_no: draft.plot,
      plot_size: draft.size,
      plot_amount: draft.plotAmount,
      paid_amount: draft.paidAmount,
      emi_amount: draft.emiAmount,
      emi_no: draft.emiNo,
      emi_time: draft.emiTime,
      emi_date: draft.emiDate,
      emi_paid_date: paidDate,
      cheque_cash: draft.paymentMode,
      month_and_year: isoDate ? monthYearFromIso(isoDate) : '',
      amount_in_word: words,
      remarks: draft.remarks,
      cancel_date: draft.cancelled ? draft.cancelDate || todayIso() : '',
    };

    setIsSaving(true);
    try {
      if (draft.mode === 'add') {
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_name: customer.client_name,
            father_or_husband_name: customer.father_or_husband_name || '',
            age: customer.age || '',
            date_of_birth: customer.date_of_birth || '',
            profession: customer.profession || '',
            address: customer.address || '',
            contact_no: customer.contact_no || '',
            resident_no: customer.resident_no || '',
            aadhar_no: customer.aadhar_no || '',
            pan_no: customer.pan_no || '',
            nominee_name: customer.nominee_name || '',
            nominee_relation: customer.nominee_relation || '',
            nominee_age: customer.nominee_age || '',
            nominee_dob: customer.nominee_dob || '',
            nominee_profession: customer.nominee_profession || '',
            "broker's_name": customer["broker's_name"] || '',
            broker_code: customer.broker_code || '',
            ba_code: customer.ba_code || '',
            policy_number: customer.policy_number || '',
            date_of_form: customer.date_of_form || '',
            date: isoDate || todayIso(),
            applicant_photo: customer.applicant_photo || '',
            ...billFields,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add bill');
        const created = data.customer as MasterDataOfGurukrupa;
        setPortfolio((prev) => [created, ...prev.filter((row) => row.id !== created.id)]);
        toast.success('Bill added');
      } else {
        const res = await fetch(`/api/customers/${draft.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(billFields),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update bill');
        const updated = data.customer as MasterDataOfGurukrupa;
        if (updated.id === customer.id) setCustomer(updated);
        setPortfolio((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
        toast.success('Bill updated');
      }
      setEditor(null);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save bill');
    } finally {
      setIsSaving(false);
    }
  };

  const saveSaved = async (draft: SavedDraft) => {
    const paid = parseAmount(draft.paidAmount);
    if (paid <= 0) {
      toast.error('Enter the bill amount.');
      return;
    }
    const words = draft.words.trim() || numberToIndianWords(paid);
    setIsSaving(true);
    try {
      const res = await fetch('/api/bills', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draft.id,
          billNumber: draft.receiptNo,
          societyName: draft.society,
          plotNo: draft.plot,
          plotSize: draft.size,
          plotAmount: parseAmount(draft.plotAmount),
          totalEmiNo: draft.emiNo,
          amount: paid,
          amountInWords: words,
          remarks: draft.remarks,
          date: draft.date,
          paymentMethod: draft.paymentMode,
          status: draft.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update bill');
      if (data.bill) {
        setSavedBills((prev) => prev.map((bill) => (bill.id === data.bill.id ? data.bill : bill)));
      }
      toast.success('Bill updated');
      setEditor(null);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update bill');
    } finally {
      setIsSaving(false);
    }
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editor || isSaving) return;
    if (editor.source === 'ledger') void saveLedger(editor);
    else void saveSaved(editor);
  };

  const viewerReceipt = viewer
    ? viewer.source === 'ledger'
      ? {
          hrefId: String(viewer.row.id),
          receiptNumber: receiptLabel(viewer.row),
          date: normalizeDate(viewer.row.emi_paid_date || viewer.row.date),
          partyName: viewer.row.client_name || '',
          mobileNo: viewer.row.contact_no,
          societyName: viewer.row.society_name,
          plotNo: viewer.row.plot_no,
          plotSize: viewer.row.plot_size,
          referenceBy: viewer.row["broker's_name"] || viewer.row.broker_code,
          totalEmiNo: viewer.row.emi_no || viewer.row.emi_time,
          paymentDescription: paymentMethodToShortCode(viewer.row.cheque_cash || undefined),
          netAmount: parseAmount(viewer.row.paid_amount) || parseAmount(viewer.row.emi_amount),
          amountInWords: viewer.row.amount_in_word,
          remarks: [viewer.row.remarks, viewer.row.cancel_date ? `Cancelled on ${viewer.row.cancel_date}` : null]
            .filter(Boolean)
            .join(' | '),
        }
      : {
          hrefId: `b${viewer.bill.id}`,
          receiptNumber: viewer.bill.bill_number || `BILL-${viewer.bill.id}`,
          date: normalizeDate(viewer.bill.date),
          partyName: viewer.bill.client_name || customer.client_name || '',
          mobileNo: viewer.bill.client_phone || customer.contact_no,
          societyName: viewer.bill.society_name,
          plotNo: viewer.bill.plot_no,
          plotSize: viewer.bill.plot_size,
          referenceBy: viewer.bill.reference_by,
          totalEmiNo: viewer.bill.total_emi_no,
          paymentDescription: paymentMethodToShortCode(viewer.bill.payment_method || undefined),
          netAmount: parseAmount(viewer.bill.amount),
          amountInWords: viewer.bill.amount_in_words,
          remarks: viewer.bill.remarks || '',
        }
    : null;

  const selectedPlot = editor && editor.source === 'ledger' ? plotKey(editor.society, editor.plot) : '';

  return (
    <>
      {showList && (
        <motion.div
          key="bills"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          <div className="card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="text-h3">Bills</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {visible.length} bill{visible.length === 1 ? '' : 's'}
                  {plotFilter === 'all' ? '' : ' on this plot'} · {fmtINR(visiblePaid)} received
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {plotOptions.length > 1 && (
                  <select
                    className="input input-sm"
                    value={plotFilter}
                    onChange={(e) => setPlotFilter(e.target.value)}
                    aria-label="Filter bills by plot"
                  >
                    <option value="all">All plots</option>
                    {plotOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                <button type="button" onClick={openAdd} className="btn btn-primary btn-sm flex items-center gap-1.5">
                  <Plus size={14} />
                  Add bill
                </button>
              </div>
            </div>

            {visible.length === 0 ? (
              <div className="empty-state py-10">
                <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                  No bills on this customer yet
                </p>
                <button type="button" onClick={openAdd} className="btn btn-secondary btn-sm mt-3">
                  Add the first bill
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b text-left" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                      <th className="py-2 pr-3">Receipt</th>
                      <th className="py-2 pr-3">Plot</th>
                      <th className="py-2 pr-3">EMI</th>
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Mode</th>
                      <th className="py-2 pr-3">Amount</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {visible.map((row) => {
                      const isCurrent = row.id === customer.id;
                      return (
                        <tr key={row.id} className={isCurrent ? 'bg-amber-50/60' : 'hover:bg-gray-50'}>
                          <td className="py-2 pr-3 font-mono whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openViewLedger(row)}
                              className="text-blue-600 hover:underline"
                            >
                              {receiptLabel(row)}
                            </button>
                            {isCurrent && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800">
                                viewing
                              </span>
                            )}
                            {row.cancel_date && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700">
                                cancelled
                              </span>
                            )}
                          </td>
                          <td className="py-2 pr-3">
                            <span className="font-medium">{row.society_name || '—'}</span>
                            <span style={{ color: 'var(--text-muted)' }}> · {row.plot_no || '—'}</span>
                          </td>
                          <td className="py-2 pr-3 whitespace-nowrap">{row.emi_no ? `EMI #${row.emi_no}` : '—'}</td>
                          <td className="py-2 pr-3 whitespace-nowrap">
                            {fmtDate(row.emi_paid_date || row.date || row.date_of_form)}
                          </td>
                          <td className="py-2 pr-3 whitespace-nowrap">{row.cheque_cash || '—'}</td>
                          <td className="py-2 pr-3 font-semibold whitespace-nowrap" style={{ color: 'var(--success)' }}>
                            {fmtINR(parseAmount(row.paid_amount))}
                          </td>
                          <td className="py-2 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openViewLedger(row)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-slate-700 hover:bg-slate-100"
                            >
                              <Eye size={12} />
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditLedger(row)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-slate-700 hover:bg-slate-100"
                            >
                              <Pencil size={12} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteReceipt(row)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {savedBills.length > 0 && (
            <div className="card p-5 space-y-3">
              <div>
                <h3 className="text-h3">Saved invoices</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Bills created from Invoices for {customer.client_name}. These sit beside the account receipts above.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b text-left" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                      <th className="py-2 pr-3">Bill</th>
                      <th className="py-2 pr-3">Plot</th>
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Amount</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {savedBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-gray-50">
                        <td className="py-2 pr-3 font-mono">
                          <button type="button" onClick={() => openViewSaved(bill)} className="text-blue-600 hover:underline">
                            {bill.bill_number || `BILL-${bill.id}`}
                          </button>
                        </td>
                        <td className="py-2 pr-3">
                          {bill.society_name || '—'}
                          {bill.plot_no ? ` · ${bill.plot_no}` : ''}
                        </td>
                        <td className="py-2 pr-3 whitespace-nowrap">{fmtDate(bill.date)}</td>
                        <td className="py-2 pr-3">{bill.status === 'Paid' ? 'Paid' : 'Pending'}</td>
                        <td className="py-2 pr-3 font-semibold whitespace-nowrap">{fmtINR(parseAmount(bill.amount))}</td>
                        <td className="py-2 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openViewSaved(bill)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-slate-700 hover:bg-slate-100"
                          >
                            <Eye size={12} />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditSaved(bill)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-slate-700 hover:bg-slate-100"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {viewer && viewerReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={() => setViewer(null)}
        >
          <div
            className="card w-full max-w-[210mm] bg-white shadow-xl my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-base font-bold text-gray-900">Bill {viewerReceipt.receiptNumber}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/invoices/print?ids=${encodeURIComponent(viewerReceipt.hrefId)}`}
                  className="btn btn-secondary btn-sm flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  Print
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (viewer.source === 'ledger') openEditLedger(viewer.row);
                    else openEditSaved(viewer.bill);
                  }}
                  className="btn btn-primary btn-sm flex items-center gap-1.5"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button type="button" onClick={() => setViewer(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-x-auto bg-slate-100">
              <GurukrupaReceipt
                receiptNumber={viewerReceipt.receiptNumber}
                date={viewerReceipt.date}
                partyName={viewerReceipt.partyName}
                mobileNo={viewerReceipt.mobileNo}
                societyName={viewerReceipt.societyName}
                plotNo={viewerReceipt.plotNo}
                plotSize={viewerReceipt.plotSize}
                referenceBy={viewerReceipt.referenceBy}
                totalEmiNo={viewerReceipt.totalEmiNo}
                paymentDescription={viewerReceipt.paymentDescription}
                netAmount={viewerReceipt.netAmount}
                amountInWords={viewerReceipt.amountInWords}
                remarks={viewerReceipt.remarks}
              />
            </div>
          </div>
        </div>
      )}

      {editor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={() => !isSaving && setEditor(null)}
        >
          <div
            className="card p-6 max-w-2xl w-full bg-white shadow-xl max-h-[90vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editor.source === 'ledger' && editor.mode === 'add'
                    ? 'Add bill'
                    : `Edit bill ${editor.receiptNo || (editor.source === 'ledger' ? `#${editor.id}` : '')}`}
                </h3>
                <p className="text-xs text-gray-500">
                  {customer.client_name || 'Customer'}
                  {editor.source === 'ledger' && editor.mode === 'add'
                    ? ' · this receipt is added to the account. The amount starts from the EMI, so change it if this payment is different.'
                    : editor.source === 'ledger'
                    ? ' · this receipt stays on the account and in the paid total'
                    : ' · saved invoice'}
                </p>
              </div>
              <button type="button" onClick={() => !isSaving && setEditor(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={save} className="space-y-4">
              {editor.source === 'ledger' && plotOptions.length > 1 && (
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Plot on this bill</label>
                  <select
                    className="input input-sm w-full"
                    value={plotOptions.some((option) => option.key === selectedPlot) ? selectedPlot : ''}
                    onChange={(e) => applyPlot(e.target.value)}
                  >
                    {!plotOptions.some((option) => option.key === selectedPlot) && (
                      <option value="">Custom plot</option>
                    )}
                    {plotOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="Receipt / bill number"
                  value={editor.receiptNo}
                  placeholder="Leave blank to assign later"
                  onChange={(receiptNo) => setEditor({ ...editor, receiptNo })}
                />
                <Field
                  label={editor.source === 'saved' ? 'Bill date' : 'Paid date'}
                  type="date"
                  value={editor.date}
                  onChange={(date) =>
                    setEditor(
                      editor.source === 'ledger' ? { ...editor, date, dateTouched: true } : { ...editor, date }
                    )
                  }
                />
                <Field
                  label="Society"
                  value={editor.society}
                  onChange={(society) => setEditor({ ...editor, society })}
                />
                <Field label="Plot number" value={editor.plot} onChange={(plot) => setEditor({ ...editor, plot })} />
                <Field label="Plot size" value={editor.size} onChange={(size) => setEditor({ ...editor, size })} />
                <Field
                  label="Plot amount"
                  value={editor.plotAmount}
                  onChange={(plotAmount) => setEditor({ ...editor, plotAmount })}
                />
                <Field label="EMI number" value={editor.emiNo} onChange={(emiNo) => setEditor({ ...editor, emiNo })} />
                {editor.source === 'ledger' ? (
                  <Field
                    label="EMI amount"
                    value={editor.emiAmount}
                    onChange={(emiAmount) => setEditor({ ...editor, emiAmount })}
                  />
                ) : (
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                    <select
                      className="input input-sm w-full"
                      value={editor.status}
                      onChange={(e) =>
                        setEditor({ ...editor, status: e.target.value === 'Paid' ? 'Paid' : 'Pending' })
                      }
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                )}
                <Field
                  label={editor.source === 'saved' ? 'Bill amount' : 'Amount received'}
                  value={editor.paidAmount}
                  onChange={setPaidAmount}
                />
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Payment mode</label>
                  <select
                    className="input input-sm w-full"
                    value={editor.paymentMode}
                    onChange={(e) => setEditor({ ...editor, paymentMode: e.target.value })}
                  >
                    {modeOptions(editor.paymentMode).map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="Amount in words"
                    value={editor.words}
                    onChange={(words) => setEditor({ ...editor, words })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="Remarks"
                    value={editor.remarks}
                    onChange={(remarks) => setEditor({ ...editor, remarks })}
                  />
                </div>
              </div>

              {editor.source === 'ledger' && (
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={editor.cancelled}
                    onChange={(e) => setEditor({ ...editor, cancelled: e.target.checked })}
                  />
                  Mark this bill cancelled. Cancelled bills stay on the list and drop out of the paid total.
                </label>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setEditor(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="btn btn-primary btn-sm">
                  {isSaving ? 'Saving…' : editor.source === 'ledger' && editor.mode === 'add' ? 'Add bill' : 'Save bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
