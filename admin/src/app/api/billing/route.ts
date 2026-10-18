import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { parseAmount, normalizeDate, isPaid } from '@/utils/dataUtils';
import { withServerCache } from '@/utils/serverCache';

const TABLE_NAME = 'Master Data Of Gurukrupa';
const BILLING_COLS = 'id,client_name,contact_no,society_name,plot_no,emi_amount,emi_amount_num,emi_paid_date,emi_paid_date_iso,cancel_date,r_no,registration_no,emi_no,"broker\'s_name",broker_code';

function applyFilters(query: any, search: string, status: string) {
  const s = search.trim();
  if (s) {
    const strippedId = s.replace(/^(inv-|bill-|r-|#)\s*0*/i, '').trim();
    const numericId = /^\d+$/.test(strippedId) ? parseInt(strippedId, 10) : null;
    const clauses = [
      `client_name.ilike.%${s}%`,
      `contact_no.ilike.%${s}%`,
      `society_name.ilike.%${s}%`,
      `plot_no.ilike.%${s}%`,
      `"broker's_name".ilike.%${s}%`,
      `broker_code.ilike.%${s}%`,
      `ba_code.ilike.%${s}%`,
      `broker_name_clean.ilike.%${s}%`,
      `r_no.ilike.%${s}%`,
      `registration_no.ilike.%${s}%`,
    ];
    if (numericId !== null) {
      clauses.push(`id.eq.${numericId}`);
      clauses.push(`r_no.ilike.%${strippedId}%`);
      clauses.push(`registration_no.ilike.%${strippedId}%`);
    }
    query = query.or(clauses.join(','));
  }
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
    const [aggData, { data: billRows }, { data, error }, count] = await Promise.all([
      withServerCache('rpc:get_billing_aggregates_rpc', async () => {
        const { data: d, error: e } = await supabase.rpc('get_billing_aggregates_rpc');
        if (e || !d) throw new Error(e?.message || 'Failed to compute billing aggregates');
        return d;
      }),
      supabase
        .from('bills')
        .select('id,bill_number,client_name,client_phone,society_name,plot_no,description,amount,date,status,payment_ref')
        .order('created_at', { ascending: false }),
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

    const qLower = search.trim().toLowerCase();
    const matchedCustomBills = (page === 1 && Array.isArray(billRows) ? billRows : [])
      .filter((b: any) => {
        const billStatus = b.status === 'Paid' ? 'Completed' : 'Pending';
        if (status !== 'All' && billStatus !== status) return false;
        if (qLower) {
          const hay = `${b.bill_number || ''} b${b.id || ''} ${b.client_name || ''} ${b.client_phone || ''} ${b.society_name || ''} ${b.plot_no || ''} ${b.description || ''} ${b.payment_ref || ''}`.toLowerCase();
          if (!hay.includes(qLower)) return false;
        }
        return true;
      })
      .map((b: any) => {
        const amt = parseFloat(b.amount) || 0;
        return {
          id:          `b${b.id}`,
          date:        b.date || null,
          description: [b.society_name, b.plot_no ? `Plot ${b.plot_no}` : null].filter(Boolean).join(' – ') || b.description || 'Property Sale',
          amount:      `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amt)}`,
          status:      b.status === 'Paid' ? 'Completed' : 'Pending',
          source:      'Property Sale',
          reference:   b.bill_number || `b${b.id}`,
          client:      b.client_name ? { name: b.client_name, type: 'Individual' } : null,
        };
      });

    const masterTransactions = (data || []).map((row: any) => {
      const paid = isPaid(row.emi_paid_date);
      const d    = row.emi_paid_date_iso || (paid ? normalizeDate(row.emi_paid_date) : null);
      return {
        id:          String(row.id),
        date:        d || (paid ? String(row.emi_paid_date).trim() : null),
        description: [row.society_name, row.plot_no ? `Plot ${row.plot_no}` : null].filter(Boolean).join(' – ') || 'Property Sale',
        amount:      `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.emi_amount_num ?? parseAmount(row.emi_amount))}`,
        status:      row.cancel_date ? 'Cancelled' : (paid ? 'Completed' : 'Pending'),
        source:      'Property Sale',
        reference:   row.registration_no || row.r_no || row.emi_no || `#${row.id}`,
        client:      row.client_name ? { name: row.client_name, type: 'Individual' } : null,
      };
    });

    const transactions = [...matchedCustomBills, ...masterTransactions].slice(0, limit);
    const totalItems = (count || 0) + matchedCustomBills.length;
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
