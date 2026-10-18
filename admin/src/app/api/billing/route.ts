import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { parseAmount, normalizeDate, isPaid } from '@/utils/dataUtils';
import { withServerCache } from '@/utils/serverCache';

const TABLE_NAME = 'Master Data Of Gurukrupa';
const BILLING_COLS = 'id,client_name,society_name,plot_no,emi_amount,emi_amount_num,emi_paid_date,emi_paid_date_iso,cancel_date,r_no,emi_no';

function applyFilters(query: any, search: string, status: string) {
  if (search) query = query.or(`client_name.ilike.%${search}%,society_name.ilike.%${search}%`);
  if (status === 'Completed') query = query.not('emi_paid_date', 'is', null).neq('emi_paid_date', '');
  else if (status === 'Pending') query = query.or('emi_paid_date.is.null,emi_paid_date.eq.');
  return query;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page   = Math.max(1, parseInt(searchParams.get('page')   || '1'));
    const limit  = Math.max(1, parseInt(searchParams.get('limit')  || '25'));
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'All';
    const offset = (page - 1) * limit;
    const supabase = createServiceClient();

    // ── Summary & trends via fast cached Postgres RPC ──────────────────────
    const countCacheKey = `count:billing:${search}|${status}`;
    const [aggData, { data, error }, count] = await Promise.all([
      withServerCache('rpc:get_billing_aggregates_rpc', async () => {
        const { data: d, error: e } = await supabase.rpc('get_billing_aggregates_rpc');
        if (e || !d) throw new Error(e?.message || 'Failed to compute billing aggregates');
        return d;
      }),
      applyFilters(supabase.from(TABLE_NAME).select(BILLING_COLS), search, status)
        .order('id', { ascending: false })
        .range(offset, offset + limit - 1),
      withServerCache(countCacheKey, async () => {
        const { count: c, error: cErr } = await applyFilters(
          supabase.from(TABLE_NAME).select('*', { count: 'exact', head: true }),
          search,
          status
        );
        if (cErr) throw new Error(cErr.message);
        return c || 0;
      }),
    ]);

    if (error) throw new Error(error.message);

    const { summary, trends, sources } = aggData as {
      summary: {
        totalRevenue: number;
        pendingPayments: number;
        totalTransactions: number;
        completedTransactions: number;
        cancelledCount: number;
        cancelledAmount: number;
      };
      trends: { name: string; value: number }[];
      sources: { name: string; value: number }[];
    };

    const transactions = (data || []).map((row: any) => {
      const paid = isPaid(row.emi_paid_date);
      const d    = row.emi_paid_date_iso || (paid ? normalizeDate(row.emi_paid_date) : null);
      return {
        id:          String(row.id),
        date:        d || (paid ? String(row.emi_paid_date).trim() : null),
        description: [row.society_name, row.plot_no ? `Plot ${row.plot_no}` : null].filter(Boolean).join(' – ') || 'Property Sale',
        amount:      `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.emi_amount_num ?? parseAmount(row.emi_amount))}`,
        status:      row.cancel_date ? 'Cancelled' : (paid ? 'Completed' : 'Pending'),
        source:      'Property Sale',
        reference:   row.r_no || row.emi_no || `#${row.id}`,
        client:      row.client_name ? { name: row.client_name, type: 'Individual' } : null,
      };
    });

    const totalItems = count || 0;
    return NextResponse.json({
      summary,
      trends,
      sources,
      transactions,
      pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    });

  } catch (error: any) {
    console.error('Billing API error:', error);
    return NextResponse.json({ error: 'Failed to fetch billing data' }, { status: 500 });
  }
}

// PATCH /api/billing  { id }
// Marks a master-data EMI row as paid by stamping today's date on emi_paid_date.
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = parseInt(body.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Valid transaction id required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const paidDate = body.paidDate || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ emi_paid_date: paidDate })
      .eq('id', id)
      .select('id,emi_paid_date')
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, id: data.id, paidDate: data.emi_paid_date });

  } catch (error: any) {
    console.error('Billing PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Failed to mark as paid' }, { status: 500 });
  }
}
