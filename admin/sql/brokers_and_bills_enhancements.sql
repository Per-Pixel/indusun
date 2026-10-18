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
ALTER TABLE bills ADD COLUMN IF NOT EXISTS attachments  jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS linked_bill_ids jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS society_name text;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS plot_no      text;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS plot_size    text;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS reference_by text;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS total_emi_no text;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS amount_in_words text;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS remarks      text;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS cancellation_note text;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS bank_details jsonb DEFAULT '[]'::jsonb;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS upi_vpa      text DEFAULT 'gurukrupacorp@kbl';
ALTER TABLE bills ADD COLUMN IF NOT EXISTS show_qr      boolean DEFAULT true;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS plot_amount  numeric DEFAULT 0;

-- items rows look like: [{ "description": "...", "quantity": 1, "unit_price": 50000 }]


-- 3. "Master Data Of Gurukrupa" — Gurukrupa Corporation Application Form fields
--    Adds missing applicant, KYC, address, nominee, BA code, block, and EMI schedule
--    fields from the physical Gurukrupa Corporation Application Form, and ensures
--    `id` has an auto-incrementing sequence default.
CREATE SEQUENCE IF NOT EXISTS public.master_data_of_gurukrupa_id_seq;
SELECT setval(
  'public.master_data_of_gurukrupa_id_seq',
  GREATEST(COALESCE((SELECT MAX(id) FROM "Master Data Of Gurukrupa"), 0), 1),
  true
);
ALTER TABLE "Master Data Of Gurukrupa"
  ALTER COLUMN id SET DEFAULT nextval('public.master_data_of_gurukrupa_id_seq');

ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS registration_no        text;
ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS ba_code                text;
ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS father_or_husband_name text;
ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS age                    text;
ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS date_of_birth          text;
ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS profession             text;
ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS address                text;
ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS resident_no            text;
ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS aadhar_no              text;
ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS pan_no                 text;
ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS nominee_name           text;
ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS nominee_relation       text;
ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS nominee_age            text;
ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS nominee_dob            text;
ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS nominee_profession     text;
ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS emi_date               text;
ALTER TABLE "Master Data Of Gurukrupa" ADD COLUMN IF NOT EXISTS applicant_photo        text;

