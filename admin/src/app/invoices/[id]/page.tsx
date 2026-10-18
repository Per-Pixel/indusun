'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  Calendar,
  DollarSign,
  User,
  Building,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Receipt,
} from 'lucide-react';
import CRMLayout from '@/components/CRMLayout';
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

// Types for invoices (same as in the listing page)
interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string | null;
  dueDate: string | null;
  amount: string;
  amountNum?: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  societyName?: string | null;
  plotNo?: string | null;
  plotSize?: string | null;
  referenceBy?: string | null;
  totalEmiNo?: string | null;
  amountInWords?: string | null;
  remarks?: string | null;
  cancellationNote?: string | null;
  bankDetails?: BankAccountItem[];
  upiVpa?: string | null;
  showQr?: boolean;
  client: {
    name: string;
    type: 'Individual' | 'Company';
    id: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  property?: {
    id: string;
    title: string;
  };
  generatedBy: 'System' | 'Admin' | 'Broker';
  generatorName?: string;
  paymentMethod?: string;
  paymentRef?: string | null;
  notes?: string | null;
  subtotal?: string;
  taxRate?: number;
  taxAmount?: string;
  discount?: string;
  attachments?: { name: string; url: string; type?: string }[];
  linkedBillIds?: { id: string; billNumber: string; date: string; amount: number; description: string }[];
  items: {
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }[];
}

const getStatusColor = (status: Invoice['status']) => {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: Invoice['status']) => {
  switch (status) {
    case 'Paid':
      return <CheckCircle size={16} className="mr-1" />;
    case 'Pending':
      return <Clock size={16} className="mr-1" />;
    case 'Overdue':
      return <AlertCircle size={16} className="mr-1" />;
    default:
      return null;
  }
};

