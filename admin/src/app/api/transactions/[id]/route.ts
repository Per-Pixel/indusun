import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

const TABLE_NAME = 'Master Data Of Gurukrupa';

function parseAmount(amount: string | null | undefined): number {
  if (!amount) return 0;
  const cleaned = String(amount).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

// GET handler – fetch a single master-data record by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }

    const supabase = createServiceClient();
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

    return NextResponse.json({
      id:          row.id,
      date:        row.emi_paid_date || null,
      description: desc,
      amount:      parseAmount(row.emi_amount),
      status:      row.emi_paid_date ? 'Completed' : 'Pending',
      source:      'Property Sale',
      reference:   row.r_no || row.emi_no || `#${row.id}`,
      clientId:    row.id,
      client:      row.client_name
        ? { id: row.id, name: row.client_name, type: 'Individual' }
        : null,
      broker:      row["broker's_name"]
        ? { id: 0, name: row["broker's_name"] }
        : null,
    });
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
  }
}

// Mutations are not supported on read-only master data
export async function PUT() {
  return NextResponse.json(
    { error: 'Editing master data records is not supported' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Deleting master data records is not supported' },
    { status: 405 }
  );
}
