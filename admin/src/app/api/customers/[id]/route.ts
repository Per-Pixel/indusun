import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { invalidateServerCache } from '@/utils/serverCache';

const TABLE_NAME = 'Master Data Of Gurukrupa';

function cleanStr(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s || null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rowId = parseInt(id, 10);
    if (isNaN(rowId)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: customer, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', rowId)
      .single();

    if (error || !customer) {
      return NextResponse.json({ error: 'Customer record not found' }, { status: 404 });
    }

    let portfolio: any[] = [];
    if (customer.client_name) {
      const { data: rows } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .ilike('client_name', customer.client_name)
        .order('id', { ascending: false });
      portfolio = rows || [];
    }

    return NextResponse.json({ customer, portfolio });
  } catch (err: any) {
    console.error('Error in GET /api/customers/[id]:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

const ALLOWED_FIELDS = [
  'client_name',
  'father_or_husband_name',
  'contact_no',
  'resident_no',
  'address',
  'profession',
  'age',
  'date_of_birth',
  'aadhar_no',
  'pan_no',
  'society_name',
  'block_name',
  'plot_no',
  'plot_size',
  'plot_amount',
  'paid_amount',
  'amount_in_word',
  'emi_amount',
  'emi_no',
  'emi_time',
  'emi_date',
  'emi_paid_date',
  "broker's_name",
  'broker_code',
  'ba_code',
  'r_no',
  'registration_no',
  'policy_number',
  'cheque_cash',
  'month_and_year',
  'date_of_form',
  'date',
  'cancel_date',
  'remarks',
  'nominee_name',
  'nominee_relation',
  'nominee_age',
  'nominee_dob',
  'nominee_profession',
] as const;

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rowId = parseInt(id, 10);
    if (isNaN(rowId)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }

    const body = await req.json();
    const supabase = createServiceClient();

    const updateData: Record<string, any> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in body) {
        updateData[key] = cleanStr(body[key]);
      }
    }

    if ('client_name' in updateData && !updateData.client_name) {
      return NextResponse.json({ error: 'Customer name cannot be empty' }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', rowId)
      .select()
      .single();

    if (error || !updated) {
      console.error('Error updating customer record:', error);
      return NextResponse.json(
        { error: error?.message || 'Failed to update customer record' },
        { status: 500 }
      );
    }

    // Optionally sync personal details across all rows for the same client_name
    if (body.updateAllForClient) {
      const targetName = cleanStr(body.originalClientName) || updated.client_name;
      if (targetName) {
        const personalSync: Record<string, any> = {};
        const personalKeys = [
          'client_name',
          'father_or_husband_name',
          'contact_no',
          'resident_no',
          'address',
          'profession',
          'age',
          'date_of_birth',
          'aadhar_no',
          'pan_no',
          'nominee_name',
          'nominee_relation',
        ];
        for (const k of personalKeys) {
          if (k in updateData) {
            personalSync[k] = updateData[k];
          }
        }
        if (Object.keys(personalSync).length > 0) {
          await supabase
            .from(TABLE_NAME)
            .update(personalSync)
            .ilike('client_name', targetName);
        }
      }
    }

    invalidateServerCache();

    return NextResponse.json({ success: true, customer: updated });
  } catch (err: any) {
    console.error('Unexpected error in PUT /api/customers/[id]:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rowId = parseInt(id, 10);
    if (isNaN(rowId)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }

    const url = new URL(req.url);
    const scope = url.searchParams.get('scope') === 'customer' ? 'customer' : 'record';

    const supabase = createServiceClient();

    if (scope === 'customer') {
      const { data: existing, error: fetchErr } = await supabase
        .from(TABLE_NAME)
        .select('id,client_name')
        .eq('id', rowId)
        .single();

      if (fetchErr || !existing) {
        return NextResponse.json({ error: 'Customer record not found' }, { status: 404 });
      }

      const clientName = existing.client_name?.trim();
      if (clientName) {
        const { error: delErr } = await supabase
          .from(TABLE_NAME)
          .delete()
          .ilike('client_name', clientName);

        if (delErr) {
          return NextResponse.json(
            { error: delErr.message || 'Failed to delete customer records' },
            { status: 500 }
          );
        }

        // Also delete any matching row in the custom clients table
        await supabase.from('clients').delete().ilike('name', clientName);
      } else {
        const { error: delErr } = await supabase
          .from(TABLE_NAME)
          .delete()
          .eq('id', rowId);
        if (delErr) {
          return NextResponse.json(
            { error: delErr.message || 'Failed to delete customer record' },
            { status: 500 }
          );
        }
      }

      invalidateServerCache();
      return NextResponse.json({
        success: true,
        scope: 'customer',
        clientName: clientName || null,
      });
    }

    // Default: delete single installment/plot record by ID
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', rowId);

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to delete customer record' },
        { status: 500 }
      );
    }

    invalidateServerCache();
    return NextResponse.json({ success: true, scope: 'record', id: rowId });
  } catch (err: any) {
    console.error('Unexpected error in DELETE /api/customers/[id]:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
