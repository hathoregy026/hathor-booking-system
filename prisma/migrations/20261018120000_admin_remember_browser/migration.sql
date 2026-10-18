-- Additive only: existing sessions keep their original idle and absolute limits.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '15s';
LOCK TABLE "AdminSession" IN ACCESS EXCLUSIVE MODE;
DO $migration$
DECLARE
  before_hash text;
  after_hash text;
BEGIN
  SELECT md5(COALESCE(string_agg(to_jsonb(s)::text, '' ORDER BY id), ''))
    INTO before_hash FROM "AdminSession" s;

  ALTER TABLE "AdminSession" ADD COLUMN "rememberBrowser" BOOLEAN NOT NULL DEFAULT false;

  SELECT md5(COALESCE(string_agg((to_jsonb(s) - 'rememberBrowser')::text, '' ORDER BY id), ''))
    INTO after_hash FROM "AdminSession" s;
  IF before_hash IS DISTINCT FROM after_hash THEN
    RAISE EXCEPTION 'Existing sessions changed; migration cancelled';
  END IF;
END
$migration$;
COMMIT;
