import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedMasterData } from '@/services/masterDataService';
import { createServiceClient } from '@/utils/supabase/service';
import { invalidateServerCache } from '@/utils/serverCache';

const TABLE_NAME = 'Master Data Of Gurukrupa';

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
  'project_name',
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
  'broker_name_clean',
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

function cleanStr(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s || null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
  const clientNameFilter = searchParams.get('clientNameFilter') || '';
  const search = searchParams.get('search') || '';
  const societyFilter = searchParams.get('societyFilter') || '';
  const brokerFilter = searchParams.get('broker') || '';

  const result = await getPaginatedMasterData({
    page,
    pageSize,
    clientNameFilter,
    search,
    societyFilter,
    brokerFilter,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ data: result.data, count: result.count });
}

async function handleUpdate(request: NextRequest) {
  try {
    const body = await request.json();
    const id = Number(body?.id);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Valid record id is required' }, { status: 400 });
    }

    const updateData: Record<string, string | null> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in body) {
        updateData[key] = cleanStr(body[key]);
      }
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
        { error: error?.message || 'Failed to update record' },
        { status: 500 }
      );
    }

    invalidateServerCache();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Master data PATCH/PUT error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update master data record' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  return handleUpdate(request);
}

export async function PUT(request: NextRequest) {
  return handleUpdate(request);
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id');

    const idsToDelete: number[] = [];

    if (queryId) {
      const parsed = Number(queryId);
      if (Number.isFinite(parsed) && parsed > 0) {
        idsToDelete.push(parsed);
      }
    }

    if (idsToDelete.length === 0) {
      const body = await request.json().catch(() => ({}));
      if (body?.id !== undefined) {
        const parsed = Number(body.id);
        if (Number.isFinite(parsed) && parsed > 0) {
          idsToDelete.push(parsed);
        }
      }
      if (Array.isArray(body?.ids)) {
        for (const raw of body.ids) {
          const parsed = Number(raw);
          if (Number.isFinite(parsed) && parsed > 0) {
            idsToDelete.push(parsed);
          }
        }
      }
    }

    const uniqueIds = Array.from(new Set(idsToDelete));
    if (uniqueIds.length === 0) {
      return NextResponse.json({ error: 'No valid record ID(s) provided' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .in('id', uniqueIds);

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to delete record(s)' },
        { status: 500 }
      );
    }

    invalidateServerCache();
    return NextResponse.json({ success: true, deletedCount: uniqueIds.length });
  } catch (err: any) {
    console.error('Master data DELETE error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete master data record(s)' },
      { status: 500 }
    );
  }
}
