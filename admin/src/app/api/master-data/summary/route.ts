import { NextResponse } from 'next/server';
import { getMasterDataSummary } from '@/services/masterDataService';

export async function GET() {
  const { summary, error } = await getMasterDataSummary();
  if (error || !summary) {
    return NextResponse.json({ error: error?.message || 'Failed to load summary' }, { status: 500 });
  }
  return NextResponse.json({ summary });
}
