import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

const MASTER_TABLE = 'Master Data Of Gurukrupa';
const CLIENTS_TABLE = 'clients';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    // Custom clients have IDs prefixed with "c-"
    if (id.startsWith('c-')) {
      const uuid = id.slice(2);
      const { data, error } = await supabase
        .from(CLIENTS_TABLE)
        .select('*')
        .eq('id', uuid)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }

      return NextResponse.json({
        client: {
          id:         `c-${data.id}`,
          name:       data.name,
          phone:      data.phone || '',
          email:      data.email || '',
          role:       'client',
          status:     data.status || 'active',
          location:   data.location || '',
          image:      `/images/avatars/avatar_1.jpg`,
          lastActive: data.created_at ? data.created_at.split('T')[0] : '',
          createdAt:  data.created_at ? data.created_at.split('T')[0] : '',
          source:     'custom',
        },
      });
    }

    // Master data clients have numeric IDs
    const rowId = parseInt(id);
    if (isNaN(rowId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(MASTER_TABLE)
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
        source:     'master',
      },
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Only writable for custom clients
    if (!id.startsWith('c-')) {
      return NextResponse.json(
        { error: 'Editing master data clients is not supported. Only custom-added clients can be edited.' },
        { status: 405 }
      );
    }

    const uuid = id.slice(2);
    const body = await req.json();
    const { name, phone, email, status, location, notes } = body;

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from(CLIENTS_TABLE)
      .update({
        name:     name?.trim(),
        phone:    phone?.trim() || null,
        email:    email?.trim() || null,
        status:   status || 'active',
        location: location?.trim() || null,
        notes:    notes?.trim() || null,
      })
      .eq('id', uuid)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Client not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true, client: data });
  } catch (error: any) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: error.message || 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Only deletable for custom clients
    if (!id.startsWith('c-')) {
      return NextResponse.json(
        { error: 'Deleting master data clients is not supported. Only custom-added clients can be deleted.' },
        { status: 405 }
      );
    }

    const uuid = id.slice(2);
    const supabase = createServiceClient();
    const { error } = await supabase
      .from(CLIENTS_TABLE)
      .delete()
      .eq('id', uuid);

    if (error) {
      return NextResponse.json({ error: 'Client not found or delete failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete client' }, { status: 500 });
  }
}
