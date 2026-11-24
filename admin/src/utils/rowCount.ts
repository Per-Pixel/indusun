import { withServerCache } from '@/utils/serverCache';

type CountResult = {
  count: number | null;
  error: { message: string } | null;
};

/**
 * Cached row count. Pass `estimated` for an unfiltered table scan so Postgres
 * can answer from table stats instead of counting every row. Falls back to an
 * exact count when the estimate is missing or zero.
 */
export async function cachedRowCount(
  key: string,
  exact: () => PromiseLike<CountResult>,
  estimated?: () => PromiseLike<CountResult>,
): Promise<number> {
  return withServerCache(key, async () => {
    if (estimated) {
      const est = await estimated();
      if (!est.error && est.count != null && est.count > 0) return est.count;
    }
    const { count, error } = await exact();
    if (error) throw new Error(error.message);
    return count || 0;
  });
}
