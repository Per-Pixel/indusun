// Read-side helper for the shared `page_content` table.
// Returns a `{ [sectionKey]: { data, visible } }` map for the given page slug.
// Falls back to an empty map on any error (DB down, table missing, etc.) so
// callers can safely use defaults without crashing the page.

import pool from '@/lib/db';

export interface PageSection<T = Record<string, unknown>> {
  data: T;
  visible: boolean;
}

export type PageContent = Record<string, PageSection>;

export async function getPageContent(slug: string): Promise<PageContent> {
  try {
    const result = await pool.query<{ section_key: string; data: Record<string, unknown>; visible: boolean }>(
      `SELECT section_key, data, visible FROM page_content WHERE page_slug = $1`,
      [slug],
    );
    const out: PageContent = {};
    for (const row of result.rows) {
      out[row.section_key] = { data: row.data, visible: row.visible };
    }
    return out;
  } catch {
    // Table may not exist yet, or DB is unavailable. Caller will use its
    // hardcoded defaults instead.
    return {};
  }
}

/**
 * Pick a section's data with a typed default fallback.
 * Useful pattern in client components fed via props from a server parent.
 */
export function sectionData<T extends Record<string, unknown>>(
  content: PageContent | undefined,
  key: string,
  defaults: T,
): { data: T; visible: boolean } {
  const found = content?.[key];
  if (!found) return { data: defaults, visible: true };
  return {
    data: { ...defaults, ...(found.data as T) },
    visible: found.visible,
  };
}
