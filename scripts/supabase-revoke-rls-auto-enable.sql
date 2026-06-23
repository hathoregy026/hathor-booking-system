-- Supabase Security Adviser fix: lock down rls_auto_enable()
-- Run in Supabase Dashboard → SQL Editor
--
-- Why: SECURITY DEFINER functions run with owner privileges (bypass RLS).
-- By default, public schema functions are executable via /rest/v1/rpc/... by
-- anon and authenticated. This function is only needed by internal triggers.

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;

-- Optional: verify anon/authenticated can no longer execute it
-- SELECT has_function_privilege('anon', 'public.rls_auto_enable()', 'EXECUTE');
-- SELECT has_function_privilege('authenticated', 'public.rls_auto_enable()', 'EXECUTE');
