import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

const TABLE_NAME = 'Master Data Of Gurukrupa';

function parseAmount(v: any): number {
  if (!v) return 0;
  return parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0;
}

function normalizeDate(d: any): string | null {
  if (!d || !String(d).trim()) return null;
  const s = String(d).trim();
  // Handle DD/MM/YYYY or DD-MM-YYYY (Indian format)
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const iso = `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
    const dt = new Date(iso);
    if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
  }
  try {
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
  } catch {}
  return null;
}

function isPaid(emiDate: any): boolean {
  return !!(emiDate && String(emiDate).trim());
}

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
          return supabase.from(TABLE_NAME).select('emi_paid_date,emi_amount').range(from, from + 999);
        })
      );
      for (const { data } of results) aggRows = aggRows.concat(data || []);
    }

    let totalRevenue = 0, pendingPayments = 0, completedCount = 0;
    const monthMap: Record<string, number> = {};
    for (const row of aggRows) {
      const amount = parseAmount(row.emi_amount);
      const paid = isPaid(row.emi_paid_date);
      const d    = paid ? normalizeDate(row.emi_paid_date) : null;
      if (paid) {
        totalRevenue += amount;
        completedCount++;
        const mk = (d || String(row.emi_paid_date).trim()).substring(0, 7);
        monthMap[mk] = (monthMap[mk] || 0) + amount;
      } else {
        pendingPayments += amount;
      }
    }

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
      summary: { totalRevenue, pendingPayments, totalTransactions: totalCount || 0, completedTransactions: completedCount },
      trends,
      transactions,
      pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    });

  } catch (error: any) {
    console.error('Billing API error:', error);
    return NextResponse.json({ error: 'Failed to fetch billing data' }, { status: 500 });
  }
}
