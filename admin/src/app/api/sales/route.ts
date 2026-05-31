import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

const TABLE_NAME = 'Master Data Of Gurukrupa';
const PAGE_SIZE   = 1000;
const BATCH_SIZE  = 10; // parallel requests per round

async function fetchAllRows(supabase: ReturnType<typeof createServiceClient>): Promise<any[]> {
  // 1. Get total row count without downloading data
  const { count, error: countErr } = await supabase
    .from(TABLE_NAME)
    .select('*', { count: 'exact', head: true });

  if (countErr) throw new Error(countErr.message);
  if (!count)   return [];

  const totalPages = Math.ceil(count / PAGE_SIZE);
  let allRows: any[] = [];

  // 2. Fetch pages in parallel batches
  for (let batchStart = 0; batchStart < totalPages; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, totalPages);
    const promises = Array.from({ length: batchEnd - batchStart }, (_, i) => {
      const from = (batchStart + i) * PAGE_SIZE;
      return supabase.from(TABLE_NAME).select('*').range(from, from + PAGE_SIZE - 1);
    });

    const results = await Promise.all(promises);
    for (const { data, error } of results) {
      if (error) throw new Error(error.message);
      allRows = allRows.concat(data || []);
    }
  }

  console.log(`fetchAllRows: retrieved ${allRows.length} / ${count} rows in ${totalPages} pages`);
  return allRows;
}

function parseAmount(amount: string | null | undefined): number {
  if (!amount) return 0;
  const cleaned = String(amount).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

function normalizeDate(dateStr: string | null | undefined): string | null {
  if (!dateStr || !String(dateStr).trim()) return null;
  const s = String(dateStr).trim();
  // Handle DD/MM/YYYY or DD-MM-YYYY (Indian format)
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const iso = `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }
  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch {}
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate  = searchParams.get('startDate')  || undefined;
    const endDate    = searchParams.get('endDate')    || undefined;
    const brokerName = searchParams.get('brokerName') || undefined;
    const sortBy     = searchParams.get('sortBy')     || 'date';
    const sortOrder  = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const supabase = createServiceClient();

    // Fetch all records using paginated parallel requests (bypasses Supabase 1000-row default cap)
    const rows = await fetchAllRows(supabase);
    console.log(`Supabase master data: ${rows.length} total rows`);

    // ── Filter rows: "paid" = non-empty emi_paid_date ─────────────────────
    // When a date range is active we also require a parseable date so the
    // comparison works; when no range is set we include ALL paid rows (same
    // logic as the billing page).
    const filteredRows = rows.filter((r) => {
      const hasPaidDate = !!(r.emi_paid_date && String(r.emi_paid_date).trim());
      if (!hasPaidDate) return false;

      if (startDate || endDate) {
        const d = normalizeDate(r.emi_paid_date);
        if (!d) return false;
        if (startDate && d < startDate) return false;
        if (endDate   && d > endDate)   return false;
      }

      if (brokerName && r["broker's_name"] !== brokerName) return false;
      return true;
    });

    // Determine chart granularity: monthly for long/unfiltered ranges, daily for short ones
    const granularity: 'monthly' | 'daily' = (() => {
      if (!startDate && !endDate) return 'monthly'; // All Time → monthly
      if (startDate && endDate) {
        const days = (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000;
        return days > 90 ? 'monthly' : 'daily';
      }
      return 'daily';
    })();

    // Aggregate by date (chart only — requires a parseable date)
    const dateMap: Record<string, { total_amount: number; transaction_count: number }> = {};
    filteredRows.forEach((r) => {
      const d = normalizeDate(r.emi_paid_date);
      if (!d) return;
      const dateKey = granularity === 'monthly' ? d.substring(0, 7) : d; // YYYY-MM or YYYY-MM-DD
      if (!dateMap[dateKey]) dateMap[dateKey] = { total_amount: 0, transaction_count: 0 };
      dateMap[dateKey].total_amount     += parseAmount(r.emi_amount);
      dateMap[dateKey].transaction_count += 1;
    });

    // For monthly keys (YYYY-MM) use first-of-month as date so the frontend can parse consistently
    let salesData = Object.entries(dateMap).map(([key, s]) => ({
      date: granularity === 'monthly' ? `${key}-01` : key,
      total_amount:      s.total_amount,
      transaction_count: s.transaction_count,
    }));

    salesData.sort((a, b) => {
      if (sortBy === 'total_amount') {
        return sortOrder === 'asc'
          ? a.total_amount - b.total_amount
          : b.total_amount - a.total_amount;
      }
      return sortOrder === 'asc'
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date);
    });
    // Monthly: up to 120 buckets (10 years); Daily: up to 366 days
    salesData = salesData.slice(0, granularity === 'monthly' ? 120 : 366);

    console.log(`Sales chart: ${filteredRows.length} payment rows → ${salesData.length} date buckets`);

    // ── Summary statistics ─────────────────────────────────────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];

    const clientSet       = new Set<string>();
    const activeClientSet = new Set<string>();
    const brokerSet       = new Set<string>();
    const activeBrokerSet = new Set<string>();
    const propertySet     = new Set<string>();
    const soldPropertySet = new Set<string>();
    const brokerNameSet   = new Set<string>();

    rows.forEach((r) => {
      const cn   = r.client_name;
      const bn   = r["broker's_name"];
      const normDate = normalizeDate(r.emi_paid_date);
      const plotKey  = r.plot_no ? `${r.society_name || ''}||${r.plot_no}` : null;

      if (cn) clientSet.add(cn);
      if (bn) { brokerSet.add(bn); brokerNameSet.add(bn); }

      if (normDate && normDate >= sixMonthsAgoStr) {
        if (cn) activeClientSet.add(cn);
        if (bn) activeBrokerSet.add(bn);
      }

      if (plotKey) {
        propertySet.add(plotKey);
        if (!r.cancel_date && r.paid_amount) soldPropertySet.add(plotKey);
      }
    });

    // Dynamic stats (respect the active filters)
    const filteredRevenue = filteredRows.reduce((s, r) => s + parseAmount(r.emi_amount), 0);
    const filteredTxCount = filteredRows.length;

    const summary = {
      totalClients:      clientSet.size,
      activeClients:     activeClientSet.size,
      totalBrokers:      brokerSet.size,
      activeBrokers:     activeBrokerSet.size,
      totalProperties:   propertySet.size,
      propertiesSold:    soldPropertySet.size,
      totalTransactions: filteredTxCount,
      totalRevenue:      filteredRevenue,
    };

    const brokers = Array.from(brokerNameSet)
      .sort()
      .map((name) => ({ id: name, name }));

    console.log('Sales summary:', summary);

    return NextResponse.json({
      sales: salesData,
      granularity,
      filterOptions: { brokers },
      summary,
    });

  } catch (error) {
    console.error('Error fetching sales data:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    return NextResponse.json(
      { error: 'Failed to fetch sales data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
