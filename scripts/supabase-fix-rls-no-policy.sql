-- Supabase Security Adviser: "RLS Enabled No Policy"
-- Run in Supabase Dashboard → SQL Editor
--
-- Your Hathor app uses Prisma (server-side postgres connection), NOT the
-- Supabase Data API. These tables don't need RLS unless you plan to query
-- them from the browser with supabase-js.
--
-- This script:
-- 1. Blocks anon/authenticated from accessing tables via REST API
-- 2. Disables RLS (clears the adviser warnings; Prisma still works)

-- ── Step 1: Block public API access to app tables ──────────────────────────
REVOKE ALL ON TABLE public."Booking"         FROM anon, authenticated;
REVOKE ALL ON TABLE public."BookingRoom"     FROM anon, authenticated;
REVOKE ALL ON TABLE public."BookingTicket"   FROM anon, authenticated;
REVOKE ALL ON TABLE public."Cruise"          FROM anon, authenticated;
REVOKE ALL ON TABLE public."CruiseSchedule"  FROM anon, authenticated;
REVOKE ALL ON TABLE public."Room"            FROM anon, authenticated;
REVOKE ALL ON TABLE public."SiteContent"    FROM anon, authenticated;
REVOKE ALL ON TABLE public."TicketType"     FROM anon, authenticated;

-- ── Step 2: Disable RLS (Prisma-only; clears "RLS Enabled No Policy") ─────
ALTER TABLE public."Booking"         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."BookingRoom"     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."BookingTicket"   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Cruise"          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."CruiseSchedule"  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Room"            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."SiteContent"     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."TicketType"      DISABLE ROW LEVEL SECURITY;

-- ── Optional: stop auto-enabling RLS on future Prisma tables ─────────────
-- Only run if you don't want rls_auto_enable trigger anymore:
-- DROP EVENT TRIGGER IF EXISTS auto_enable_rls_on_table_create;
