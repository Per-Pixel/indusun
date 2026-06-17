import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { parseAmount, normalizeDate, isPaid } from '@/utils/dataUtils';

const TABLE_NAME = 'Master Data Of Gurukrupa';
const BROKER_FETCH_LIMIT = 10000; // enough rows to cover all unique broker names

// Whether a row should be treated as "Completed"
function isCompleted(row: any): boolean {
  return isPaid(row.emi_paid_date);
}

function mapRow(row: any) {
  const desc =
    [row.society_name, row.plot_no ? `Plot ${row.plot_no}` : null]
      .filter(Boolean)
      .join(' – ') || 'Property Sale';

  return {
    id:          row.id,
    date:        normalizeDate(row.emi_paid_date),
    description: desc,
    amount:      parseAmount(row.emi_amount),
    status:      isCompleted(row) ? 'Completed' : 'Pending',
    source:      'Property Sale',
    reference:   row.r_no || row.emi_no || `#${row.id}`,
    clientId:    row.id,
    client:      row.client_name
      ? { id: String(row.id), name: row.client_name, type: 'Individual' }
      : null,
    broker:      row["broker's_name"]
      ? { id: row["broker's_name"], name: row["broker's_name"] }
      : null,
  };
}

/** Apply shared non-date filters to any Supabase query builder */
function applyFilters(query: any, search: string, status: string, brokerName: string) {
  if (search) {
    query = query.or(`client_name.ilike.%${search}%,society_name.ilike.%${search}%`);
  }

  // Status: 'Pending' = null OR empty string; 'Completed' = non-null AND non-empty
  if (status === 'Completed') {
    query = query.not('emi_paid_date', 'is', null).neq('emi_paid_date', '');
  } else if (status === 'Pending') {
    // Catches both SQL NULL and empty-string values stored in a text column
    query = query.or('emi_paid_date.is.null,emi_paid_date.eq.');
  }

  if (brokerName) {
    query = query.eq("broker's_name", brokerName);
  }

  return query;
}

// GET handler – paginated transactions from Supabase master data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page       = Math.max(1, parseInt(searchParams.get('page')       || '1'));
    const limit      = Math.max(1, parseInt(searchParams.get('limit')      || '10'));
    const search     = searchParams.get('search')     || '';
    const status     = searchParams.get('status')     || 'All';
    const brokerName = searchParams.get('brokerName') || '';
    const startDate  = searchParams.get('startDate')  || '';
    const endDate    = searchParams.get('endDate')    || '';

    const supabase = createServiceClient();
    const offset = (page - 1) * limit;

    let transactions: ReturnType<typeof mapRow>[];
    let totalItems: number;

    // ── Date range: must normalise dates in JS because they may not be ISO ──
    if (startDate || endDate) {
      // 1. Count matching rows (without date filter, applied in JS)
      let countQ = supabase.from(TABLE_NAME).select('*', { count: 'exact', head: true });
      countQ = applyFilters(countQ, search, status, brokerName);
      const { count: approxCount, error: countErr } = await countQ;
      if (countErr) throw new Error(countErr.message);

      const totalPages = Math.ceil((approxCount || 0) / 1000);

      // 2. Fetch all matching rows in parallel batches (same strategy as sales API)
      let allRows: any[] = [];
      for (let batch = 0; batch < totalPages; batch += 10) {
        const end = Math.min(batch + 10, totalPages);
        const results = await Promise.all(
          Array.from({ length: end - batch }, (_, i) => {
            const from = (batch + i) * 1000;
            let q = applyFilters(supabase.from(TABLE_NAME).select('*'), search, status, brokerName);
            return q.range(from, from + 999);
          })
        );
        for (const { data, error } of results) {
          if (error) throw new Error(error.message);
          allRows = allRows.concat(data || []);
        }
      }

      // 3. JS-side date filter with normalisation
      const filtered = allRows.filter(row => {
        const d = normalizeDate(row.emi_paid_date);
        if (startDate && endDate) return !!d && d >= startDate && d <= endDate;
        if (startDate) return !!d && d >= startDate;
        if (endDate)   return !!d && d <= endDate;
        return true;
      });

      totalItems = filtered.length;
      transactions = filtered
        .sort((a, b) => (b.id || 0) - (a.id || 0))
        .slice(offset, offset + limit)
        .map(mapRow);

    } else {
      // ── No date filter: efficient server-side pagination ────────────────
      let query = applyFilters(
        supabase.from(TABLE_NAME).select('*', { count: 'exact' }),
        search, status, brokerName
      );

      const { data, error, count } = await query
        .order('id', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw new Error(error.message);

      totalItems = count || 0;
      transactions = (data || []).map(mapRow);
    }

    const totalPages = Math.ceil(totalItems / limit);
    console.log(`Transactions API: page ${page}, ${transactions.length} rows, total ${totalItems}`);

    // ── Broker list for the searchable dropdown ─────────────────────────
    const { data: brokerRows } = await supabase
      .from(TABLE_NAME)
      .select("broker's_name")
      .not("broker's_name", 'is', null)
      .neq("broker's_name", '')
      .range(0, BROKER_FETCH_LIMIT - 1);

    const brokers = [...new Set(
      (brokerRows || []).map((r: any) => r["broker's_name"] as string).filter(Boolean)
    )].sort().map(name => ({ id: name, name }));

    return NextResponse.json({
      transactions,
      pagination: { totalItems, totalPages, currentPage: page, itemsPerPage: limit },
      filterOptions: { brokers },
    });

  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST is not supported on read-only master data
export async function POST() {
  return NextResponse.json(
    { error: 'Adding transactions directly is not supported on master data' },
    { status: 405 }
  );
}
