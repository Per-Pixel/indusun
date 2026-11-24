-- ============================================================================
-- Admin roles — reusable roles with a permission set
-- Run this in the Supabase SQL editor after admin_panel_overhaul.sql.
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_roles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,
  name         text NOT NULL,
  description  text NOT NULL DEFAULT '',
  permissions  jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_system    boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Custom role slugs (sales, finance, …) must be allowed on admin_users.role.
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_admin_roles_updated_at'
  ) THEN
    CREATE TRIGGER set_admin_roles_updated_at
      BEFORE UPDATE ON admin_roles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'admin_roles_select_authenticated'
  ) THEN
    CREATE POLICY admin_roles_select_authenticated ON admin_roles
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

INSERT INTO admin_roles (slug, name, description, permissions, is_system)
VALUES
  (
    'super_admin',
    'Super Admin',
    'Full control, including users, roles, and settings.',
    '["user_management","role_management","property_management","broker_management","financial_reports","billing_management","system_settings","audit_logs","cms_management","messaging","internal_comms","lead_management","booking_management"]'::jsonb,
    true
  ),
  (
    'admin',
    'Admin',
    'Day-to-day CRM, properties, billing, and messaging.',
    '["property_management","broker_management","financial_reports","billing_management","cms_management","messaging","internal_comms","lead_management","booking_management"]'::jsonb,
    true
  ),
  (
    'sales',
    'Sales',
    'Leads, site visits, bookings, and customer messages.',
    '["lead_management","booking_management","messaging","internal_comms","property_management"]'::jsonb,
    false
  ),
  (
    'finance',
    'Finance',
    'Billing, invoices, and financial reports.',
    '["billing_management","financial_reports","messaging","internal_comms"]'::jsonb,
    false
  ),
  (
    'content',
    'Content',
    'Website CMS and the media library.',
    '["cms_management","internal_comms"]'::jsonb,
    false
  )
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_admin_roles_slug ON admin_roles(slug);
