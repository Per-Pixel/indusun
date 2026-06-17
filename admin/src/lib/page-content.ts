// CRUD helpers for the shared `page_content` table.
// Both admin (writes) and main (reads) point at the same Supabase project.
//
// Required Supabase table (create once in the SQL editor):
//   CREATE TABLE IF NOT EXISTS page_content (
//     page_slug   VARCHAR(64) NOT NULL,
//     section_key VARCHAR(64) NOT NULL,
//     data        JSONB        NOT NULL DEFAULT '{}',
//     visible     BOOLEAN      NOT NULL DEFAULT TRUE,
//     updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
//     PRIMARY KEY (page_slug, section_key)
//   );

import { createServiceClient } from '@/utils/supabase/service';

export interface PageSectionRow {
  page_slug: string;
  section_key: string;
  data: Record<string, unknown>;
  visible: boolean;
  updated_at: string;
}

export async function getPageSections(pageSlug: string): Promise<PageSectionRow[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('page_content')
    .select('page_slug,section_key,data,visible,updated_at')
    .eq('page_slug', pageSlug);

  if (error) {
    console.error('[page-content] getPageSections error:', error.message);
    return [];
  }
  return (data || []) as PageSectionRow[];
}

export interface UpsertSectionInput {
  pageSlug: string;
  sectionKey: string;
  data: Record<string, unknown>;
  visible: boolean;
}

export async function upsertSection(input: UpsertSectionInput): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('page_content')
    .upsert(
      {
        page_slug:   input.pageSlug,
        section_key: input.sectionKey,
        data:        input.data,
        visible:     input.visible,
        updated_at:  new Date().toISOString(),
      },
      { onConflict: 'page_slug,section_key' }
    );

  if (error) {
    throw new Error(`[page-content] upsertSection failed: ${error.message}`);
  }
}
