-- The app talks to Postgres only as the table owner (Prisma) and to Storage
-- only with the service-role key, so the Supabase Data API roles never need
-- table access. RLS with no policies already denies them every row; removing
-- the grants as well means an accidental `DISABLE ROW LEVEL SECURITY` or an
-- over-broad policy added later cannot expose CMS content, rate-limit state,
-- migration history or the admin profile through the public REST endpoint.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated, PUBLIC;
