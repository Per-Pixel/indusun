/**
 * verify-data.mjs — cross-checks what the admin app displays vs the database.
 *
 * 1. Loads .env.local (same env the dev server uses).
 * 2. Pulls every row of "Master Data Of Gurukrupa" + aux tables via the
 *    service role and computes ground-truth aggregates using the SAME logic
 *    as the app (parseAmount / normalizeDate / isPaid / derive*Status).
 * 3. Mints a real auth session (admin.generateLink + verifyOtp) and calls the
 *    live API endpoints on the running dev server, comparing each summary
 *    number against ground truth.
 *
 * Usage:  node scripts/verify-data.mjs [--base http://localhost:3001]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADMIN_DIR = path.resolve(__dirname, '..');

/* ── env ─────────────────────────────────────────────────────────── */
function loadEnv(file) {
  const env = {};
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    env[key] = val;
  }
  return env;
}
const env = loadEnv(path.join(ADMIN_DIR, '.env.local'));
const SUPA_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BASE = (process.argv.find(a => a.startsWith('--base'))?.split('=')[1]) || 'http://localhost:3001';

if (!SUPA_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const TABLE = 'Master Data Of Gurukrupa';
const supa = createClient(SUPA_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

/* ── replica of src/utils/dataUtils.ts ───────────────────────────── */
const parseAmount = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const s = String(v);
  const parts = s.match(/[\d,]+(?:\.\d+)?\s*\/-/g);
  if (parts && parts.length) {
    return parts.reduce((sum, p) => sum + (parseFloat(p.replace(/[^0-9.]/g, '')) || 0), 0);
  }
  return parseFloat(s.replace(/[^0-9.]/g, '')) || 0;
};
const isPaid = (d) => !!(d && String(d).trim());
function normalizeDate(d) {
  if (d === null || d === undefined) return null;
  const s = String(d).trim();
  if (!s) return null;
  if (/^\d{4,5}$/.test(s)) {
    const serial = parseInt(s, 10);
    if (serial > 25569 && serial < 60000) {
      const js = new Date((serial - 25569) * 86400 * 1000);
      if (!isNaN(js.getTime())) return js.toISOString().split('T')[0];
    }
  }
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const iso = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    const dt = new Date(iso);
    if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
  }
  const dt = new Date(s);
  if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
  return null;
}
const deriveLeadStatus = (r) => {
  if (r.cancel_date) return 'cancelled';
  if (parseAmount(r.paid_amount) > 0) return 'booked';
  if (parseAmount(r.emi_amount) > 0) return 'negotiation';
  if (r.plot_no) return 'interested';
  return 'new';
};
const deriveBookingStatus = (r) => {
  if (r.cancel_date) return 'cancelled';
  const plot = parseAmount(r.plot_amount); const pct = plot === 0 ? 0 : parseAmount(r.paid_amount) / plot;
  if (pct >= 0.9) return 'possession';
  if (pct >= 0.5) return 'registered';
  if (pct >= 0.1) return 'agreement';
  return 'token';
};
const deriveVisitStatus = (r) => {
  if (r.cancel_date) return 'cancelled';
  if (parseAmount(r.paid_amount) > 0) return 'completed';
  const dv = r.emi_paid_date ?? r.date_of_form ?? r.date;
  if (!dv) return 'scheduled';
  const d = new Date(dv);
  if (isNaN(d.getTime())) return 'scheduled';
  return d < new Date() ? 'completed' : 'scheduled';
};

/* ── fetch helpers ───────────────────────────────────────────────── */
async function fetchAll(table, select = '*') {
  const { count, error } = await supa.from(table).select('*', { count: 'exact', head: true });
  if (error) throw new Error(`${table} count: ${error.message}`);
  const pages = Math.ceil((count || 0) / 1000);
  let rows = [];
  for (let b = 0; b < pages; b += 10) {
    const end = Math.min(b + 10, pages);
    const results = await Promise.all(
      Array.from({ length: end - b }, (_, i) => supa.from(table).select(select).order('id', { ascending: true }).range((b + i) * 1000, (b + i) * 1000 + 999))
    );
    for (const { data, error } of results) {
      if (error) throw new Error(`${table} fetch: ${error.message}`);
      rows = rows.concat(data || []);
    }
  }
  return { rows, count: count || 0 };
}
async function tryCount(table, filter) {
  try {
    let q = supa.from(table).select('*', { count: 'exact', head: true });
    if (filter) q = filter(q);
    const { count, error } = await q;
    if (error) return { count: null, error: error.message };
    return { count: count || 0, error: null };
  } catch (e) { return { count: null, error: e.message }; }
}

