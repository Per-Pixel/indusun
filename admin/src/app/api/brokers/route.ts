import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { withServerCache, invalidateServerCache } from '@/utils/serverCache';

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

function normKey(s: string | null | undefined): string {
  return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function compactAlnum(s: string | null | undefined): string {
  return String(s || '').toLowerCase().replace(/[^a-z0-9\u0900-\u097f]/g, '');
}

export async function GET(req: NextRequest) {
  try {
    const url    = new URL(req.url);
    const page   = Math.max(1, parseInt(url.searchParams.get('page')  || '1'));
    const limit  = Math.max(1, parseInt(url.searchParams.get('limit') || '15'));
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const filter = (url.searchParams.get('filter') || 'all').trim().toLowerCase();
    const sort   = (url.searchParams.get('sort')   || 'deals_desc').trim().toLowerCase();

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

    const derivedByRaw = new Map(derivedList.map((d) => [normKey(d.name), d]));

    let directory: BrokerEntry[] = [];
    if (dirRows) {
      directory = dirRows.map((r: any) => {
        const rawKey = normKey(r.raw_identifier || r.name);
        const dStat = derivedByRaw.get(rawKey);
        return {
          id: `t${r.id}`,
          name: r.name,
          broker_code: r.broker_code ?? dStat?.broker_code ?? null,
          raw_identifier: r.raw_identifier ?? dStat?.name ?? null,
          deal_count: dStat?.deal_count ?? r.deal_count ?? 0,
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

    // Track exact raw_identifier keys from directory so distinct coded brokers with same short name (e.g. 'BS') are not dropped
    const directoryRawKeys = new Set(
      directory.map((d) => normKey(d.raw_identifier || d.name)).filter(Boolean)
    );

    const derived: BrokerEntry[] = derivedList
      .filter((d) => !directoryRawKeys.has(normKey(d.name)))
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

    const allBrokers = [...directory, ...derived];

    const codedCount = allBrokers.filter((b) => !!b.broker_code).length;
    const uncodedCount = allBrokers.length - codedCount;
    const totalDeals = allBrokers.reduce((sum, b) => sum + (b.deal_count || 0), 0);
    const totalRevenue = allBrokers.reduce((sum, b) => sum + (b.total_revenue || 0), 0);

    let brokers = allBrokers;

    if (filter === 'coded') {
      brokers = brokers.filter((b) => !!b.broker_code);
    } else if (filter === 'uncoded') {
      brokers = brokers.filter((b) => !b.broker_code);
    } else if (filter === 'directory') {
      brokers = brokers.filter((b) => b.source === 'directory');
    } else if (filter === 'records') {
      brokers = brokers.filter((b) => b.source === 'records');
    }

    if (search) {
      const compactSearch = compactAlnum(search);
      brokers = brokers.filter((b) => {
        if (
          b.name.toLowerCase().includes(search) ||
          b.broker_code?.toLowerCase().includes(search) ||
          b.raw_identifier?.toLowerCase().includes(search) ||
          b.phone?.toLowerCase().includes(search) ||
          b.email?.toLowerCase().includes(search) ||
          b.location?.toLowerCase().includes(search) ||
          b.rera_number?.toLowerCase().includes(search)
        ) {
          return true;
        }
        if (compactSearch.length >= 2) {
          return (
            compactAlnum(b.name).includes(compactSearch) ||
            compactAlnum(b.broker_code).includes(compactSearch) ||
            compactAlnum(b.raw_identifier).includes(compactSearch)
          );
        }
        return false;
      });
    }

    brokers = [...brokers].sort((a, b) => {
      if (sort === 'revenue_desc') {
        return (b.total_revenue || 0) - (a.total_revenue || 0) || (b.deal_count || 0) - (a.deal_count || 0);
      }
      if (sort === 'code_asc') {
        if (a.broker_code && !b.broker_code) return -1;
        if (!a.broker_code && b.broker_code) return 1;
        return (a.broker_code || a.name).localeCompare(b.broker_code || b.name);
      }
      if (sort === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      // default: deals_desc
      return (b.deal_count || 0) - (a.deal_count || 0) || a.name.localeCompare(b.name);
    });

    const totalItems = brokers.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paged = brokers.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      brokers: paged,
      pagination: { page, limit, totalItems, totalPages },
      summary: {
        totalBrokers: allBrokers.length,
        directoryCount: directory.length,
        recordsCount: derivedList.length,
        codedCount,
        uncodedCount,
        totalDeals,
        totalRevenue,
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

    const brokerCode = body.broker_code?.trim() || null;
    const rawIdentifier =
      body.raw_identifier?.trim() ||
      (brokerCode && !name.toUpperCase().startsWith(brokerCode.toUpperCase())
        ? `${brokerCode}/${name}`
        : name);

    const record = {
      name,
      broker_code:     brokerCode,
      raw_identifier:  rawIdentifier,
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

    invalidateServerCache('rpc:get_derived_brokers_rpc');
    invalidateServerCache('rpc:get_unique_brokers_rpc');

    return NextResponse.json({ id: `t${data.id}` }, { status: 201 });
  } catch (err: any) {
    console.error('Brokers POST error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create broker' }, { status: 500 });
  }
}
