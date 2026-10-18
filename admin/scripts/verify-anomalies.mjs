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
const pa = (v) => (v == null || v === '') ? 0 : (parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0);

const { count } = await supa.from(T).select('*', { count: 'exact', head: true });
let rows = [];
for (let f = 0; f < count; f += 1000) {
  const { data, error } = await supa.from(T).select('id,client_name,society_name,plot_no,plot_amount,paid_amount,emi_amount,emi_paid_date,"broker\'s_name",cancel_date').range(f, f + 999);
  if (error) { console.error('fetch error at', f, error.message); break; }
  rows = rows.concat(data || []);
}
console.log('fetched', rows.length, '/', count);

// 1. broker name oddities: whitespace-only / untrimmed
const rawNames = rows.map(r => r["broker's_name"]).filter(v => v != null && v !== '');
console.log('raw truthy broker names distinct:', new Set(rawNames).size);
console.log('trimmed non-empty distinct:', new Set(rawNames.map(s => String(s).trim()).filter(s => s)).size);
const wsOnly = [...new Set(rawNames.filter(v => String(v).trim() === ''))];
console.log('whitespace-only values:', JSON.stringify(wsOnly));
const untrimmed = [...new Set(rawNames.filter(v => v !== String(v).trim()))];
console.log('names w/ leading-trailing ws:', JSON.stringify(untrimmed));

// 2. absurd plot_amount
const big = rows.filter(r => pa(r.plot_amount) > 1e8).sort((a, b) => pa(b.plot_amount) - pa(a.plot_amount));
console.log('\nplot_amount > 10Cr rows:', big.length);
big.slice(0, 15).forEach(r => console.log(' id=' + r.id, JSON.stringify(r.society_name), 'plot=' + r.plot_no, 'plot_amount=' + JSON.stringify(r.plot_amount), 'paid=' + JSON.stringify(r.paid_amount), 'emi=' + JSON.stringify(r.emi_amount)));
const sumNoBig = rows.reduce((s, r) => pa(r.plot_amount) > 1e8 ? s : s + pa(r.plot_amount), 0);
console.log('sum(plot_amount) excluding >10Cr outliers:', sumNoBig.toLocaleString('en-IN'));

// 3. the single pending row
console.log('\npending (empty emi_paid_date) rows:');
rows.filter(r => !isPaidLocal(r.emi_paid_date)).forEach(r => console.log(' id=' + r.id, JSON.stringify(r)));
function isPaidLocal(d) { return !!(d && String(d).trim()); }

// 4. paid rows with no emi_amount
const paidNoAmt = rows.filter(r => isPaidLocal(r.emi_paid_date) && pa(r.emi_amount) === 0);
console.log('\npaid rows with zero/empty emi_amount:', paidNoAmt.length);
paidNoAmt.slice(0, 5).forEach(r => console.log(' id=' + r.id, 'emi=' + JSON.stringify(r.emi_amount), 'paid_date=' + JSON.stringify(r.emi_paid_date)));

// 5. distinct emi_paid_date formats (are they real dates?)
const fmt = {};
rows.forEach(r => {
  const s = String(r.emi_paid_date ?? '');
  const k = s === '' ? '(empty)' : /^\d{4}-\d{2}-\d{2}/.test(s) ? 'ISO' : /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(s) ? 'DD/MM/YYYY' : /^\d{4,5}$/.test(s.trim()) ? 'excel-serial' : 'other';
  fmt[k] = (fmt[k] || 0) + 1;
});
console.log('\nemi_paid_date formats:', JSON.stringify(fmt));
const others = [...new Set(rows.filter(r => { const s = String(r.emi_paid_date ?? ''); return s && !/^\d{4}-\d{2}-\d{2}/.test(s) && !/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(s) && !/^\d{4,5}$/.test(s.trim()); }).map(r => String(r.emi_paid_date)))];
console.log('unrecognized emi_paid_date values:', JSON.stringify(others.slice(0, 20)));

// 6. paid_amount values that are non-numeric text
const weirdPaid = rows.filter(r => r.paid_amount != null && String(r.paid_amount).trim() !== '' && pa(r.paid_amount) === 0);
console.log('\nnon-numeric paid_amount values:', JSON.stringify([...new Set(weirdPaid.map(r => String(r.paid_amount)))].slice(0, 20)), 'count:', weirdPaid.length);
