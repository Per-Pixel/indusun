import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

const TABLE_NAME = 'Master Data Of Gurukrupa';
const PAGE_SIZE  = 1000;

function rowToBroker(name: string, idx: number) {
  const parts = name.trim().split(' ');
  const first  = parts[0].toLowerCase();
  const last   = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  return {
    id:         idx + 1,
    name:       name.trim(),
    email:      `${first}.${last}@indusun.com`,
    phone:      '',
    role:       'broker',
    status:     'active',
    image:      `/images/avatars/avatar_${((idx + 1) % 24) + 1}.jpg`,
    location:   'India',
    lastActive: new Date().toISOString().split('T')[0],
    createdAt:  new Date().toISOString().split('T')[0],
  };
}

export async function GET(req: NextRequest) {
  try {
    const url    = new URL(req.url);
    const page   = Math.max(1, parseInt(url.searchParams.get('page')  || '1'));
    const limit  = Math.max(1, parseInt(url.searchParams.get('limit') || '10'));
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();

    const supabase = createServiceClient();

    const { count: totalRows } = await supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true });

    const batches = Math.ceil((totalRows || 0) / PAGE_SIZE);
    let allNames: (string | null)[] = [];

    for (let b = 0; b < batches; b += 10) {
      const end = Math.min(b + 10, batches);
      const results = await Promise.all(
        Array.from({ length: end - b }, (_, i) => {
          const from = (b + i) * PAGE_SIZE;
          return supabase
            .from(TABLE_NAME)
            .select("broker's_name")
            .range(from, from + PAGE_SIZE - 1);
        })
      );
      for (const { data } of results) {
        allNames = allNames.concat((data || []).map((r: any) => r["broker's_name"]));
      }
    }

    // Deduplicate (case-insensitive), preserve original casing
    const seen = new Map<string, string>();
    for (const n of allNames) {
      if (!n) continue;
      const key = n.trim().toLowerCase();
      if (!seen.has(key)) seen.set(key, n.trim());
    }

    let brokers = Array.from(seen.values())
      .sort((a, b) => a.localeCompare(b))
      .map((name, idx) => rowToBroker(name, idx));

    if (search) {
      brokers = brokers.filter((b) => b.name.toLowerCase().includes(search));
    }

    const totalItems = brokers.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paged = brokers.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      brokers: paged,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (error) {
    console.error('Error fetching brokers:', error);
    return NextResponse.json({ error: 'Failed to fetch brokers' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Broker creation is not supported on the read-only master data table. Add the broker directly in the source spreadsheet.' },
    { status: 405 }
  );
}
