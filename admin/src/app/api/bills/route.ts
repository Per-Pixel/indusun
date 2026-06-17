import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

// Run this SQL once in the Supabase SQL editor to create the table:
//
// CREATE TABLE IF NOT EXISTS bills (
//   id             BIGSERIAL     PRIMARY KEY,
//   bill_number    TEXT          NOT NULL,
//   client_name    TEXT          NOT NULL,
//   client_phone   TEXT,
//   client_address TEXT,
//   description    TEXT,
//   amount         NUMERIC(15,2) NOT NULL DEFAULT 0,
//   date           DATE          NOT NULL DEFAULT CURRENT_DATE,
//   notes          TEXT,
//   status         TEXT          NOT NULL DEFAULT 'Pending'
//                                CHECK (status IN ('Paid', 'Pending')),
//   created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
// );

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page   = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit  = Math.max(1, parseInt(searchParams.get('limit') || '25'));
    const offset = (page - 1) * limit;

    const supabase = createServiceClient();
    const { data, error, count } = await supabase
      .from('bills')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({
          bills: [],
          pagination: { page, limit, totalItems: 0, totalPages: 0 },
        });
      }
      throw new Error(error.message);
    }

    return NextResponse.json({
      bills: data || [],
      pagination: { page, limit, totalItems: count || 0, totalPages: Math.ceil((count || 0) / limit) },
    });
  } catch (err: any) {
    console.error('Bills GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      billNumber, clientName, clientPhone, clientAddress,
      description, amount, date, notes, status,
    } = body;

    if (!clientName?.trim()) {
      return NextResponse.json({ error: 'clientName is required' }, { status: 400 });
    }
    const parsedAmount = parseFloat(String(amount));
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('bills')
      .insert({
        bill_number:    billNumber?.trim()     || `BILL-${Date.now()}`,
        client_name:    clientName.trim(),
        client_phone:   clientPhone?.trim()   || null,
        client_address: clientAddress?.trim() || null,
        description:    description?.trim()   || null,
        amount:         parsedAmount,
        date:           date || new Date().toISOString().split('T')[0],
        notes:          notes?.trim()         || null,
        status:         status === 'Paid' ? 'Paid' : 'Pending',
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'bills table not found — please create it in the Supabase SQL editor (see route comment).' },
          { status: 503 },
        );
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (err: any) {
    console.error('Bills POST error:', err);
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}
