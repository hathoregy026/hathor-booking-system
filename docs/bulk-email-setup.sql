-- Run once when enabling real delivery. No existing mail or booking tables change.
-- Kept outside public: this data must never be exposed through the Supabase Data API.
BEGIN;
CREATE SCHEMA IF NOT EXISTS bulk_mail;
REVOKE ALL ON SCHEMA bulk_mail FROM PUBLIC, anon, authenticated;
CREATE TABLE IF NOT EXISTS bulk_mail.records (
  id text PRIMARY KEY CHECK (id ~ '^(campaign:[a-f0-9-]{36}|suppression:[a-f0-9]{64})$'),
  payload text NOT NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE bulk_mail.records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON bulk_mail.records FROM PUBLIC, anon, authenticated;
CREATE INDEX IF NOT EXISTS bulk_mail_records_updated ON bulk_mail.records ("updatedAt" DESC);
COMMIT;
