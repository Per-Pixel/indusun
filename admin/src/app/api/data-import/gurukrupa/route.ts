import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { requireStaff } from '@/lib/adminAccess';
import { invalidateServerCache } from '@/utils/serverCache';
import { ledgerKey, stableLedgerKey, type GurukrupaLedgerRow } from '@/lib/gurukrupaWorkbook';

const TABLE = 'Master Data Of Gurukrupa';
const LOOKUP_CHUNK = 150;
const INSERT_CHUNK = 200;

function recordForInsert(row: GurukrupaLedgerRow, includeNumeric: boolean) {
  const record: Record<string, unknown> = {
    r_no: row.r_no,
    society_name: row.society_name,
    client_name: row.client_name,
    contact_no: row.contact_no,
    plot_no: row.plot_no,
    plot_size: row.plot_size,
    emi_paid_date: row.emi_paid_date,
    plot_amount: row.plot_amount,
    emi_amount: row.emi_amount,
    paid_amount: row.paid_amount,
    amount_in_word: row.amount_in_word,
    emi_time: row.emi_time,
    "broker's_name": row["broker's_name"],
    cheque_cash: row.cheque_cash,
    remarks: row.remarks,
    emi_no: row.emi_no,
    month_and_year: row.month_and_year,
    yes: row.yes,
    policy_number: row.policy_number,
    date: row.date,
    cancel_date: row.cancel_date,
  };
  if (includeNumeric) {
    record.plot_amount_num = row.plot_amount_num;
    record.paid_amount_num = row.paid_amount_num;
    record.emi_amount_num = row.emi_amount_num;
    record.emi_paid_date_iso = row.emi_paid_date_iso;
  }
  return record;
}

type StoredReceipt = {
  id: number;
  r_no: string | null;
  society_name: string | null;
  plot_no: string | null;
  emi_no: string | null;
  emi_paid_date: string | null;
  paid_amount: string | null;
  client_name: string | null;
};

const RECEIPT_LOOKUP = 'id,r_no,society_name,plot_no,emi_no,emi_paid_date,paid_amount,client_name';

async function loadStored(
  supabase: ReturnType<typeof createServiceClient>,
  rows: Array<Pick<GurukrupaLedgerRow, 'r_no' | 'client_name'>>
): Promise<StoredReceipt[]> {
  const stored: StoredReceipt[] = [];
  const receiptNos = [...new Set(rows.map((row) => row.r_no).filter((value): value is string => !!value))];
  for (let i = 0; i < receiptNos.length; i += LOOKUP_CHUNK) {
    const slice = receiptNos.slice(i, i + LOOKUP_CHUNK);
    const { data, error } = await supabase.from(TABLE).select(RECEIPT_LOOKUP).in('r_no', slice);
    if (error) throw new Error(error.message);
    stored.push(...((data || []) as StoredReceipt[]));
  }

  const withoutReceipt = rows.filter((row) => !row.r_no && row.client_name);
  const names = [...new Set(withoutReceipt.map((row) => row.client_name).filter((value): value is string => !!value))];
  for (let i = 0; i < names.length; i += LOOKUP_CHUNK) {
    const slice = names.slice(i, i + LOOKUP_CHUNK);
    const { data, error } = await supabase.from(TABLE).select(RECEIPT_LOOKUP).in('client_name', slice);
    if (error) throw new Error(error.message);
    stored.push(...((data || []) as StoredReceipt[]));
  }
  return stored;
}

function indexStored(stored: StoredReceipt[]) {
  const byExact = new Map<string, number[]>();
  const byStable = new Map<string, number[]>();
  for (const found of stored) {
    const id = Number(found.id);
    const exact = ledgerKey(found);
    const exactIds = byExact.get(exact) || [];
    exactIds.push(id);
    byExact.set(exact, exactIds);
    const stable = stableLedgerKey(found);
    if (!stable) continue;
    const stableIds = byStable.get(stable) || [];
    stableIds.push(id);
    byStable.set(stable, stableIds);
  }
  return { byExact, byStable };
}

function matchIds(
  row: Pick<GurukrupaLedgerRow, 'ledgerKey' | 'stableKey' | 'r_no' | 'society_name' | 'plot_no' | 'emi_no' | 'client_name'>,
  byExact: Map<string, number[]>,
  byStable: Map<string, number[]>
): number[] {
  const exact = byExact.get(row.ledgerKey) || [];
  if (exact.length > 0) return exact;
  const stable = row.stableKey || stableLedgerKey(row);
  if (!stable) return [];
  const ids = byStable.get(stable) || [];
  return ids.length === 1 ? ids : [];
}

