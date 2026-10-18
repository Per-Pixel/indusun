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
const testId = 22708; // "MANOJ " row
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };

// current value
const cur = await supa.from(T).select('id,"broker\'s_name"').eq('id', testId).single();
console.log('current:', JSON.stringify(cur.data));

// A) PATCH with columns param (quoted col name) + body key
let r = await fetch(`${URL}/rest/v1/${enc}?id=eq.${testId}&columns=%22broker%27s_name%22`, {
  method: 'PATCH', headers, body: JSON.stringify({ "broker's_name": 'MANOJ' }),
});
console.log('A) PATCH ?columns=...:', r.status, (await r.text()).slice(0, 300));

// B) PATCH plain body (no columns param)
r = await fetch(`${URL}/rest/v1/${enc}?id=eq.${testId}`, {
  method: 'PATCH', headers, body: JSON.stringify({ "broker's_name": 'MANOJ' }),
});
console.log('B) PATCH plain:', r.status, (await r.text()).slice(0, 300));

// C) upsert via POST merge-duplicates
r = await fetch(`${URL}/rest/v1/${enc}?on_conflict=id`, {
  method: 'POST', headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify([{ id: testId, "broker's_name": 'MANOJ' }]),
});
console.log('C) upsert:', r.status, (await r.text()).slice(0, 300));

const after = await supa.from(T).select('id,"broker\'s_name"').eq('id', testId).single();
console.log('after:', JSON.stringify(after.data));
