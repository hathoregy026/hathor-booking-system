-- Freeze the server-authoritative catalogue price used for each booking.
-- Nullable line snapshots allow a safe rolling deployment; legacy readers retain
-- a fallback until every environment has applied this migration.
ALTER TABLE "Booking"
  ADD COLUMN "totalPriceCents" INTEGER,
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN "priceSnapshotAt" TIMESTAMP(3);

ALTER TABLE "BookingRoom"
  ADD COLUMN "unitPriceCents" INTEGER;

ALTER TABLE "BookingTicket"
  ADD COLUMN "unitPriceCents" INTEGER;

-- Best-effort historical backfill. This freezes the catalogue values that can be
-- reconstructed today; prices that changed before this migration cannot be
-- recovered without an external invoice or email record.
UPDATE "BookingRoom" br
SET "unitPriceCents" = ROUND(c."basePriceCents" * CASE
  WHEN r."priceMultiplier" > 0 THEN r."priceMultiplier"
  ELSE 1
END)::INTEGER
FROM "Room" r, "CruiseSchedule" cs, "Cruise" c
WHERE br."roomId" = r.id
  AND br."cruiseScheduleId" = cs.id
  AND cs."cruiseId" = c.id
  AND br."unitPriceCents" IS NULL;

UPDATE "BookingTicket" bt
SET "unitPriceCents" = tt."priceCents"
FROM "TicketType" tt
WHERE bt."ticketTypeId" = tt.id
  AND bt."unitPriceCents" IS NULL;

UPDATE "Booking" b
SET
  "totalPriceCents" = COALESCE(
    (SELECT SUM(br."unitPriceCents")::INTEGER
     FROM "BookingRoom" br
     WHERE br."bookingId" = b.id),
    (SELECT SUM(bt.quantity * bt."unitPriceCents")::INTEGER
     FROM "BookingTicket" bt
     WHERE bt."bookingId" = b.id),
    0
  ),
  "priceSnapshotAt" = CURRENT_TIMESTAMP
WHERE b."totalPriceCents" IS NULL;

ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_totalPriceCents_nonnegative"
  CHECK ("totalPriceCents" IS NULL OR "totalPriceCents" >= 0);

ALTER TABLE "BookingRoom"
  ADD CONSTRAINT "BookingRoom_unitPriceCents_nonnegative"
  CHECK ("unitPriceCents" IS NULL OR "unitPriceCents" >= 0);

ALTER TABLE "BookingTicket"
  ADD CONSTRAINT "BookingTicket_unitPriceCents_nonnegative"
  CHECK ("unitPriceCents" IS NULL OR "unitPriceCents" >= 0);
