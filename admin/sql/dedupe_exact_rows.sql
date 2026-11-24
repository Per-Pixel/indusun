-- Remove exact duplicate rows found in the live Indusun database.
-- Safe to re-run. Does not merge brokers who share a short name or a short code.

-- Clients: keep the earliest row when name, email, and phone all match.
DELETE FROM clients newer
USING clients older
WHERE newer.created_at > older.created_at
  AND lower(btrim(newer.name)) = lower(btrim(older.name))
  AND lower(btrim(coalesce(newer.email, ''))) = lower(btrim(coalesce(older.email, '')))
  AND regexp_replace(coalesce(newer.phone, ''), '\D', '', 'g')
    = regexp_replace(coalesce(older.phone, ''), '\D', '', 'g')
  AND btrim(newer.name) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS clients_email_lower_uidx
  ON clients (lower(btrim(email)))
  WHERE email IS NOT NULL AND btrim(email) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS clients_name_phone_uidx
  ON clients (
    lower(btrim(name)),
    regexp_replace(coalesce(phone, ''), '\D', '', 'g')
  )
  WHERE name IS NOT NULL AND btrim(name) <> '';

-- Master ledger: ids 14629 and 16640 were identical apart from id.
-- Delete the later copy only while that is still true.
DELETE FROM "Master Data Of Gurukrupa" extra
WHERE extra.id = 16640
  AND EXISTS (
    SELECT 1
    FROM "Master Data Of Gurukrupa" kept
    WHERE kept.id = 14629
      AND (to_jsonb(extra) - 'id') = (to_jsonb(kept) - 'id')
  );
