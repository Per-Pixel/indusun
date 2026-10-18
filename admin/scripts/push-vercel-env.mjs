// Push admin/.env.local vars to the linked Vercel project via `vercel env add`.
// Values are piped to stdin so they never appear in the terminal or argv.
// Skips VERCEL_OIDC_TOKEN (a local machine token written by `vercel link`).

import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local');
const pairs = [];
for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (!m || line.trim().startsWith('#')) continue;
  const key = m[1];
  if (key === 'VERCEL_OIDC_TOKEN') continue;
  pairs.push([key, m[2].trim().replace(/^["']|["']$/g, '')]);
}

const targets = ['production', 'preview', 'development'];
let failures = 0;
for (const [key, value] of pairs) {
  for (const target of targets) {
    const r = spawnSync(`vercel env add ${key} ${target} --scope koala-codes05s-projects`, {
      input: value,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });
    const ok = r.status === 0;
    if (!ok) failures++;
    console.log(`${ok ? 'OK ' : 'FAIL'} ${key} -> ${target}${ok ? '' : ' | ' + (r.stderr || r.stdout || '').slice(0, 200)}`);
  }
}
process.exit(failures ? 1 : 0);