/* ── session minting → cookie header for live API calls ──────────── */
async function mintCookieHeader() {
  const { data: list, error } = await supa.auth.admin.listUsers({ perPage: 5 });
  if (error || !list?.users?.length) throw new Error(`listUsers failed: ${error?.message || 'no users'}`);
  const email = list.users[0].email;
  const { data: link, error: gErr } = await supa.auth.admin.generateLink({ type: 'magiclink', email });
  if (gErr) throw new Error(`generateLink failed: ${gErr.message}`);

  const anon = createClient(SUPA_URL, ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: sess, error: vErr } = await anon.auth.verifyOtp({
    token_hash: link.properties.hashed_token, type: 'magiclink',
  });
  if (vErr || !sess.session) throw new Error(`verifyOtp failed: ${vErr?.message}`);

  // Ask @supabase/ssr to encode the session exactly the way the browser
  // client would store it, so middleware.getSession() accepts it.
  const jar = new Map();
  const ssr = createServerClient(SUPA_URL, ANON_KEY, {
    cookies: {
      getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
      setAll: (cs) => cs.forEach((c) => jar.set(c.name, c.value)),
    },
  });
  await ssr.auth.setSession(sess.session);
  const cookie = [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  return { cookie, email };
}

async function api(pathname, cookie) {
  const res = await fetch(BASE + pathname, { headers: { cookie }, redirect: 'manual' });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* html (login redirect page) */ }
  return { status: res.status, json, location: res.headers.get('location') };
}

/* ── comparisons ─────────────────────────────────────────────────── */
const results = [];
function check(name, expected, actual) {
  const tol = typeof expected === 'number' && typeof actual === 'number' ? Math.abs(expected - actual) : 0;
  const ok = expected === actual || (typeof expected === 'number' && typeof actual === 'number' && tol < 0.01);
  results.push({ name, expected, actual, ok });
}

const approx = (n) => Math.round(n * 100) / 100;

/* ══ MAIN ══════════════════════════════════════════════════════════ */
console.log(`\n== Ground truth from Supabase ==`);
const { rows, count: totalRows } = await fetchAll(TABLE);
console.log(`${TABLE}: ${totalRows} rows (fetched ${rows.length})`);
if (rows.length !== totalRows) console.log(`  ⚠ fetched ${rows.length} != count ${totalRows}`);

