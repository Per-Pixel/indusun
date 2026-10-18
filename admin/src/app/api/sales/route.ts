import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { withServerCache } from '@/utils/serverCache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate  = searchParams.get('startDate')  || null;
    const endDate    = searchParams.get('endDate')    || null;
    const brokerName = searchParams.get('brokerName') || null;
    const sortBy     = searchParams.get('sortBy')     || 'date';
    const sortOrder  = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const cacheKey = `rpc:sales:${startDate || ''}:${endDate || ''}:${brokerName || ''}:${sortBy}:${sortOrder}`;
    const data = await withServerCache(cacheKey, async () => {
      const supabase = createServiceClient();
      const { data: d, error } = await supabase.rpc('get_sales_aggregates_rpc', {
        p_start_date: startDate,
        p_end_date: endDate,
        p_broker_name: brokerName,
        p_sort_by: sortBy,
        p_sort_order: sortOrder,
      });
      if (error || !d) {
        throw new Error(error?.message || 'Failed to compute sales aggregates');
      }
      return d;
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
