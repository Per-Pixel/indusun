import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { withServerCache, invalidateServerCache } from '@/utils/serverCache';

const MASTER_TABLE = 'Master Data Of Gurukrupa';

interface BrokerEntry {
  id: string;
  name: string;
  broker_code: string | null;
  raw_identifier: string | null;
  deal_count: number;
  total_revenue: number;
  paid_revenue?: number;
  email: string | null;
  phone: string | null;
  location: string | null;
  commission_rate: number | null;
  rera_number: string | null;
  source: 'directory' | 'records';
  createdAt: string | null;
}

interface DerivedBrokerStat {
  name: string;
  broker_code: string | null;
  clean_name: string | null;
  deal_count: number;
  total_revenue: number;
  paid_revenue?: number;
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

function parseTableId(id: string): number | null {
  if (id.startsWith('t')) {
    const n = parseInt(id.slice(1), 10);
    return isNaN(n) ? null : n;
  }
  if (/^\d+$/.test(id)) {
    return parseInt(id, 10);
  }
  return null;
}

function parseDerivedIndex(id: string): number | null {
  if (/^d\d+$/i.test(id)) {
    const n = parseInt(id.slice(1), 10);
    return isNaN(n) ? null : n;
  }
  return null;
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

    const derivedList: DerivedBrokerStat[] = Array.isArray(derivedData)
      ? (derivedData as DerivedBrokerStat[])
      : [];

    const derivedByRaw = new Map(derivedList.map((d) => [normKey(d.name), d]));

    let directory: BrokerEntry[] = [];
    if (dirRows) {
      directory = dirRows.map((r: any) => {
        const rawKey = normKey(r.raw_identifier || r.name);
        const dStat = derivedByRaw.get(rawKey);
        const paidRev = dStat ? (dStat.paid_revenue ?? dStat.total_revenue ?? 0) : 0;
        const totalRev = dStat ? (dStat.paid_revenue ?? dStat.total_revenue ?? 0) : 0;
        return {
          id: `t${r.id}`,
          name: r.name,
          broker_code: r.broker_code ?? dStat?.broker_code ?? null,
          raw_identifier: r.raw_identifier ?? dStat?.name ?? null,
          deal_count: dStat?.deal_count ?? r.deal_count ?? 0,
          total_revenue: totalRev,
          paid_revenue: paidRev,
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
      .map((d, idx) => ({ d, idx }))
      .filter(({ d }) => !directoryRawKeys.has(normKey(d.name)))
      .map(({ d, idx }) => {
        const rev = d.paid_revenue ?? d.total_revenue ?? 0;
        return {
          id: `d${idx}`,
          name: d.clean_name || d.name,
          broker_code: d.broker_code || null,
          raw_identifier: d.name,
          deal_count: d.deal_count || 0,
          total_revenue: rev,
          paid_revenue: rev,
          email: null,
          phone: null,
          location: null,
          commission_rate: null,
          rera_number: null,
          source: 'records' as const,
          createdAt: null,
        };
      });

    const allBrokers = [...directory, ...derived];

    const codedCount = allBrokers.filter((b) => !!b.broker_code).length;
    const uncodedCount = allBrokers.length - codedCount;
    const totalDeals = allBrokers.reduce((sum, b) => sum + (b.deal_count || 0), 0);
    const totalRevenue = allBrokers.reduce((sum, b) => sum + (b.total_revenue || 0), 0);
    const totalPaidRevenue = allBrokers.reduce(
      (sum, b) => sum + (b.paid_revenue ?? b.total_revenue ?? 0),
      0
    );

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
        totalPaidRevenue,
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

    invalidateServerCache();

    return NextResponse.json({ id: `t${data.id}` }, { status: 201 });
  } catch (err: any) {
    console.error('Brokers POST error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create broker' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawIds: string[] = Array.isArray(body?.ids) ? body.ids : [];
    const mode: 'unlink' | 'delete_deals' =
      body?.mode === 'delete_deals' ? 'delete_deals' : 'unlink';

    if (rawIds.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required for bulk delete' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const [{ data: dirRows, error: dirErr }, derivedData] = await Promise.all([
      supabase
        .from('brokers')
        .select('id,name,broker_code,raw_identifier'),
      withServerCache('rpc:get_derived_brokers_rpc', async () => {
        const { data, error } = await supabase.rpc('get_derived_brokers_rpc');
        if (error) return [];
        return data || [];
      }),
    ]);

    if (dirErr && !isMissingTable(dirErr)) {
      throw new Error(dirErr.message);
    }

    const dirList: any[] = Array.isArray(dirRows) ? dirRows : [];
    const derivedList: DerivedBrokerStat[] = Array.isArray(derivedData)
      ? (derivedData as DerivedBrokerStat[])
      : [];

    const dirRawKeys = new Set(
      dirList.map((r) => normKey(r.raw_identifier || r.name)).filter(Boolean)
    );
    const filteredDerived = derivedList.filter((d) => !dirRawKeys.has(normKey(d.name)));

    const brokerRowIdsToDelete = new Set<number>();
    const identifierSet = new Set<string>();

    const addIdentifiers = (...vals: (string | null | undefined)[]) => {
      for (const v of vals) {
        const t = String(v || '').trim();
        if (t) identifierSet.add(t);
      }
    };

    for (const rawId of rawIds) {
      const decodedId = decodeURIComponent(String(rawId || '')).trim();
      if (!decodedId) continue;

      const rowId = parseTableId(decodedId);
      const dIdx = parseDerivedIndex(decodedId);

      if (rowId !== null) {
        brokerRowIdsToDelete.add(rowId);
        const dirRow = dirList.find((r) => Number(r.id) === rowId);
        if (dirRow) {
          addIdentifiers(dirRow.raw_identifier, dirRow.broker_code, dirRow.name);
        }
      } else if (dIdx !== null) {
        const dStat = derivedList[dIdx] || filteredDerived[dIdx];
        if (dStat) {
          addIdentifiers(dStat.name, dStat.broker_code, dStat.clean_name);
        }
      } else {
        addIdentifiers(decodedId);
        const targetKey = normKey(decodedId);
        for (const r of dirList) {
          if (
            normKey(r.raw_identifier) === targetKey ||
            normKey(r.broker_code) === targetKey ||
            normKey(r.name) === targetKey
          ) {
            brokerRowIdsToDelete.add(Number(r.id));
            addIdentifiers(r.raw_identifier, r.broker_code, r.name);
          }
        }
        for (const d of derivedList) {
          if (
            normKey(d.name) === targetKey ||
            normKey(d.broker_code) === targetKey ||
            normKey(d.clean_name) === targetKey
          ) {
            addIdentifiers(d.name, d.broker_code, d.clean_name);
          }
        }
      }
    }

    // Cross-match any collected identifiers against dirList and derivedList
    const normCollected = new Set(Array.from(identifierSet).map((s) => normKey(s)));
    for (const r of dirList) {
      if (
        normCollected.has(normKey(r.raw_identifier)) ||
        normCollected.has(normKey(r.broker_code)) ||
        normCollected.has(normKey(r.name))
      ) {
        brokerRowIdsToDelete.add(Number(r.id));
        addIdentifiers(r.raw_identifier, r.broker_code, r.name);
      }
    }
    for (const d of derivedList) {
      if (
        normCollected.has(normKey(d.name)) ||
        (d.broker_code && normCollected.has(normKey(d.broker_code))) ||
        (d.clean_name && normCollected.has(normKey(d.clean_name)))
      ) {
        addIdentifiers(d.name, d.broker_code, d.clean_name);
      }
    }

    // Delete from brokers table by row IDs
    if (brokerRowIdsToDelete.size > 0) {
      const { error: delIdsErr } = await supabase
        .from('brokers')
        .delete()
        .in('id', Array.from(brokerRowIdsToDelete));
      if (delIdsErr && !isMissingTable(delIdsErr)) {
        throw new Error(delIdsErr.message);
      }
    }

    const identifiers = Array.from(identifierSet);

    if (identifiers.length > 0) {
      // Chunk identifiers to avoid overly long PostgREST query strings
      const CHUNK_SIZE = 20;
      for (let i = 0; i < identifiers.length; i += CHUNK_SIZE) {
        const chunk = identifiers.slice(i, i + CHUNK_SIZE);

        const brokerOrParts: string[] = [];
        const masterOrParts: string[] = [];
        for (const ident of chunk) {
          const esc = ident.replace(/"/g, '\\"');
          brokerOrParts.push(`raw_identifier.eq."${esc}"`);
          brokerOrParts.push(`broker_code.eq."${esc}"`);
          brokerOrParts.push(`name.eq."${esc}"`);

          masterOrParts.push(`"broker's_name".eq."${esc}"`);
          masterOrParts.push(`broker_code.eq."${esc}"`);
          masterOrParts.push(`ba_code.eq."${esc}"`);
          masterOrParts.push(`broker_name_clean.eq."${esc}"`);
        }

        const { error: delBrokerErr } = await supabase
          .from('brokers')
          .delete()
          .or(brokerOrParts.join(','));
        if (delBrokerErr && !isMissingTable(delBrokerErr)) {
          throw new Error(delBrokerErr.message);
        }

        if (mode === 'delete_deals') {
          const { error: masterDelErr } = await supabase
            .from(MASTER_TABLE)
            .delete()
            .or(masterOrParts.join(','));
          if (masterDelErr) throw new Error(masterDelErr.message);
        } else {
          const { error: masterUpdErr } = await supabase
            .from(MASTER_TABLE)
            .update({
              "broker's_name": null,
              broker_code: null,
              ba_code: null,
              broker_name_clean: null,
            })
            .or(masterOrParts.join(','));
          if (masterUpdErr) throw new Error(masterUpdErr.message);
        }
      }
    }

    invalidateServerCache();
    return NextResponse.json({
      success: true,
      deletedCount: rawIds.length,
      mode,
    });
  } catch (err: any) {
    console.error('Brokers bulk DELETE error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete brokers' },
      { status: 500 }
    );
  }
}
