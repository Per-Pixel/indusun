import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { requireStaff } from '@/lib/adminAccess';
import { invalidateServerCache } from '@/utils/serverCache';
import { ledgerKey, type GurukrupaLedgerRow } from '@/lib/gurukrupaWorkbook';

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

async function existingKeys(
  supabase: ReturnType<typeof createServiceClient>,
  rows: GurukrupaLedgerRow[]
): Promise<Set<string>> {
  const keys = new Set<string>();
  const receiptNos = [...new Set(rows.map((row) => row.r_no).filter((value): value is string => !!value))];
  for (let i = 0; i < receiptNos.length; i += LOOKUP_CHUNK) {
    const slice = receiptNos.slice(i, i + LOOKUP_CHUNK);
    const { data, error } = await supabase
      .from(TABLE)
      .select('r_no,society_name,plot_no,emi_no,emi_paid_date,paid_amount,client_name')
      .in('r_no', slice);
    if (error) throw new Error(error.message);
    for (const found of data || []) {
      keys.add(ledgerKey(found));
    }
  }

  const withoutReceipt = rows.filter((row) => !row.r_no && row.client_name);
  const names = [...new Set(withoutReceipt.map((row) => row.client_name).filter((value): value is string => !!value))];
  for (let i = 0; i < names.length; i += LOOKUP_CHUNK) {
    const slice = names.slice(i, i + LOOKUP_CHUNK);
    const { data, error } = await supabase
      .from(TABLE)
      .select('r_no,society_name,plot_no,emi_no,emi_paid_date,paid_amount,client_name')
      .in('client_name', slice);
    if (error) throw new Error(error.message);
    for (const found of data || []) {
      keys.add(ledgerKey(found));
    }
  }
  return keys;
}

export async function POST(req: NextRequest) {
  const access = await requireStaff('property_management');
  if (access.denied) return access.denied;

  try {
    const body = await req.json();
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
      skipped: incoming.length - rows.length,
      failed: 0,
    };
    const errors: { row: number; message: string }[] = [];

    if (rows.length === 0) {
      return NextResponse.json({ success: true, stats, errors });
    }

    const supabase = createServiceClient();
    const already = await existingKeys(supabase, rows);
    const fresh = rows.filter((row) => {
      if (already.has(row.ledgerKey)) {
        stats.skipped++;
        return false;
      }
      already.add(row.ledgerKey);
      return true;
    });

    let includeNumeric = true;
    for (let i = 0; i < fresh.length; i += INSERT_CHUNK) {
      const chunk = fresh.slice(i, i + INSERT_CHUNK);
      let payload = chunk.map((row) => recordForInsert(row, includeNumeric));
      let { error } = await supabase.from(TABLE).insert(payload);
      if (error && includeNumeric && /column|schema cache|plot_amount_num|emi_paid_date_iso/i.test(error.message)) {
        includeNumeric = false;
        payload = chunk.map((row) => recordForInsert(row, false));
        ({ error } = await supabase.from(TABLE).insert(payload));
      }
      if (!error) {
        stats.imported += chunk.length;
        continue;
      }

      for (const row of chunk) {
        const single = recordForInsert(row, includeNumeric);
        const { error: oneError } = await supabase.from(TABLE).insert(single);
        if (oneError) {
          stats.failed++;
          if (errors.length < 40) errors.push({ row: row.sourceRow || 0, message: oneError.message });
        } else {
          stats.imported++;
        }
      }
    }

    if (stats.imported > 0) invalidateServerCache();

    return NextResponse.json({ success: true, stats, errors });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Import failed';
    console.error('Gurukrupa import error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