CREATE INDEX IF NOT EXISTS idx_master_registration_no_trgm
  ON public."Master Data Of Gurukrupa" USING gin (registration_no gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_master_aadhar_no_trgm
  ON public."Master Data Of Gurukrupa" USING gin (aadhar_no gin_trgm_ops);

-- Update normalization trigger so explicitly supplied block_name, ba_code,
-- broker_code, and registration_no from the Application Form are preserved.
CREATE OR REPLACE FUNCTION public.sync_master_data_normalized_cols()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.id IS NULL THEN
    NEW.id := nextval('public.master_data_of_gurukrupa_id_seq');
  END IF;

  IF NEW.registration_no IS NOT NULL AND btrim(NEW.registration_no) <> '' AND (NEW.r_no IS NULL OR btrim(NEW.r_no) = '') THEN
    NEW.r_no := btrim(NEW.registration_no);
  ELSIF NEW.r_no IS NOT NULL AND btrim(NEW.r_no) <> '' AND (NEW.registration_no IS NULL OR btrim(NEW.registration_no) = '') THEN
    NEW.registration_no := btrim(NEW.r_no);
  END IF;

  IF NEW.society_name IS NOT NULL THEN
    NEW.society_name := regexp_replace(btrim(NEW.society_name), '\s+', ' ', 'g');
    NEW.project_name := CASE
      WHEN upper(NEW.society_name) LIKE 'ROYAL CITY%' THEN 'ROYAL CITY'
      WHEN upper(NEW.society_name) LIKE 'SAI SHRUSHTI RESIDANCY%' THEN 'SAI SHRUSHTI RESIDANCY'
      WHEN NEW.society_name = 'MAHADEV NAGAR (BLOCK NO.- 44/164-B)' THEN 'MAHADEV NAGAR'
      WHEN NEW.society_name = 'SATGURU PARK (BHARUCH)' THEN 'SATGURU PARK'
      WHEN NEW.society_name IN ('SHIV SAI NAGAR -I', 'SHIV SAI NAGAR V') THEN 'SHIV SAI NAGAR'
      WHEN NEW.society_name = 'SAI NAGAR - 1' THEN 'SAI NAGAR'
      WHEN NEW.society_name = 'SATGURU NAGAR -2' THEN 'SATGURU NAGAR'
      WHEN NEW.society_name = 'AVADH RESIDANCY -2' THEN 'AVADH RESIDANCY'
      WHEN NEW.society_name = 'DREAM CITY -1' THEN 'DREAM CITY'
      ELSE NEW.society_name
    END;
    IF NEW.block_name IS NOT NULL AND btrim(NEW.block_name) <> '' AND btrim(NEW.block_name) <> 'Main' THEN
      NEW.block_name := btrim(NEW.block_name);
    ELSE
      NEW.block_name := CASE
        WHEN NEW.society_name ~ '^ROYAL CITY \(\s*([A-Z])/BLOCK\s*\)$' THEN 'Block ' || substring(NEW.society_name from '^ROYAL CITY \(\s*([A-Z])/BLOCK\s*\)$')
        WHEN NEW.society_name ~ '^SAI SHRUSHTI RESIDANCY \(BLOCK (\d+)\)$' THEN 'Block ' || substring(NEW.society_name from '^SAI SHRUSHTI RESIDANCY \(BLOCK (\d+)\)$')
        WHEN NEW.society_name = 'MAHADEV NAGAR (BLOCK NO.- 44/164-B)' THEN 'Block 44/164-B'
        WHEN NEW.society_name = 'SATGURU PARK (BHARUCH)' THEN 'Bharuch'
        WHEN NEW.society_name = 'SHIV SAI NAGAR -I' THEN 'Phase I'
        WHEN NEW.society_name = 'SHIV SAI NAGAR V' THEN 'Phase V'
        WHEN NEW.society_name = 'SAI NAGAR - 1' THEN 'Phase 1'
        WHEN NEW.society_name = 'SATGURU NAGAR -2' THEN 'Phase 2'
        WHEN NEW.society_name = 'AVADH RESIDANCY -2' THEN 'Phase 2'
        WHEN NEW.society_name = 'DREAM CITY -1' THEN 'Phase 1'
        ELSE 'Main'
      END;
    END IF;
  END IF;

  IF (NEW."broker's_name" IS NULL OR btrim(NEW."broker's_name") = '') AND COALESCE(NULLIF(btrim(NEW.ba_code), ''), NULLIF(btrim(NEW.broker_code), '')) IS NOT NULL THEN
    NEW."broker's_name" := COALESCE(NULLIF(btrim(NEW.ba_code), ''), NULLIF(btrim(NEW.broker_code), ''));
  END IF;

  IF NEW."broker's_name" IS NOT NULL AND btrim(NEW."broker's_name") <> '' THEN
    NEW."broker's_name" := btrim(NEW."broker's_name");
    NEW.broker_code := COALESCE(
      NULLIF(btrim(NEW.broker_code), ''),
      NULLIF(btrim(NEW.ba_code), ''),
      public.parse_broker_field(NEW."broker's_name", 'code')
    );
    NEW.ba_code := COALESCE(NULLIF(btrim(NEW.ba_code), ''), NEW.broker_code);
    NEW.broker_name_clean := COALESCE(
      public.parse_broker_field(NEW."broker's_name", 'name'),
      NEW."broker's_name"
    );
  ELSE
    NEW.broker_code := COALESCE(NULLIF(btrim(NEW.broker_code), ''), NULLIF(btrim(NEW.ba_code), ''));
    NEW.ba_code := COALESCE(NULLIF(btrim(NEW.ba_code), ''), NEW.broker_code);
    NEW.broker_name_clean := NULL;
  END IF;

  NEW.plot_amount_num := public.parse_master_amount(NEW.plot_amount);
  NEW.paid_amount_num := public.parse_master_amount(NEW.paid_amount);
  NEW.emi_amount_num := public.parse_master_amount(NEW.emi_amount);
  NEW.emi_paid_date_iso := public.normalize_master_date(NEW.emi_paid_date);
  NEW.form_date_iso := public.normalize_master_date(COALESCE(NEW.date_of_form, NEW.date));

  RETURN NEW;
END;
$function$;

-- Seed Application Form #9003 (Ashok Kumar Varma S/O - Rampal Varma) if not already present
INSERT INTO "Master Data Of Gurukrupa" (
  r_no,
  registration_no,
  date_of_form,
  date,
  ba_code,
  broker_code,
  "broker's_name",
  plot_no,
  society_name,
  block_name,
  plot_size,
  client_name,
  father_or_husband_name,
  date_of_birth,
  age,
  profession,
  address,
  contact_no,
  aadhar_no,
  emi_amount,
  paid_amount,
  plot_amount,
  amount_in_word,
  cheque_cash,
  emi_date,
  emi_no,
  emi_time,
  emi_paid_date
)
SELECT
  '9003',
  '9003',
  '2026-10-01',
  '2026-10-01',
  'BS',
  'BS',
  'BS',
  '219, 220',
  'ROYAL CITY ( I/BLOCK )',
  'Block I',
  '14x36',
  'Ashok Kumar Varma S/O - Rampal Varma',
  'Rampal Varma',
  '1979-06-20',
  '47',
  'Job',
  'H No. 2198, Pragati Nagar, Gandhiwadi, Umbergam, Valsad, Umbergam, Gujarat - 396170',
  '8401348543',
  '753000774699',
  '5000',
  '5000',
  '325000',
  'FIVE THOUSAND RUPEES ONLY.',
  'Transfer',
  '15 to 20',
  '1',
  '65',
  '2026-10-01'
WHERE NOT EXISTS (
  SELECT 1 FROM "Master Data Of Gurukrupa"
  WHERE r_no = '9003' OR registration_no = '9003'
);

NOTIFY pgrst, 'reload schema';
