import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

function isMissingTable(err: any) {
  return err?.code === '42P01' || /could not find the table/i.test(err?.message || '');
}

function parseTableId(id: string): number | null {
  if (!id.startsWith('t')) return null;
  const n = parseInt(id.slice(1));
  return isNaN(n) ? null : n;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rowId = parseTableId(id);
    if (rowId === null) {
      return NextResponse.json(
        { error: 'Only brokers in the directory have a detail record. Records-derived brokers have no standalone page.' },
        { status: 404 }
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('brokers')
      .select('*')
      .eq('id', rowId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Broker not found' }, { status: 404 });
    }

    const r = data as any;
    return NextResponse.json({
      broker: {
        id: `t${r.id}`,
        name: r.name,
        email: r.email || null,
        phone: r.phone || null,
        location: r.location || null,
        commission_rate: r.commission_rate ?? null,
        rera_number: r.rera_number || null,
        source: 'directory',
        createdAt: r.created_at || null,
      },
    });
  } catch (error) {
    console.error('Error fetching broker:', error);
    return NextResponse.json({ error: 'Failed to fetch broker' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rowId = parseTableId(id);
    if (rowId === null) {
      return NextResponse.json(
        { error: 'Brokers derived from records are read-only. Rename them in the master data or add them to the directory.' },
        { status: 405 }
      );
    }

    const body = await req.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const record = {
      name:            body.name.trim(),
      phone:           body.phone?.trim()    || null,
      email:           body.email?.trim()    || null,
      location:        body.location?.trim() || null,
      commission_rate: body.commission_rate === '' || body.commission_rate == null
        ? null
        : Number(body.commission_rate),
      rera_number:     body.rera_number?.trim() || null,
    };

    const supabase = createServiceClient();
    const { error } = await supabase
      .from('brokers')
      .update(record)
      .eq('id', rowId);

    if (error) {
      if (isMissingTable(error)) {
        return NextResponse.json(
          { error: 'brokers table not found — run the migration in admin/sql/brokers_and_bills.sql' },
          { status: 503 }
        );
      }
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A broker with this name already exists' }, { status: 409 });
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Brokers PUT error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update broker' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rowId = parseTableId(id);
    if (rowId === null) {
      return NextResponse.json(
        { error: 'Brokers derived from records cannot be deleted here. Remove the name from master data rows instead.' },
        { status: 405 }
      );
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from('brokers')
      .delete()
      .eq('id', rowId);

    if (error) {
      if (isMissingTable(error)) {
        return NextResponse.json(
          { error: 'brokers table not found — run the migration in admin/sql/brokers_and_bills.sql' },
          { status: 503 }
        );
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Brokers DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete broker' }, { status: 500 });
  }
}
