import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { parseAmount, normalizeDate, isPaid } from '@/utils/dataUtils';

const MASTER_TABLE = 'Master Data Of Gurukrupa';

export interface BillSuggestion {
  id: string;
  source: 'bill' | 'master';
  billNumber: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  societyName: string;
  projectName: string;
  blockName: string;
  plotNo: string;
  plotSize: string;
  plotAmount: number;
  emiAmount: number;
  paidAmount: number;
  emiNo: string;
  emiTime: string;
  brokerName: string;
  brokerCode: string;
  referenceBy?: string;
  amountInWords?: string;
  remarks?: string;
  cancellationNote?: string;
  description: string;
  items: { description: string; quantity: number; unit_price: number }[];
  amount: number;
  date: string;
  dueDate: string;
  status: 'Paid' | 'Pending';
  paymentMethod: string;
  paymentRef: string;
  notes: string;
  taxRate: number;
  discount: number;
  attachments?: { name: string; url: string; type?: string }[];
  linkedBillIds?: string[];
}

function mapCustomBill(b: any): BillSuggestion {
  const amt = parseFloat(b.amount) || 0;
  const storedItems = Array.isArray(b.items) && b.items.length > 0
    ? b.items.map((it: any) => ({
        description: String(it.description || b.description || 'Property Installment'),
        quantity: Number(it.quantity) || 1,
        unit_price: Number(it.unit_price ?? it.unitPrice) || amt,
      }))
    : [{
        description: b.description || `Bill ${b.bill_number}`,
        quantity: 1,
        unit_price: amt,
      }];

  return {
    id: `b${b.id}`,
    source: 'bill',
    billNumber: b.bill_number || `BILL-${b.id}`,
    clientName: b.client_name || '',
    clientPhone: b.client_phone || '',
    clientAddress: b.client_address || '',
    societyName: b.society_name || b.description || '',
    projectName: b.society_name || '',
    blockName: '',
    plotNo: b.plot_no || '',
    plotSize: b.plot_size || '',
    plotAmount: parseFloat(b.plot_amount) || amt,
    emiAmount: amt,
    paidAmount: b.status === 'Paid' ? amt : 0,
    emiNo: b.total_emi_no || '',
    emiTime: b.total_emi_no || '',
    brokerName: b.reference_by || '',
    brokerCode: b.reference_by || '',
    referenceBy: b.reference_by || '',
    amountInWords: b.amount_in_words || '',
    remarks: b.remarks || '',
    cancellationNote: b.cancellation_note || '',
    description: b.description || '',
    items: storedItems,
    amount: amt,
    date: b.date || new Date().toISOString().split('T')[0],
    dueDate: b.due_date || '',
    status: b.status === 'Paid' ? 'Paid' : 'Pending',
    paymentMethod: b.payment_method || 'Cash',
    paymentRef: b.payment_ref || '',
    notes: b.notes || '',
    taxRate: parseFloat(b.tax_rate) || 0,
    discount: parseFloat(b.discount) || 0,
    attachments: Array.isArray(b.attachments) ? b.attachments : [],
    linkedBillIds: Array.isArray(b.linked_bill_ids) ? b.linked_bill_ids : [],
  };
}

