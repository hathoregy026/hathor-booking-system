-- One row per WhatsApp, phone or email tap on the public site: which kind,
-- the page it was tapped on, and which ad or link brought the visitor.
-- No names, emails or phone numbers of guests. Additive: nothing else changes.
CREATE TABLE IF NOT EXISTS "ContactTap" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "kind" TEXT NOT NULL,
  "page" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "attribution" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContactTap_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ContactTap_kind_check" CHECK ("kind" IN ('whatsapp', 'phone', 'email'))
);

CREATE INDEX IF NOT EXISTS "ContactTap_createdAt_idx" ON "ContactTap" ("createdAt");

ALTER TABLE "ContactTap" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "ContactTap" FROM anon, authenticated;
