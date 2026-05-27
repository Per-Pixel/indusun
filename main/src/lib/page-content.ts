// Read-side helper for the shared `page_content` table.
// Returns a `{ [sectionKey]: { data, visible } }` map for the given page slug.
// Falls back to an empty map on any error (DB down, table missing, etc.) so
// callers can safely use defaults without crashing the page.

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export interface PageSection<T = Record<string, unknown>> {
  data: T;
  visible: boolean;
}

export type PageContent = Record<string, PageSection>;

export async function getPageContent(slug: string): Promise<PageContent> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data, error } = await supabase
      .from('page_content')
      .select('section_key, data, visible')
      .eq('page_slug', slug);
    
    if (error) {
      throw error;
    }

    const out: PageContent = {};
    if (data) {
      for (const row of data) {
        out[row.section_key] = { data: row.data as Record<string, unknown>, visible: row.visible };
      }
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
