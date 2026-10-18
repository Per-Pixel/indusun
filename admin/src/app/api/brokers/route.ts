import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

const TABLE_NAME = 'Master Data Of Gurukrupa';
const PAGE_SIZE  = 1000;

interface BrokerEntry {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  commission_rate: number | null;
  rera_number: string | null;
  source: 'directory' | 'records';
  createdAt: string | null;
}

function isMissingTable(err: any) {
  return err?.code === '42P01' || /could not find the table/i.test(err?.message || '');
}

export async function GET(req: NextRequest) {
  try {
    const url    = new URL(req.url);
    const page   = Math.max(1, parseInt(url.searchParams.get('page')  || '1'));
    const limit  = Math.max(1, parseInt(url.searchParams.get('limit') || '10'));
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();

    const supabase = createServiceClient();

    // ── Directory brokers (editable `brokers` table) ───────────────────────
    let directory: BrokerEntry[] = [];
    const { data: dirRows, error: dirErr } = await supabase
      .from('brokers')
      .select('id,name,phone,email,location,commission_rate,rera_number,created_at')
      .order('name', { ascending: true });

    if (!dirErr && dirRows) {
      directory = dirRows.map((r: any) => ({
        id: `t${r.id}`,
        name: r.name,
        email: r.email || null,
        phone: r.phone || null,
        location: r.location || null,
        commission_rate: r.commission_rate ?? null,
        rera_number: r.rera_number || null,
        source: 'directory' as const,
        createdAt: r.created_at || null,
      }));
    } else if (dirErr && !isMissingTable(dirErr)) {
      throw new Error(dirErr.message);
    }
    // Missing `brokers` table → directory is empty, derived list still works.

    // ── Brokers derived from master-data rows (read-only) ──────────────────
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
            // Column literally contains an apostrophe — must be double-quoted
            // or PostgREST rejects the whole select parameter.
            .select(`"broker's_name"`)
            .range(from, from + PAGE_SIZE - 1);
        })
      );
      for (const { data, error } of results) {
        if (error) throw new Error(error.message);
        allNames = allNames.concat((data || []).map((r: any) => r["broker's_name"]));
      }
    }

    const directoryNames = new Set(directory.map((d) => d.name.trim().toLowerCase()));
    const seen = new Map<string, string>();
    for (const n of allNames) {
      const trimmed = String(n ?? '').trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (!seen.has(key)) seen.set(key, trimmed);
    }

    const derived: BrokerEntry[] = Array.from(seen.values())
      .sort((a, b) => a.localeCompare(b))
      // A directory broker with the same name wins — it carries real details.
      .filter((name) => !directoryNames.has(name.toLowerCase()))
      .map((name, idx) => ({
        id: `d${idx}`,
        name,
        email: null,
        phone: null,
        location: null,
        commission_rate: null,
        rera_number: null,
        source: 'records' as const,
        createdAt: null,
      }));

    let brokers = [...directory, ...derived];

    if (search) {
      brokers = brokers.filter((b) =>
        b.name.toLowerCase().includes(search) ||
        b.phone?.toLowerCase().includes(search) ||
        b.email?.toLowerCase().includes(search)
      );
    }

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const newThisMonth = directory.filter(
      (b) => b.createdAt && new Date(b.createdAt) >= monthStart
    ).length;

    const totalItems = brokers.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paged = brokers.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      brokers: paged,
      pagination: { page, limit, totalItems, totalPages },
      summary: {
        totalBrokers: totalItems,
        directoryCount: directory.length,
        recordsCount: derived.length,
        newThisMonth,
      },
    });
  } catch (error) {
    console.error('Error fetching brokers:', error);
    return NextResponse.json({ error: 'Failed to fetch brokers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const record = {
      name,
      phone:           body.phone?.trim()           || null,
      email:           body.email?.trim()           || null,
      location:        body.location?.trim()        || null,
      commission_rate: body.commission_rate === '' || body.commission_rate == null
        ? null
        : Number(body.commission_rate),
      rera_number:     body.rera_number?.trim()     || null,
    };

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('brokers')
      .insert(record)
      .select('id')
      .single();

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

    return NextResponse.json({ id: `t${data.id}` }, { status: 201 });
  } catch (err: any) {
    console.error('Brokers POST error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create broker' }, { status: 500 });
  }
}