export async function POST(req: NextRequest) {
  const access = await requireStaff('property_management');
  if (access.denied) return access.denied;

  try {
    const body = await req.json();

    if (body?.action === 'match') {
      const incoming = (Array.isArray(body.rows) ? body.rows.slice(0, 800) : []) as Array<Record<string, unknown>>;
      const probes = incoming
        .map((row) => ({
          ledgerKey: typeof row?.ledgerKey === 'string' ? row.ledgerKey : '',
          stableKey: typeof row?.stableKey === 'string' ? row.stableKey : '',
          r_no: typeof row?.r_no === 'string' ? row.r_no : null,
          society_name: typeof row?.society_name === 'string' ? row.society_name : null,
          plot_no: typeof row?.plot_no === 'string' ? row.plot_no : null,
          emi_no: typeof row?.emi_no === 'string' ? row.emi_no : null,
          client_name: typeof row?.client_name === 'string' ? row.client_name : null,
        }))
        .filter((row) => row.ledgerKey.length > 0);
      if (probes.length === 0) return NextResponse.json({ existing: [] as string[] });
      const supabase = createServiceClient();
      const { byExact, byStable } = indexStored(await loadStored(supabase, probes));
      return NextResponse.json({
        existing: probes
          .filter((row) => matchIds(row, byExact, byStable).length > 0)
          .map((row) => row.ledgerKey),
      });
    }

    const scope = body?.scope === 'property' ? 'property' : 'all';
    const society = typeof body?.society === 'string' ? body.society.trim() : '';
    const incoming = Array.isArray(body?.rows) ? body.rows as GurukrupaLedgerRow[] : [];

    if (scope === 'property' && !society) {
      return NextResponse.json({ error: 'Choose a property to import' }, { status: 400 });
    }
    if (incoming.length === 0) {
      return NextResponse.json({ error: 'No rows to import' }, { status: 400 });
    }
    if (incoming.length > 400) {
      return NextResponse.json({ error: 'Send at most 400 rows per request' }, { status: 400 });
    }

    const wantedSociety = society.toLowerCase();
    const rows = incoming.filter((row) => {
      if (!row || typeof row !== 'object') return false;
      if (!row.ledgerKey || !row.client_name && !row.plot_no) return false;
      if (scope === 'all') return true;
      return (row.society_name || '').trim().toLowerCase() === wantedSociety;
    });

    const stats = {
      received: incoming.length,
      imported: 0,
      updated: 0,
      skipped: incoming.length - rows.length,
      failed: 0,
    };
    const errors: { row: number; message: string }[] = [];

    if (rows.length === 0) {
      return NextResponse.json({ success: true, stats, errors });
    }

    const supabase = createServiceClient();
    const { byExact, byStable } = indexStored(await loadStored(supabase, rows));
    const fresh: GurukrupaLedgerRow[] = [];
    const updates: { id: number; row: GurukrupaLedgerRow }[] = [];
    const claimed = new Set<number>();
    for (const row of rows) {
      const ids = matchIds(row, byExact, byStable).filter((id) => !claimed.has(id));
      if (ids.length === 0) {
        fresh.push(row);
        continue;
      }
      for (const id of ids) {
        claimed.add(id);
        updates.push({ id, row });
      }
      stats.updated++;
    }

    let includeNumeric = true;
    const writeChunk = async (
      chunk: { id?: number; row: GurukrupaLedgerRow }[],
      kind: 'insert' | 'update'
    ) => {
      const payload = chunk.map((item) => ({
        ...(item.id ? { id: item.id } : {}),
        ...recordForInsert(item.row, includeNumeric),
      }));
      const run = (records: Record<string, unknown>[]) =>
        kind === 'insert'
          ? supabase.from(TABLE).insert(records)
          : supabase.from(TABLE).upsert(records, { onConflict: 'id' });
      let { error } = await run(payload);
      if (error && includeNumeric && /column|schema cache|plot_amount_num|emi_paid_date_iso/i.test(error.message)) {
        includeNumeric = false;
        const retry = chunk.map((item) => ({
          ...(item.id ? { id: item.id } : {}),
          ...recordForInsert(item.row, false),
        }));
        ({ error } = await run(retry));
      }
      if (!error) {
        if (kind === 'insert') stats.imported += chunk.length;
        return;
      }
      for (const item of chunk) {
        const single = {
          ...(item.id ? { id: item.id } : {}),
          ...recordForInsert(item.row, includeNumeric),
        };
        const { error: oneError } = await run([single]);
        if (oneError) {
          if (kind === 'update') stats.updated = Math.max(0, stats.updated - 1);
          stats.failed++;
          if (errors.length < 40) errors.push({ row: item.row.sourceRow || 0, message: oneError.message });
        } else if (kind === 'insert') {
          stats.imported++;
        }
      }
    };

    for (let i = 0; i < updates.length; i += INSERT_CHUNK) {
      await writeChunk(updates.slice(i, i + INSERT_CHUNK), 'update');
    }
    for (let i = 0; i < fresh.length; i += INSERT_CHUNK) {
      await writeChunk(fresh.slice(i, i + INSERT_CHUNK).map((row) => ({ row })), 'insert');
    }

    if (stats.imported > 0 || stats.updated > 0) invalidateServerCache();

    return NextResponse.json({ success: true, stats, errors });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Import failed';
    console.error('Gurukrupa import error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
