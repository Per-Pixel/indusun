import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedMasterData } from '@/services/masterDataService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
  const clientNameFilter = searchParams.get('clientNameFilter') || '';
  const societyFilter = searchParams.get('societyFilter') || '';

  const result = await getPaginatedMasterData({ page, pageSize, clientNameFilter, societyFilter });

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ data: result.data, count: result.count });
}
