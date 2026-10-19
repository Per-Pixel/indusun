import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { invalidateServerCache } from '@/utils/serverCache';

const MASTER_TABLE = 'Master Data Of Gurukrupa';

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
      societyName, plotNo, plotSize, referenceBy, totalEmiNo, plotAmount,
      description, amount, amountInWords, remarks, cancellationNote,
      bankDetails, upiVpa, showQr,
      date, notes, status, paymentMethod,
      dueDate, items, taxRate, discount, paymentRef,
      attachments, linkedBillIds,
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
      society_name:      societyName?.trim()      || null,
      plot_no:           plotNo?.trim()           || null,
      plot_size:         plotSize?.trim()         || null,
      reference_by:      referenceBy?.trim()      || null,
      total_emi_no:      totalEmiNo?.trim()       || null,
      plot_amount:       Math.max(0, parseFloat(plotAmount) || 0),
      amount_in_words:   amountInWords?.trim()    || null,
      remarks:           remarks?.trim()          || null,
      cancellation_note: cancellationNote?.trim() || null,
      bank_details:      Array.isArray(bankDetails) ? bankDetails : [],
      upi_vpa:           upiVpa?.trim()           || 'gurukrupacorp@kbl',
      show_qr:           showQr !== false,
      due_date:          dueDate || null,
      items:             lineItems,
      tax_rate:          Math.max(0, parseFloat(taxRate) || 0),
      discount:          Math.max(0, parseFloat(discount) || 0),
      payment_ref:       paymentRef?.trim() || null,
      attachments:       Array.isArray(attachments) ? attachments : [],
      linked_bill_ids:   Array.isArray(linkedBillIds) ? linkedBillIds : [],
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

    invalidateServerCache();
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
    const rawId = String(body.id ?? '').replace(/^b/i, '');
    const id = parseInt(rawId, 10);
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
    invalidateServerCache();
    return NextResponse.json({ success: true, id: data.id, status: data.status });

  } catch (err: any) {
    console.error('Bills PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 });
  }
}

// DELETE /api/bills  ?id=<billId>&source=master | { id, ids, source }
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get('id');
    const querySource = searchParams.get('source');

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // No JSON body provided
    }

    const source = body?.source || querySource;
    const rawList: (string | number)[] = Array.isArray(body?.ids)
      ? body.ids
      : body?.id !== undefined
      ? [body.id]
      : queryId
      ? [queryId]
      : [];

    if (rawList.length === 0) {
      return NextResponse.json({ error: 'Bill id or ids required' }, { status: 400 });
    }

    const billIds: number[] = [];
    const masterIds: number[] = [];

    for (const item of rawList) {
      const s = String(item).trim();
      if (/^b\d+$/i.test(s)) {
        const n = parseInt(s.slice(1), 10);
        if (!isNaN(n)) billIds.push(n);
      } else {
        const n = parseInt(s, 10);
        if (!isNaN(n)) {
          if (source === 'master') {
            masterIds.push(n);
          } else {
            billIds.push(n);
          }
        }
      }
    }

    if (billIds.length === 0 && masterIds.length === 0) {
      return NextResponse.json({ error: 'No valid IDs provided' }, { status: 400 });
    }

    const supabase = createServiceClient();

    if (billIds.length > 0) {
      const { error } = await supabase.from('bills').delete().in('id', billIds);
      if (error) throw new Error(error.message);
    }

    if (masterIds.length > 0) {
      const { error } = await supabase.from(MASTER_TABLE).delete().in('id', masterIds);
      if (error) throw new Error(error.message);
    }

    invalidateServerCache();
    return NextResponse.json({
      success: true,
      deletedBills: billIds.length,
      deletedMaster: masterIds.length,
    });
  } catch (err: any) {
    console.error('Bills DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete bill(s)' }, { status: 500 });
  }
}
