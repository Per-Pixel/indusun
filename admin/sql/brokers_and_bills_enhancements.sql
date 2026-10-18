-- ============================================================================
-- Brokers table + Bills enhancements — Database Migration
-- Run this against your Supabase SQL Editor or psql connection.
-- Safe to re-run (idempotent).
-- ============================================================================

-- 1. brokers — real broker directory records.
--    The /api/brokers GET merges these with broker names derived from
--    "Master Data Of Gurukrupa" rows (those stay read-only).
CREATE TABLE IF NOT EXISTS brokers (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name            text NOT NULL,
  phone           text,
  email           text,
  location        text,
  status          text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  role            text DEFAULT 'Broker',
  commission_rate numeric,
  rera_number     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at on row change (function already exists from
-- admin_panel_overhaul.sql; created here too so this file is standalone)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_brokers_updated_at'
  ) THEN
    CREATE TRIGGER set_brokers_updated_at
      BEFORE UPDATE ON brokers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'brokers_select_authenticated'
  ) THEN
    CREATE POLICY brokers_select_authenticated ON brokers
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_brokers_name   ON brokers(name);
CREATE INDEX IF NOT EXISTS idx_brokers_status ON brokers(status);


-- 2. bills — richer invoice detail: due date, line items, tax, discount,
--    payment reference. All optional so existing rows are unaffected.
ALTER TABLE bills ADD COLUMN IF NOT EXISTS due_date     date;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS items        jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS tax_rate     numeric DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS discount     numeric DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS payment_ref  text;

-- items rows look like: [{ "description": "...", "quantity": 1, "unit_price": 50000 }]