// distinct sets
const clients = new Set(), societies = new Set(), plots = new Set(), soldPlots = new Set();
const brokerKeys = new Set(); // trim + lowercase dedup — mirrors /api/sales & /api/brokers
let sumPlot = 0, sumPaid = 0, listed = 0, sold = 0, cancelled = 0;
let paidRows = 0, paidEmiSum = 0, pendingEmiSum = 0;
let activePaidRows = 0, activePaidEmiSum = 0, activePendingEmiSum = 0;
let cancelledRows = 0, cancelledEmiSum = 0;
const pipeline = { new: 0, contacted: 0, interested: 0, site_visit: 0, negotiation: 0, booked: 0, cancelled: 0 };
const booking = { rows: 0, token: 0, agreement: 0, registered: 0, possession: 0, cancelled: 0, revenue: 0, paid: 0 };
const visits = { total: 0, scheduled: 0, completed: 0, cancelled: 0 };
let bookingsCountDb = 0; // .not('paid_amount','is',null)
for (const r of rows) {
  if (r.client_name) clients.add(r.client_name);
  if (r.society_name) societies.add(r.society_name);
  const bn = String(r["broker's_name"] ?? '').trim();
  if (bn) brokerKeys.add(bn.toLowerCase());
  const plotKey = r.plot_no ? `${r.society_name || ''}||${r.plot_no}` : null;
  if (plotKey) {
    plots.add(plotKey);
    if (!r.cancel_date && r.paid_amount) soldPlots.add(plotKey);
  }
  sumPlot += parseAmount(r.plot_amount);
  sumPaid += parseAmount(r.paid_amount);
  if (r.cancel_date) cancelled++; else {
    listed++;
    if (r.paid_amount) sold++;
  }
  if (isPaid(r.emi_paid_date)) { paidRows++; paidEmiSum += parseAmount(r.emi_amount); }
  else pendingEmiSum += parseAmount(r.emi_amount);
  // new semantics: cancelled excluded from revenue/pending/completed
  if (r.cancel_date) { cancelledRows++; cancelledEmiSum += parseAmount(r.emi_amount); }
  else if (isPaid(r.emi_paid_date)) { activePaidRows++; activePaidEmiSum += parseAmount(r.emi_amount); }
  else activePendingEmiSum += parseAmount(r.emi_amount);
  pipeline[deriveLeadStatus(r)]++;
  if (r.paid_amount !== null && r.paid_amount !== undefined) {
    bookingsCountDb++;
    booking.revenue += parseAmount(r.plot_amount);
    booking.paid += parseAmount(r.paid_amount);
    booking[deriveBookingStatus(r)]++;
  }
  if (r.date_of_form !== null && r.date_of_form !== undefined) {
    visits.total++;
    visits[deriveVisitStatus(r)]++;
  }
}
booking.rows = bookingsCountDb;

// invoices summary: paid = emi_paid_date non-empty; pending = null/'' (PostgREST neq '' matters)
const invPaid = rows.filter(r => isPaid(r.emi_paid_date)).length;
const invPending = totalRows - invPaid; // eq '' or null — same partition as isPaid()

const aux = {};
for (const t of ['bills', 'brokers', 'admin_users', 'messages']) {
  aux[t] = await tryCount(t);
}
let billsPaid = 0, billsPending = 0;
if (aux.bills.error === null) {
  const bp = await tryCount('bills', q => q.eq('status', 'Paid'));
  billsPaid = bp.count || 0;
  billsPending = (aux.bills.count || 0) - billsPaid;
}

const truth = {
  totalRows,
  uniqueClients: clients.size, uniqueSocieties: societies.size, uniqueBrokers: brokerKeys.size,
  totalPlotAmount: approx(sumPlot), totalPaidAmount: approx(sumPaid),
  listed, sold, cancelled,
  pipeline,
  sales: { totalTransactions: activePaidRows, totalRevenue: approx(activePaidEmiSum), totalProperties: plots.size, propertiesSold: soldPlots.size, cancelledTransactions: cancelledRows, cancelledRevenue: approx(cancelledEmiSum) },
  billing: { totalRevenue: approx(activePaidEmiSum), pendingPayments: approx(activePendingEmiSum), totalTransactions: totalRows, completedTransactions: activePaidRows, cancelledCount: cancelledRows, cancelledAmount: approx(cancelledEmiSum) },
  invoices: { paidCount: invPaid + billsPaid, pendingCount: invPending + billsPending, totalCount: totalRows + (aux.bills.count || 0) },
  booking, visits,
  aux: Object.fromEntries(Object.entries(aux).map(([k, v]) => [k, v.error === null ? v.count : `ERR: ${v.error}`])),
};

console.log('\n== Ground-truth aggregates ==');
console.log(JSON.stringify(truth, null, 2));

/* ── live API comparison ─────────────────────────────────────────── */
console.log(`\n== Live API check against ${BASE} ==`);
let cookie = null;
try {
  const minted = await mintCookieHeader();
  cookie = minted.cookie;
  console.log(`minted session for ${minted.email}`);
} catch (e) {
  console.log(`could not mint session: ${e.message} — skipping live API checks`);
}

