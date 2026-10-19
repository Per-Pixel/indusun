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

  IF NEW.client_name IS NOT NULL THEN
    NEW.client_name := btrim(NEW.client_name);
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

-- Normalize untrimmed client_name values so distinct client counts match everywhere
UPDATE public."Master Data Of Gurukrupa"
SET client_name = btrim(client_name)
WHERE client_name IS NOT NULL AND client_name <> btrim(client_name);

-- 4. Unified Summary & Aggregate RPCs
CREATE OR REPLACE FUNCTION public.get_master_data_summary_rpc()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  v_stats record;
  v_unique_plots record;
  v_by_soc jsonb;
  v_monthly jsonb;
BEGIN
  SELECT
    count(*)::int AS total_records,
    count(DISTINCT lower(NULLIF(btrim(client_name), '')))::int AS total_clients,
    count(DISTINCT NULLIF(btrim(society_name), ''))::int AS unique_societies,
    count(DISTINCT lower(NULLIF(btrim("broker's_name"), '')))::int AS unique_brokers,
    COALESCE(round(sum(plot_amount_num), 2), 0) AS total_plot_amount,
    COALESCE(round(sum(paid_amount_num), 2), 0) AS total_paid_amount,
    COALESCE(round(sum(paid_amount_num) FILTER (WHERE cancel_date IS NULL), 2), 0) AS active_paid_amount,
    COALESCE(round(sum(paid_amount_num) FILTER (WHERE cancel_date IS NOT NULL), 2), 0) AS cancelled_paid_amount,
    COALESCE(round(sum(emi_amount_num) FILTER (WHERE cancel_date IS NULL AND emi_paid_date IS NOT NULL AND btrim(emi_paid_date) != ''), 2), 0) AS total_emi_amount,
    count(*) FILTER (WHERE cancel_date IS NULL)::int AS listed_properties,
    count(*) FILTER (WHERE cancel_date IS NULL AND paid_amount IS NOT NULL AND btrim(paid_amount) != '')::int AS sold_properties,
    count(*) FILTER (WHERE cancel_date IS NOT NULL)::int AS cancelled_properties,
    count(DISTINCT CASE WHEN plot_no IS NOT NULL THEN COALESCE(society_name, '') || '||' || plot_no END)::int AS unique_plots,
    count(DISTINCT CASE WHEN plot_no IS NOT NULL AND cancel_date IS NULL AND paid_amount IS NOT NULL AND btrim(paid_amount) != '' THEN COALESCE(society_name, '') || '||' || plot_no END)::int AS unique_sold_plots
  INTO v_stats
  FROM public."Master Data Of Gurukrupa";

  SELECT COALESCE(round(sum(max_plot), 2), 0) AS unique_plot_value
  INTO v_unique_plots
  FROM (
    SELECT max(plot_amount_num) AS max_plot
    FROM public."Master Data Of Gurukrupa"
    WHERE plot_no IS NOT NULL AND cancel_date IS NULL
    GROUP BY COALESCE(society_name, ''), plot_no
  ) up;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'name', CASE WHEN char_length(society_name) > 12 THEN substring(society_name from 1 for 12) || '…' ELSE society_name END,
    'fullName', society_name,
    'count', cnt
  )), '[]'::jsonb)
  INTO v_by_soc
  FROM (
    SELECT society_name, count(*)::int AS cnt
    FROM public."Master Data Of Gurukrupa"
    WHERE society_name IS NOT NULL
    GROUP BY society_name
    ORDER BY cnt DESC
    LIMIT 8
  ) s;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'month', to_char(to_date(ym || '-01', 'YYYY-MM-DD'), 'Mon YY'),
    'count', cnt
  ) ORDER BY ym ASC), '[]'::jsonb)
  INTO v_monthly
  FROM (
    SELECT ym, cnt FROM (
      SELECT substring(form_date_iso from 1 for 7) AS ym, count(*)::int AS cnt
      FROM public."Master Data Of Gurukrupa"
      WHERE form_date_iso IS NOT NULL
      GROUP BY 1
    ) m
    WHERE ym IS NOT NULL
    ORDER BY ym DESC
    LIMIT 8
  ) m2;

  RETURN jsonb_build_object(
    'totalRecords', v_stats.total_records,
    'totalClients', v_stats.total_clients,
    'uniqueSocieties', v_stats.unique_societies,
    'uniqueBrokers', v_stats.unique_brokers,
    'totalPlotAmount', v_stats.total_plot_amount,
    'totalPaidAmount', v_stats.total_paid_amount,
    'activePaidAmount', v_stats.active_paid_amount,
    'cancelledPaidAmount', v_stats.cancelled_paid_amount,
    'totalEmiAmount', v_stats.total_emi_amount,
    'uniquePlots', v_stats.unique_plots,
    'uniqueSoldPlots', v_stats.unique_sold_plots,
    'uniquePlotValue', v_unique_plots.unique_plot_value,
    'listedProperties', v_stats.listed_properties,
    'soldProperties', v_stats.sold_properties,
    'cancelledProperties', v_stats.cancelled_properties,
    'propertiesBySociety', v_by_soc,
    'monthlyListings', v_monthly
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_billing_aggregates_rpc()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  v_total_rows int;
  v_total_rev numeric;
  v_total_paid numeric;
  v_active_paid numeric;
  v_cancelled_paid numeric;
  v_pending numeric;
  v_completed int;
  v_cancelled_cnt int;
  v_cancelled_amt numeric;
  v_sources jsonb;
  v_trends jsonb;
BEGIN
  SELECT
    count(*)::int,
    COALESCE(round(sum(CASE WHEN cancel_date IS NULL AND emi_paid_date IS NOT NULL AND btrim(emi_paid_date) != '' THEN emi_amount_num ELSE 0 END), 2), 0),
    COALESCE(round(sum(paid_amount_num), 2), 0),
    COALESCE(round(sum(CASE WHEN cancel_date IS NULL THEN paid_amount_num ELSE 0 END), 2), 0),
    COALESCE(round(sum(CASE WHEN cancel_date IS NOT NULL THEN paid_amount_num ELSE 0 END), 2), 0),
    COALESCE(round(sum(CASE WHEN cancel_date IS NULL AND (emi_paid_date IS NULL OR btrim(emi_paid_date) = '') THEN emi_amount_num ELSE 0 END), 2), 0),
    count(*) FILTER (WHERE cancel_date IS NULL AND emi_paid_date IS NOT NULL AND btrim(emi_paid_date) != '')::int,
    count(*) FILTER (WHERE cancel_date IS NOT NULL)::int,
    COALESCE(round(sum(CASE WHEN cancel_date IS NOT NULL THEN emi_amount_num ELSE 0 END), 2), 0)
  INTO v_total_rows, v_total_rev, v_total_paid, v_active_paid, v_cancelled_paid, v_pending, v_completed, v_cancelled_cnt, v_cancelled_amt
  FROM public."Master Data Of Gurukrupa";

  WITH soc_rev AS (
    SELECT
      COALESCE(NULLIF(btrim(society_name), ''), 'Unassigned') AS name,
      round(sum(emi_amount_num), 2) AS val,
      row_number() OVER (ORDER BY sum(emi_amount_num) DESC) AS rn
    FROM public."Master Data Of Gurukrupa"
    WHERE cancel_date IS NULL AND emi_paid_date IS NOT NULL AND btrim(emi_paid_date) != ''
    GROUP BY 1
  ),
  top5 AS (
    SELECT name, val AS value, rn FROM soc_rev WHERE rn <= 5
    UNION ALL
    SELECT 'Other' AS name, round(sum(val), 2) AS value, 6 AS rn FROM soc_rev WHERE rn > 5 HAVING sum(val) > 0
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object('name', name, 'value', value) ORDER BY rn), '[]'::jsonb)
  INTO v_sources
  FROM top5;

  WITH m_rev AS (
    SELECT
      substring(emi_paid_date_iso from 1 for 7) AS ym,
      round(sum(emi_amount_num), 2) AS val
    FROM public."Master Data Of Gurukrupa"
    WHERE cancel_date IS NULL AND emi_paid_date_iso IS NOT NULL
    GROUP BY 1
  ),
  last12 AS (
    SELECT ym, val FROM m_rev WHERE ym IS NOT NULL ORDER BY ym DESC LIMIT 12
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'name', to_char(to_date(ym || '-01', 'YYYY-MM-DD'), 'Mon YYYY'),
    'value', val
  ) ORDER BY ym ASC), '[]'::jsonb)
  INTO v_trends
  FROM last12;

  RETURN jsonb_build_object(
    'summary', jsonb_build_object(
      'totalRevenue', v_total_rev,
      'emiRevenue', v_total_rev,
      'totalPaidAmount', v_total_paid,
      'activePaidAmount', v_active_paid,
      'cancelledPaidAmount', v_cancelled_paid,
      'pendingPayments', v_pending,
      'totalTransactions', v_total_rows,
      'completedTransactions', v_completed,
      'cancelledCount', v_cancelled_cnt,
      'cancelledAmount', v_cancelled_amt
    ),
    'sources', v_sources,
    'trends', v_trends
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_sales_aggregates_rpc(
  p_start_date text DEFAULT NULL::text,
  p_end_date text DEFAULT NULL::text,
  p_broker_name text DEFAULT NULL::text,
  p_sort_by text DEFAULT 'date'::text,
  p_sort_order text DEFAULT 'desc'::text
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  v_granularity text;
  v_six_months_ago text;
  v_global record;
  v_filtered record;
  v_sales jsonb;
  v_brokers jsonb;
BEGIN
  IF p_start_date IS NULL AND p_end_date IS NULL THEN
    v_granularity := 'monthly';
  ELSIF p_start_date IS NOT NULL AND p_end_date IS NOT NULL THEN
    IF (to_date(p_end_date, 'YYYY-MM-DD') - to_date(p_start_date, 'YYYY-MM-DD')) > 90 THEN
      v_granularity := 'monthly';
    ELSE
      v_granularity := 'daily';
    END IF;
  ELSE
    v_granularity := 'daily';
  END IF;

  v_six_months_ago := to_char(current_date - interval '6 months', 'YYYY-MM-DD');

  SELECT
    count(DISTINCT lower(NULLIF(btrim(client_name), '')))::int AS total_clients,
    count(DISTINCT lower(NULLIF(btrim(client_name), ''))) FILTER (WHERE emi_paid_date_iso >= v_six_months_ago)::int AS active_clients,
    count(DISTINCT lower(NULLIF(btrim("broker's_name"), '')))::int AS total_brokers,
    count(DISTINCT lower(NULLIF(btrim("broker's_name"), ''))) FILTER (WHERE emi_paid_date_iso >= v_six_months_ago)::int AS active_brokers,
    count(DISTINCT CASE WHEN plot_no IS NOT NULL THEN COALESCE(society_name, '') || '||' || plot_no END)::int AS total_properties,
    count(DISTINCT CASE WHEN plot_no IS NOT NULL AND cancel_date IS NULL AND paid_amount IS NOT NULL AND paid_amount != '' THEN COALESCE(society_name, '') || '||' || plot_no END)::int AS properties_sold,
    COALESCE(round(sum(paid_amount_num), 2), 0) AS total_paid_all,
    COALESCE(round(sum(paid_amount_num) FILTER (WHERE cancel_date IS NULL), 2), 0) AS active_paid_all
  INTO v_global
  FROM public."Master Data Of Gurukrupa";

  WITH scoped AS (
    SELECT
      emi_amount_num,
      paid_amount_num,
      emi_paid_date,
      emi_paid_date_iso,
      cancel_date
    FROM public."Master Data Of Gurukrupa"
    WHERE ( (emi_paid_date IS NOT NULL AND btrim(emi_paid_date) != '') OR cancel_date IS NOT NULL )
      AND (p_broker_name IS NULL OR p_broker_name = '' OR btrim(COALESCE("broker's_name", '')) = p_broker_name)
      AND (
        (p_start_date IS NULL AND p_end_date IS NULL)
        OR (
          emi_paid_date_iso IS NOT NULL
          AND (p_start_date IS NULL OR emi_paid_date_iso >= p_start_date)
          AND (p_end_date IS NULL OR emi_paid_date_iso <= p_end_date)
        )
      )
  )
  SELECT
    count(*) FILTER (WHERE cancel_date IS NULL AND emi_paid_date IS NOT NULL AND btrim(emi_paid_date) != '')::int AS tx_count,
    COALESCE(round(sum(emi_amount_num) FILTER (WHERE cancel_date IS NULL AND emi_paid_date IS NOT NULL AND btrim(emi_paid_date) != ''), 2), 0) AS tx_rev,
    COALESCE(round(sum(paid_amount_num) FILTER (WHERE cancel_date IS NULL AND emi_paid_date IS NOT NULL AND btrim(emi_paid_date) != ''), 2), 0) AS tx_paid_rev,
    count(*) FILTER (WHERE cancel_date IS NOT NULL)::int AS cancel_count,
    COALESCE(round(sum(emi_amount_num) FILTER (WHERE cancel_date IS NOT NULL), 2), 0) AS cancel_rev,
    COALESCE(round(sum(paid_amount_num) FILTER (WHERE cancel_date IS NOT NULL), 2), 0) AS cancel_paid_rev
  INTO v_filtered
  FROM scoped;

  WITH scoped_active AS (
    SELECT
      CASE
        WHEN v_granularity = 'monthly' THEN substring(emi_paid_date_iso from 1 for 7) || '-01'
        ELSE emi_paid_date_iso
      END AS bucket_date,
      emi_amount_num AS amt
    FROM public."Master Data Of Gurukrupa"
    WHERE cancel_date IS NULL
      AND emi_paid_date_iso IS NOT NULL
      AND (p_broker_name IS NULL OR p_broker_name = '' OR btrim(COALESCE("broker's_name", '')) = p_broker_name)
      AND (p_start_date IS NULL OR emi_paid_date_iso >= p_start_date)
      AND (p_end_date IS NULL OR emi_paid_date_iso <= p_end_date)
  ),
  agg AS (
    SELECT
      bucket_date AS date,
      round(sum(amt), 2) AS total_amount,
      count(*)::int AS transaction_count
    FROM scoped_active
    WHERE bucket_date IS NOT NULL
    GROUP BY bucket_date
  ),
  sorted AS (
    SELECT * FROM agg
    ORDER BY
      CASE WHEN p_sort_by = 'total_amount' AND p_sort_order = 'asc' THEN total_amount END ASC,
      CASE WHEN p_sort_by = 'total_amount' AND p_sort_order = 'desc' THEN total_amount END DESC,
      CASE WHEN p_sort_by != 'total_amount' AND p_sort_order = 'asc' THEN date END ASC,
      CASE WHEN p_sort_by != 'total_amount' AND p_sort_order = 'desc' THEN date END DESC
    LIMIT CASE WHEN v_granularity = 'monthly' THEN 120 ELSE 366 END
  )
  SELECT COALESCE(jsonb_agg(row_to_json(sorted)), '[]'::jsonb)
  INTO v_sales
  FROM sorted;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', name,
    'name', name,
    'code', code,
    'cleanName', clean_name
  ) ORDER BY name), '[]'::jsonb)
  INTO v_brokers
  FROM (
    SELECT
      min(btrim("broker's_name")) AS name,
      max(broker_code) AS code,
      max(broker_name_clean) AS clean_name
    FROM public."Master Data Of Gurukrupa"
    WHERE "broker's_name" IS NOT NULL AND btrim("broker's_name") != ''
    GROUP BY lower(btrim("broker's_name"))
  ) b;

  RETURN jsonb_build_object(
    'sales', v_sales,
    'granularity', v_granularity,
    'filterOptions', jsonb_build_object('brokers', v_brokers),
    'summary', jsonb_build_object(
      'totalClients', v_global.total_clients,
      'activeClients', v_global.active_clients,
      'totalBrokers', v_global.total_brokers,
      'activeBrokers', v_global.active_brokers,
      'totalProperties', v_global.total_properties,
      'propertiesSold', v_global.properties_sold,
      'totalTransactions', v_filtered.tx_count,
      'totalRevenue', v_filtered.tx_rev,
      'emiRevenue', v_filtered.tx_rev,
      'totalPaidAmount', v_global.total_paid_all,
      'activePaidAmount', v_filtered.tx_paid_rev,
      'cancelledTransactions', v_filtered.cancel_count,
      'cancelledRevenue', v_filtered.cancel_rev,
      'cancelledPaidRevenue', v_filtered.cancel_paid_rev
    )
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_derived_brokers_rpc()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $function$
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  FROM (
    SELECT
      min(btrim("broker's_name")) AS name,
      max(broker_code) AS broker_code,
      max(broker_name_clean) AS clean_name,
      count(*)::int AS deal_count,
      COALESCE(round(sum(emi_amount_num) FILTER (WHERE cancel_date IS NULL), 2), 0) AS total_revenue,
      COALESCE(round(sum(paid_amount_num) FILTER (WHERE cancel_date IS NULL), 2), 0) AS paid_revenue,
      COALESCE(round(sum(paid_amount_num), 2), 0) AS total_paid_all
    FROM public."Master Data Of Gurukrupa"
    WHERE "broker's_name" IS NOT NULL AND btrim("broker's_name") != ''
    GROUP BY lower(btrim("broker's_name"))
    ORDER BY min(btrim("broker's_name")) ASC
  ) t;
$function$;

CREATE OR REPLACE FUNCTION public.get_unique_clients_rpc()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $function$
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  FROM (
    SELECT
      min(btrim(client_name)) AS display,
      max(contact_no) AS phone,
      max(society_name) AS society,
      count(*)::int AS records_count,
      COALESCE(round(sum(paid_amount_num), 2), 0) AS total_paid,
      min(id)::int AS first_id
    FROM public."Master Data Of Gurukrupa"
    WHERE client_name IS NOT NULL AND btrim(client_name) != ''
    GROUP BY lower(btrim(client_name))
    ORDER BY min(btrim(client_name)) ASC
  ) t;
$function$;

NOTIFY pgrst, 'reload schema';
