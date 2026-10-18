'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  Save,
  AlertCircle,
  Plus,
  Trash2,
  Paperclip,
  Eye,
  Link2,
  Upload,
  FileText,
  X,
  User,
  Hash,
  ExternalLink,
  QrCode,
  Landmark,
  Receipt,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import CRMLayout from '@/components/CRMLayout';
import type { BillSuggestion } from '@/app/api/bills/lookup/route';
import {
  GurukrupaReceipt,
  PaymentQrSection,
  DEFAULT_BANK_DETAILS,
  DEFAULT_CANCELLATION_NOTE,
  DEFAULT_UPI_VPA,
  numberToIndianWords,
  paymentMethodToShortCode,
  type BankAccountItem,
} from '@/components/invoices/GurukrupaReceipt';

// ── helpers ─────────────────────────────────────────────────────────────────

function makeBillNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rnd = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BILL-${ymd}-${rnd}`;
}

function formatINR(n: number): string {
  if (isNaN(n)) return '—';
  return `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
}

function fmtDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const today = new Date().toISOString().split('T')[0];

interface LineItem {
  description: string;
  quantity: string;
  unit_price: string;
}

export interface AttachmentItem {
  name: string;
  url: string;
  type?: string;
}

export interface LinkedBillRef {
  id: string;
  billNumber: string;
  date: string;
  amount: number;
  description: string;
}

const emptyItem = (): LineItem => ({ description: 'Installment Payment', quantity: '1', unit_price: '' });

const initForm = () => ({
  billNumber:       makeBillNumber(),
  clientName:       '',
  clientPhone:      '',
  societyName:      '',
  plotNo:           '',
  plotSize:         '',
  referenceBy:      '',
  totalEmiNo:       '',
  plotAmount:       '',
  clientAddress:    '',
  description:      '',
  receiptDescCode:  'CHQ',
  items:            [emptyItem()] as LineItem[],
  discount:         '',
  taxRate:          '',
  date:             today,
  dueDate:          '',
  amountInWords:    '',
  customWords:      false,
  remarks:          '',
  cancellationNote: DEFAULT_CANCELLATION_NOTE,
  notes:            '',
  status:           'Paid' as 'Pending' | 'Paid',
  paymentMethod:    'Cheque',
  paymentRef:       '',
  upiVpa:           DEFAULT_UPI_VPA,
  showQr:           true,
  bankDetails:      DEFAULT_BANK_DETAILS.map((b) => ({ ...b })) as BankAccountItem[],
  attachments:      [] as AttachmentItem[],
  linkedBills:      [] as LinkedBillRef[],
});

type Form = ReturnType<typeof initForm>;