if (cookie) {
  const [sales, billing, invoices, tx, props, brokerList, admins, health, dash, masterPage] = await Promise.all([
    api('/api/sales', cookie),
    api('/api/billing?limit=1', cookie),
    api('/api/invoices?limit=1', cookie),
    api('/api/transactions?limit=1', cookie),
    api('/api/properties?pageSize=1', cookie),
    api('/api/brokers', cookie),
    api('/api/admin-users', cookie),
    api('/api/health', cookie),
    api('/dashboard', cookie),
    api('/master-data', cookie),
  ]);

  const redir = (r) => r.status >= 300 && r.status < 400 ? `→ ${r.location}` : '';
  console.log(`routes: /api/sales ${sales.status} /api/billing ${billing.status} /api/invoices ${invoices.status} /api/transactions ${tx.status} /api/properties ${props.status} /api/brokers ${brokerList.status} /api/admin-users ${admins.status} /dashboard ${dash.status} ${redir(dash)} /master-data ${masterPage.status}`);

  if (sales.json?.summary) {
    const s = sales.json.summary;
    check('sales.totalTransactions', truth.sales.totalTransactions, s.totalTransactions);
    check('sales.totalRevenue', truth.sales.totalRevenue, approx(s.totalRevenue));
    check('sales.totalClients', truth.uniqueClients, s.totalClients);
    check('sales.totalBrokers', truth.uniqueBrokers, s.totalBrokers);
    check('sales.totalProperties', truth.sales.totalProperties, s.totalProperties);
    check('sales.propertiesSold', truth.sales.propertiesSold, s.propertiesSold);
    check('sales.cancelledTransactions', truth.sales.cancelledTransactions, s.cancelledTransactions);
    check('sales.cancelledRevenue', truth.sales.cancelledRevenue, approx(s.cancelledRevenue));
  } else console.log('sales: no json summary (status ' + sales.status + ')');

  if (billing.json?.summary) {
    const b = billing.json.summary;
    check('billing.totalRevenue', truth.billing.totalRevenue, approx(b.totalRevenue));
    check('billing.pendingPayments', truth.billing.pendingPayments, approx(b.pendingPayments));
    check('billing.totalTransactions', truth.billing.totalTransactions, b.totalTransactions);
    check('billing.completedTransactions', truth.billing.completedTransactions, b.completedTransactions);
    check('billing.cancelledCount', truth.billing.cancelledCount, b.cancelledCount);
    check('billing.cancelledAmount', truth.billing.cancelledAmount, approx(b.cancelledAmount));
  } else console.log('billing: no json summary (status ' + billing.status + ')');

  if (invoices.json?.summary) {
    const i = invoices.json.summary;
    check('invoices.paidCount', truth.invoices.paidCount, i.paidCount);
    check('invoices.pendingCount', truth.invoices.pendingCount, i.pendingCount);
    check('invoices.totalCount', truth.invoices.totalCount, i.totalCount);
  } else console.log('invoices: no json summary (status ' + invoices.status + ')');

  if (tx.json?.pagination) check('transactions.totalItems', totalRows, tx.json.pagination.totalItems);
  if (props.json) check('properties.count', totalRows, props.json.count);

  if (brokerList.json?.summary) {
    check('brokers.totalBrokers', truth.uniqueBrokers, brokerList.json.summary.totalBrokers);
    check('brokers.directoryCount', aux.brokers.error === null ? aux.brokers.count : 0, brokerList.json.summary.directoryCount);
  } else console.log('brokers: no summary in payload');

  if (admins.json) {
    const n = Array.isArray(admins.json) ? admins.json.length : (admins.json.users?.length ?? admins.json.data?.length ?? '?');
    check('admin_users.count', aux.admin_users.error === null ? aux.admin_users.count : n, n);
  }
  if (health.json) console.log('health:', JSON.stringify(health.json));

  console.log('\n== Comparison ==');
  for (const r of results) {
    const fmt = (v) => typeof v === 'number' ? v.toLocaleString('en-IN') : String(v);
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(38)} db=${fmt(r.expected)}  api=${fmt(r.actual)}`);
  }
  const fails = results.filter(r => !r.ok);
  console.log(`\n${results.length - fails.length}/${results.length} checks passed` + (fails.length ? ` — ${fails.length} MISMATCHES` : ''));
}
