import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { parseAmount, normalizeDate, isPaid } from '@/utils/dataUtils';
import { withServerCache, invalidateServerCache } from '@/utils/serverCache';

const TABLE_NAME = 'Master Data Of Gurukrupa';
const INVOICE_COLS = 'id,client_name,contact_no,society_name,plot_no,emi_amount,emi_amount_num,paid_amount,paid_amount_num,emi_paid_date,cancel_date,r_no,registration_no,emi_no,"broker\'s_name",ba_code';

const inr = (n: number) =>
  `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page   = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit  = Math.max(1, parseInt(searchParams.get('limit') || '25'));
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const status = searchParams.get('status') || 'All';
    const source = (searchParams.get('source') || 'all').toLowerCase(); // 'all' | 'custom' | 'master'
    const supabase = createServiceClient();

    // ── Custom bills (bills table) — small set, fetched fully and merged ────
    let bills: any[] = [];
    let billRows: any[] | null = null;
    let billErr: any = null;

    const res1 = await supabase
      .from('bills')
      .select('id,bill_number,client_name,client_phone,society_name,plot_no,reference_by,payment_ref,description,amount,date,due_date,status,payment_method')
      .order('created_at', { ascending: false });
    billRows = res1.data; billErr = res1.error;

    // Retry without newer columns if migration hasn't added them yet
    if (billErr) {
      const res2 = await supabase
        .from('bills')
        .select('id,bill_number,client_name,description,amount,date,status,payment_method')
        .order('created_at', { ascending: false });
      billRows = res2.data; billErr = res2.error;
    }

    const allBillRows = !billErr && Array.isArray(billRows) ? billRows : [];
    const allBillsCount = allBillRows.length;
    const allBillsPaid = allBillRows.filter((b: any) => b.status === 'Paid').length;
    const allBillsPending = allBillsCount - allBillsPaid;

    if (source !== 'master' && allBillRows.length > 0) {
      bills = allBillRows
        .filter((b: any) => {
          const bStatus = b.status === 'Paid' ? 'Paid' : 'Pending';
          if (status !== 'All' && bStatus !== status) return false;
          if (search) {
            const hay = `${b.client_name || ''} ${b.client_phone || ''} ${b.bill_number || ''} b${b.id || ''} ${b.society_name || ''} ${b.plot_no || ''} ${b.reference_by || ''} ${b.payment_ref || ''} ${b.description || ''}`.toLowerCase();
            if (!hay.includes(search)) return false;
          }
          return true;
        })
        .map((b: any) => {
          const amt = parseFloat(b.amount) || 0;
          const propTitle = [b.society_name, b.plot_no ? `Plot ${b.plot_no}` : null].filter(Boolean).join(' – ') || b.description;
          return {
            id:            `b${b.id}`,
            invoiceNumber: b.bill_number,
            date:          b.date || null,
            dueDate:       b.due_date || null,
            amount:        inr(amt),
            amountNum:     amt,
            emiAmount:     inr(amt),
            emiAmountNum:  amt,
            status:        b.status === 'Paid' ? 'Paid' : 'Pending',
            source:        'custom',
            client:        { name: b.client_name || 'Unknown', type: 'Individual', id: `b${b.id}` },
            property:      propTitle ? { id: `b${b.id}`, title: propTitle } : undefined,
            broker:        b.reference_by || null,
          };
        });
    }
    // Missing/empty bills table → master data still works.

    // ── Master-data invoices ───────────────────────────────────────────────
    const strippedId = search.replace(/^(inv-|bill-|r-|#)\s*0*/i, '').trim();
    const numericId = /^\d+$/.test(strippedId) ? parseInt(strippedId, 10) : null;

    const applyMasterFilters = (q: any) => {
      if (search) {
        const clauses = [
          `client_name.ilike.%${search}%`,
          `contact_no.ilike.%${search}%`,
          `society_name.ilike.%${search}%`,
          `plot_no.ilike.%${search}%`,
          `"broker's_name".ilike.%${search}%`,
          `broker_code.ilike.%${search}%`,
          `ba_code.ilike.%${search}%`,
          `broker_name_clean.ilike.%${search}%`,
          `r_no.ilike.%${search}%`,
          `registration_no.ilike.%${search}%`,
        ];
        if (numericId !== null) {
          clauses.push(`id.eq.${numericId}`);
          if (strippedId !== search) {
            clauses.push(`r_no.ilike.%${strippedId}%`);
            clauses.push(`registration_no.ilike.%${strippedId}%`);
          }
        }
        q = q.or(clauses.join(','));
      }
      if (status === 'Cancelled') {
        q = q.not('cancel_date', 'is', null).neq('cancel_date', '');
      } else if (status === 'Paid') {
        q = q.or('cancel_date.is.null,cancel_date.eq.').not('emi_paid_date', 'is', null).neq('emi_paid_date', '');
      } else if (status === 'Pending') {
        q = q.or('cancel_date.is.null,cancel_date.eq.').or('emi_paid_date.is.null,emi_paid_date.eq.');
      }
      return q;
    };

    // Bills occupy positions [0, billsCount); master rows continue after.
    const billsCount = bills.length;
    const offset     = (page - 1) * limit;
    const billSlice  = bills.slice(offset, offset + limit);
    const remaining  = limit - billSlice.length;
    const masterFrom = Math.max(0, offset - billsCount);

    let masterInvoices: any[] = [];
    let masterCount = 0;

    if (source !== 'custom') {
      const rangeEnd = remaining > 0 ? masterFrom + remaining - 1 : masterFrom;
      const countCacheKey = `count:invoices:${search}|${status}`;
      const [{ data, error }, cachedCount] = await Promise.all([
        remaining > 0
          ? applyMasterFilters(supabase.from(TABLE_NAME).select(INVOICE_COLS))
              .order('id', { ascending: false })
              .range(masterFrom, rangeEnd)
          : Promise.resolve({ data: [], error: null }),
        withServerCache(countCacheKey, async () => {
          const { count: c, error: cErr } = await applyMasterFilters(
            supabase.from(TABLE_NAME).select('*', { count: 'exact', head: true })
          );
          if (cErr) throw new Error(cErr.message);
          return c || 0;
        }),
      ]);
      if (error) throw new Error(error.message);
      masterCount = cachedCount || 0;
      const rows = remaining > 0 ? (data || []) : [];

      masterInvoices = rows.map((row: any) => {
        const isCancelled = Boolean(row.cancel_date && String(row.cancel_date).trim() !== '');
        const paid        = isPaid(row.emi_paid_date);
        const d           = paid ? normalizeDate(row.emi_paid_date) : null;
        const paidAmt     = row.paid_amount_num ?? parseAmount(row.paid_amount);
        const emiAmt      = row.emi_amount_num ?? parseAmount(row.emi_amount);
        const amount      = paidAmt > 0 ? paidAmt : emiAmt;
        return {
          id:            String(row.id),
          invoiceNumber: row.registration_no || row.r_no || row.emi_no || `INV-${String(row.id).padStart(6, '0')}`,
          date:          d || (paid ? String(row.emi_paid_date).trim() : null),
          amount:        inr(amount),
          amountNum:     amount,
          emiAmount:     inr(emiAmt),
          emiAmountNum:  emiAmt,
          status:        isCancelled ? 'Cancelled' : (paid ? 'Paid' : 'Pending'),
          source:        'master',
          client: {
            name: row.client_name || 'Unknown',
            type: 'Individual',
            id:   String(row.id),
          },
          property: row.society_name
            ? { id: String(row.id), title: [row.society_name, row.plot_no ? `Plot ${row.plot_no}` : null].filter(Boolean).join(' – ') }
            : undefined,
          broker: row["broker's_name"] || null,
        };
      });
    }

    // ── Summary counts (cached so pagination/search stays fast) ────────────
    const masterCounts = await withServerCache('invoices:master_status_counts', async () => {
      const [paidRes, pendingRes, cancelledRes, totalRes] = await Promise.all([
        supabase.from(TABLE_NAME).select('*', { count: 'exact', head: true })
          .or('cancel_date.is.null,cancel_date.eq.')
          .not('emi_paid_date', 'is', null).neq('emi_paid_date', ''),
        supabase.from(TABLE_NAME).select('*', { count: 'exact', head: true })
          .or('cancel_date.is.null,cancel_date.eq.')
          .or('emi_paid_date.is.null,emi_paid_date.eq.'),
        supabase.from(TABLE_NAME).select('*', { count: 'exact', head: true })
          .not('cancel_date', 'is', null).neq('cancel_date', ''),
        supabase.from(TABLE_NAME).select('*', { count: 'exact', head: true }),
      ]);
      const paid = paidRes.count || 0;
      const pending = pendingRes.count || 0;
      const cancelled = cancelledRes.count || 0;
      const total = totalRes.count || (paid + pending + cancelled);
      return {
        paid,
        pending,
        cancelled,
        total,
      };
    });

    const totalItems = billsCount + masterCount;
    return NextResponse.json({
      invoices: [...billSlice, ...masterInvoices],
      pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
      summary: {
        paidCount:        masterCounts.paid + allBillsPaid,
        pendingCount:     masterCounts.pending + allBillsPending,
        cancelledCount:   masterCounts.cancelled,
        customBillsCount: allBillsCount,
        emiReceiptsCount: masterCounts.total,
        totalCount:       masterCounts.total + allBillsCount,
      },
    });

  } catch (error: any) {
    console.error('Invoices API error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id');

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // ignore if no body
    }

    const rawIds: (string | number)[] = Array.isArray(body?.ids)
      ? body.ids
      : body?.id !== undefined
      ? [body.id]
      : queryId
      ? queryId.split(',')
      : [];

    if (rawIds.length === 0) {
      return NextResponse.json({ error: 'No invoice IDs provided' }, { status: 400 });
    }

    const billIds: number[] = [];
    const masterIds: number[] = [];

    for (const raw of rawIds) {
      const s = String(raw).trim();
      if (/^b\d+$/i.test(s)) {
        const n = parseInt(s.slice(1), 10);
        if (!isNaN(n)) billIds.push(n);
      } else {
        const n = parseInt(s, 10);
        if (!isNaN(n)) masterIds.push(n);
      }
    }

    if (billIds.length === 0 && masterIds.length === 0) {
      return NextResponse.json({ error: 'No valid invoice IDs provided' }, { status: 400 });
    }

    const supabase = createServiceClient();

    if (billIds.length > 0) {
      const { error } = await supabase.from('bills').delete().in('id', billIds);
      if (error) throw new Error(error.message);
    }

    if (masterIds.length > 0) {
      const { error } = await supabase.from(TABLE_NAME).delete().in('id', masterIds);
      if (error) throw new Error(error.message);
    }

    invalidateServerCache();
    return NextResponse.json({
      success: true,
      deletedBills: billIds.length,
      deletedMaster: masterIds.length,
    });
  } catch (error: any) {
    console.error('Invoices DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete invoices' }, { status: 500 });
  }
}
