import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

// Schema: see admin/sql/add_bills_payment_method.sql (base table) and
// admin/sql/brokers_and_bills_enhancements.sql (due_date, items, tax_rate,
// discount, payment_ref). POST degrades gracefully if those columns don't
// exist yet — the bill still saves without them.

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
      description, amount, date, notes, status, paymentMethod,
      dueDate, items, taxRate, discount, paymentRef,
    } = body;

    if (!clientName?.trim()) {
      return NextResponse.json({ error: 'clientName is required' }, { status: 400 });
    }
    const parsedAmount = parseFloat(String(amount));
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    // Sanitize line items
    const lineItems = Array.isArray(items)
      ? items
          .map((it: any) => ({
            description: String(it?.description ?? '').trim(),
            quantity:    Math.max(0, parseFloat(it?.quantity) || 0),
            unit_price:  Math.max(0, parseFloat(it?.unit_price ?? it?.unitPrice) || 0),
          }))
          .filter((it) => it.description && it.quantity > 0)
      : [];

    const supabase = createServiceClient();

    const baseRecord = {
      bill_number:    billNumber?.trim()     || `BILL-${Date.now()}`,
      client_name:    clientName.trim(),
      client_phone:   clientPhone?.trim()   || null,
      client_address: clientAddress?.trim() || null,
      description:    description?.trim()   || null,
      amount:         parsedAmount,
      date:           date || new Date().toISOString().split('T')[0],
      notes:          notes?.trim()         || null,
      payment_method: paymentMethod?.trim() || null,
      status:         status === 'Paid' ? 'Paid' : 'Pending',
    };

    const extendedRecord = {
      ...baseRecord,
      due_date:    dueDate || null,
      items:       lineItems,
      tax_rate:    Math.max(0, parseFloat(taxRate) || 0),
      discount:    Math.max(0, parseFloat(discount) || 0),
      payment_ref: paymentRef?.trim() || null,
    };

    let { data, error } = await supabase
      .from('bills')
      .insert(extendedRecord)
      .select('id')
      .single();

    // Migration not applied yet → retry with legacy columns only
    if (error && (error.code === 'PGRST204' || error.code === '42703')) {
      const retry = await supabase
        .from('bills')
        .insert(baseRecord)
        .select('id')
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'bills table not found — please create it in the Supabase SQL editor (see route comment).' },
          { status: 503 },
        );
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ id: data!.id }, { status: 201 });
  } catch (err: any) {
    console.error('Bills POST error:', err);
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}

// PATCH /api/bills  { id, status }
// Updates a bill's status ('Paid' | 'Pending').
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = parseInt(body.id);
    const status = body.status === 'Paid' ? 'Paid' : 'Pending';
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Valid bill id required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('bills')
      .update({ status })
      .eq('id', id)
      .select('id,status')
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, id: data.id, status: data.status });

  } catch (err: any) {
    console.error('Bills PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 });
  }
}