function num(v: string) {
  const n = parseFloat(String(v || '').replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}

function totals(form: Form) {
  const subtotal = form.items.reduce(
    (s, it) => s + num(it.quantity) * num(it.unit_price),
    0
  );
  const discount = num(form.discount);
  const taxable  = Math.max(0, subtotal - discount);
  const taxAmt   = (taxable * num(form.taxRate)) / 100;
  const total    = taxable + taxAmt;
  return { subtotal, discount, taxAmt, total };
}

// ── Standard InvoicePreview ──────────────────────────────────────────────────

function InvoicePreview({ form }: { form: Form }) {
  const t = totals(form);
  const filledItems = form.items.filter((it) => it.description.trim() || num(it.unit_price) > 0);
  const autoWords = form.customWords && form.amountInWords.trim()
    ? form.amountInWords.trim()
    : numberToIndianWords(t.total);

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 font-sans text-sm"
    >
      {/* Header */}
      <div className="flex justify-between items-start pb-6 border-b border-gray-200 mb-6">
        <div className="flex items-center gap-3">
          <img
            src="/gurukrupa-emblem-left.png"
            alt="Gurukrupa"
            className="h-12 w-auto object-contain"
          />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-blue-900 uppercase">
              GURUKRUPA CORPORATION
            </h1>
            <p className="text-[11px] text-gray-600 mt-0.5 font-medium">
              PLOT NO.7, NR. MARUTI COMPLEX, NASIK MARKANTILE BANK SURAT - 395 002
            </p>
            <p className="text-[11px] text-gray-500">PH: (0261) - 4812727</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800 uppercase tracking-wider">Receipt / Invoice</p>
          <p className="text-gray-700 text-xs mt-1 font-mono font-semibold">
            #{form.billNumber || '—'}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">Date: {fmtDate(form.date)}</p>
          {form.dueDate && (
            <p className="text-gray-500 text-xs mt-0.5">Due: {fmtDate(form.dueDate)}</p>
          )}
          {form.totalEmiNo && (
            <p className="text-blue-800 font-semibold text-xs mt-1">
              Total EMI No: {form.totalEmiNo}
            </p>
          )}
        </div>
      </div>

      {/* Party & Property Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div>
          <p className="text-[11px] uppercase font-semibold text-gray-400 mb-1 tracking-wider">
            Party Details
          </p>
          <p className="font-bold text-gray-900 text-base uppercase">
            {form.clientName || <span className="text-gray-300 font-normal italic">Party Name</span>}
          </p>
          {form.clientPhone && (
            <p className="text-gray-700 text-xs mt-0.5">Mobile No: {form.clientPhone}</p>
          )}
          {form.referenceBy && (
            <p className="text-gray-700 text-xs mt-0.5">
              <span className="font-semibold">Reference By:</span> {form.referenceBy}
            </p>
          )}
          {form.clientAddress && (
            <p className="text-gray-600 text-xs mt-0.5 whitespace-pre-line">{form.clientAddress}</p>
          )}
        </div>

        <div>
          <p className="text-[11px] uppercase font-semibold text-gray-400 mb-1 tracking-wider">
            Property / Plot Details
          </p>
          <div className="space-y-0.5 text-xs text-gray-800">
            <p>
              <span className="font-semibold text-gray-600">Society Name:</span>{' '}
              <span className="font-bold uppercase">{form.societyName || '—'}</span>
            </p>
            <p>
              <span className="font-semibold text-gray-600">Plot No.:</span>{' '}
              <span className="font-semibold">{form.plotNo || '—'}</span>
              {form.plotSize ? (
                <>
                  {' · '}
                  <span className="font-semibold text-gray-600">Plot Size:</span>{' '}
                  <span className="font-semibold">{form.plotSize}</span>
                </>
              ) : null}
            </p>
            {form.totalEmiNo && (
              <p>
                <span className="font-semibold text-gray-600">Total EMI No.:</span>{' '}
                <span className="font-semibold">{form.totalEmiNo}</span>
              </p>
            )}
            {num(form.plotAmount) > 0 && (
              <p>
                <span className="font-semibold text-gray-600">Total Plot Value:</span>{' '}
                <span className="font-semibold">{formatINR(num(form.plotAmount))}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Subject */}
      {form.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-700"><span className="font-semibold">Subject:</span> {form.description}</p>
        </div>
      )}

      {/* Items table */}
      <table className="w-full mb-6 text-sm">
        <thead>
          <tr className="bg-blue-50">
            <th className="py-2.5 px-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Description
            </th>
            <th className="py-2.5 px-4 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider w-24">
              Mode
            </th>
            <th className="py-2.5 px-4 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider w-16">
              Qty
            </th>
            <th className="py-2.5 px-4 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider w-32">
              Rate
            </th>
            <th className="py-2.5 px-4 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider w-32">
              Net Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {(filledItems.length ? filledItems : [emptyItem()]).map((it, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-3.5 px-4 text-gray-800">
                {it.description || <span className="text-gray-300 italic">Item description</span>}
              </td>
              <td className="py-3.5 px-4 text-center font-semibold text-purple-800 text-xs uppercase">
                {form.receiptDescCode || paymentMethodToShortCode(form.paymentMethod)}
              </td>
              <td className="py-3.5 px-4 text-center text-gray-600">{num(it.quantity) || '—'}</td>
              <td className="py-3.5 px-4 text-right text-gray-600">{num(it.unit_price) ? formatINR(num(it.unit_price)) : '—'}</td>
              <td className="py-3.5 px-4 text-right font-medium text-gray-900">
                {formatINR(num(it.quantity) * num(it.unit_price))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200">
            <td colSpan={4} className="py-2.5 px-4 text-right text-sm font-medium text-gray-600">Subtotal</td>
            <td className="py-2.5 px-4 text-right font-semibold text-gray-800">{formatINR(t.subtotal)}</td>
          </tr>
          {t.discount > 0 && (
            <tr>
              <td colSpan={4} className="py-2.5 px-4 text-right text-sm font-medium text-gray-600">Discount</td>
              <td className="py-2.5 px-4 text-right font-medium text-red-600">− {formatINR(t.discount)}</td>
            </tr>
          )}
          {num(form.taxRate) > 0 && (
            <tr>
              <td colSpan={4} className="py-2.5 px-4 text-right text-sm font-medium text-gray-600">
                Tax ({num(form.taxRate)}%)
              </td>
              <td className="py-2.5 px-4 text-right font-medium text-gray-800">+ {formatINR(t.taxAmt)}</td>
            </tr>
          )}
          <tr className="bg-gray-50">
            <td colSpan={4} className="py-3 px-4 text-right text-sm font-semibold text-gray-600">Total</td>
            <td className="py-3 px-4 text-right font-bold text-blue-800 text-base">{formatINR(t.total)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Status & Payment Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            form.status === 'Paid'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {form.status}
          </span>
          {form.paymentMethod && (
            <span className="text-xs text-gray-600">
              <span className="font-semibold text-gray-700">Payment Method:</span> {form.paymentMethod}
            </span>
          )}
          {form.paymentRef && (
            <span className="text-xs text-gray-600">
              <span className="font-semibold text-gray-700">Ref:</span> {form.paymentRef}
            </span>
          )}
        </div>
      </div>

      {/* Bank Details + QR Code + Amount in Words + Remarks + Cancellation Note */}
      <PaymentQrSection
        bankDetails={form.bankDetails}
        upiVpa={form.upiVpa}
        showQr={form.showQr}
        amountInWords={autoWords}
        remarks={form.remarks}
        cancellationNote={form.cancellationNote}
      />

      {/* Linked Previous Bills */}
      {form.linkedBills.length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Attached / Linked Previous Bills ({form.linkedBills.length})
          </p>
          <div className="space-y-1.5">
            {form.linkedBills.map((lb) => (
              <div
                key={lb.id}
                className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded border border-gray-200"
              >
                <div>
                  <span className="font-semibold text-gray-800">#{lb.billNumber}</span>
                  <span className="text-gray-500 ml-2">{lb.description}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{formatINR(lb.amount)}</span>
                  {lb.date && <span className="text-gray-400 ml-2">({fmtDate(lb.date)})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Attachments */}
      {form.attachments.length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Attached Documents ({form.attachments.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {form.attachments.map((att, idx) => (
              <a
                key={idx}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 hover:bg-blue-100"
              >
                <Paperclip size={12} />
                {att.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {form.notes && (
        <div className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
          <p className="font-semibold mb-1 text-gray-600">Additional Notes</p>
          <p className="whitespace-pre-line">{form.notes}</p>
        </div>
      )}
    </div>
  );
}

// ── CreateInvoicePage ────────────────────────────────────────────────────────

export default function CreateInvoicePage() {
  const router = useRouter();
  const [form, setForm] = useState(initForm());
  const [previewMode, setPreviewMode] = useState<'receipt' | 'invoice'>('receipt');
  const [showBankEditor, setShowBankEditor] = useState(false);
  const [showQrCardPreview, setShowQrCardPreview] = useState(false);
  const [societiesList, setSocietiesList] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Suggestions state for Bill Number & Client Name
  const [billSuggestions, setBillSuggestions] = useState<BillSuggestion[]>([]);
  const [nameSuggestions, setNameSuggestions] = useState<BillSuggestion[]>([]);
  const [showBillDropdown, setShowBillDropdown] = useState(false);
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [loadingBillLookup, setLoadingBillLookup] = useState(false);
  const [loadingNameLookup, setLoadingNameLookup] = useState(false);

  // Previous bills for the selected client
  const [clientHistory, setClientHistory] = useState<BillSuggestion[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [previewHistoryBill, setPreviewHistoryBill] = useState<BillSuggestion | null>(null);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const billWrapperRef = useRef<HTMLDivElement>(null);
  const nameWrapperRef = useRef<HTMLDivElement>(null);
  const billTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load unique society names for Society Name datalist
  useEffect(() => {
    fetch('/api/master-data/societies')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.societies)) {
          setSocietiesList(d.societies);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (billWrapperRef.current && !billWrapperRef.current.contains(e.target as Node)) {
        setShowBillDropdown(false);
      }
      if (nameWrapperRef.current && !nameWrapperRef.current.contains(e.target as Node)) {
        setShowNameDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const set = (k: keyof Form, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setItem = (i: number, k: keyof LineItem, v: string) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)),
    }));

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }));

  const removeItem = (i: number) =>
    setForm((f) => ({
      ...f,
      items: f.items.length > 1 ? f.items.filter((_, idx) => idx !== i) : f.items,
    }));

  const updateBankDetail = (idx: number, key: keyof BankAccountItem, val: string) => {
    setForm((f) => ({
      ...f,
      bankDetails: f.bankDetails.map((b, i) => (i === idx ? { ...b, [key]: val } : b)),
    }));
  };

  // Sync Society Name + Plot No + Plot Size -> Subject & Address automatically if convenient
  const handlePropertyFieldChange = (
    field: 'societyName' | 'plotNo' | 'plotSize',
    value: string
  ) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      const subjParts = [
        next.societyName.trim(),
        next.plotNo.trim() ? `Plot No. ${next.plotNo.trim()}` : '',
        next.plotSize.trim() ? `(${next.plotSize.trim()})` : '',
      ].filter(Boolean);
      const addrParts = [
        next.societyName.trim(),
        next.plotNo.trim() ? `Plot No. ${next.plotNo.trim()}` : '',
      ].filter(Boolean);
      return {
        ...next,
        description: subjParts.length > 0 ? subjParts.join(' – ') : prev.description,
        clientAddress: addrParts.length > 0 ? addrParts.join(', ') : prev.clientAddress,
      };
    });
  };

  // Fetch client's previous bills history whenever a client is selected or typed
  const fetchClientHistory = async (clientName: string) => {
    const trimmed = clientName.trim();
    if (!trimmed || trimmed.length < 2) {
      setClientHistory([]);
      return;
    }
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/bills/lookup?historyFor=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        setClientHistory(data.history || []);
      }
    } catch {
      // Ignore lookup errors
    } finally {
      setLoadingHistory(false);
    }
  };

  // Apply a suggestion to auto-fill ALL fields in the form
  const applySuggestion = (s: BillSuggestion, mode: 'by-bill' | 'by-name') => {
    const refBy =
      s.referenceBy ||
      [s.brokerCode, s.brokerName].filter(Boolean).join('/') ||
      '';
    const method = s.paymentMethod || 'Cheque';
    const shortCode = paymentMethodToShortCode(method);

    setForm((prev) => ({
      ...prev,
      billNumber: mode === 'by-bill' ? s.billNumber : prev.billNumber || makeBillNumber(),
      clientName: s.clientName || prev.clientName,
      clientPhone: s.clientPhone || prev.clientPhone,
      societyName: s.societyName || prev.societyName,
      plotNo: s.plotNo || prev.plotNo,
      plotSize: s.plotSize || prev.plotSize,
      referenceBy: refBy || prev.referenceBy,
      totalEmiNo: s.emiNo || s.emiTime || prev.totalEmiNo,
      plotAmount: s.plotAmount ? String(s.plotAmount) : prev.plotAmount,
      clientAddress: s.clientAddress || prev.clientAddress,
      description: s.description || prev.description,
      receiptDescCode: shortCode || prev.receiptDescCode,
      items:
        s.items && s.items.length > 0
          ? s.items.map((it) => ({
              description: it.description,
              quantity: String(it.quantity || 1),
              unit_price: String(it.unit_price || 0),
            }))
          : prev.items,
      discount: s.discount ? String(s.discount) : prev.discount,
      taxRate: s.taxRate ? String(s.taxRate) : prev.taxRate,
      date: mode === 'by-bill' && s.date ? s.date : prev.date,
      dueDate: s.dueDate || prev.dueDate,
      status: s.status || prev.status,
      paymentMethod: method,
      paymentRef: s.paymentRef || prev.paymentRef,
      remarks: s.remarks || prev.remarks,
      cancellationNote: s.cancellationNote || prev.cancellationNote,
      notes: s.notes || prev.notes,
      attachments: s.attachments && s.attachments.length > 0 ? s.attachments : prev.attachments,
    }));
    setShowBillDropdown(false);
    setShowNameDropdown(false);
    if (s.clientName) {
      void fetchClientHistory(s.clientName);
    }
  };

  // Debounced lookup when typing Bill Number
  const handleBillNumberChange = (val: string) => {
    set('billNumber', val);
    if (billTimerRef.current) clearTimeout(billTimerRef.current);
    const q = val.trim();
    if (!q || q.startsWith('BILL-20')) {
      if (q.length < 2) {
        setBillSuggestions([]);
        setShowBillDropdown(false);
        return;
      }
    }
    billTimerRef.current = setTimeout(async () => {
      setLoadingBillLookup(true);
      try {
        const res = await fetch(`/api/bills/lookup?field=bill&q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setBillSuggestions(data.suggestions || []);
          setShowBillDropdown((data.suggestions || []).length > 0);
        }
      } finally {
        setLoadingBillLookup(false);
      }
    }, 220);
  };

  // Debounced lookup when typing Client Name
  const handleClientNameChange = (val: string) => {
    set('clientName', val);
    if (nameTimerRef.current) clearTimeout(nameTimerRef.current);
    const q = val.trim();
    if (q.length < 2) {
      setNameSuggestions([]);
      setShowNameDropdown(false);
      return;
    }
    nameTimerRef.current = setTimeout(async () => {
      setLoadingNameLookup(true);
      try {
        const res = await fetch(`/api/bills/lookup?field=name&q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setNameSuggestions(data.suggestions || []);
          setShowNameDropdown((data.suggestions || []).length > 0);
        }
      } finally {
        setLoadingNameLookup(false);
      }
    }, 220);
  };

  // Toggle attaching a previous bill to this invoice
  const toggleAttachPreviousBill = (b: BillSuggestion) => {
    setForm((prev) => {
      const exists = prev.linkedBills.some((x) => x.id === b.id);
      const nextLinked = exists
        ? prev.linkedBills.filter((x) => x.id !== b.id)
        : [
            ...prev.linkedBills,
            {
              id: b.id,
              billNumber: b.billNumber,
              date: b.date,
              amount: b.amount,
              description: b.description,
            },
          ];
      return { ...prev, linkedBills: nextLinked };
    });
  };

  // Add a previous bill's line items directly into the current invoice's line items
  const addPreviousBillToItems = (b: BillSuggestion) => {
    setForm((prev) => {
      const newLine: LineItem = {
        description: `Prev Bill #${b.billNumber} – ${b.description || 'Installment'} (${fmtDate(b.date)})`,
        quantity: '1',
        unit_price: String(b.amount || 0),
      };
      const existingNonEmpty = prev.items.filter((it) => it.description.trim() || num(it.unit_price) > 0);
      return {
        ...prev,
        items: [...existingNonEmpty, newLine],
      };
    });
  };

  // Handle uploading a receipt/bill file (PDF or image)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setSaveError(null);
    try {
      const uploaded: AttachmentItem[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/uploads', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        uploaded.push({
          name: data.name || file.name,
          url: data.url,
          type: data.type || file.type,
        });
      }
      setForm((prev) => ({ ...prev, attachments: [...prev.attachments, ...uploaded] }));
    } catch (err: any) {
      setSaveError(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== idx),
    }));
  };

  const t = totals(form);
  const computedWords =
    form.customWords && form.amountInWords.trim()
      ? form.amountInWords.trim()
      : numberToIndianWords(t.total);

  function validate(): string | null {
    if (!form.clientName.trim()) return 'Party / Client name is required';
    const hasItem = form.items.some((it) => it.description.trim() && num(it.unit_price) > 0);
    if (!hasItem) return 'Add at least one item with a description and rate';
    if (t.total <= 0) return 'Total must be greater than zero';
    return null;
  }

  async function saveToSupabase(): Promise<string> {
    const res = await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        billNumber:       form.billNumber,
        clientName:       form.clientName,
        clientPhone:      form.clientPhone,
        societyName:      form.societyName,
        plotNo:           form.plotNo,
        plotSize:         form.plotSize,
        referenceBy:      form.referenceBy,
        totalEmiNo:       form.totalEmiNo,
        plotAmount:       num(form.plotAmount),
        clientAddress:    form.clientAddress,
        description:      form.description || [form.societyName, form.plotNo ? `Plot No. ${form.plotNo}` : ''].filter(Boolean).join(' – '),
        items:            form.items
          .filter((it) => it.description.trim() && num(it.unit_price) > 0)
          .map((it) => ({ description: it.description.trim(), quantity: num(it.quantity), unit_price: num(it.unit_price) })),
        taxRate:          num(form.taxRate),
        discount:         num(form.discount),
        amount:           t.total,
        amountInWords:    computedWords,
        remarks:          form.remarks,
        cancellationNote: form.cancellationNote,
        bankDetails:      form.bankDetails,
        upiVpa:           form.upiVpa,
        showQr:           form.showQr,
        date:             form.date,
        dueDate:          form.dueDate || null,
        notes:            form.notes,
        status:           form.status,
        paymentMethod:    form.receiptDescCode || form.paymentMethod,
        paymentRef:       form.paymentRef,
        attachments:      form.attachments,
        linkedBillIds:    form.linkedBills,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Save failed');
    return data.id as string;
  }

  const handleSave = async () => {
    const err = validate();
    if (err) { setSaveError(err); return; }
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
    const err = validate();
    if (err) { setSaveError(err); return; }
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
            padding: 16px !important;
            background: white !important;
          }
          .no-print { display: none !important; }
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
                Create New Receipt / Invoice
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Includes all Gurukrupa Corporation Receipt fields (Society Name, Plot No., Plot Size, Reference By, Total EMI No., Amount in Words, Remarks, Bank Details & Karnataka Bank Payment QR Code).
              </p>
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

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

            {/* ── Form ─── */}
            <div className="xl:col-span-5 bg-white rounded-lg shadow-sm p-6 space-y-5 h-fit">
              <h2 className="text-base font-semibold text-gray-800 border-b pb-3">
                Receipt & Date Details
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {/* Bill / Receipt Number with Autocomplete */}
                <div className="col-span-2 relative" ref={billWrapperRef}>
                  <label className={labelCls}>
                    Receipt / Bill No. <span className="text-[10px] font-normal text-blue-600 lowercase">(type to search & auto-fill)</span>
                  </label>
                  <div className="relative">
                    <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      className={`${inputCls} pl-8 pr-8`}
                      placeholder="e.g. 0/86916 or BILL-2026..."
                      value={form.billNumber}
                      onFocus={() => {
                        if (billSuggestions.length > 0) setShowBillDropdown(true);
                      }}
                      onChange={(e) => handleBillNumberChange(e.target.value)}
                    />
                    {loadingBillLookup && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                    )}
                  </div>

                  {/* Bill Number Suggestions Dropdown */}
                  {showBillDropdown && billSuggestions.length > 0 && (
                    <div className="absolute z-30 left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl divide-y divide-gray-100">
                      <div className="px-3 py-1.5 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
                        <span>Matching Bills / Receipts</span>
                        <span>Click to auto-fill all</span>
                      </div>
                      {billSuggestions.map((s) => (
                        <button
                          key={`${s.source}-${s.id}`}
                          type="button"
                          onClick={() => applySuggestion(s, 'by-bill')}
                          className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors flex items-start justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                #{s.billNumber}
                              </span>
                              <span className="text-xs font-semibold text-gray-900 truncate">
                                {s.clientName}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {s.description} {s.brokerCode || s.brokerName ? `· Ref: ${s.brokerCode || s.brokerName}` : ''}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-emerald-700">{formatINR(s.amount)}</p>
                            <p className="text-[10px] text-gray-400">{fmtDate(s.date)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Receipt Date</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.date}
                    onChange={(e) => set('date', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelCls}>Total EMI No.</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. 17"
                    value={form.totalEmiNo}
                    onChange={(e) => set('totalEmiNo', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelCls}>Due Date (Optional)</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.dueDate}
                    onChange={(e) => set('dueDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    className={inputCls}
                    value={form.status}
                    onChange={(e) => set('status', e.target.value as 'Pending' | 'Paid')}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <h2 className="text-base font-semibold text-gray-800 border-b pb-3 pt-2">
                Party & Plot Details (Receipt Fields)
              </h2>

              {/* Party Name with Autocomplete */}
              <div className="relative" ref={nameWrapperRef}>
                <label className={labelCls}>
                  Party Name (Client Name) <span className="text-red-500">*</span>{' '}
                  <span className="text-[10px] font-normal text-blue-600 lowercase">(type name or mobile to auto-fill)</span>
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className={`${inputCls} pl-8 pr-8`}
                    placeholder="e.g. SINTU KALICHARAN CHAUHAN..."
                    value={form.clientName}
                    onFocus={() => {
                      if (nameSuggestions.length > 0) setShowNameDropdown(true);
                    }}
                    onChange={(e) => handleClientNameChange(e.target.value)}
                  />
                  {loadingNameLookup && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  )}
                </div>

                {/* Client Name Suggestions Dropdown */}
                {showNameDropdown && nameSuggestions.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl divide-y divide-gray-100">
                    <div className="px-3 py-1.5 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
                      <span>Matching Parties & Plots</span>
                      <span>Click to auto-fill all</span>
                    </div>
                    {nameSuggestions.map((s) => (
                      <button
                        key={`${s.source}-${s.id}`}
                        type="button"
                        onClick={() => applySuggestion(s, 'by-name')}
                        className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-900 truncate">
                              {s.clientName}
                            </span>
                            {s.clientPhone && (
                              <span className="text-[11px] text-gray-500">({s.clientPhone})</span>
                            )}
                          </div>
                          <p className="text-xs text-blue-700 font-medium mt-0.5 truncate">
                            {s.societyName ? `${s.societyName} · Plot ${s.plotNo || '—'}${s.plotSize ? ` (${s.plotSize})` : ''}` : s.description}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                            Receipt #{s.billNumber} {s.brokerCode || s.brokerName ? `· Ref: ${s.brokerCode || s.brokerName}` : ''}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-emerald-700">{formatINR(s.amount)}</p>
                          {s.plotAmount > 0 && (
                            <p className="text-[10px] text-gray-400">Plot: {formatINR(s.plotAmount)}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Mobile No.</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. 7041981254"
                    value={form.clientPhone}
                    onChange={(e) => set('clientPhone', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelCls}>Reference By (Broker Code)</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. GKC/30/RJS/RS"
                    value={form.referenceBy}
                    onChange={(e) => set('referenceBy', e.target.value)}
                  />
                </div>

                <div className="col-span-2">
                  <label className={labelCls}>Society Name</label>
                  <input
                    list="gurukrupa-societies-list"
                    className={inputCls}
                    placeholder="e.g. GURUKRUPA PARK, ROYAL CITY ( B/BLOCK )..."
                    value={form.societyName}
                    onChange={(e) => handlePropertyFieldChange('societyName', e.target.value)}
                  />
                  <datalist id="gurukrupa-societies-list">
                    {societiesList.map((soc) => (
                      <option key={soc} value={soc} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className={labelCls}>Plot No.</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. 45"
                    value={form.plotNo}
                    onChange={(e) => handlePropertyFieldChange('plotNo', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelCls}>Plot Size</label>
                  <input
                    list="gurukrupa-plot-sizes"
                    className={inputCls}
                    placeholder="e.g. 14*40"
                    value={form.plotSize}
                    onChange={(e) => handlePropertyFieldChange('plotSize', e.target.value)}
                  />
                  <datalist id="gurukrupa-plot-sizes">
                    <option value="14*40" />
                    <option value="14*42" />
                    <option value="14*45" />
                    <option value="15*40" />
                    <option value="12*40" />
                    <option value="20*40" />
                  </datalist>
                </div>
              </div>

              <div>
                <label className={labelCls}>Subject / Property Summary</label>
                <input
                  className={inputCls}
                  placeholder="e.g. GURUKRUPA PARK – Plot No. 45 (14*40)"
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                />
              </div>

              {/* ── Previous Bills for this Client (View / Attach / Load) ─── */}
              {(clientHistory.length > 0 || loadingHistory) && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FileText size={15} className="text-blue-700" />
                      <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                        Previous Bills for {form.clientName} ({clientHistory.length})
                      </span>
                    </div>
                    {loadingHistory && (
                      <span className="text-[11px] text-blue-600">Loading history…</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-600">
                    View past bills, attach them as references to this invoice, or copy their details.
                  </p>
                  <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                    {clientHistory.map((hb) => {
                      const isAttached = form.linkedBills.some((x) => x.id === hb.id);
                      return (
                        <div
                          key={`${hb.source}-${hb.id}`}
                          className="bg-white border border-gray-200 rounded-md p-2.5 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-bold text-blue-700">#{hb.billNumber}</span>
                              <span className="text-gray-400">·</span>
                              <span className="font-semibold text-gray-800">{formatINR(hb.amount)}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${hb.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {hb.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">
                              {hb.description} · {fmtDate(hb.date)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewHistoryBill(hb)}
                              title="View this bill"
                              className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-700 flex items-center gap-1 text-[11px] font-medium"
                            >
                              <Eye size={12} /> View
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleAttachPreviousBill(hb)}
                              title={isAttached ? 'Detach from this bill' : 'Attach reference to this bill'}
                              className={`px-2 py-1 rounded border flex items-center gap-1 text-[11px] font-medium ${
                                isAttached
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                              }`}
                            >
                              <Link2 size={12} /> {isAttached ? 'Attached' : 'Attach'}
                            </button>
                            <button
                              type="button"
                              onClick={() => addPreviousBillToItems(hb)}
                              title="Add as line item"
                              className="px-2 py-1 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 text-[11px] font-medium"
                            >
                              <Plus size={12} /> Item
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <h2 className="text-base font-semibold text-gray-800 border-b pb-3 pt-2">
                Amount & Line Items
              </h2>

              <div className="space-y-3">
                {form.items.map((it, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-6">
                      {i === 0 && <label className={labelCls}>Description</label>}
                      <input
                        className={inputCls}
                        placeholder="e.g. EMI #17 / Booking Installment"
                        value={it.description}
                        onChange={(e) => setItem(i, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <label className={labelCls}>Qty</label>}
                      <input
                        className={inputCls}
                        type="number"
                        min="0"
                        step="1"
                        value={it.quantity}
                        onChange={(e) => setItem(i, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      {i === 0 && <label className={labelCls}>Net Amount (₹)</label>}
                      <input
                        className={inputCls}
                        type="text"
                        inputMode="decimal"
                        placeholder="3,500"
                        value={it.unit_price}
                        onChange={(e) => setItem(i, 'unit_price', e.target.value)}
                      />
                      {num(it.unit_price) > 0 && (
                        <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          ₹{num(it.unit_price).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1 pt-1 flex justify-center">
                      {i === 0 && <label className={`${labelCls} invisible`}>.</label>}
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        disabled={form.items.length === 1}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md disabled:opacity-30"
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <Plus size={15} /> Add item
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className={labelCls}>Discount (₹)</label>
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.discount}
                    onChange={(e) => set('discount', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Tax / GST %</label>
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={form.taxRate}
                    onChange={(e) => set('taxRate', e.target.value)}
                  />
                </div>
              </div>

              {/* Running total */}
              <div className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
                <span className="text-sm font-semibold text-blue-900">Net Total Amount</span>
                <span className="text-lg font-bold text-blue-800">{formatINR(t.total)}</span>
              </div>

              {/* Amount in Words (AMT IN WORD) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Amt in Word
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[11px] text-blue-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.customWords}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setForm((prev) => ({
                          ...prev,
                          customWords: checked,
                          amountInWords: checked
                            ? prev.amountInWords || numberToIndianWords(t.total)
                            : '',
                        }));
                      }}
                      className="rounded border-gray-300"
                    />
                    <span>Edit manually</span>
                  </label>
                </div>
                <input
                  className={`${inputCls} ${!form.customWords ? 'bg-gray-50 text-gray-700 font-semibold' : ''}`}
                  readOnly={!form.customWords}
                  placeholder="Auto-generated from total (e.g. THREE THOUSAND FIVE HUNDRED RUPEES ONLY.)"
                  value={computedWords}
                  onChange={(e) => set('amountInWords', e.target.value)}
                />
              </div>

              <h2 className="text-base font-semibold text-gray-800 border-b pb-3 pt-2">
                Payment Mode, Remarks & QR Code
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Receipt Description / Mode</label>
                  <select
                    className={inputCls}
                    value={form.receiptDescCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      const methodMap: Record<string, string> = {
                        CHQ: 'Cheque',
                        CASH: 'Cash',
                        UPI: 'UPI',
                        'BANK TRF': 'Bank Transfer',
                        NEFT: 'Bank Transfer',
                        RTGS: 'Bank Transfer',
                        CARD: 'Card',
                      };
                      setForm((prev) => ({
                        ...prev,
                        receiptDescCode: code,
                        paymentMethod: methodMap[code] || prev.paymentMethod,
                      }));
                    }}
                  >
                    <option value="CHQ">CHQ (Cheque)</option>
                    <option value="CASH">CASH</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK TRF">BANK TRF</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                    <option value="CARD">CARD</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Payment Ref / UTR / Chq No.</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. UPI-664564565198"
                    value={form.paymentRef}
                    onChange={(e) => set('paymentRef', e.target.value)}
                  />
                </div>
              </div>

              {/* REMARKS : */}
              <div>
                <label className={labelCls}>Remarks (Printed on Receipt)</label>
                <input
                  className={inputCls}
                  placeholder="e.g. TRANSFER IN GURUKRUPA AC.(UPI-664564565198/664535457093)"
                  value={form.remarks}
                  onChange={(e) => set('remarks', e.target.value)}
                />
              </div>

              {/* Payment QR Code & Bank Details Box */}
              <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.showQr}
                      onChange={(e) => set('showQr', e.target.checked)}
                      className="rounded border-gray-300 text-purple-700 focus:ring-purple-500 h-4 w-4"
                    />
                    <span className="text-xs font-bold text-purple-950 uppercase tracking-wide flex items-center gap-1.5">
                      <QrCode size={15} className="text-purple-700" />
                      Include Payment QR Code on Bill
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowQrCardPreview(true)}
                    className="text-[11px] font-semibold text-purple-700 hover:underline"
                  >
                    View Full QR Card
                  </button>
                </div>

                {form.showQr && (
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-purple-100">
                    <img
                      src="/gurukrupa-qr.png"
                      alt="Karnataka Bank QR"
                      className="w-16 h-16 object-contain border border-gray-200 rounded shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900">
                        KARNATAKA BANK – GURUKRUPA CORPORATION
                      </p>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase mt-1">
                        UPI VPA ID
                      </label>
                      <input
                        className="w-full px-2 py-1 text-xs font-mono border border-gray-300 rounded bg-gray-50 focus:bg-white"
                        value={form.upiVpa}
                        onChange={(e) => set('upiVpa', e.target.value)}
                        placeholder="gurukrupacorp@kbl"
                      />
                    </div>
                  </div>
                )}

                {/* Collapsible Bank Details Editor */}
                <div className="border-t border-purple-200/70 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBankEditor((v) => !v)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-gray-700 hover:text-gray-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Landmark size={14} className="text-blue-700" />
                      Bank Details on Receipt ({form.bankDetails.length} Banks)
                    </span>
                    {showBankEditor ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {showBankEditor && (
                    <div className="mt-2.5 space-y-2.5">
                      {form.bankDetails.map((b, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-2.5 rounded border border-gray-200 space-y-1.5 text-xs"
                        >
                          <p className="font-bold text-gray-700">Bank #{idx + 1}</p>
                          <input
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            placeholder="Bank Name"
                            value={b.bankName}
                            onChange={(e) => updateBankDetail(idx, 'bankName', e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              className="px-2 py-1 border border-gray-300 rounded text-xs"
                              placeholder="Account No"
                              value={b.accountNo}
                              onChange={(e) => updateBankDetail(idx, 'accountNo', e.target.value)}
                            />
                            <input
                              className="px-2 py-1 border border-gray-300 rounded text-xs"
                              placeholder="IFSC Code"
                              value={b.ifsc}
                              onChange={(e) => updateBankDetail(idx, 'ifsc', e.target.value)}
                            />
                          </div>
                          <input
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            placeholder="VPA (Optional, e.g. gurukrupacorp@kbl)"
                            value={b.vpa || ''}
                            onChange={(e) => updateBankDetail(idx, 'vpa', e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Cancellation Note (NOTE:) */}
              <div>
                <label className={labelCls}>Cancellation / Terms Note</label>
                <textarea
                  className={`${inputCls} resize-none text-xs`}
                  rows={2}
                  value={form.cancellationNote}
                  onChange={(e) => set('cancellationNote', e.target.value)}
                />
              </div>

              {/* File Upload for Bill / Receipt Attachment */}
              <div>
                <label className={labelCls}>Attach Bill / Receipt Document (PDF or Image)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Upload size={14} className="text-blue-600" />
                    {isUploading ? 'Uploading…' : 'Upload Previous Bill / Receipt'}
                  </button>
                </div>

                {form.attachments.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {form.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs"
                      >
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-blue-600 hover:underline truncate"
                        >
                          <Paperclip size={12} />
                          <span className="truncate">{att.name}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-gray-400 hover:text-red-600 ml-2"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Live Preview ─── */}
            <div className="xl:col-span-7 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 no-print">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Live Bill / Receipt Preview
                </p>
                <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('receipt')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      previewMode === 'receipt'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Receipt size={13} />
                    Gurukrupa Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('invoice')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      previewMode === 'invoice'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FileText size={13} />
                    Detailed Invoice
                  </button>
                </div>
              </div>

              <div id="invoice-print-area">
                {previewMode === 'receipt' ? (
                  <GurukrupaReceipt
                    receiptNumber={form.billNumber}
                    date={form.date}
                    partyName={form.clientName}
                    mobileNo={form.clientPhone}
                    societyName={form.societyName}
                    plotNo={form.plotNo}
                    plotSize={form.plotSize}
                    referenceBy={form.referenceBy}
                    totalEmiNo={form.totalEmiNo}
                    paymentDescription={
                      form.receiptDescCode || paymentMethodToShortCode(form.paymentMethod)
                    }
                    netAmount={t.total}
                    amountInWords={computedWords}
                    remarks={
                      form.remarks ||
                      (form.paymentRef ? `${form.paymentMethod.toUpperCase()} (${form.paymentRef})` : '')
                    }
                    cancellationNote={form.cancellationNote}
                    bankDetails={form.bankDetails}
                    upiVpa={form.upiVpa}
                    showQr={form.showQr}
                  />
                ) : (
                  <InvoicePreview form={form} />
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Modal to View Full Karnataka Bank QR Card ─── */}
      {showQrCardPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 no-print"
          onClick={() => setShowQrCardPreview(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-purple-900 text-white">
              <div className="flex items-center gap-2">
                <QrCode size={18} />
                <span className="text-sm font-bold">
                  Karnataka Bank – Payment QR Code
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowQrCardPreview(false)}
                className="p-1 rounded hover:bg-purple-800 text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 flex flex-col items-center bg-white">
              <img
                src="/gurukrupa-qr-card.png"
                alt="Gurukrupa Corporation Karnataka Bank QR Card"
                className="max-h-[460px] w-auto object-contain rounded border border-gray-200"
              />
              <p className="text-xs font-semibold text-gray-700 mt-3">
                VPA: <span className="font-mono text-purple-800">{form.upiVpa || DEFAULT_UPI_VPA}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal to View a Previous Bill in Detail ─── */}
      {previewHistoryBill && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Bill / Receipt #{previewHistoryBill.billNumber}
                </h3>
                <p className="text-xs text-gray-500">
                  Date: {fmtDate(previewHistoryBill.date)} · Status: {previewHistoryBill.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewHistoryBill(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>
                  <p className="text-[11px] uppercase text-gray-400 font-semibold">Party Name</p>
                  <p className="font-semibold text-gray-900">{previewHistoryBill.clientName}</p>
                  {previewHistoryBill.clientPhone && (
                    <p className="text-xs text-gray-600">{previewHistoryBill.clientPhone}</p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] uppercase text-gray-400 font-semibold">Net Amount</p>
                  <p className="text-base font-bold text-emerald-700">{formatINR(previewHistoryBill.amount)}</p>
                  <p className="text-xs text-gray-500">Mode: {previewHistoryBill.paymentMethod}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-gray-400 block uppercase text-[10px]">Society</span>
                  <span className="font-semibold text-gray-800">{previewHistoryBill.societyName || '—'}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-gray-400 block uppercase text-[10px]">Plot No / Size</span>
                  <span className="font-semibold text-gray-800">
                    {previewHistoryBill.plotNo || '—'} {previewHistoryBill.plotSize ? `(${previewHistoryBill.plotSize})` : ''}
                  </span>
                </div>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-gray-400 block uppercase text-[10px]">Total EMI No.</span>
                  <span className="font-semibold text-gray-800">{previewHistoryBill.emiNo || '—'}</span>
                </div>
              </div>

              {(previewHistoryBill.referenceBy || previewHistoryBill.brokerName) && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Reference By (Broker)</p>
                  <p className="text-gray-800">
                    {previewHistoryBill.referenceBy || previewHistoryBill.brokerName}{' '}
                    {previewHistoryBill.brokerCode && !previewHistoryBill.referenceBy
                      ? `(${previewHistoryBill.brokerCode})`
                      : ''}
                  </p>
                </div>
              )}

              {previewHistoryBill.remarks && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Remarks</p>
                  <p className="text-xs text-gray-700 font-medium">{previewHistoryBill.remarks}</p>
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.open(`/invoices/${previewHistoryBill.id}`, '_blank')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
              >
                <ExternalLink size={13} /> Open Full Invoice Page
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    applySuggestion(previewHistoryBill, 'by-bill');
                    setPreviewHistoryBill(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                >
                  Fill Form From This Bill
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewHistoryBill(null)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
