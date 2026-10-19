import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { parseAmount, normalizeDate, isPaid } from '@/utils/dataUtils';
import { invalidateServerCache } from '@/utils/serverCache';

const TABLE_NAME = 'Master Data Of Gurukrupa';

// GET handler – fetch a single transaction by ID (supports b<id> custom bills and master data rows)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const s = String(rawId || '').trim();
    const supabase = createServiceClient();

    // ── Custom bill (id = "b123") ─────────────────────────────────────────────
    if (/^b\d+$/i.test(s)) {
      const billId = parseInt(s.slice(1), 10);
      const { data: bill, error: billErr } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .single();

      if (billErr || !bill) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }

      const b: any = bill;
      const amt = parseFloat(b.amount) || 0;
      const desc = [b.society_name, b.plot_no ? `Plot ${b.plot_no}` : null]
        .filter(Boolean).join(' – ') || b.description || 'Property Sale';

      return NextResponse.json({
        id:          `b${b.id}`,
        date:        b.date || null,
        description: desc,
        amount:      amt,
        emiAmount:   amt,
        status:      b.status === 'Paid' ? 'Completed' : (b.status === 'Cancelled' ? 'Cancelled' : 'Pending'),
        source:      'Property Sale',
        reference:   b.bill_number || `b${b.id}`,
        clientId:    `b${b.id}`,
        client:      b.client_name
          ? { id: `b${b.id}`, name: b.client_name, type: 'Individual' }
          : null,
        broker:      b.reference_by
          ? { id: b.reference_by, name: b.reference_by }
          : null,
      });
    }

    // ── Master-data transaction (numeric or "t123" / "#123") ──────────────────
    const cleanId = s.replace(/^(t|#)/i, '');
    const id = parseInt(cleanId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const row: any = data;
    const desc = [row.society_name, row.plot_no ? `Plot ${row.plot_no}` : null]
      .filter(Boolean).join(' – ') || 'Property Sale';
    const paidAmt = row.paid_amount_num ?? parseAmount(row.paid_amount);
    const emiAmt  = row.emi_amount_num ?? parseAmount(row.emi_amount);
    const amount  = paidAmt || emiAmt;
    const isCancelled = Boolean(row.cancel_date && String(row.cancel_date).trim() !== '');
    const completed   = isPaid(row.emi_paid_date);
    const date        = row.emi_paid_date_iso || normalizeDate(row.emi_paid_date) || (row.emi_paid_date ? String(row.emi_paid_date).trim() : null);

    return NextResponse.json({
      id:          row.id,
      date,
      description: desc,
      amount,
      emiAmount:   emiAmt,
      status:      isCancelled ? 'Cancelled' : (completed ? 'Completed' : 'Pending'),
      source:      'Property Sale',
      reference:   row.registration_no || row.r_no || row.emi_no || `#${row.id}`,
      clientId:    row.id,
      client:      row.client_name
        ? { id: row.id, name: row.client_name, type: 'Individual' }
        : null,
      broker:      row["broker's_name"]
        ? { id: row["broker's_name"], name: row["broker's_name"] }
        : null,
    });
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const s = String(rawId || '').trim();
    const supabase = createServiceClient();
    const body = await request.json();

    // ── Custom bill update ────────────────────────────────────────────────────
    if (/^b\d+$/i.test(s)) {
      const billId = parseInt(s.slice(1), 10);
      const updates: Record<string, any> = {};
      const allowedBillMap: Record<string, string[]> = {
        client_name:   ['client_name', 'clientName'],
        society_name:  ['society_name', 'societyName'],
        plot_no:       ['plot_no', 'plotNo'],
        amount:        ['amount', 'emi_amount', 'emiAmount'],
        date:          ['date', 'emi_paid_date', 'emiPaidDate'],
        status:        ['status'],
        payment_ref:   ['payment_ref', 'paymentRef', 'r_no', 'rNo', 'reference'],
        description:   ['description', 'remarks'],
        reference_by:  ['reference_by', 'referenceBy', "broker's_name", 'broker_name', 'brokerName'],
      };

      for (const [col, keys] of Object.entries(allowedBillMap)) {
        for (const k of keys) {
          if (body[k] !== undefined) {
            updates[col] = body[k];
            break;
          }
        }
      }

      if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('bills')
        .update(updates)
        .eq('id', billId)
        .select('*')
        .single();

      if (error) throw new Error(error.message);

      invalidateServerCache();
      return NextResponse.json({ success: true, data });
    }

    // ── Master-data transaction update ────────────────────────────────────────
    const cleanId = s.replace(/^(t|#)/i, '');
    const id = parseInt(cleanId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }

    const updates: Record<string, any> = {};

    const allowedMap: Record<string, string[]> = {
      client_name:      ['client_name', 'clientName'],
      society_name:     ['society_name', 'societyName'],
      plot_no:          ['plot_no', 'plotNo'],
      emi_amount:       ['emi_amount', 'emiAmount', 'amount'],
      paid_amount:      ['paid_amount', 'paidAmount'],
      emi_paid_date:    ['emi_paid_date', 'emiPaidDate', 'date'],
      cancel_date:      ['cancel_date', 'cancelDate'],
      r_no:             ['r_no', 'rNo', 'reference'],
      remarks:          ['remarks', 'description'],
      "broker's_name":  ["broker's_name", 'broker_name', 'brokerName'],
    };

    for (const [col, keys] of Object.entries(allowedMap)) {
      for (const k of keys) {
        if (body[k] !== undefined) {
          updates[col] = body[k] === null ? null : String(body[k]);
          break;
        }
      }
    }

    // Status shortcut
    if (body.status === 'Cancelled') {
      updates.cancel_date = updates.cancel_date || new Date().toISOString().split('T')[0];
    } else if (body.status === 'Completed') {
      updates.cancel_date = null;
      if (!updates.emi_paid_date && !body.emi_paid_date && !body.date) {
        updates.emi_paid_date = new Date().toISOString().split('T')[0];
      }
    } else if (body.status === 'Pending') {
      updates.cancel_date = null;
      updates.emi_paid_date = null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);

    invalidateServerCache();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const s = String(rawId || '').trim();
    const supabase = createServiceClient();

    // ── Custom bill delete ────────────────────────────────────────────────────
    if (/^b\d+$/i.test(s)) {
      const billId = parseInt(s.slice(1), 10);
      const { error } = await supabase.from('bills').delete().eq('id', billId);
      if (error) throw new Error(error.message);

      invalidateServerCache();
      return NextResponse.json({ success: true });
    }

    // ── Master-data transaction delete ────────────────────────────────────────
    const cleanId = s.replace(/^(t|#)/i, '');
    const id = parseInt(cleanId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);

    invalidateServerCache();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
