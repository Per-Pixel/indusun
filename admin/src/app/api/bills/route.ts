import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { invalidateServerCache } from '@/utils/serverCache';
import { requireStaff } from '@/lib/adminAccess';

const MASTER_TABLE = 'Master Data Of Gurukrupa';

// Schema: see admin/sql/add_bills_payment_method.sql (base table) and
// admin/sql/brokers_and_bills_enhancements.sql (due_date, items, tax_rate,
// discount, payment_ref). POST degrades gracefully if those columns don't
// exist yet — the bill still saves without them.

export async function GET(req: NextRequest) {
  const access = await requireStaff('billing_management');
  if (access.denied) return access.denied;
  try {
    const { searchParams } = new URL(req.url);
    const client = (searchParams.get('client') || '').trim();
    const page   = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const parsedLimit = parseInt(searchParams.get('limit') || '', 10);
    const limit = Math.max(1, Math.min(200, Number.isFinite(parsedLimit) ? parsedLimit : client ? 100 : 25));
    const offset = (page - 1) * limit;

    const supabase = createServiceClient();
    let query = supabase.from('bills').select('*', { count: 'exact' });
    if (client) {
      query = query.ilike('client_name', client).order('date', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    const { data, error, count } = await query.range(offset, offset + limit - 1);

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
  const access = await requireStaff('billing_management');
  if (access.denied) return access.denied;
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

function cleanBillText(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s || null;
}

// PUT /api/bills  { id, ...fields }
// Updates the bill fields sent in the body. Omitted fields are left as they are.
export async function PUT(req: NextRequest) {
  const access = await requireStaff('billing_management');
  if (access.denied) return access.denied;
  try {
    const body = await req.json();
    const id = parseInt(String(body.id ?? '').replace(/^b/i, ''), 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Valid bill id required' }, { status: 400 });
    }

    const base: Record<string, unknown> = {};
    const extra: Record<string, unknown> = {};

    if ('billNumber' in body) base.bill_number = cleanBillText(body.billNumber) || `BILL-${id}`;
    if ('clientName' in body) {
      const name = cleanBillText(body.clientName);
      if (!name) return NextResponse.json({ error: 'clientName is required' }, { status: 400 });
      base.client_name = name;
    }
    if ('clientPhone' in body) base.client_phone = cleanBillText(body.clientPhone);
    if ('clientAddress' in body) base.client_address = cleanBillText(body.clientAddress);
    if ('description' in body) base.description = cleanBillText(body.description);
    if ('amount' in body) {
      const parsedAmount = parseFloat(String(body.amount));
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
      }
      base.amount = parsedAmount;
    }
    if ('date' in body) base.date = cleanBillText(body.date);
    if ('notes' in body) base.notes = cleanBillText(body.notes);
    if ('paymentMethod' in body) base.payment_method = cleanBillText(body.paymentMethod);
    if ('status' in body) base.status = body.status === 'Paid' ? 'Paid' : 'Pending';

    if ('societyName' in body) extra.society_name = cleanBillText(body.societyName);
    if ('plotNo' in body) extra.plot_no = cleanBillText(body.plotNo);
    if ('plotSize' in body) extra.plot_size = cleanBillText(body.plotSize);
    if ('referenceBy' in body) extra.reference_by = cleanBillText(body.referenceBy);
    if ('totalEmiNo' in body) extra.total_emi_no = cleanBillText(body.totalEmiNo);
    if ('plotAmount' in body) extra.plot_amount = Math.max(0, parseFloat(String(body.plotAmount)) || 0);
    if ('amountInWords' in body) extra.amount_in_words = cleanBillText(body.amountInWords);
    if ('remarks' in body) extra.remarks = cleanBillText(body.remarks);
    if ('cancellationNote' in body) extra.cancellation_note = cleanBillText(body.cancellationNote);
    if ('dueDate' in body) extra.due_date = cleanBillText(body.dueDate);
    if ('paymentRef' in body) extra.payment_ref = cleanBillText(body.paymentRef);
    if ('upiVpa' in body) extra.upi_vpa = cleanBillText(body.upiVpa);
    if ('showQr' in body) extra.show_qr = body.showQr !== false;
    if ('taxRate' in body) extra.tax_rate = Math.max(0, parseFloat(String(body.taxRate)) || 0);
    if ('discount' in body) extra.discount = Math.max(0, parseFloat(String(body.discount)) || 0);

    if (Object.keys(base).length === 0 && Object.keys(extra).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const supabase = createServiceClient();
    let { data, error } = await supabase
      .from('bills')
      .update({ ...base, ...extra })
      .eq('id', id)
      .select('*')
      .single();

    if (error && (error.code === 'PGRST204' || error.code === '42703') && Object.keys(base).length > 0) {
      const retry = await supabase.from('bills').update(base).eq('id', id).select('*').single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw new Error(error.message);
    invalidateServerCache();
    return NextResponse.json({ success: true, bill: data });
  } catch (err: any) {
    console.error('Bills PUT error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update bill' }, { status: 500 });
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
