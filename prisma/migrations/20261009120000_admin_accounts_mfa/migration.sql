-- Per-person dashboard accounts with mandatory two-step sign-in, replacing the
-- single shared ADMIN_PASSWORD. Additive only: no existing table is touched.

-- CreateEnum
CREATE TYPE "AdminSessionStage" AS ENUM ('MFA_PENDING', 'ENROLL_PENDING', 'ACTIVE');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totpSecretEnc" TEXT,
    "totpPendingEnc" TEXT,
    "totpLastStep" INTEGER,
    "mfaEnrolledAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stage" "AdminSessionStage" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idleExpiresAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "mfaAttempts" INTEGER NOT NULL DEFAULT 0,
    "ip" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRecoveryCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminRecoveryCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuthEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuthEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_userId_revokedAt_idx" ON "AdminSession"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminRecoveryCode_userId_codeHash_key" ON "AdminRecoveryCode"("userId", "codeHash");

-- CreateIndex
CREATE INDEX "AdminAuthEvent_userId_createdAt_idx" ON "AdminAuthEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuthEvent_createdAt_idx" ON "AdminAuthEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRecoveryCode" ADD CONSTRAINT "AdminRecoveryCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuthEvent" ADD CONSTRAINT "AdminAuthEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Emails are compared lower-cased; refuse anything else at the database too.
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_email_normalized_check" CHECK ("email" = lower(btrim("email")) AND length("email") BETWEEN 3 AND 254);
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_mfaAttempts_check" CHECK ("mfaAttempts" >= 0);

-- These tables hold password hashes and session fingerprints. The app reaches
-- them only as the table owner, so lock out the Supabase Data API roles twice
-- over: RLS with no policies, and no grants. Guarded so the migration also
-- runs on a plain local Postgres that has no Supabase roles.
ALTER TABLE "AdminUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminRecoveryCode" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminAuthEvent" ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  api_role text;
BEGIN
  FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
      EXECUTE format('REVOKE ALL ON TABLE "AdminUser", "AdminSession", "AdminRecoveryCode", "AdminAuthEvent" FROM %I', api_role);
    END IF;
  END LOOP;
END
$$;
