// CRUD helpers for the shared `page_content` table.
// Both admin (writes) and main (reads) point at the same Postgres DB.
//
// Schema:
//   page_slug     varchar(64)
//   section_key   varchar(64)
//   data          jsonb     -- arbitrary section payload
//   visible       boolean   -- per-section visibility toggle
//   updated_at    timestamptz
//   PRIMARY KEY (page_slug, section_key)

import pool from '@/lib/db';

export interface PageSectionRow {
  page_slug: string;
  section_key: string;
  data: Record<string, unknown>;
  visible: boolean;
  updated_at: string;
}

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS page_content (
    page_slug   VARCHAR(64) NOT NULL,
    section_key VARCHAR(64) NOT NULL,
    data        JSONB        NOT NULL DEFAULT '{}'::jsonb,
    visible     BOOLEAN      NOT NULL DEFAULT TRUE,
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (page_slug, section_key)
  );
`;

export async function ensurePageContentTable(): Promise<void> {
  await pool.query(CREATE_TABLE_SQL);
}

export async function getPageSections(pageSlug: string): Promise<PageSectionRow[]> {
  await ensurePageContentTable();
  const result = await pool.query<PageSectionRow>(
    `SELECT page_slug, section_key, data, visible, updated_at
       FROM page_content
      WHERE page_slug = $1`,
    [pageSlug],
  );
  return result.rows;
}

export interface UpsertSectionInput {
  pageSlug: string;
  sectionKey: string;
  data: Record<string, unknown>;
  visible: boolean;
}

export async function upsertSection(input: UpsertSectionInput): Promise<void> {
  await ensurePageContentTable();
  await pool.query(
    `INSERT INTO page_content (page_slug, section_key, data, visible, updated_at)
     VALUES ($1, $2, $3::jsonb, $4, NOW())
     ON CONFLICT (page_slug, section_key)
     DO UPDATE SET data = EXCLUDED.data,
                   visible = EXCLUDED.visible,
                   updated_at = NOW()`,
    [input.pageSlug, input.sectionKey, JSON.stringify(input.data), input.visible],
  );
}
