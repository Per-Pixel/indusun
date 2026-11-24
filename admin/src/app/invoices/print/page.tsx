'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Printer, ArrowLeft } from 'lucide-react';
import CRMLayout from '@/components/CRMLayout';
import {
  GurukrupaReceipt,
  DEFAULT_BANK_DETAILS,
  DEFAULT_CANCELLATION_NOTE,
  DEFAULT_UPI_VPA,
  paymentMethodToShortCode,
} from '@/components/invoices/GurukrupaReceipt';

interface PrintInvoice {
  id: string;
  invoiceNumber: string;
  date: string | null;
  amount: string;
  amountNum?: number;
  societyName?: string | null;
  plotNo?: string | null;
  plotSize?: string | null;
  referenceBy?: string | null;
  totalEmiNo?: string | null;
  amountInWords?: string | null;
  remarks?: string | null;
  notes?: string | null;
  cancellationNote?: string | null;
  bankDetails?: { bankName: string; accountNo: string; ifsc: string; vpa?: string }[];
  upiVpa?: string | null;
  showQr?: boolean;
  paymentMethod?: string | null;
  client: { name: string; phone?: string | null };
  property?: { title?: string };
}

function PrintBatch() {
  const router = useRouter();
  const params = useSearchParams();
  const [invoices, setInvoices] = useState<PrintInvoice[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = (params.get('ids') || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 40);
    if (ids.length === 0) {
      setError('Select at least one bill to print.');
      setLoading(false);
      return;
    }
    Promise.all(
      ids.map(async (id) => {
        const res = await fetch(`/api/invoices/${encodeURIComponent(id)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Could not load ${id}`);
        return data.invoice as PrintInvoice;
      })
    )
      .then(setInvoices)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load bills'))
      .finally(() => setLoading(false));
  }, [params]);

  return (
    <CRMLayout>
      <div className="p-6">
        <div className="max-w-[190mm] mx-auto mb-4 flex items-center justify-between gap-3 no-print">
          <button
            type="button"
            onClick={() => router.push('/invoices')}
            className="inline-flex items-center gap-2 text-sm text-slate-600"
          >
            <ArrowLeft size={16} /> Back to bills
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={invoices.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            <Printer size={16} /> Print {invoices.length} bill{invoices.length === 1 ? '' : 's'}
          </button>
        </div>

        {loading && <p className="text-sm text-slate-500 no-print">Preparing bills…</p>}
        {error && <p className="text-sm text-red-700 no-print">{error}</p>}

        <div className="gk-print-stack">
          {invoices.map((invoice) => (
            <section key={invoice.id} className="gk-print-sheet">
              <GurukrupaReceipt
                receiptNumber={invoice.invoiceNumber}
                date={invoice.date}
                partyName={invoice.client?.name || ''}
                mobileNo={invoice.client?.phone}
                societyName={invoice.societyName || invoice.property?.title}
                plotNo={invoice.plotNo}
                plotSize={invoice.plotSize}
                referenceBy={invoice.referenceBy}
                totalEmiNo={invoice.totalEmiNo}
                paymentDescription={paymentMethodToShortCode(invoice.paymentMethod || undefined)}
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
            </section>
          ))}
        </div>
      </div>
    </CRMLayout>
  );
}

export default function PrintInvoicesPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Preparing bills…</p>}>
      <PrintBatch />
    </Suspense>
  );
}
