import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { withServerCache } from '@/utils/serverCache';

interface BrokerEntry {
  id: string;
  name: string;
  broker_code: string | null;
  raw_identifier: string | null;
  deal_count: number;
  total_revenue: number;
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

    // ── Fetch both directory brokers and master-data derived stats in parallel ─
    const [{ data: dirRows, error: dirErr }, derivedData] = await Promise.all([
      supabase
        .from('brokers')
        .select('id,name,broker_code,raw_identifier,deal_count,phone,email,location,commission_rate,rera_number,created_at')
        .order('deal_count', { ascending: false, nullsFirst: false })
        .order('name', { ascending: true }),
      withServerCache('rpc:get_derived_brokers_rpc', async () => {
        const { data, error } = await supabase.rpc('get_derived_brokers_rpc');
        if (error) throw new Error(error.message);
        return data;
      }),
    ]);

    if (dirErr && !isMissingTable(dirErr)) {
      throw new Error(dirErr.message);
    }

    const derivedList = Array.isArray(derivedData)
      ? (derivedData as { name: string; broker_code: string | null; clean_name: string | null; deal_count: number; total_revenue: number }[])
      : [];

    const derivedByRaw = new Map(derivedList.map((d) => [d.name.trim().toLowerCase(), d]));

    let directory: BrokerEntry[] = [];
    if (dirRows) {
      directory = dirRows.map((r: any) => {
        const rawKey = String(r.raw_identifier || r.name || '').trim().toLowerCase();
        const dStat = derivedByRaw.get(rawKey);
        return {
          id: `t${r.id}`,
          name: r.name,
          broker_code: r.broker_code ?? dStat?.broker_code ?? null,
          raw_identifier: r.raw_identifier ?? dStat?.name ?? null,
          deal_count: r.deal_count ?? dStat?.deal_count ?? 0,
          total_revenue: dStat?.total_revenue ?? 0,
          email: r.email || null,
          phone: r.phone || null,
          location: r.location || null,
          commission_rate: r.commission_rate ?? null,
          rera_number: r.rera_number || null,
          source: 'directory' as const,
          createdAt: r.created_at || null,
        };
      });
    }

    const directoryKeys = new Set(
      directory.flatMap((d) => [
        d.name.trim().toLowerCase(),
        ...(d.raw_identifier ? [d.raw_identifier.trim().toLowerCase()] : []),
      ])
    );

    const derived: BrokerEntry[] = derivedList
      .filter((d) => !directoryKeys.has(d.name.trim().toLowerCase()))
      .map((d, idx) => ({
        id: `d${idx}`,
        name: d.clean_name || d.name,
        broker_code: d.broker_code || null,
        raw_identifier: d.name,
        deal_count: d.deal_count || 0,
        total_revenue: d.total_revenue || 0,
        email: null,
        phone: null,
        location: null,
        commission_rate: null,
        rera_number: null,
        source: 'records' as const,
        createdAt: null,
      }));

    let brokers = [...directory, ...derived];

    const codedCount = brokers.filter((b) => !!b.broker_code).length;

    if (search) {
      brokers = brokers.filter((b) =>
        b.name.toLowerCase().includes(search) ||
        b.broker_code?.toLowerCase().includes(search) ||
        b.raw_identifier?.toLowerCase().includes(search) ||
        b.phone?.toLowerCase().includes(search) ||
        b.email?.toLowerCase().includes(search)
      );
    }

    const totalItems = brokers.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paged = brokers.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      brokers: paged,
      pagination: { page, limit, totalItems, totalPages },
      summary: {
        totalBrokers: directory.length + derived.length,
        directoryCount: directory.length,
        recordsCount: derivedList.length,
        codedCount,
        newThisMonth: codedCount,
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
      broker_code:     body.broker_code?.trim()     || null,
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
