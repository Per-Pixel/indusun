import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { parseAmount } from '@/utils/dataUtils';
import { withServerCache, invalidateServerCache } from '@/utils/serverCache';

const MASTER_TABLE = 'Master Data Of Gurukrupa';

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

function normKey(s: string | null | undefined): string {
  return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

async function resolveBrokerById(supabase: any, decodedId: string) {
  const rowId = parseTableId(decodedId);
  const dIdx = parseDerivedIndex(decodedId);

  const derivedData = await withServerCache('rpc:get_derived_brokers_rpc', async () => {
    const { data, error } = await supabase.rpc('get_derived_brokers_rpc');
    if (error) return [];
    return data || [];
  });
  const derivedList: DerivedBrokerStat[] = Array.isArray(derivedData)
    ? (derivedData as DerivedBrokerStat[])
    : [];
  const derivedByRaw = new Map(derivedList.map((d) => [normKey(d.name), d]));

  let brokerRecord: any = null;
  const matchedBrokerRowIds = new Set<number>();

  if (rowId !== null) {
    const { data } = await supabase
      .from('brokers')
      .select('*')
      .eq('id', rowId)
      .maybeSingle();
    if (data) {
      matchedBrokerRowIds.add(Number(data.id));
      const dStat = derivedByRaw.get(normKey(data.raw_identifier || data.name));
      brokerRecord = {
        id: `t${data.id}`,
        name: data.name,
        broker_code: data.broker_code ?? dStat?.broker_code ?? null,
        raw_identifier: data.raw_identifier ?? dStat?.name ?? data.name,
        deal_count: dStat?.deal_count ?? data.deal_count ?? 0,
        total_revenue: dStat?.paid_revenue ?? dStat?.total_revenue ?? 0,
        email: data.email || null,
        phone: data.phone || null,
        location: data.location || null,
        commission_rate: data.commission_rate ?? null,
        rera_number: data.rera_number || null,
        source: 'directory',
        createdAt: data.created_at || null,
      };
    }
  }

  if (!brokerRecord && dIdx !== null) {
    let dStat = derivedList[dIdx];
    if (!dStat) {
      const { data: dirRows } = await supabase.from('brokers').select('name,raw_identifier');
      const dirKeys = new Set(
        (dirRows || []).map((r: any) => normKey(r.raw_identifier || r.name)).filter(Boolean)
      );
      const filteredDerived = derivedList.filter((d) => !dirKeys.has(normKey(d.name)));
      dStat = filteredDerived[dIdx];
    }
    if (dStat) {
      brokerRecord = {
        id: decodedId,
        name: dStat.clean_name || dStat.name,
        broker_code: dStat.broker_code || null,
        raw_identifier: dStat.name,
        deal_count: dStat.deal_count || 0,
        total_revenue: dStat.paid_revenue ?? dStat.total_revenue ?? 0,
        email: null,
        phone: null,
        location: null,
        commission_rate: null,
        rera_number: null,
        source: 'records',
        createdAt: null,
      };
    }
  }

  if (!brokerRecord && rowId === null && dIdx === null) {
    const esc = decodedId.replace(/"/g, '\\"');
    const { data: matchedRows } = await supabase
      .from('brokers')
      .select('*')
      .or(`raw_identifier.ilike."${esc}",broker_code.ilike."${esc}",name.ilike."${esc}"`)
      .limit(10);

    if (matchedRows && matchedRows.length > 0) {
      for (const r of matchedRows) matchedBrokerRowIds.add(Number(r.id));
      const data = matchedRows[0];
      const dStat = derivedByRaw.get(normKey(data.raw_identifier || data.name));
      brokerRecord = {
        id: `t${data.id}`,
        name: data.name,
        broker_code: data.broker_code ?? dStat?.broker_code ?? null,
        raw_identifier: data.raw_identifier ?? dStat?.name ?? data.name,
        deal_count: dStat?.deal_count ?? data.deal_count ?? 0,
        total_revenue: dStat?.paid_revenue ?? dStat?.total_revenue ?? 0,
        email: data.email || null,
        phone: data.phone || null,
        location: data.location || null,
        commission_rate: data.commission_rate ?? null,
        rera_number: data.rera_number || null,
        source: 'directory',
        createdAt: data.created_at || null,
      };
    } else {
      const targetKey = normKey(decodedId);
      const dStat = derivedList.find(
        (d) =>
          normKey(d.name) === targetKey ||
          normKey(d.broker_code) === targetKey ||
          normKey(d.clean_name) === targetKey
      );
      if (dStat) {
        brokerRecord = {
          id: decodedId,
          name: dStat.clean_name || dStat.name,
          broker_code: dStat.broker_code || null,
          raw_identifier: dStat.name,
          deal_count: dStat.deal_count || 0,
          total_revenue: dStat.paid_revenue ?? dStat.total_revenue ?? 0,
          email: null,
          phone: null,
          location: null,
          commission_rate: null,
          rera_number: null,
          source: 'records',
          createdAt: null,
        };
      }
    }
  }

  return { brokerRecord, derivedList, matchedBrokerRowIds };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id).trim();
    const supabase = createServiceClient();

    const { brokerRecord } = await resolveBrokerById(supabase, decodedId);

    if (!brokerRecord) {
      return NextResponse.json({ error: 'Broker not found' }, { status: 404 });
    }

    // Fetch deals handled by this broker from Master Data Of Gurukrupa
    const identifiers = Array.from(
      new Set(
        [brokerRecord.raw_identifier, brokerRecord.broker_code]
          .map((s) => String(s || '').trim())
          .filter(Boolean)
      )
    );
    if (identifiers.length === 0 && brokerRecord.name) {
      identifiers.push(String(brokerRecord.name).trim());
    }

    const orParts: string[] = [];
    for (const ident of identifiers) {
      const esc = ident.replace(/"/g, '\\"');
      orParts.push(`"broker's_name".eq."${esc}"`);
      orParts.push(`broker_code.eq."${esc}"`);
      orParts.push(`ba_code.eq."${esc}"`);
    }

    let deals: any[] = [];
    let totalDealsCount = brokerRecord.deal_count || 0;

    if (orParts.length > 0) {
      const [{ data: masterDeals }, { count: exactCount }] = await Promise.all([
        supabase
          .from(MASTER_TABLE)
          .select(
            'id,client_name,contact_no,society_name,block_name,plot_no,plot_size,plot_amount,paid_amount,emi_amount,r_no,registration_no,ba_code,broker_code,broker_name_clean,"broker\'s_name",date_of_form,date,emi_paid_date,cancel_date'
          )
          .or(orParts.join(','))
          .order('id', { ascending: false })
          .limit(100),
        supabase
          .from(MASTER_TABLE)
          .select('*', { count: 'exact', head: true })
          .or(orParts.join(',')),
      ]);

      deals = masterDeals || [];
      if (typeof exactCount === 'number' && exactCount > 0) {
        totalDealsCount = exactCount;
      }
    }

    let sampleBooked = 0;
    let samplePaid = 0;
    let activeCount = 0;
    let cancelledCount = 0;
    const societiesSet = new Set<string>();

    for (const d of deals) {
      const pAmt = parseAmount(d.plot_amount);
      const pdAmt = parseAmount(d.paid_amount);
      sampleBooked += pAmt;
      samplePaid += pdAmt;
      if (d.cancel_date) cancelledCount++;
      else activeCount++;
      if (d.society_name) societiesSet.add(d.society_name);
    }

    const totalRevenue = Math.max(brokerRecord.total_revenue || 0, samplePaid);

    return NextResponse.json({
      broker: {
        ...brokerRecord,
        deal_count: totalDealsCount,
        total_revenue: totalRevenue,
      },
      stats: {
        totalDeals: totalDealsCount,
        totalRevenue,
        sampleBookedAmount: sampleBooked,
        samplePaidAmount: samplePaid,
        activeInSample: activeCount,
        cancelledInSample: cancelledCount,
        societiesCount: societiesSet.size,
        societies: Array.from(societiesSet),
      },
      deals,
    });
  } catch (error) {
    console.error('Error fetching broker:', error);
    return NextResponse.json({ error: 'Failed to fetch broker' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rowId = parseTableId(id);

    const body = await req.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const record: Record<string, any> = {
      name:            body.name.trim(),
      broker_code:     body.broker_code?.trim() || null,
      phone:           body.phone?.trim()    || null,
      email:           body.email?.trim()    || null,
      location:        body.location?.trim() || null,
      commission_rate: body.commission_rate === '' || body.commission_rate == null
        ? null
        : Number(body.commission_rate),
      rera_number:     body.rera_number?.trim() || null,
    };
    if (body.raw_identifier !== undefined) {
      record.raw_identifier = body.raw_identifier?.trim() || null;
    }

    const supabase = createServiceClient();

    if (rowId === null) {
      // Promote records-derived broker into directory on edit
      record.raw_identifier = body.raw_identifier?.trim() || body.broker_code?.trim() || body.name.trim();
      const { data: inserted, error: insErr } = await supabase
        .from('brokers')
        .insert(record)
        .select('id')
        .single();
      if (insErr) throw new Error(insErr.message);
      invalidateServerCache();
      return NextResponse.json({ success: true, id: `t${inserted.id}` });
    }

    const { error } = await supabase
      .from('brokers')
      .update(record)
      .eq('id', rowId);

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
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Brokers PUT error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update broker' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const body = await req.json();
    const action = body?.action as 'unlink_deal' | 'delete_deal' | undefined;
    const dealId = Number(body?.dealId);

    if (
      !action ||
      (action !== 'unlink_deal' && action !== 'delete_deal') ||
      !Number.isFinite(dealId)
    ) {
      return NextResponse.json(
        { error: 'Valid action (unlink_deal | delete_deal) and numeric dealId are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    if (action === 'unlink_deal') {
      const { error } = await supabase
        .from(MASTER_TABLE)
        .update({
          "broker's_name": null,
          broker_code: null,
          ba_code: null,
          broker_name_clean: null,
        })
        .eq('id', dealId);

      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from(MASTER_TABLE)
        .delete()
        .eq('id', dealId);

      if (error) throw new Error(error.message);
    }

    invalidateServerCache();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Brokers PATCH error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update broker deal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id).trim();

    const url = new URL(req.url);
    let modeParam = url.searchParams.get('mode');
    if (!modeParam) {
      try {
        const body = await req.json();
        if (body?.mode) modeParam = body.mode;
      } catch {
        // No JSON body provided
      }
    }
    const mode: 'unlink' | 'delete_deals' =
      modeParam === 'delete_deals' ? 'delete_deals' : 'unlink';

    const supabase = createServiceClient();
    const { brokerRecord, derivedList, matchedBrokerRowIds } = await resolveBrokerById(
      supabase,
      decodedId
    );

    if (!brokerRecord) {
      return NextResponse.json({ error: 'Broker not found' }, { status: 404 });
    }

    // Collect all matching identifiers (raw_identifier, broker_code, name)
    const identifierSet = new Set<string>();
    for (const val of [
      brokerRecord.raw_identifier,
      brokerRecord.broker_code,
      brokerRecord.name,
    ]) {
      const trimmed = String(val || '').trim();
      if (trimmed) identifierSet.add(trimmed);
    }

    // Also include any matching derivedList identifiers
    const normIdents = new Set(Array.from(identifierSet).map((s) => normKey(s)));
    for (const d of derivedList) {
      if (
        normIdents.has(normKey(d.name)) ||
        (d.broker_code && normIdents.has(normKey(d.broker_code))) ||
        (d.clean_name && normIdents.has(normKey(d.clean_name)))
      ) {
        if (d.name?.trim()) identifierSet.add(d.name.trim());
        if (d.broker_code?.trim()) identifierSet.add(d.broker_code.trim());
        if (d.clean_name?.trim()) identifierSet.add(d.clean_name.trim());
      }
    }

    const identifiers = Array.from(identifierSet);

    // Delete matching row(s) from brokers table
    if (matchedBrokerRowIds.size > 0) {
      const { error: delByIdErr } = await supabase
        .from('brokers')
        .delete()
        .in('id', Array.from(matchedBrokerRowIds));
      if (delByIdErr && !isMissingTable(delByIdErr)) {
        throw new Error(delByIdErr.message);
      }
    }

    if (identifiers.length > 0) {
      const brokerOrParts: string[] = [];
      for (const ident of identifiers) {
        const esc = ident.replace(/"/g, '\\"');
        brokerOrParts.push(`raw_identifier.eq."${esc}"`);
        brokerOrParts.push(`broker_code.eq."${esc}"`);
        brokerOrParts.push(`name.eq."${esc}"`);
      }
      const { error: delByIdentErr } = await supabase
        .from('brokers')
        .delete()
        .or(brokerOrParts.join(','));
      if (delByIdentErr && !isMissingTable(delByIdentErr)) {
        throw new Error(delByIdentErr.message);
      }

      // Update or delete rows in 'Master Data Of Gurukrupa'
      const masterOrParts: string[] = [];
      for (const ident of identifiers) {
        const esc = ident.replace(/"/g, '\\"');
        masterOrParts.push(`"broker's_name".eq."${esc}"`);
        masterOrParts.push(`broker_code.eq."${esc}"`);
        masterOrParts.push(`ba_code.eq."${esc}"`);
        masterOrParts.push(`broker_name_clean.eq."${esc}"`);
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

    invalidateServerCache();
    return NextResponse.json({ success: true, mode });
  } catch (err: any) {
    console.error('Brokers DELETE error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete broker' },
      { status: 500 }
    );
  }
}
