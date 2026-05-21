CREATE TABLE IF NOT EXISTS page_content (
  page_slug   VARCHAR(64) NOT NULL,
  section_key VARCHAR(64) NOT NULL,
  data        JSONB        NOT NULL DEFAULT '{}'::jsonb,
  visible     BOOLEAN      NOT NULL DEFAULT TRUE,
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (page_slug, section_key)
);