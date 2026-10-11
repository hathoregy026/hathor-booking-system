-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "isOwner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roleId" TEXT;

-- CreateTable
CREATE TABLE "AdminRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminInvitation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminRole_name_key" ON "AdminRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AdminInvitation_userId_key" ON "AdminInvitation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminInvitation_tokenHash_key" ON "AdminInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminUser_roleId_idx" ON "AdminUser"("roleId");

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AdminRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminInvitation" ADD CONSTRAINT "AdminInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Existing accounts receive no implicit business access. Bootstrap a named
-- administrator explicitly with the CLI before enabling a preview/release.
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_owner_role_check" CHECK (NOT "isOwner" OR "roleId" IS NULL);
ALTER TABLE "AdminRole" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminInvitation" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "AdminRole", "AdminInvitation" FROM PUBLIC;
DO $$
DECLARE api_role text;
BEGIN
  FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
      EXECUTE format('REVOKE ALL ON TABLE "AdminRole", "AdminInvitation" FROM %I', api_role);
    END IF;
  END LOOP;
END
$$;

ALTER TABLE "AdminRole" ALTER COLUMN "permissions" SET NOT NULL;
ALTER TABLE "AdminRole" ADD CONSTRAINT "AdminRole_permissions_check" CHECK ("permissions" <@ ARRAY['dashboard.view','dashboard.manage','analytics.view','analytics.manage','bookings.view','bookings.manage','inbox.view','inbox.manage','availability.view','availability.manage','cruises.view','cruises.manage','prices.view','prices.manage','website.view','website.manage','ship.view','ship.manage','blogs.view','blogs.manage','templates.view','templates.manage','storage.view','storage.manage']::text[]);
