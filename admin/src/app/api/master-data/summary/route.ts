import { NextResponse } from 'next/server';
import { getMasterDataSummary } from '@/services/masterDataService';
import { requireStaff } from '@/lib/adminAccess';

export async function GET() {
  const access = await requireStaff('financial_reports');
  if (access.denied) return access.denied;
  const { summary, error } = await getMasterDataSummary();
  if (error || !summary) {
    return NextResponse.json({ error: error?.message || 'Failed to load summary' }, { status: 500 });
  }
  return NextResponse.json({ summary });
}
