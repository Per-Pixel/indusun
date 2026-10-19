import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { withServerCache, invalidateServerCache } from '@/utils/serverCache';
import { parseAmount } from '@/utils/dataUtils';

const MASTER_TABLE = 'Master Data Of Gurukrupa';
const CLIENTS_TABLE = 'clients';

interface MasterClientRpcItem {
  display: string;
  phone: string | null;
  records_count?: number;
  total_paid?: number;
  society?: string;
}

async function resolveMasterClient(
  rawId: string,
  supabase: ReturnType<typeof createServiceClient>
): Promise<{
  clientName: string;
  phone: string;
  location: string;
  createdAt: string;
  firstRecordId: number | null;
  recordsCount: number;
  totalPaid: number;
  portfolio: any[];
} | null> {
  const decoded = decodeURIComponent(rawId).trim();
  const numId = /^\d+$/.test(decoded) ? parseInt(decoded, 10) : NaN;

  let resolvedName = '';
  let fallbackPhone = '';

  if (!isNaN(numId) && numId > 0) {
    // 1. Check 1-based index from get_unique_clients_rpc (used by /api/clients list)
    try {
      const masterClientsData = await withServerCache('rpc:get_unique_clients_rpc', async () => {
        const { data, error } = await supabase.rpc('get_unique_clients_rpc');
        if (error) throw new Error(error.message);
        return data;
      });
      const masterList = Array.isArray(masterClientsData)
        ? (masterClientsData as MasterClientRpcItem[])
        : [];
      const rpcEntry = masterList[numId - 1];
      if (rpcEntry?.display) {
        resolvedName = rpcEntry.display.trim();
        fallbackPhone = rpcEntry.phone || '';
      }
    } catch {
      // ignore RPC failure and fall back to direct table lookup
    }

    // 2. Fallback: check direct row id in Master Data Of Gurukrupa
    if (!resolvedName) {
      const { data: rowById } = await supabase
        .from(MASTER_TABLE)
        .select('id,client_name,contact_no,address,society_name,created_at')
        .eq('id', numId)
        .maybeSingle();
      if (rowById?.client_name) {
        resolvedName = String(rowById.client_name).trim();
        fallbackPhone = rowById.contact_no || '';
      }
    }
  } else if (decoded) {
    resolvedName = decoded;
  }

  if (!resolvedName) return null;

  const { data: rows } = await supabase
    .from(MASTER_TABLE)
    .select(
      'id,client_name,contact_no,address,society_name,plot_no,plot_size,plot_amount,paid_amount,emi_no,emi_paid_date,date_of_form,date,cancel_date,registration_no,r_no,created_at'
    )
    .ilike('client_name', resolvedName)
    .order('id', { ascending: false });

  if (!rows || rows.length === 0) {
    if (!fallbackPhone) return null;
    return {
      clientName: resolvedName,
      phone: fallbackPhone,
      location: '',
      createdAt: new Date().toISOString().split('T')[0],
      firstRecordId: null,
      recordsCount: 1,
      totalPaid: 0,
      portfolio: [],
    };
  }

  const first = rows[0] as any;
  const phone =
    rows.map((r: any) => r.contact_no).find((p: any) => p && String(p).trim()) ||
    fallbackPhone ||
    '';
  const location =
    rows.map((r: any) => r.address || r.society_name).find((l: any) => l && String(l).trim()) ||
    '';
  const totalPaid = rows
    .filter((r: any) => !r.cancel_date)
    .reduce((acc: number, r: any) => acc + parseAmount(r.paid_amount), 0);
  const createdAt = first.created_at
    ? new Date(first.created_at).toISOString().split('T')[0]
    : first.date_of_form || first.date || new Date().toISOString().split('T')[0];

  return {
    clientName: first.client_name || resolvedName,
    phone,
    location,
    createdAt,
    firstRecordId: first.id ?? null,
    recordsCount: rows.length,
    totalPaid,
    portfolio: rows,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id).trim();
    const supabase = createServiceClient();

    // Custom clients have IDs prefixed with "c-"
    if (decodedId.startsWith('c-')) {
      const uuid = decodedId.slice(2);
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
          id: `c-${data.id}`,
          name: data.name,
          rawName: data.name,
          phone: data.phone || '',
          email: data.email || '',
          role: 'client',
          status: data.status || 'active',
          location: data.location || '',
          image: `/images/avatars/avatar_1.jpg`,
          lastActive: data.created_at ? data.created_at.split('T')[0] : '',
          createdAt: data.created_at ? data.created_at.split('T')[0] : '',
          source: 'custom',
          recordsCount: 1,
          totalPaid: 0,
          portfolio: [],
        },
      });
    }

    const masterClient = await resolveMasterClient(decodedId, supabase);
    if (!masterClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const parts = masterClient.clientName.trim().split(' ');
    const first = (parts[0] || 'client').toLowerCase();
    const last = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    const numId = parseInt(decodedId, 10) || masterClient.firstRecordId || 1;

    return NextResponse.json({
      client: {
        id: decodedId,
        name: masterClient.clientName,
        rawName: masterClient.clientName,
        phone: masterClient.phone,
        email: last ? `${first}.${last}@example.com` : `${first}@example.com`,
        role: 'client',
        status: 'active',
        location: masterClient.location,
        image: `/images/avatars/avatar_${(numId % 24) + 1}.jpg`,
        lastActive: new Date().toISOString().split('T')[0],
        createdAt: masterClient.createdAt,
        source: 'master',
        firstRecordId: masterClient.firstRecordId,
        recordsCount: masterClient.recordsCount,
        totalPaid: masterClient.totalPaid,
        portfolio: masterClient.portfolio,
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
    const decodedId = decodeURIComponent(id).trim();
    const body = await req.json();
    const { name, phone, email, status, location, notes } = body;

    const supabase = createServiceClient();

    if (decodedId.startsWith('c-')) {
      const uuid = decodedId.slice(2);
      const { data, error } = await supabase
        .from(CLIENTS_TABLE)
        .update({
          name: name?.trim(),
          phone: phone?.trim() || null,
          email: email?.trim() || null,
          status: status || 'active',
          location: location?.trim() || null,
          notes: notes?.trim() || null,
        })
        .eq('id', uuid)
        .select()
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Client not found or update failed' }, { status: 404 });
      }

      invalidateServerCache();
      return NextResponse.json({ success: true, client: data });
    }

    // Master-data client update
    const masterClient = await resolveMasterClient(decodedId, supabase);
    if (!masterClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const updatePayload: Record<string, any> = {};
    if (name && String(name).trim()) {
      updatePayload.client_name = String(name).trim();
    }
    if (phone !== undefined) {
      updatePayload.contact_no = phone ? String(phone).trim() : null;
    }
    if (location !== undefined) {
      updatePayload.address = location ? String(location).trim() : null;
    }

    if (Object.keys(updatePayload).length > 0) {
      const { error } = await supabase
        .from(MASTER_TABLE)
        .update(updatePayload)
        .ilike('client_name', masterClient.clientName);

      if (error) {
        return NextResponse.json(
          { error: error.message || 'Failed to update client in master data' },
          { status: 500 }
        );
      }
    }

    invalidateServerCache();

    return NextResponse.json({
      success: true,
      client: {
        id: decodedId,
        name: updatePayload.client_name || masterClient.clientName,
        phone: updatePayload.contact_no ?? masterClient.phone,
        email: email || '',
        role: 'client',
        status: status || 'active',
        location: updatePayload.address ?? masterClient.location,
      },
    });
  } catch (error: any) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update client' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id).trim();
    const supabase = createServiceClient();

    if (decodedId.startsWith('c-')) {
      const uuid = decodedId.slice(2);
      const { error } = await supabase
        .from(CLIENTS_TABLE)
        .delete()
        .eq('id', uuid);

      if (error) {
        return NextResponse.json({ error: 'Client not found or delete failed' }, { status: 404 });
      }

      invalidateServerCache();
      return NextResponse.json({ success: true });
    }

    const masterClient = await resolveMasterClient(decodedId, supabase);
    if (!masterClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const { error: delErr } = await supabase
      .from(MASTER_TABLE)
      .delete()
      .ilike('client_name', masterClient.clientName);

    if (delErr) {
      return NextResponse.json(
        { error: delErr.message || 'Failed to delete client records' },
        { status: 500 }
      );
    }

    // Also delete any matching custom client row
    await supabase
      .from(CLIENTS_TABLE)
      .delete()
      .ilike('name', masterClient.clientName);

    invalidateServerCache();
    return NextResponse.json({
      success: true,
      deletedClient: masterClient.clientName,
    });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete client' },
      { status: 500 }
    );
  }
}
