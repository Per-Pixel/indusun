import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

const TABLE_NAME = 'Master Data Of Gurukrupa';
const PAGE_SIZE = 1000;

function rowToClient(name: string, phone: string | null, idx: number) {
  const parts = name.trim().split(' ');
  const first = parts[0].toLowerCase();
  const last  = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  return {
    id:         idx + 1,
    name:       name.trim(),
    phone:      phone || '',
    email:      `${first}.${last}@example.com`,
    role:       'client',
    status:     'active',
    location:   '',
    image:      `/images/avatars/avatar_${((idx + 1) % 24) + 1}.jpg`,
    lastActive: new Date().toISOString().split('T')[0],
    createdAt:  new Date().toISOString().split('T')[0],
  };
}

export async function GET(req: NextRequest) {
  try {
    const url    = new URL(req.url);
    const page   = Math.max(1, parseInt(url.searchParams.get('page')  || '1'));
    const limit  = Math.max(1, parseInt(url.searchParams.get('limit') || '50'));
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();

    const supabase = createServiceClient();

    // Fetch only the two columns needed to build the client list
    const { count: totalRows } = await supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true });

    const batches = Math.ceil((totalRows || 0) / PAGE_SIZE);
    let allRows: { client_name: string | null; contact_no: string | null }[] = [];

    for (let b = 0; b < batches; b += 10) {
      const end = Math.min(b + 10, batches);
      const results = await Promise.all(
        Array.from({ length: end - b }, (_, i) => {
          const from = (b + i) * PAGE_SIZE;
          return supabase
            .from(TABLE_NAME)
            .select('client_name,contact_no')
            .range(from, from + PAGE_SIZE - 1);
        })
      );
      for (const { data } of results) allRows = allRows.concat(data || []);
    }

    // Deduplicate by client_name (case-insensitive), preserve original casing
    const seen = new Map<string, { display: string; phone: string | null }>();
    for (const r of allRows) {
      if (!r.client_name) continue;
      const key = r.client_name.trim().toLowerCase();
      if (!seen.has(key)) seen.set(key, { display: r.client_name.trim(), phone: r.contact_no });
    }

    // Build full client list sorted alphabetically
    let clients = Array.from(seen.values())
      .sort((a, b) => a.display.localeCompare(b.display))
      .map(({ display, phone }, idx) => rowToClient(display, phone, idx));

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
  return NextResponse.json(
    { error: 'Client creation is not supported on the read-only master data table. Add the client directly in the source spreadsheet.' },
    { status: 405 }
  );
}
