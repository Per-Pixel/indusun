import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

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

// session
const { data: list } = await supa.auth.admin.listUsers({ perPage: 5 });
const { data: link } = await supa.auth.admin.generateLink({ type: 'magiclink', email: list.users[0].email });
const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const { data: sess } = await anon.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: 'magiclink' });
const jar = new Map();
const ssr = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  cookies: {
    getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
    setAll: (cs) => cs.forEach((c) => jar.set(c.name, c.value)),
  },
});
await ssr.auth.setSession(sess.session);
const cookie = [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');

// brokers summary
const res = await fetch('http://localhost:3001/api/brokers?limit=10', { headers: { cookie } });
const json = await res.json();
console.log('brokers summary:', JSON.stringify(json.summary), 'pagination:', JSON.stringify(json.pagination));

// DB-side derived broker count (trim + lowercase dedup — mirrors the API)
const { count } = await supa.from(T).select('*', { count: 'exact', head: true });
let names = [];
for (let f = 0; f < count; f += 1000) {
  const { data } = await supa.from(T).select('"broker\'s_name"').range(f, f + 999);
  names = names.concat((data || []).map(r => r["broker's_name"]));
}
const seen = new Map();
for (const n of names) {
  const t = String(n ?? '').trim();
  if (!t) continue;
  const k = t.toLowerCase();
  if (!seen.has(k)) seen.set(k, t);
}
console.log('DB derived broker names (trim+lowercase dedup):', seen.size);

// cancel_date shape: NULL vs '' vs other — matters because main site uses .is('cancel_date', null)
let nullCount = 0, emptyCount = 0, otherCount = 0;
const otherVals = {};
for (let f = 0; f < count; f += 1000) {
  const { data } = await supa.from(T).select('cancel_date').range(f, f + 999);
  for (const r of data || []) {
    if (r.cancel_date === null) nullCount++;
    else if (String(r.cancel_date).trim() === '') emptyCount++;
    else { otherCount++; otherVals[String(r.cancel_date)] = (otherVals[String(r.cancel_date)] || 0) + 1; }
  }
}
console.log('\ncancel_date: NULL=' + nullCount, "''=" + emptyCount, 'other=' + otherCount);
console.log('distinct non-empty cancel_date values:', JSON.stringify(otherVals));

// what main-site properties API would count: cancel_date IS NULL
const { count: mainProps } = await supa.from(T).select('*', { count: 'exact', head: true }).is('cancel_date', null);
console.log('main-site listed properties (cancel_date IS NULL):', mainProps);
