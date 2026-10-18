/**
 * cleanup-data.mjs — normalize dirty columns in "Master Data Of Gurukrupa".
 *
 *   node scripts/cleanup-data.mjs          dry-run: prints planned writes
 *   node scripts/cleanup-data.mjs --apply  performs the writes
 *
 * Actions (mirrors what was shown for approval):
 *  - cancel_date: whitespace-only → NULL; DD/MM/YYYY-ish strings → ISO;
 *    non-date markers ('CANSAL', 'DASTAVEJ', 'PLOT TRF', stray numbers) → 'Cancelled'
 *  - paid_amount: non-numeric/→0 text ('PENDING','BAKI','OM','DONE','ADJUST','0') → NULL
 *  - broker's_name: trim whitespace; whitespace-only → NULL
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = {};
for (const raw of fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)) {
  const line = raw.trim();
  if (!line || line.startsWith('#')) continue;
  const i = line.indexOf('=');
  if (i < 0) continue;
  let v = line.slice(i + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  env[line.slice(0, i).trim()] = v;
}
const supa = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const T = 'Master Data Of Gurukrupa';
const APPLY = process.argv.includes('--apply');

const normalizeDate = (d) => {
  if (d == null) return null;
  const s = String(d).trim();
  if (!s) return null;
  if (/^\d{4,5}$/.test(s)) {
    const serial = parseInt(s, 10);
    if (serial > 25569 && serial < 60000) {
      const js = new Date((serial - 25569) * 86400 * 1000);
      if (!isNaN(js.getTime())) return js.toISOString().split('T')[0];
    }
  }
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) {
    const iso = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    const dt = new Date(iso);
    if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
  }
  // Pure integer strings outside the serial range are junk markers, not
  // dates — new Date('150') would parse as year 150.
  if (/^\d+$/.test(s)) return null;
  const dt = new Date(s);
  if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
  return null;
};
const parseAmount = (v) => (v == null || v === '') ? 0 : (parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0);

// ── pull the columns we need ────────────────────────────────────────
const { count } = await supa.from(T).select('*', { count: 'exact', head: true });
let rows = [];
for (let f = 0; f < count; f += 1000) {
  const { data, error } = await supa.from(T).select('id,cancel_date,paid_amount,"broker\'s_name"').range(f, f + 999);
  if (error) { console.error('fetch error at', f, error.message); process.exit(1); }
  rows = rows.concat(data || []);
}
console.log(`fetched ${rows.length}/${count} rows`);

// ── plan the writes ─────────────────────────────────────────────────
const plan = []; // {id, field, from, to}

for (const r of rows) {
  // cancel_date
  if (r.cancel_date !== null) {
    const raw = String(r.cancel_date);
    if (raw.trim() === '') {
      plan.push({ id: r.id, field: 'cancel_date', from: raw, to: null });
    } else {
      const iso = normalizeDate(raw);
      if (iso) {
        if (raw !== iso) plan.push({ id: r.id, field: 'cancel_date', from: raw, to: iso });
      } else {
        plan.push({ id: r.id, field: 'cancel_date', from: raw, to: 'Cancelled' });
      }
    }
  }
  // paid_amount
  if (r.paid_amount !== null && String(r.paid_amount).trim() !== '' && parseAmount(r.paid_amount) === 0) {
    plan.push({ id: r.id, field: 'paid_amount', from: String(r.paid_amount), to: null });
  }
  // broker's_name
  const bn = r["broker's_name"];
  if (bn !== null) {
    const t = String(bn).trim();
    if (t === '') plan.push({ id: r.id, field: "broker's_name", from: bn, to: null });
    else if (t !== bn) plan.push({ id: r.id, field: "broker's_name", from: bn, to: t });
  }
}

const byField = {};
const samples = {};
for (const p of plan) {
  byField[p.field] = (byField[p.field] || 0) + 1;
  (samples[p.field] ||= []).push(p);
}
console.log('\nplanned writes:', JSON.stringify(byField));
for (const [f, arr] of Object.entries(samples)) {
  const uniq = [...new Map(arr.map(p => [String(p.from), p])).values()].slice(0, 12);
  console.log(`\n${f} (${arr.length} rows):`);
  uniq.forEach(p => console.log(`   id=${p.id}  ${JSON.stringify(p.from)}  ->  ${JSON.stringify(p.to)}`));
}

if (!APPLY) {
  console.log('\ndry-run only — rerun with --apply to execute.');
  process.exit(0);
}

// ── apply: value-grouped updates where possible, else by id ─────────
console.log('\napplying...');
let done = 0, failed = 0;
async function updateWhere(field, fromVal, toVal, useNull) {
  let q = supa.from(T).update({ [field]: toVal });
  q = useNull ? q.is(field, null) : q.eq(field, fromVal);
  const { error } = await q;
  if (error) { console.error(`  FAIL ${field} ${JSON.stringify(fromVal)} -> ${JSON.stringify(toVal)}: ${error.message}`); failed++; }
  else done++;
}

// group plan rows by (field, from, to) — one UPDATE per distinct mapping
const groups = new Map();
for (const p of plan) {
  const key = `${p.field}${JSON.stringify(p.from)}${JSON.stringify(p.to)}`;
  if (!groups.has(key)) groups.set(key, p);
}
for (const p of groups.values()) {
  if (String(p.from).trim() === '') {
    // whitespace values can't be .eq'd reliably per-variant; do per-id
    const ids = plan.filter(x => x.field === p.field && x.from === p.from).map(x => x.id);
    const { error } = await supa.from(T).update({ [p.field]: p.to }).in('id', ids);
    if (error) { console.error(`  FAIL ${p.field} ids(${ids.length}): ${error.message}`); failed += ids.length; } else done += ids.length;
  } else {
    await updateWhere(p.field, p.from, p.to, false);
  }
}
console.log(`done. ${done} update statements ok, ${failed} failed.`);
