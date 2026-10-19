import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { parseAmount, normalizeDate, isPaid } from '@/utils/dataUtils';
import { withServerCache, invalidateServerCache } from '@/utils/serverCache';

const TABLE_NAME = 'Master Data Of Gurukrupa';
const BILLING_COLS = 'id,client_name,contact_no,society_name,plot_no,emi_amount,emi_amount_num,paid_amount,paid_amount_num,emi_paid_date,emi_paid_date_iso,cancel_date,r_no,registration_no,emi_no,"broker\'s_name",broker_code';

const fmtInr = (n: number) =>
  `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;

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
  if (status === 'Cancelled') {
    query = query.not('cancel_date', 'is', null).neq('cancel_date', '');
  } else if (status === 'Completed') {
    query = query.or('cancel_date.is.null,cancel_date.eq.').not('emi_paid_date', 'is', null).neq('emi_paid_date', '');
  } else if (status === 'Pending') {
    query = query.or('cancel_date.is.null,cancel_date.eq.').or('emi_paid_date.is.null,emi_paid_date.eq.');
  }
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
        const billStatus = b.status === 'Paid' ? 'Completed' : (b.status === 'Cancelled' ? 'Cancelled' : 'Pending');
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
          amount:      fmtInr(amt),
          emiAmount:   fmtInr(amt),
          status:      b.status === 'Paid' ? 'Completed' : (b.status === 'Cancelled' ? 'Cancelled' : 'Pending'),
          source:      'Property Sale',
          reference:   b.bill_number || `b${b.id}`,
          client:      b.client_name ? { name: b.client_name, type: 'Individual' } : null,
        };
      });

    const masterTransactions = (data || []).map((row: any) => {
      const paid        = isPaid(row.emi_paid_date);
      const isCancelled = Boolean(row.cancel_date && String(row.cancel_date).trim() !== '');
      const d           = row.emi_paid_date_iso || (paid ? normalizeDate(row.emi_paid_date) : null);
      const paidAmt     = row.paid_amount_num ?? parseAmount(row.paid_amount);
      const emiAmt      = row.emi_amount_num ?? parseAmount(row.emi_amount);
      const effAmt      = paidAmt || emiAmt;
      return {
        id:          String(row.id),
        date:        d || (paid ? String(row.emi_paid_date).trim() : null),
        description: [row.society_name, row.plot_no ? `Plot ${row.plot_no}` : null].filter(Boolean).join(' – ') || 'Property Sale',
        amount:      fmtInr(effAmt),
        emiAmount:   fmtInr(emiAmt),
        status:      isCancelled ? 'Cancelled' : (paid ? 'Completed' : 'Pending'),
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
// Marks a master-data EMI row (or custom bill) as paid by stamping today's date on emi_paid_date.
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const rawId = String(body.id ?? '').trim();
    const supabase = createServiceClient();
    const paidDate = body.paidDate || new Date().toISOString().split('T')[0];

    if (/^b\d+$/i.test(rawId)) {
      const billId = parseInt(rawId.slice(1), 10);
      const { data, error } = await supabase
        .from('bills')
        .update({ status: 'Paid' })
        .eq('id', billId)
        .select('id,status,date')
        .single();
      if (error) throw new Error(error.message);
      invalidateServerCache();
      return NextResponse.json({ success: true, id: `b${data.id}`, paidDate: data.date || paidDate });
    }

    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Valid transaction id required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ emi_paid_date: paidDate })
      .eq('id', id)
      .select('id,emi_paid_date')
      .single();

    if (error) throw new Error(error.message);
    invalidateServerCache();
    return NextResponse.json({ success: true, id: data.id, paidDate: data.emi_paid_date });

  } catch (error: any) {
    console.error('Billing PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Failed to mark as paid' }, { status: 500 });
  }
}

// DELETE /api/billing  ?id= | { id, ids }
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
      return NextResponse.json({ error: 'Transaction id or ids required' }, { status: 400 });
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
      return NextResponse.json({ error: 'No valid transaction IDs provided' }, { status: 400 });
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
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Billing DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete transaction(s)' }, { status: 500 });
  }
}
