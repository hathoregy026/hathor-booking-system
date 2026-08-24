-- One immediate-confirmation booking flow, authoritative rate-plan snapshots,
-- structured guest contact data, and durable public-API throttling.

DO $$ BEGIN
  CREATE TYPE "BookingRatePlan" AS ENUM ('STANDARD', 'NON_REFUNDABLE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE "BookingPaymentStatus" AS ENUM ('PENDING', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "ratePlan" "BookingRatePlan" NOT NULL DEFAULT 'STANDARD',
  ADD COLUMN IF NOT EXISTS "paymentStatus" "BookingPaymentStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT,
  ADD COLUMN IF NOT EXISTS "customerPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "adultCount" INTEGER,
  ADD COLUMN IF NOT EXISTS "childCount" INTEGER,
  ADD COLUMN IF NOT EXISTS "specialRequests" TEXT,
  ADD COLUMN IF NOT EXISTS "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "marketingOptInAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "termsAcceptedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "Booking_idempotencyKey_key"
  ON "Booking"("idempotencyKey");

DO $$ BEGIN
  ALTER TABLE "Booking" ADD CONSTRAINT "Booking_adultCount_nonnegative"
    CHECK ("adultCount" IS NULL OR "adultCount" >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Booking" ADD CONSTRAINT "Booking_childCount_nonnegative"
    CHECK ("childCount" IS NULL OR "childCount" >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Recover structured values from historical customerName blobs without
-- rewriting or losing the original source text.
UPDATE "Booking"
SET
  "customerPhone" = NULLIF(
    substring("customerName" FROM '(?im)^Phone:[[:space:]]*([^\r\n]+)'),
    ''
  ),
  "adultCount" = NULLIF(
    substring("customerName" FROM '(?im)^Guests:[[:space:]]*([0-9]+)[[:space:]]+adult'),
    ''
  )::INTEGER,
  "childCount" = NULLIF(
    substring("customerName" FROM '(?im),[[:space:]]*([0-9]+)[[:space:]]+child'),
    ''
  )::INTEGER,
  "specialRequests" = NULLIF(
    substring("customerName" FROM '(?im)^Requests:[[:space:]]*([^\r\n]+)'),
    ''
  )
WHERE "customerName" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "ApiRateLimit" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL,
  "resetAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ApiRateLimit_pkey" PRIMARY KEY ("key")
);

CREATE INDEX IF NOT EXISTS "ApiRateLimit_resetAt_idx" ON "ApiRateLimit"("resetAt");

-- Keep editable branding, but remove stale request/paid wording from the live
-- transactional templates.
UPDATE "EmailTemplate"
SET
  "subject" = 'Reservation confirmed — payment pending | Hathor Dahabiya',
  "heroHeading" = 'Reservation Confirmed, {guestName}',
  "bodyText" = 'Your cabin is reserved. No payment has been collected yet; the full balance remains pending.'
WHERE "name" = 'BookingConfirmed';

UPDATE "EmailTemplate"
SET
  "subject" = 'New confirmed reservation — {guestName}',
  "heroHeading" = 'New Confirmed Reservation',
  "bodyText" = 'This reservation was confirmed automatically without collecting payment. Follow up through your approved payment process.'
WHERE "name" = 'AdminAlert';

UPDATE "Room" SET "name" = 'Luxury Twin Bed'
WHERE "name" = 'Hathor Dahabiya Twin Bed';
UPDATE "Room" SET "name" = 'Luxury Suite'
WHERE "name" = 'Hathor Luxury Suite';
UPDATE "Room" SET "name" = 'Luxury Royal Suite'
WHERE "name" = 'Hathor Luxury Royal Suite';

-- Select one canonical schedule per cruise/UTC calendar date. Prefer a row
-- carrying a live booking, then any historical booking, then the oldest row.
DO $$ BEGIN
DROP TABLE IF EXISTS "_CruiseScheduleMerge";
CREATE TABLE "_CruiseScheduleMerge" AS
WITH schedule_stats AS (
  SELECT
    cs.id,
    cs."cruiseId",
    cs."departureTime",
    cs."createdAt",
    COUNT(b.id) FILTER (
      WHERE b."deletedAt" IS NULL
        AND b.status IN ('PENDING_HOLD', 'CONFIRMED')
    ) AS live_booking_count,
    COUNT(b.id) AS booking_count
  FROM "CruiseSchedule" cs
  LEFT JOIN "Booking" b ON b."cruiseScheduleId" = cs.id
  GROUP BY cs.id
), ranked AS (
  SELECT
    id AS old_id,
    FIRST_VALUE(id) OVER (
      PARTITION BY "cruiseId", "departureTime"::date
      ORDER BY live_booking_count DESC, booking_count DESC, "createdAt" ASC, id ASC
    ) AS canonical_id,
    ROW_NUMBER() OVER (
      PARTITION BY "cruiseId", "departureTime"::date
      ORDER BY live_booking_count DESC, booking_count DESC, "createdAt" ASC, id ASC
    ) AS row_number
  FROM schedule_stats
)
SELECT old_id, canonical_id
FROM ranked
WHERE row_number > 1;

UPDATE "BookingRoom" br
SET "cruiseScheduleId" = merge.canonical_id
FROM "_CruiseScheduleMerge" merge
WHERE br."cruiseScheduleId" = merge.old_id;

UPDATE "Booking" b
SET "cruiseScheduleId" = merge.canonical_id
FROM "_CruiseScheduleMerge" merge
WHERE b."cruiseScheduleId" = merge.old_id;

DELETE FROM "CruiseSchedule" cs
USING "_CruiseScheduleMerge" merge
WHERE cs.id = merge.old_id;

DROP TABLE "_CruiseScheduleMerge";
END $$;

-- Prisma cannot represent this expression index, but it is the database-level
-- invariant that prevents timezone-shifted duplicate rows on one sailing day.
CREATE UNIQUE INDEX IF NOT EXISTS "CruiseSchedule_cruiseId_departureDate_key"
  ON "CruiseSchedule"("cruiseId", ("departureTime"::date));
