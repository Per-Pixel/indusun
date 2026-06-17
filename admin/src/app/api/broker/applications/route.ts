import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      applications: [],
      message: 'Broker applications feature requires a broker_applications table in Supabase. Please complete the database migration.',
    },
    { status: 503 }
  );
}
