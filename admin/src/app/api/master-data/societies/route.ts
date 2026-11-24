import { NextResponse } from 'next/server';
import { getUniqueSocieties } from '@/services/masterDataService';
import { forbidUnless, requireStaff } from '@/lib/adminAccess';

export async function GET() {
  const access = await requireStaff();
  if (access.denied) return access.denied;
  const denied = forbidUnless(access.user, 'billing_management', 'property_management', 'lead_management');
  if (denied) return denied;
  const result = await getUniqueSocieties();

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ societies: result.societies });
}
