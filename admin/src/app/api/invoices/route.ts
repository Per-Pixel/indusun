import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { parseAmount, normalizeDate, isPaid } from '@/utils/dataUtils';
import { withServerCache } from '@/utils/serverCache';

const TABLE_NAME = 'Master Data Of Gurukrupa';
const INVOICE_COLS = 'id,client_name,society_name,plot_no,emi_amount,emi_paid_date,r_no,emi_no,"broker\'s_name"';

const inr = (n: number) =>
  `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page   = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit  = Math.max(1, parseInt(searchParams.get('limit') || '25'));
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const status = searchParams.get('status') || 'All';
    const supabase = createServiceClient();

    // ── Custom bills (bills table) — small set, fetched fully and merged ────
    let bills: any[] = [];
    let billRows: any[] | null = null;
    let billErr: any = null;

    const res1 = await supabase
      .from('bills')
      .select('id,bill_number,client_name,description,amount,date,due_date,status,payment_method')
      .order('created_at', { ascending: false });
    billRows = res1.data; billErr = res1.error;

    // Retry without due_date if the migration hasn't added it yet
    if (billErr) {
      const res2 = await supabase
        .from('bills')
        .select('id,bill_number,client_name,description,amount,date,status,payment_method')
        .order('created_at', { ascending: false });
      billRows = res2.data; billErr = res2.error;
    }

    if (!billErr && billRows) {
      bills = billRows
        .filter((b: any) => {
          if (status !== 'All' && b.status !== status) return false;
          if (search) {
            const hay = `${b.client_name || ''} ${b.bill_number || ''} ${b.description || ''}`.toLowerCase();
            if (!hay.includes(search)) return false;
          }
          return true;
        })
        .map((b: any) => {
          const amt = parseFloat(b.amount) || 0;
          return {
            id:            `b${b.id}`,
            invoiceNumber: b.bill_number,
            date:          b.date || null,
            dueDate:       b.due_date || null,
            amount:        inr(amt),
            amountNum:     amt,
            status:        b.status === 'Paid' ? 'Paid' : 'Pending',
            client:        { name: b.client_name || 'Unknown', type: 'Individual', id: `b${b.id}` },
            property:      b.description ? { id: `b${b.id}`, title: b.description } : undefined,
            broker:        null,
          };
        });
    }
    // Missing/empty bills table → master data still works.

    // ── Master-data invoices ───────────────────────────────────────────────
    const applyMasterFilters = (q: any) => {
      if (search) {
        q = q.or(
          `client_name.ilike.%${search}%,society_name.ilike.%${search}%,plot_no.ilike.%${search}%,"broker's_name".ilike.%${search}%,r_no.ilike.%${search}%`
        );
      }
      if (status === 'Paid')    q = q.not('emi_paid_date', 'is', null).neq('emi_paid_date', '');
      if (status === 'Pending') q = q.or('emi_paid_date.is.null,emi_paid_date.eq.');
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

    {
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
        const paid   = isPaid(row.emi_paid_date);
        const d      = paid ? normalizeDate(row.emi_paid_date) : null;
        const amount = parseAmount(row.emi_amount);
        return {
          id:            String(row.id),
          invoiceNumber: row.r_no || row.emi_no || `INV-${String(row.id).padStart(6, '0')}`,
          date:          d || (paid ? String(row.emi_paid_date).trim() : null),
          amount:        inr(amount),
          amountNum:     amount,
          status:        paid ? 'Paid' : 'Pending',
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
      const [paidRes, pendingRes] = await Promise.all([
        supabase.from(TABLE_NAME).select('*', { count: 'exact', head: true })
          .not('emi_paid_date', 'is', null).neq('emi_paid_date', ''),
        supabase.from(TABLE_NAME).select('*', { count: 'exact', head: true })
          .or('emi_paid_date.is.null,emi_paid_date.eq.'),
      ]);
      return {
        paid: paidRes.count || 0,
        pending: pendingRes.count || 0,
      };
    });

    const billsPaid    = bills.filter((b) => b.status === 'Paid').length;
    const billsPending = billsCount - billsPaid;

    const totalItems = billsCount + masterCount;
    return NextResponse.json({
      invoices: [...billSlice, ...masterInvoices],
      pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
      summary: {
        paidCount:    masterCounts.paid + billsPaid,
        pendingCount: masterCounts.pending + billsPending,
        totalCount:   masterCounts.paid + masterCounts.pending + billsCount,
      },
    });

  } catch (error: any) {
    console.error('Invoices API error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
