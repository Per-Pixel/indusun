import { NextResponse } from 'next/server';
import { getUniqueSocieties } from '@/services/masterDataService';

export async function GET() {
  const result = await getUniqueSocieties();

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ societies: result.societies });
}
