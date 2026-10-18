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
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const supa = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const T = 'Master Data Of Gurukrupa';
const enc = encodeURIComponent(T);
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const { count } = await supa.from(T).select('*', { count: 'exact', head: true });
let rows = [];
for (let f = 0; f < count; f += 1000) {
  const { data } = await supa.from(T).select('id,"broker\'s_name"').range(f, f + 999);
  rows = rows.concat(data || []);
}

// rows needing change: trimmed differs or whitespace-only
const groups = new Map(); // to -> ids[]
for (const r of rows) {
  const bn = r["broker's_name"];
  if (bn === null) continue;
  const t = String(bn).trim();
  if (t === bn) continue;
  const to = t === '' ? null : t;
  const key = JSON.stringify(to);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(r.id);
}
console.log(`groups: ${groups.size}`);
for (const [toJson, ids] of groups) {
  const to = JSON.parse(toJson);
  // PATCH in id-batches of 200
  let ok = 0, fail = 0;
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200);
    const r = await fetch(`${URL}/rest/v1/${enc}?id=in.(${chunk.join(',')})&columns=%22broker%27s_name%22`, {
      method: 'PATCH', headers, body: JSON.stringify({ "broker's_name": to }),
    });
    if (r.ok) ok += chunk.length;
    else { fail += chunk.length; console.error(`  FAIL -> ${toJson}: ${r.status} ${(await r.text()).slice(0, 200)}`); }
  }
  console.log(`  ${JSON.stringify(ids[0])}... ${ids.length} rows -> ${toJson}: ok=${ok} fail=${fail}`);
}
