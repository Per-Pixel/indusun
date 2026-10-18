import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { parseAmount, normalizeDate, isPaid } from '@/utils/dataUtils';

const TABLE_NAME = 'Master Data Of Gurukrupa';

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

    // ── Summary & trends: fetch only 2 columns for all rows (lightweight) ─
    const { count: totalCount } = await supabase
      .from(TABLE_NAME).select('*', { count: 'exact', head: true });

    const totalBatches = Math.ceil((totalCount || 0) / 1000);
    let aggRows: any[] = [];

    for (let batch = 0; batch < totalBatches; batch += 10) {
      const batchEnd = Math.min(batch + 10, totalBatches);
      const results = await Promise.all(
        Array.from({ length: batchEnd - batch }, (_, i) => {
          const from = (batch + i) * 1000;
          return supabase.from(TABLE_NAME).select('emi_paid_date,emi_amount,society_name,cancel_date').range(from, from + 999);
        })
      );
      for (const { data } of results) aggRows = aggRows.concat(data || []);
    }

    let totalRevenue = 0, pendingPayments = 0, completedCount = 0;
    let cancelledCount = 0, cancelledAmount = 0;
    const monthMap: Record<string, number> = {};
    const societyMap: Record<string, number> = {};
    for (const row of aggRows) {
      const amount = parseAmount(row.emi_amount);
      // Cancelled deals are reported separately — never as revenue/pending.
      if (row.cancel_date) {
        cancelledCount++;
        cancelledAmount += amount;
        continue;
      }
      const paid = isPaid(row.emi_paid_date);
      const d    = paid ? normalizeDate(row.emi_paid_date) : null;
      if (paid) {
        totalRevenue += amount;
        completedCount++;
        if (d) {
          const mk = d.substring(0, 7);
          monthMap[mk] = (monthMap[mk] || 0) + amount;
        }
        const society = String(row.society_name || '').trim() || 'Unassigned';
        societyMap[society] = (societyMap[society] || 0) + amount;
      } else {
        pendingPayments += amount;
      }
    }

    // Revenue by society — top 5 plus "Other"
    const societyEntries = Object.entries(societyMap).sort(([, a], [, b]) => b - a);
    const topSocieties = societyEntries.slice(0, 5);
    const restTotal = societyEntries.slice(5).reduce((s, [, v]) => s + v, 0);
    const sources = topSocieties.map(([name, value]) => ({ name, value }));
    if (restTotal > 0) sources.push({ name: 'Other', value: restTotal });

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const trends = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([k, v]) => {
        const [year, month] = k.split('-');
        return { name: `${MONTHS[+month - 1]} ${year}`, value: v };
      });

    // ── Paginated transaction list ─────────────────────────────────────────
    let query = applyFilters(
      supabase.from(TABLE_NAME).select('*', { count: 'exact' }),
      search, status
    );
    const { data, error, count } = await query
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw new Error(error.message);

    const transactions = (data || []).map((row: any) => {
      const paid = isPaid(row.emi_paid_date);
      const d    = paid ? normalizeDate(row.emi_paid_date) : null;
      return {
        id:          String(row.id),
        date:        d || (paid ? String(row.emi_paid_date).trim() : null),
        description: [row.society_name, row.plot_no ? `Plot ${row.plot_no}` : null].filter(Boolean).join(' – ') || 'Property Sale',
        amount:      `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseAmount(row.emi_amount))}`,
        status:      paid ? 'Completed' : 'Pending',
        source:      'Property Sale',
        reference:   row.r_no || row.emi_no || `#${row.id}`,
        client:      row.client_name ? { name: row.client_name, type: 'Individual' } : null,
      };
    });

    const totalItems = count || 0;
    return NextResponse.json({
      summary: { totalRevenue, pendingPayments, totalTransactions: totalCount || 0, completedTransactions: completedCount, cancelledCount, cancelledAmount },
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
