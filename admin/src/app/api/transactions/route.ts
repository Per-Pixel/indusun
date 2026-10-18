import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { parseAmount, normalizeDate, isPaid } from '@/utils/dataUtils';
import { withServerCache } from '@/utils/serverCache';

const TABLE_NAME = 'Master Data Of Gurukrupa';
const TXN_COLS = 'id,client_name,contact_no,society_name,plot_no,emi_amount,emi_paid_date,emi_paid_date_iso,r_no,registration_no,emi_no,"broker\'s_name",ba_code';

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
    reference:   row.registration_no || row.r_no || row.emi_no || `#${row.id}`,
    clientId:    row.id,
    client:      row.client_name
      ? { id: String(row.id), name: row.client_name, type: 'Individual' }
      : null,
    broker:      row["broker's_name"]
      ? { id: row["broker's_name"], name: row["broker's_name"] }
      : null,
  };
}

/** Apply shared filters (including pre-computed ISO date range) to any Supabase query builder */
function applyFilters(
  query: any,
  search: string,
  status: string,
  brokerName: string,
  startDate: string,
  endDate: string
) {
  if (search) {
    const s = search.trim();
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
      if (strippedId !== s) {
        clauses.push(`r_no.ilike.%${strippedId}%`);
        clauses.push(`registration_no.ilike.%${strippedId}%`);
      }
    }
    query = query.or(clauses.join(','));
  }

  // Status: 'Pending' = null OR empty string; 'Completed' = non-null AND non-empty
  if (status === 'Completed') {
    query = query.not('emi_paid_date', 'is', null).neq('emi_paid_date', '');
  } else if (status === 'Pending') {
    query = query.or('emi_paid_date.is.null,emi_paid_date.eq.');
  }

  if (brokerName) {
    // Column name contains an apostrophe — use an OR filter with quoted values
    // instead of .eq(), which parses the column as "broker" and errors.
    const safe = brokerName.trim().replace(/"/g, '\\"');
    query = query.or(
      `"broker's_name".eq."${safe}",broker_code.eq."${safe}",ba_code.eq."${safe}",broker_name_clean.eq."${safe}"`
    );
  }

  if (startDate || endDate) {
    query = query.not('emi_paid_date_iso', 'is', null);
    if (startDate) query = query.gte('emi_paid_date_iso', startDate);
    if (endDate) query = query.lte('emi_paid_date_iso', endDate);
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

    const countCacheKey = `count:txns:${search}|${status}|${brokerName}|${startDate}|${endDate}`;
    const [{ data, error }, count, brokerNames] = await Promise.all([
      applyFilters(
        supabase.from(TABLE_NAME).select(TXN_COLS),
        search, status, brokerName, startDate, endDate
      )
        .order('id', { ascending: false })
        .range(offset, offset + limit - 1),
      withServerCache(countCacheKey, async () => {
        const { count: c, error: cErr } = await applyFilters(
          supabase.from(TABLE_NAME).select('*', { count: 'exact', head: true }),
          search, status, brokerName, startDate, endDate
        );
        if (cErr) throw new Error(cErr.message);
        return c || 0;
      }),
      withServerCache('rpc:get_unique_brokers_rpc', async () => {
        const { data: b } = await supabase.rpc('get_unique_brokers_rpc');
        return Array.isArray(b) ? b : [];
      }),
    ]);

    if (error) throw new Error(error.message);

    const totalItems = count || 0;
    const transactions = (data || []).map(mapRow);
    const totalPages = Math.ceil(totalItems / limit);

    const brokers = (Array.isArray(brokerNames) ? (brokerNames as string[]) : []).map((name) => ({
      id: name,
      name,
    }));

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
