import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { withServerCache, invalidateServerCache } from '@/utils/serverCache';

const MASTER_TABLE = 'Master Data Of Gurukrupa';
const CLIENTS_TABLE = 'clients';

interface MasterClientRpcItem {
  display: string;
  phone: string | null;
  records_count?: number;
  total_paid?: number;
  society?: string;
}

function rowToClient(
  item: MasterClientRpcItem,
  idx: number,
  source: 'master' | 'custom' = 'master'
) {
  const display = item.display || '';
  const parts = display.trim().split(' ');
  const first = (parts[0] || 'client').toLowerCase();
  const last = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  return {
    id: source === 'custom' ? `c-${idx}` : String(idx + 1),
    name: display.trim(),
    rawName: display,
    phone: item.phone || '',
    email: last ? `${first}.${last}@example.com` : `${first}@example.com`,
    role: 'client',
    status: 'active' as 'active' | 'inactive' | 'pending',
    location: item.society || '',
    society: item.society || '',
    recordsCount: item.records_count || 1,
    totalPaid: item.total_paid || 0,
    image: `/images/avatars/avatar_${((idx + 1) % 24) + 1}.jpg`,
    lastActive: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString().split('T')[0],
    source,
  };
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '50'));
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();

    const supabase = createServiceClient();

    // 1. Fetch unique clients from master data via fast cached RPC
    const [masterClientsData, { data: customClients, error: customErr }] = await Promise.all([
      withServerCache('rpc:get_unique_clients_rpc', async () => {
        const { data, error } = await supabase.rpc('get_unique_clients_rpc');
        if (error) throw new Error(error.message);
        return data;
      }),
      supabase
        .from(CLIENTS_TABLE)
        .select('id,name,phone,email,status,location,created_at')
        .order('created_at', { ascending: false }),
    ]);

    const masterList = Array.isArray(masterClientsData)
      ? (masterClientsData as MasterClientRpcItem[])
      : [];

    // Filter the raw lists first, then shape only the page that is returned.
    const customSource = !customErr && customClients ? customClients : [];
    const customFiltered = customSource
      .map((c: any, idx: number) => ({ c, idx }))
      .filter(({ c }) => {
        if (!search) return true;
        return (
          String(c.name || '').toLowerCase().includes(search) ||
          String(c.phone || '').includes(search) ||
          String(c.location || '').toLowerCase().includes(search)
        );
      });

    const matchedIdx: number[] = [];
    if (search) {
      for (let i = 0; i < masterList.length; i++) {
        const item = masterList[i];
        const name = (item.display || '').toLowerCase();
        const phone = item.phone || '';
        const society = (item.society || '').toLowerCase();
        if (name.includes(search) || phone.includes(search) || society.includes(search)) {
          matchedIdx.push(i);
        }
      }
    }

    const masterTotal = search ? matchedIdx.length : masterList.length;
    const totalItems = customFiltered.length + masterTotal;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const start = (page - 1) * limit;
    const end = start + limit;

    const clients: ReturnType<typeof rowToClient>[] = [];
    for (let i = start; i < end && i < customFiltered.length; i++) {
      const { c, idx } = customFiltered[i];
      clients.push({
        id: `c-${c.id}`,
        name: c.name as string,
        rawName: c.name as string,
        phone: (c.phone || '') as string,
        email: (c.email || '') as string,
        role: 'client',
        status: (c.status || 'active') as 'active' | 'inactive' | 'pending',
        location: (c.location || '') as string,
        society: (c.location || '') as string,
        recordsCount: 1,
        totalPaid: 0,
        image: `/images/avatars/avatar_${((idx + 1) % 24) + 1}.jpg`,
        lastActive: c.created_at ? (c.created_at as string).split('T')[0] : '',
        createdAt: c.created_at ? (c.created_at as string).split('T')[0] : '',
        source: 'custom' as const,
      });
    }

    const masterStart = Math.max(0, start - customFiltered.length);
    const masterEnd = Math.max(0, end - customFiltered.length);
    for (let offset = masterStart; offset < masterEnd; offset++) {
      const idx = search ? matchedIdx[offset] : offset;
      if (idx == null || !masterList[idx]) break;
      clients.push(rowToClient(masterList[idx], idx, 'master'));
    }

    return NextResponse.json({
      clients,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, status, location, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from(CLIENTS_TABLE)
      .insert([
        {
          name: name.trim(),
          phone: phone?.trim() || null,
          email: email?.trim() || null,
          status: status || 'active',
          location: location?.trim() || null,
          notes: notes?.trim() || null,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'The clients table does not exist. Please run the SQL migration in the Supabase dashboard.' },
          { status: 500 }
        );
      }
      throw error;
    }

    invalidateServerCache();
    return NextResponse.json({ success: true, client: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding client:', error);
    return NextResponse.json({ error: error.message || 'Failed to add client' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids.map(String) : [];
    const names: string[] = Array.isArray(body?.names) ? body.names.map(String) : [];

    if (ids.length === 0 && names.length === 0) {
      return NextResponse.json({ error: 'Provide client ids or names to delete' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const customUuids: string[] = [];
    const masterIndices: number[] = [];
    const clientNamesToDelete = new Set<string>(
      names.map((n) => n.trim()).filter(Boolean)
    );

    for (const rawId of ids) {
      if (rawId.startsWith('c-')) {
        customUuids.push(rawId.slice(2));
      } else {
        const num = parseInt(rawId, 10);
        if (!isNaN(num) && num > 0) {
          masterIndices.push(num);
        } else if (rawId.trim()) {
          clientNamesToDelete.add(rawId.trim());
        }
      }
    }

    if (customUuids.length > 0) {
      await supabase.from(CLIENTS_TABLE).delete().in('id', customUuids);
    }

    if (masterIndices.length > 0) {
      const masterClientsData = await withServerCache('rpc:get_unique_clients_rpc', async () => {
        const { data, error } = await supabase.rpc('get_unique_clients_rpc');
        if (error) throw new Error(error.message);
        return data;
      });
      const masterList = Array.isArray(masterClientsData)
        ? (masterClientsData as MasterClientRpcItem[])
        : [];

      for (const idx1Based of masterIndices) {
        const rpcItem = masterList[idx1Based - 1];
        if (rpcItem?.display) {
          clientNamesToDelete.add(rpcItem.display.trim());
        }
      }
    }

    for (const clientName of clientNamesToDelete) {
      await supabase.from(MASTER_TABLE).delete().ilike('client_name', clientName);
      await supabase.from(CLIENTS_TABLE).delete().ilike('name', clientName);
    }

    invalidateServerCache();

    return NextResponse.json({
      success: true,
      deletedCustom: customUuids.length,
      deletedMasterClients: clientNamesToDelete.size,
    });
  } catch (error: any) {
    console.error('Error bulk deleting clients:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete clients' },
      { status: 500 }
    );
  }
}
