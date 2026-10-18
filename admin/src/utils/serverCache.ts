/**
 * Fast in-memory server-side cache with Stale-While-Revalidate (SWR) and
 * in-flight Promise deduplication for expensive 90k-row Supabase RPCs.
 * Attached to globalThis so it persists across Next.js dev HMR & route bundles.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  staleUntil: number;
}

const g = globalThis as unknown as {
  __indusunCacheStore?: Map<string, CacheEntry<any>>;
  __indusunCacheInflight?: Map<string, Promise<any>>;
};

const store = g.__indusunCacheStore ?? (g.__indusunCacheStore = new Map<string, CacheEntry<any>>());
const inflight = g.__indusunCacheInflight ?? (g.__indusunCacheInflight = new Map<string, Promise<any>>());

export async function withServerCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 120_000,
  staleMs = 600_000
): Promise<T> {
  const now = Date.now();
  const cached = store.get(key);

  if (cached && now < cached.expiresAt) {
    return cached.value as T;
  }

  // If within stale window, return cached value immediately and refresh in background
  if (cached && now < cached.staleUntil) {
    if (!inflight.has(key)) {
      const p = fetcher()
        .then((val) => {
          const t = Date.now();
          store.set(key, { value: val, expiresAt: t + ttlMs, staleUntil: t + staleMs });
          return val;
        })
        .catch(() => cached.value)
        .finally(() => inflight.delete(key));
      inflight.set(key, p);
    }
    return cached.value as T;
  }

  const existing = inflight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fetcher()
    .then((val) => {
      const t = Date.now();
      store.set(key, { value: val, expiresAt: t + ttlMs, staleUntil: t + staleMs });
      return val;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

export function invalidateServerCache(prefix?: string) {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const k of store.keys()) {
    if (k.startsWith(prefix)) {
      store.delete(k);
    }
  }
}
