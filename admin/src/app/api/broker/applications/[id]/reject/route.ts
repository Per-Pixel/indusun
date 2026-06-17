import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Broker application rejection requires a broker_applications table in Supabase. Please complete the database migration.' },
    { status: 503 }
  );
}