const getGeneratorIcon = (generator: Invoice['generatedBy'], extraClasses = '') => {
  switch (generator) {
    case 'System':
      return <Building size={16} className={`mr-1 ${extraClasses}`} />;
    case 'Admin':
      return <User size={16} className={`mr-1 ${extraClasses}`} />;
    case 'Broker':
      return <Users size={16} className={`mr-1 ${extraClasses}`} />;
    default:
      return null;
  }
};

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [viewMode, setViewMode] = useState<'receipt' | 'invoice'>('receipt');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [markPaidError, setMarkPaidError] = useState<string | null>(null);

  // Bills (id `b<n>`) update via /api/bills; master-data invoices via /api/billing.
  const markAsPaid = async () => {
    if (!invoice) return;
    setIsMarkingPaid(true);
    setMarkPaidError(null);
    try {
      const isBill = invoice.id.startsWith('b');
      const res = await fetch(isBill ? '/api/bills' : '/api/billing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: isBill ? invoice.id.slice(1) : invoice.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to mark as paid');
      setInvoice(prev => prev ? { ...prev, status: 'Paid' } : prev);
    } catch (e: any) {
      setMarkPaidError(e.message);
    } finally {
      setIsMarkingPaid(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/invoices/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(r.status === 404 ? 'Invoice not found' : `HTTP ${r.status}`)))
      .then(data => {
        if (cancelled) return;
        const inv = data.invoice;
        setInvoice(inv);
      })
      .catch((e: any) => { if (!cancelled) setFetchError(e.message || 'Failed to load invoice'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (isLoading) {
    return (
      <CRMLayout>
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading invoice…</p>
        </div>
      </CRMLayout>
    );
  }

  if (fetchError || !invoice) {
    return (
      <CRMLayout>
        <div className="page-container">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Invoice Not Found</h1>
            {fetchError && <p className="text-sm text-gray-500 mb-2">{fetchError}</p>}
            <button onClick={() => router.push('/invoices')} className="btn btn-primary btn-sm">Back to Invoices</button>
          </div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <style>{`
        @media print {
          body > * { visibility: hidden !important; }
          #invoice-print-area, #invoice-print-area * { visibility: visible !important; }
          #invoice-print-area { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; padding: 24px !important; background: white !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="page-container">
        <div className="max-w-7xl mx-auto">
            {/* Back Button and Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 no-print">
              <div>
                <button
                  onClick={() => router.push('/invoices')}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-2 md:mb-0"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  <span>Back to Invoices</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Invoice #{invoice.invoiceNumber}</h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 mr-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('receipt')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      viewMode === 'receipt'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Receipt size={14} />
                    Gurukrupa Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('invoice')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      viewMode === 'invoice'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FileText size={14} />
                    Detailed Invoice
                  </button>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  title="Download / Save as PDF"
                >
                  <Download size={16} />
                  <span>Download PDF</span>
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Printer size={16} />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <div id="invoice-print-area">
            {viewMode === 'receipt' && (
              <div className="mb-6">
                <GurukrupaReceipt
                  receiptNumber={invoice.invoiceNumber}
                  date={invoice.date}
                  partyName={invoice.client.name}
                  mobileNo={invoice.client.phone}
                  societyName={invoice.societyName || invoice.property?.title}
                  plotNo={invoice.plotNo}
                  plotSize={invoice.plotSize}
                  referenceBy={invoice.referenceBy}
                  totalEmiNo={invoice.totalEmiNo}
                  paymentDescription={paymentMethodToShortCode(invoice.paymentMethod)}
                  netAmount={
                    invoice.amountNum ??
                    (parseFloat(String(invoice.amount || '').replace(/[^\d.]/g, '')) || 0)
                  }
                  amountInWords={invoice.amountInWords}
                  remarks={invoice.remarks || invoice.notes}
                  cancellationNote={invoice.cancellationNote || DEFAULT_CANCELLATION_NOTE}
                  bankDetails={
                    invoice.bankDetails && invoice.bankDetails.length > 0
                      ? invoice.bankDetails
                      : DEFAULT_BANK_DETAILS
                  }
                  upiVpa={invoice.upiVpa || DEFAULT_UPI_VPA}
                  showQr={invoice.showQr !== false}
                />
              </div>
            )}
            {/* Invoice Content */}
            <div className={viewMode === 'receipt' ? 'no-print' : ''}>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              {/* Invoice Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      <FileText size={20} className="text-blue-600 mr-2" />
                      <h2 className="text-lg font-medium">Invoice Details</h2>
                    </div>
                    <div className="flex items-center mt-4">
                      {/* Status text */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-900`}>
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Invoice Date</p>
                      <div className="flex items-center mt-1">
                        <Calendar size={16} className="text-gray-400 mr-1" />
                        {/* Date values */}
                        <p className="text-sm font-medium text-gray-900">{invoice.date ? new Date(invoice.date).toLocaleDateString('en-IN') : '—'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <div className="flex items-center mt-1">
                        <Calendar size={16} className="text-gray-400 mr-1" />
                        {/* Date values */}
                        <p className="text-sm font-medium text-gray-900">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : '—'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Invoice Number</p>
                      {/* Invoice number */}
                      <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Generated By</p>
                      {/* Generator info */}
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        {getGeneratorIcon(invoice.generatedBy, 'text-gray-700')}
                        <span className="ml-1">{invoice.generatedBy} {invoice.generatorName ? `(${invoice.generatorName})` : ''}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client and Property Info */}
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client Info */}
                  <div>
                    <div className="flex items-center mb-3">
                      <User size={18} className="text-gray-500 mr-2" />
                      <h3 className="font-medium">Client Information</h3>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      {/* Client details */}
                      <p className="font-medium text-gray-900">{invoice.client.name}</p>
                      <p className="text-sm text-gray-800">{invoice.client.type}</p>
                      {invoice.client.address && (
                        <p className="text-sm text-gray-800 mt-2">{invoice.client.address}</p>
                      )}
                      {invoice.client.email && (
                        <p className="text-sm text-gray-800 mt-1">{invoice.client.email}</p>
                      )}
                      {invoice.client.phone && (
                        <p className="text-sm text-gray-800 mt-1">{invoice.client.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Property Info (if exists) */}
                  {invoice.property && (
                    <div>
                      <div className="flex items-center mb-3">
                        <Building size={18} className="text-gray-500 mr-2" />
                        <h3 className="font-medium">Property Information</h3>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        {/* Property details */}
                        <p className="font-medium text-gray-900">{invoice.property.title}</p>
                        <button
                          onClick={() => router.push(`/properties/${invoice.property?.id}`)}
                          className="text-sm text-blue-700 hover:text-blue-900 mt-2"
                        >
                          View Property Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice Items */}
              <div className="p-6">
                <h3 className="font-medium mb-4">Invoice Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3 text-center">Quantity</th>
                        <th className="px-6 py-3 text-right">Unit Price</th>
                        <th className="px-6 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoice.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {item.unitPrice}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {item.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      {invoice.subtotal && (
                        <tr>
                          <td colSpan={2} className="px-6 py-2"></td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600 text-right">
                            Subtotal
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {invoice.subtotal}
                          </td>
                        </tr>
                      )}
                      {invoice.discount && invoice.discount !== 'Rs. 0.00' && (
                        <tr>
                          <td colSpan={2} className="px-6 py-2"></td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600 text-right">
                            Discount
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-red-600 text-right">
                            − {invoice.discount}
                          </td>
                        </tr>
                      )}
                      {!!invoice.taxRate && invoice.taxRate > 0 && (
                        <tr>
                          <td colSpan={2} className="px-6 py-2"></td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600 text-right">
                            Tax ({invoice.taxRate}%)
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            + {invoice.taxAmount}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={2} className="px-6 py-4"></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          Total Amount
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900 text-right">
                          {invoice.amount}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

              {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center">
                  <DollarSign size={18} className="text-[#333] mr-2" />
                  <h3 className="font-medium text-[#111]">Payment Information & QR Code</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-[#333] mb-2">Payment Status</h4>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="text-[#333]">{invoice.status}</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[#333] mb-2">Payment Method</h4>
                    <p className="text-sm text-[#333]">{invoice.paymentMethod || '—'}</p>
                  </div>
                  {invoice.paymentRef && (
                    <div>
                      <h4 className="text-sm font-medium text-[#333] mb-2">Payment Reference</h4>
                      <p className="text-sm text-[#333]">{invoice.paymentRef}</p>
                    </div>
                  )}
                  {invoice.referenceBy && (
                    <div>
                      <h4 className="text-sm font-medium text-[#333] mb-2">Reference By (Broker)</h4>
                      <p className="text-sm text-[#333]">{invoice.referenceBy}</p>
                    </div>
                  )}
                </div>

                {/* Bank Details & Karnataka Bank Payment QR Code */}
                <PaymentQrSection
                  bankDetails={
                    invoice.bankDetails && invoice.bankDetails.length > 0
                      ? invoice.bankDetails
                      : DEFAULT_BANK_DETAILS
                  }
                  upiVpa={invoice.upiVpa || DEFAULT_UPI_VPA}
                  showQr={invoice.showQr !== false}
                  amountInWords={
                    invoice.amountInWords ||
                    numberToIndianWords(
                      invoice.amountNum ??
                        (parseFloat(String(invoice.amount || '').replace(/[^\d.]/g, '')) || 0)
                    )
                  }
                  remarks={invoice.remarks}
                  cancellationNote={invoice.cancellationNote || DEFAULT_CANCELLATION_NOTE}
                />

                {invoice.status === 'Pending' || invoice.status === 'Overdue' ? (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    {markPaidError && (
                      <p className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {markPaidError}
                      </p>
                    )}
                    <button
                      onClick={markAsPaid}
                      disabled={isMarkingPaid}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isMarkingPaid ? 'Marking…' : 'Mark as Paid'}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 space-y-6">
                {(invoice.linkedBillIds && invoice.linkedBillIds.length > 0) && (
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="font-medium mb-3 text-[#111]">Attached / Linked Previous Bills</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {invoice.linkedBillIds.map((lb: any, i: number) => (
                        <div
                          key={lb.id || i}
                          onClick={() => lb.id && router.push(`/invoices/${lb.id}`)}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-xs font-mono font-bold text-blue-700">#{lb.billNumber || lb.id}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{lb.description || 'Previous Bill'}</p>
                          </div>
                          <div className="text-right">
                            {lb.amount != null && (
                              <p className="text-xs font-bold text-gray-900">
                                Rs. {Number(lb.amount).toLocaleString('en-IN')}
                              </p>
                            )}
                            {lb.date && <p className="text-[11px] text-gray-500">{lb.date}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(invoice.attachments && invoice.attachments.length > 0) && (
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="font-medium mb-3 text-[#111]">Attached Documents</h3>
                    <div className="flex flex-wrap gap-2">
                      {invoice.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium hover:bg-blue-100"
                        >
                          <FileText size={14} />
                          <span>{att.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3 text-[#111]">Notes</h3>
                    <p className="text-sm text-[#333]">
                      {invoice.notes || 'Thank you for your business. Please make payment by the due date.'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3 text-[#111]">Terms and Conditions</h3>
                    <p className="text-sm text-[#333]">
                      Payment is due within 15 days from the date of invoice. Late payments are subject to a 5% fee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </div>
            </div> {/* end #invoice-print-area */}
        </div>
      </div>
    </CRMLayout>
  );
}
