-- ============================================================================
-- Admin Panel Overhaul — Database Migration
-- Run this against your Supabase SQL Editor or psql connection.
-- ============================================================================

-- 1. admin_users — profile/role/permissions for each admin
--    id is a FK to auth.users so every admin is a real Supabase Auth user.
CREATE TABLE IF NOT EXISTS admin_users (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  email         text NOT NULL,
  phone         text,
  role          text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  permissions   jsonb NOT NULL DEFAULT '[]'::jsonb,
  avatar_url    text,
  bio           text,
  location      text,
  website       text,
  language      text DEFAULT 'en',
  timezone      text DEFAULT 'Asia/Kolkata',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at on row change
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
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_admin_users_updated_at'
  ) THEN
    CREATE TRIGGER set_admin_users_updated_at
      BEFORE UPDATE ON admin_users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: Only authenticated users can read admin_users.
-- Write operations go through the service-role client (bypasses RLS).
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'admin_users_select_authenticated'
  ) THEN
    CREATE POLICY admin_users_select_authenticated ON admin_users
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;


-- 2. internal_messages — messages shared between admins
CREATE TABLE IF NOT EXISTS internal_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id       uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  subject         text NOT NULL,
  body            text NOT NULL DEFAULT '',
  attachments     jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- visibility controls who can see the message
  visibility      text NOT NULL DEFAULT 'admins_only'
                  CHECK (visibility IN ('admins_only', 'super_admins_only', 'custom')),
  -- when visibility = 'custom', only these user IDs can see the message
  allowed_user_ids uuid[] NOT NULL DEFAULT '{}',
  is_pinned       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_internal_messages_updated_at'
  ) THEN
    CREATE TRIGGER set_internal_messages_updated_at
      BEFORE UPDATE ON internal_messages
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

ALTER TABLE internal_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'internal_messages_select_authenticated'
  ) THEN
    CREATE POLICY internal_messages_select_authenticated ON internal_messages
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;


-- 3. internal_message_reads — tracks who has read which message
CREATE TABLE IF NOT EXISTS internal_message_reads (
  message_id  uuid NOT NULL REFERENCES internal_messages(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  read_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

ALTER TABLE internal_message_reads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'internal_message_reads_select_authenticated'
  ) THEN
    CREATE POLICY internal_message_reads_select_authenticated ON internal_message_reads
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;


-- 4. Enable Realtime for the new tables (so CRMLayout subscriptions work)
ALTER PUBLICATION supabase_realtime ADD TABLE admin_users;
ALTER PUBLICATION supabase_realtime ADD TABLE internal_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE internal_message_reads;

-- 5. Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_internal_messages_sender   ON internal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_created  ON internal_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_internal_message_reads_user ON internal_message_reads(user_id);
