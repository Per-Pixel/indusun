import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

const MASTER_TABLE = 'Master Data Of Gurukrupa';
const CLIENTS_TABLE = 'clients';
const PAGE_SIZE = 1000;

function rowToClient(name: string, phone: string | null, idx: number, source: 'master' | 'custom' = 'master') {
  const parts = name.trim().split(' ');
  const first = parts[0].toLowerCase();
  const last  = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  return {
    id:         source === 'custom' ? `c-${idx}` : idx + 1,
    name:       name.trim(),
    phone:      phone || '',
    email:      `${first}.${last}@example.com`,
    role:       'client',
    status:     'active',
    location:   '',
    image:      `/images/avatars/avatar_${((idx + 1) % 24) + 1}.jpg`,
    lastActive: new Date().toISOString().split('T')[0],
    createdAt:  new Date().toISOString().split('T')[0],
    source,
  };
}

export async function GET(req: NextRequest) {
  try {
    const url    = new URL(req.url);
    const page   = Math.max(1, parseInt(url.searchParams.get('page')  || '1'));
    const limit  = Math.max(1, parseInt(url.searchParams.get('limit') || '50'));
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();

    const supabase = createServiceClient();

    // ── 1. Fetch from master data table ───────────────────────────────────────
    const { count: totalRows } = await supabase
      .from(MASTER_TABLE)
      .select('*', { count: 'exact', head: true });

    const batches = Math.ceil((totalRows || 0) / PAGE_SIZE);
    let allRows: { client_name: string | null; contact_no: string | null }[] = [];

    for (let b = 0; b < batches; b += 10) {
      const end = Math.min(b + 10, batches);
      const results = await Promise.all(
        Array.from({ length: end - b }, (_, i) => {
          const from = (b + i) * PAGE_SIZE;
          return supabase
            .from(MASTER_TABLE)
            .select('client_name,contact_no')
            .range(from, from + PAGE_SIZE - 1);
        })
      );
      for (const { data } of results) allRows = allRows.concat(data || []);
    }

    // Deduplicate by client_name (case-insensitive)
    const seen = new Map<string, { display: string; phone: string | null }>();
    for (const r of allRows) {
      if (!r.client_name) continue;
      const key = r.client_name.trim().toLowerCase();
      if (!seen.has(key)) seen.set(key, { display: r.client_name.trim(), phone: r.contact_no });
    }

    let clients = Array.from(seen.values())
      .sort((a, b) => a.display.localeCompare(b.display))
      .map(({ display, phone }, idx) => rowToClient(display, phone, idx, 'master'));

    // ── 2. Fetch from writable clients table ──────────────────────────────────
    const { data: customClients, error: customErr } = await supabase
      .from(CLIENTS_TABLE)
      .select('id,name,phone,email,status,location,created_at')
      .order('created_at', { ascending: false });

    if (!customErr && customClients && customClients.length > 0) {
      const customFormatted = customClients.map((c: any, idx: number) => ({
        id:         `c-${c.id}`,
        name:       c.name as string,
        phone:      (c.phone || '') as string,
        email:      (c.email || '') as string,
        role:       'client',
        status:     (c.status || 'active') as string,
        location:   (c.location || '') as string,
        image:      `/images/avatars/avatar_${((idx + 1) % 24) + 1}.jpg`,
        lastActive: c.created_at ? (c.created_at as string).split('T')[0] : '',
        createdAt:  c.created_at ? (c.created_at as string).split('T')[0] : '',
        source:     'custom' as const,
      }));
      // Custom clients first, then master data
      clients = [...customFormatted, ...clients];
    }


    // Apply search filter
    if (search) {
      clients = clients.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.phone.includes(search)
      );
    }

    const totalItems = clients.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paged = clients.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      clients: paged,
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
      .insert([{
        name:     name.trim(),
        phone:    phone?.trim() || null,
        email:    email?.trim() || null,
        status:   status || 'active',
        location: location?.trim() || null,
        notes:    notes?.trim() || null,
      }])
      .select()
      .single();

    if (error) {
      // If the table doesn't exist yet, give a helpful message
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'The clients table does not exist. Please run the SQL migration in the Supabase dashboard.' },
          { status: 500 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, client: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding client:', error);
    return NextResponse.json({ error: error.message || 'Failed to add client' }, { status: 500 });
  }
}
