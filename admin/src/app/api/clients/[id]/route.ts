import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

const TABLE_NAME = 'Master Data Of Gurukrupa';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rowId = parseInt(id);
    if (isNaN(rowId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('id,client_name,contact_no,created_at')
      .eq('id', rowId)
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const name   = (data as any).client_name || '';
    const parts  = name.split(' ');
    const first  = parts[0]?.toLowerCase() || '';
    const last   = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';

    return NextResponse.json({
      client: {
        id:         (data as any).id,
        name,
        phone:      (data as any).contact_no || '',
        email:      `${first}.${last}@example.com`,
        role:       'client',
        status:     'active',
        location:   '',
        image:      `/images/avatars/avatar_${((data as any).id % 24) + 1}.jpg`,
        lastActive: new Date().toISOString().split('T')[0],
        createdAt:  (data as any).created_at
          ? new Date((data as any).created_at).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      },
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Editing clients is not supported on the read-only master data table.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Deleting clients is not supported on the read-only master data table.' },
    { status: 405 }
  );
}
