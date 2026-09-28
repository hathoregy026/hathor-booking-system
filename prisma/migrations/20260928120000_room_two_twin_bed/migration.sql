-- The owner's room list: Rooms 1, 3, 4, 5 and 6 have a king bed, Rooms 2, 7
-- and 8 have twin beds, and all four suites have a king bed. The ship sells
-- 5 King cabins, 3 Twin cabins, 2 Luxury Suites and 2 Royal Suites.
--
-- Room 2 is catalogue cabin K02. Its id stays: closures, the ship plan and
-- booking history all reference cabins by id. Only its bed type changes.
SELECT pg_advisory_xact_lock(734821901);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "BookingRoom" WHERE "roomId" = 'K02') THEN
    RAISE EXCEPTION 'Room 2 (K02) has booking history; its bed type cannot change';
  END IF;
END $$;

-- Bed type is a setting of the eight 22 m² cabins, not of their number: each
-- may be King or Twin. Suites keep their fixed type, size and capacity.
ALTER TABLE "Room" DROP CONSTRAINT "Room_physical_inventory_check";
ALTER TABLE "Room" ADD CONSTRAINT "Room_physical_inventory_check" CHECK (
 "cruiseId" IS NULL AND "roomNumber" IS NOT NULL AND "roomType" IS NOT NULL AND (
 ("roomNumber" ~ '^(K0[1-6]|T0[12])$' AND "roomType" IN ('Luxury King Cabin','Luxury Twin Cabin') AND capacity=2 AND "sizeSqm"=22)
 OR ("roomNumber" ~ '^S0[12]$' AND "roomType"='Luxury Suite' AND capacity=4 AND "sizeSqm"=46)
 OR ("roomNumber" ~ '^R0[12]$' AND "roomType"='Royal Suite' AND capacity=4 AND "sizeSqm"=56)
 ));

SELECT hathor_expire_holds();

-- A King closure on Room 2 stays a King closure: it moves, with its dates,
-- reason and closure group, to a King cabin that is free for those dates.
-- Allocations are immutable, so it is re-created there and the original is
-- released. No free King cabin leaves roomId NULL, which aborts everything.
-- Whole-ship charters stay put: every cabin is closed either way.
INSERT INTO "InventoryAllocation" ("roomId", "startsAt", "endsAt", state, "blockKey", reason)
SELECT (
    SELECT k.id FROM "Room" k
    WHERE k."roomType" = 'Luxury King Cabin' AND k.id <> 'K02' AND k."deletedAt" IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM "InventoryAllocation" o
        WHERE o."roomId" = k.id AND o.active
          AND o."startsAt" < a."endsAt" AND o."endsAt" > a."startsAt"
      )
    ORDER BY k.id DESC LIMIT 1
  ), a."startsAt", a."endsAt", a.state, a."blockKey", a.reason
FROM "InventoryAllocation" a
JOIN "Room" r ON r.id = a."roomId"
WHERE a."roomId" = 'K02' AND r."roomType" = 'Luxury King Cabin'
  AND a.active AND a."bookingRoomId" IS NULL AND a.state <> 'CHARTER_BLOCK';

UPDATE "InventoryAllocation" a SET active = false
FROM "Room" r
WHERE r.id = a."roomId" AND a."roomId" = 'K02' AND r."roomType" = 'Luxury King Cabin'
  AND a.active AND a."bookingRoomId" IS NULL AND a.state <> 'CHARTER_BLOCK';

UPDATE "Room" SET "roomType" = 'Luxury Twin Cabin', name = 'Luxury Twin Cabin', "updatedAt" = now()
WHERE id = 'K02' AND "roomType" = 'Luxury King Cabin';