function mapMasterRow(r: any): BillSuggestion {
  const emiAmt = r.emi_amount_num ?? parseAmount(r.emi_amount);
  const paidAmt = r.paid_amount_num ?? parseAmount(r.paid_amount);
  const plotAmt = r.plot_amount_num ?? parseAmount(r.plot_amount);
  const effectiveRate = emiAmt || paidAmt || plotAmt || 0;
  const isoDate = r.emi_paid_date_iso || normalizeDate(r.emi_paid_date) || r.form_date_iso || new Date().toISOString().split('T')[0];
  const paid = isPaid(r.emi_paid_date);
  const billNo = r.registration_no || r.r_no || (r.emi_no ? `EMI-${r.emi_no}-${r.id}` : `INV-${String(r.id).padStart(6, '0')}`);

  const subjectParts = [
    r.society_name,
    r.plot_no ? `Plot No. ${r.plot_no}` : null,
    r.plot_size ? `(${r.plot_size})` : null,
  ].filter(Boolean);
  const subject = subjectParts.join(' – ') || 'Property Booking / Installment';

  const itemDescParts = [
    r.emi_no ? `EMI #${r.emi_no}` : 'Installment Payment',
    r.society_name ? `for ${r.society_name}` : null,
    r.plot_no ? `Plot ${r.plot_no}` : null,
  ].filter(Boolean);

  const rawPay = String(r.cheque_cash || '').toUpperCase();
  const paymentMethod = rawPay.includes('CHQ') || rawPay.includes('CHEQUE')
    ? 'Cheque'
    : rawPay.includes('UPI')
    ? 'UPI'
    : rawPay.includes('BANK') || rawPay.includes('NEFT') || rawPay.includes('RTGS')
    ? 'Bank Transfer'
    : 'Cash';

  return {
    id: String(r.id),
    source: 'master',
    billNumber: billNo,
    clientName: r.client_name || '',
    clientPhone: r.contact_no || '',
    clientAddress: [r.society_name, r.plot_no ? `Plot No. ${r.plot_no}` : null].filter(Boolean).join(', '),
    societyName: r.society_name || '',
    projectName: r.project_name || r.society_name || '',
    blockName: r.block_name || '',
    plotNo: r.plot_no || '',
    plotSize: r.plot_size || '',
    plotAmount: plotAmt,
    emiAmount: emiAmt,
    paidAmount: paidAmt,
    emiNo: r.emi_no || r.emi_time || '',
    emiTime: r.emi_time || '',
    brokerName: r.broker_name_clean || r["broker's_name"] || '',
    brokerCode: r.broker_code || '',
    referenceBy: r["broker's_name"] || [r.broker_code, r.broker_name_clean].filter(Boolean).join('/') || '',
    remarks: r.remarks && String(r.remarks).trim() ? String(r.remarks).trim() : '',
    description: subject,
    items: [
      {
        description: itemDescParts.join(' '),
        quantity: 1,
        unit_price: effectiveRate,
      },
    ],
    amount: effectiveRate,
    date: isoDate,
    dueDate: '',
    status: paid ? 'Paid' : 'Pending',
    paymentMethod,
    paymentRef: r.r_no || '',
    notes: [
      r.remarks && String(r.remarks).trim() ? `Remarks: ${String(r.remarks).trim()}` : null,
      r.broker_name_clean || r["broker's_name"]
        ? `Broker: ${r.broker_name_clean || r["broker's_name"]}${r.broker_code ? ` (${r.broker_code})` : ''}`
        : null,
      plotAmt > 0 ? `Total Plot Value: Rs. ${plotAmt.toLocaleString('en-IN')}` : null,
    ]
      .filter(Boolean)
      .join(' | '),
    taxRate: 0,
    discount: 0,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const field = (searchParams.get('field') || 'all') as 'name' | 'bill' | 'all';
    const clientHistoryFor = (searchParams.get('historyFor') || '').trim();

    const supabase = createServiceClient();

    // ── Mode 1: Fetch all previous bills/invoices for a specific client name ──
    if (clientHistoryFor) {
      const [{ data: billRows }, { data: masterRows }] = await Promise.all([
        supabase
          .from('bills')
          .select('*')
          .ilike('client_name', clientHistoryFor)
          .order('date', { ascending: false })
          .limit(30),
        supabase
          .from(MASTER_TABLE)
          .select('*')
          .ilike('client_name', clientHistoryFor)
          .order('id', { ascending: false })
          .limit(50),
      ]);

      const history: BillSuggestion[] = [
        ...(billRows || []).map(mapCustomBill),
        ...(masterRows || []).map(mapMasterRow),
      ];

      return NextResponse.json({ history });
    }

    // ── Mode 2: Typeahead suggestions by Client Name or Bill/Receipt Number ───
    if (!q) {
      return NextResponse.json({ suggestions: [] });
    }

    const strippedId = q.replace(/^(INV-|BILL-|R-|#)\s*0*/i, '').trim();
    const numericId = /^\d+$/.test(strippedId) ? parseInt(strippedId, 10) : null;

    let billsQuery = supabase.from('bills').select('*').order('created_at', { ascending: false }).limit(10);
    let masterQuery = supabase.from(MASTER_TABLE).select('*').order('id', { ascending: false });

    if (field === 'bill') {
      billsQuery = billsQuery.or(`bill_number.ilike.%${q}%,client_name.ilike.%${q}%,payment_ref.ilike.%${q}%`);
      if (numericId !== null) {
        masterQuery = masterQuery.or(`r_no.ilike.%${q}%,registration_no.ilike.%${q}%,id.eq.${numericId},plot_no.ilike.%${q}%`).limit(15);
      } else {
        masterQuery = masterQuery.or(`r_no.ilike.%${q}%,registration_no.ilike.%${q}%,client_name.ilike.%${q}%`).limit(15);
      }
    } else if (field === 'name') {
      billsQuery = billsQuery.or(`client_name.ilike.%${q}%,client_phone.ilike.%${q}%,bill_number.ilike.%${q}%`);
      // Fetch up to 60 rows so we can deduplicate by (client_name, society_name, plot_no) and still show distinct clients
      masterQuery = masterQuery
        .or(`client_name.ilike.%${q}%,contact_no.ilike.%${q}%,society_name.ilike.%${q}%,r_no.ilike.%${q}%,registration_no.ilike.%${q}%`)
        .limit(60);
    } else {
      billsQuery = billsQuery.or(`bill_number.ilike.%${q}%,client_name.ilike.%${q}%,client_phone.ilike.%${q}%`);
      if (numericId !== null) {
        masterQuery = masterQuery
          .or(`client_name.ilike.%${q}%,r_no.ilike.%${q}%,registration_no.ilike.%${q}%,contact_no.ilike.%${q}%,id.eq.${numericId}`)
          .limit(40);
      } else {
        masterQuery = masterQuery
          .or(`client_name.ilike.%${q}%,r_no.ilike.%${q}%,registration_no.ilike.%${q}%,contact_no.ilike.%${q}%,society_name.ilike.%${q}%`)
          .limit(40);
      }
    }

    const [{ data: billRows }, { data: masterRows }] = await Promise.all([billsQuery, masterQuery]);

    const mappedBills = (billRows || []).map(mapCustomBill);
    const mappedMaster = (masterRows || []).map(mapMasterRow);

    // When searching by name, deduplicate master rows by (clientName + societyName + plotNo)
    // so the dropdown shows distinct client/plot combinations (latest EMI first) instead of 30 EMIs of the same person.
    // When searching by bill number, keep every distinct receipt/bill number.
    let finalMaster = mappedMaster;
    if (field === 'name') {
      const seen = new Set<string>();
      finalMaster = [];
      for (const m of mappedMaster) {
        const key = `${m.clientName.toLowerCase()}|${m.societyName.toLowerCase()}|${m.plotNo.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          finalMaster.push(m);
        }
        if (finalMaster.length >= 12) break;
      }
    } else {
      finalMaster = mappedMaster.slice(0, 15);
    }

    return NextResponse.json({
      suggestions: [...mappedBills, ...finalMaster],
    });
  } catch (err: any) {
    console.error('Bills lookup error:', err);
    return NextResponse.json({ error: err.message || 'Lookup failed', suggestions: [] }, { status: 500 });
  }
}
