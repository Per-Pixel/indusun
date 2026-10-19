import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { invalidateServerCache } from '@/utils/serverCache';

const TABLE_NAME = 'Master Data Of Gurukrupa';

const ALLOWED_FIELDS = [
  'society_name',
  'project_name',
  'block_name',
  'plot_no',
  'plot_size',
  'plot_amount',
  'client_name',
  'contact_no',
  'paid_amount',
  'emi_amount',
  'emi_time',
  'emi_no',
  'r_no',
  'registration_no',
  'policy_number',
  'cheque_cash',
  'month_and_year',
  'date_of_form',
  'date',
  'cancel_date',
  'remarks',
  "broker's_name",
  'broker_code',
  'ba_code',
] as const;

function cleanStr(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s || null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'Property not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const updateData: Record<string, string | null> = {};

    for (const key of ALLOWED_FIELDS) {
      if (key in body) {
        updateData[key] = cleanStr(body[key]);
      }
    }

    // Support Property form fields if submitted from /properties/[id]/edit
    if (!('society_name' in updateData) && body.actualLocation) {
      updateData.society_name = cleanStr(body.actualLocation);
    }
    if (!('plot_amount' in updateData) && body.price) {
      updateData.plot_amount = cleanStr(String(body.price).replace(/[^0-9.]/g, ''));
    }
    if (!('plot_size' in updateData) && body.squareFootage) {
      updateData.plot_size = cleanStr(body.squareFootage);
    }
    if (!('remarks' in updateData) && body.description) {
      updateData.remarks = cleanStr(body.description);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Failed to update property' },
        { status: 500 }
      );
    }

    invalidateServerCache();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Properties [id] PUT error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update property' },
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
    const id = parseInt(rawId, 10);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to delete property' },
        { status: 500 }
      );
    }

    invalidateServerCache();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Properties [id] DELETE error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete property' },
      { status: 500 }
    );
  }
}
