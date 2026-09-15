BEGIN;
SET LOCAL lock_timeout = '15s';
SELECT pg_advisory_xact_lock(734821901);
LOCK TABLE "Booking", "BookingRoom", "Room" IN ACCESS EXCLUSIVE MODE;

-- Only the five individually audited and explicitly approved test bookings.
DELETE FROM "Booking" WHERE id IN (
 'cmtdppqph000004ju5dfqygjg','cmtfm7bbb000004l8uc2kd5yi',
 'cmtyjxfla000004l9j2yv8mik','cmtyofiim000104jjsg9nf59n','cmtyoo7hg000404jjtk3uo4ui'
);
-- Abort instead of deleting any later guest booking or silently remapping it.
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM "BookingRoom" br JOIN "Room" r ON r.id=br."roomId"
   WHERE r."roomNumber" IN ('KING-3N','TWIN-3N','SUITE-3N','ROYAL-3N',
   'KING-4N','TWIN-4N','SUITE-4N','ROYAL-4N','KING-7N','TWIN-7N','SUITE-7N','ROYAL-7N')
   OR r.id IN ('cm0seed0001room0000001','cm0seed0001room0000002','cm0seed0001room0000003'))
 THEN RAISE EXCEPTION 'Unapproved booking dependency: stop and review'; END IF;
 IF EXISTS (SELECT 1 FROM "Booking" WHERE "ratePlan"='NON_REFUNDABLE')
 THEN RAISE EXCEPTION 'Unapproved discounted booking: stop and review'; END IF;
END $$;
DELETE FROM "Room" r USING "Cruise" c WHERE r."cruiseId"=c.id AND
 ((c.slug IN ('3-nights-aswan-luxor','4-nights-luxor-aswan','7-nights-luxor-aswan-luxor')
   AND r."roomNumber" IN ('KING-3N','TWIN-3N','SUITE-3N','ROYAL-3N','KING-4N','TWIN-4N','SUITE-4N','ROYAL-4N','KING-7N','TWIN-7N','SUITE-7N','ROYAL-7N'))
 OR (c.slug='nile-majesty' AND r.id IN ('cm0seed0001room0000001','cm0seed0001room0000002','cm0seed0001room0000003')));

ALTER TABLE "Booking" DROP COLUMN "ratePlan";
DROP TYPE "BookingRatePlan";
ALTER TABLE "Room" ALTER COLUMN "cruiseId" DROP NOT NULL;
ALTER TABLE "Room" DROP CONSTRAINT "Room_cruiseId_fkey";
ALTER TABLE "Room" ADD CONSTRAINT "Room_cruiseId_fkey" FOREIGN KEY ("cruiseId") REFERENCES "Cruise"(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Room" ADD COLUMN "sizeSqm" integer NOT NULL DEFAULT 22;
CREATE UNIQUE INDEX "Room_roomNumber_key" ON "Room"("roomNumber");
CREATE TABLE "_CruiseRooms" (
 "A" text NOT NULL REFERENCES "Cruise"(id) ON DELETE CASCADE ON UPDATE CASCADE,
 "B" text NOT NULL REFERENCES "Room"(id) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT "_CruiseRooms_AB_pkey" PRIMARY KEY ("A","B")
);
CREATE INDEX "_CruiseRooms_B_index" ON "_CruiseRooms"("B");
INSERT INTO "Room"(id,name,"roomNumber","roomType",capacity,"sizeSqm","priceMultiplier","updatedAt")
SELECT code, kind, code, kind, capacity, size, multiplier, now()
FROM (VALUES
 ('K01','Luxury King Cabin',2,22,1.0),('K02','Luxury King Cabin',2,22,1.0),
 ('K03','Luxury King Cabin',2,22,1.0),('K04','Luxury King Cabin',2,22,1.0),
 ('K05','Luxury King Cabin',2,22,1.0),('K06','Luxury King Cabin',2,22,1.0),
 ('T01','Luxury Twin Cabin',2,22,1.0),('T02','Luxury Twin Cabin',2,22,1.0),
 ('S01','Luxury Suite',4,46,1.5),('S02','Luxury Suite',4,46,1.5),
 ('R01','Royal Suite',4,56,1.8),('R02','Royal Suite',4,56,1.8)
) AS units(code,kind,capacity,size,multiplier);
INSERT INTO "_CruiseRooms"("A","B")
SELECT c.id,r.id FROM "Cruise" c CROSS JOIN "Room" r
WHERE c.slug IN ('3-nights-aswan-luxor','4-nights-luxor-aswan','7-nights-luxor-aswan-luxor')
AND r."roomNumber" ~ '^(K0[1-6]|T0[12]|S0[12]|R0[12])$';
ALTER TABLE "Room" ADD CONSTRAINT "Room_physical_inventory_check" CHECK (
 "cruiseId" IS NULL AND "roomNumber" IS NOT NULL AND "roomType" IS NOT NULL AND (
 ("roomNumber" ~ '^K0[1-6]$' AND "roomType"='Luxury King Cabin' AND capacity=2 AND "sizeSqm"=22)
 OR ("roomNumber" ~ '^T0[12]$' AND "roomType"='Luxury Twin Cabin' AND capacity=2 AND "sizeSqm"=22)
 OR ("roomNumber" ~ '^S0[12]$' AND "roomType"='Luxury Suite' AND capacity=4 AND "sizeSqm"=46)
 OR ("roomNumber" ~ '^R0[12]$' AND "roomType"='Royal Suite' AND capacity=4 AND "sizeSqm"=56)
 ));

-- Reuse TicketType as the authoritative per-voyage accommodation rate.
ALTER TABLE "TicketType" ADD COLUMN "roomType" text;
UPDATE "TicketType" t SET "roomType"='Luxury King Cabin', name='Luxury King Cabin'
FROM "Cruise" c WHERE c.id=t."cruiseId" AND c.slug IN
 ('3-nights-aswan-luxor','4-nights-luxor-aswan','7-nights-luxor-aswan-luxor') AND t.name='Per Cabin';
INSERT INTO "TicketType"(id,"cruiseId",name,"roomType","priceCents","updatedAt")
SELECT gen_random_uuid()::text,c.id,k.kind,k.kind,
 CASE c.slug WHEN '3-nights-aswan-luxor' THEN k.p3 WHEN '4-nights-luxor-aswan' THEN k.p4 ELSE k.p7 END,now()
FROM "Cruise" c CROSS JOIN (VALUES
 ('Luxury Twin Cabin',300000,400000,700000),('Luxury Suite',450000,600000,1050000),('Royal Suite',540000,720000,1260000)
) k(kind,p3,p4,p7)
WHERE c.slug IN ('3-nights-aswan-luxor','4-nights-luxor-aswan','7-nights-luxor-aswan-luxor');
CREATE UNIQUE INDEX "TicketType_cruiseId_roomType_key" ON "TicketType"("cruiseId","roomType");
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_positive_price" CHECK ("priceCents">0);

ALTER TABLE "CruiseSchedule" ADD COLUMN "isBookable" boolean NOT NULL DEFAULT false;
CREATE TABLE "SailingSector" (
 id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
 "startsAt" timestamp(3) NOT NULL UNIQUE,
 "endsAt" timestamp(3) NOT NULL,
 CHECK ((extract(dow FROM "startsAt")=6 AND "endsAt"="startsAt"+interval '4 days')
 OR (extract(dow FROM "startsAt")=3 AND "endsAt"="startsAt"+interval '3 days'))
);
CREATE TABLE "ScheduleSector" (
 "cruiseScheduleId" text NOT NULL REFERENCES "CruiseSchedule"(id) ON DELETE CASCADE ON UPDATE CASCADE,
 "sectorId" text NOT NULL REFERENCES "SailingSector"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
 PRIMARY KEY ("cruiseScheduleId","sectorId")
);
CREATE FUNCTION hathor_schedule_sectors() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE slug text; nights int; start_b timestamp;
BEGIN
 SELECT c.slug INTO slug FROM "Cruise" c WHERE c.id=NEW."cruiseId";
 nights:=CASE slug WHEN '3-nights-aswan-luxor' THEN 3 WHEN '4-nights-luxor-aswan' THEN 4 WHEN '7-nights-luxor-aswan-luxor' THEN 7 ELSE NULL END;
 IF TG_OP='UPDATE' AND (NEW."departureTime",NEW."arrivalTime",NEW."cruiseId") IS DISTINCT FROM (OLD."departureTime",OLD."arrivalTime",OLD."cruiseId")
 AND EXISTS(SELECT 1 FROM "Booking" WHERE "cruiseScheduleId"=NEW.id)
 THEN RAISE EXCEPTION 'Cannot change a sailing with reservations'; END IF;
 IF NEW."isBookable" AND (nights IS NULL OR NEW."departureTime"<>date_trunc('day',NEW."departureTime")
 OR extract(dow FROM NEW."departureTime")<>CASE WHEN nights=3 THEN 3 ELSE 6 END
 OR NEW."arrivalTime"<>NEW."departureTime"+make_interval(days=>nights))
 THEN RAISE EXCEPTION 'Invalid Hathor sailing'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER hathor_schedule_validate BEFORE INSERT OR UPDATE ON "CruiseSchedule" FOR EACH ROW EXECUTE FUNCTION hathor_schedule_sectors();
CREATE FUNCTION hathor_link_sectors() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE d timestamp; n int;
BEGIN
 DELETE FROM "ScheduleSector" WHERE "cruiseScheduleId"=NEW.id;
 IF NEW."isBookable" THEN
  d:=NEW."departureTime";
  WHILE d<NEW."arrivalTime" LOOP
   n:=CASE WHEN extract(dow FROM d)=6 THEN 4 ELSE 3 END;
   INSERT INTO "SailingSector"("startsAt","endsAt") VALUES(d,d+make_interval(days=>n)) ON CONFLICT("startsAt") DO NOTHING;
   INSERT INTO "ScheduleSector" SELECT NEW.id,id FROM "SailingSector" WHERE "startsAt"=d;
   d:=d+make_interval(days=>n);
  END LOOP;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER hathor_schedule_link AFTER INSERT OR UPDATE OF "departureTime","arrivalTime","isBookable" ON "CruiseSchedule" FOR EACH ROW EXECUTE FUNCTION hathor_link_sectors();
UPDATE "CruiseSchedule" s SET "isBookable"=true FROM "Cruise" c WHERE c.id=s."cruiseId"
 AND ((c.slug='3-nights-aswan-luxor' AND extract(dow FROM s."departureTime")=3 AND s."arrivalTime"=s."departureTime"+interval '3 days')
 OR (c.slug='4-nights-luxor-aswan' AND extract(dow FROM s."departureTime")=6 AND s."arrivalTime"=s."departureTime"+interval '4 days')
 OR (c.slug='7-nights-luxor-aswan-luxor' AND extract(dow FROM s."departureTime")=6 AND s."arrivalTime"=s."departureTime"+interval '7 days'))
 AND s."departureTime"=date_trunc('day',s."departureTime");

ALTER TABLE "Booking"
 ADD COLUMN "firstName" text, ADD COLUMN "lastName" text, ADD COLUMN country text,
 ADD COLUMN "paymentMethod" text CHECK ("paymentMethod" IN ('VISA','BANK_TRANSFER')),
 ADD COLUMN "requestedAt" timestamp(3), ADD COLUMN "acceptedAt" timestamp(3), ADD COLUMN "confirmedAt" timestamp(3),
 ADD COLUMN "cancelledAt" timestamp(3), ADD COLUMN "cancellationFeeCents" integer CHECK ("cancellationFeeCents">=0),
 ADD COLUMN "requestFingerprint" text,
 ADD COLUMN "guestEmailStatus" text NOT NULL DEFAULT 'PENDING' CHECK ("guestEmailStatus" IN ('PENDING','SENT','FAILED')),
 ADD COLUMN "adminEmailStatus" text NOT NULL DEFAULT 'PENDING' CHECK ("adminEmailStatus" IN ('PENDING','SENT','FAILED'));
CREATE UNIQUE INDEX "Booking_id_cruiseScheduleId_key" ON "Booking"(id,"cruiseScheduleId");
ALTER TABLE "BookingRoom" ADD COLUMN adults integer NOT NULL DEFAULT 1 CHECK(adults>=1), ADD COLUMN children integer NOT NULL DEFAULT 0 CHECK(children>=0);
ALTER TABLE "BookingRoom" ADD CONSTRAINT "BookingRoom_parent_schedule_fkey" FOREIGN KEY ("bookingId","cruiseScheduleId") REFERENCES "Booking"(id,"cruiseScheduleId") ON DELETE CASCADE;

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;
CREATE TABLE "InventoryAllocation" (
 id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
 "roomId" text NOT NULL REFERENCES "Room"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
 "bookingRoomId" text UNIQUE REFERENCES "BookingRoom"(id) ON DELETE CASCADE ON UPDATE CASCADE,
 "startsAt" timestamp(3) NOT NULL, "endsAt" timestamp(3) NOT NULL,
 state text NOT NULL CHECK(state IN ('HELD','REQUESTED','CONFIRMED','MANUAL_BLOCK','MAINTENANCE','CHARTER_BLOCK')),
 active boolean NOT NULL DEFAULT true, "expiresAt" timestamp(3), "blockKey" text, reason text,
 "createdAt" timestamp(3) NOT NULL DEFAULT now(),
 CHECK("endsAt">"startsAt"),
 CHECK((state='HELD' AND "expiresAt" IS NOT NULL) OR (state<>'HELD' AND "expiresAt" IS NULL)),
 CHECK(("bookingRoomId" IS NOT NULL AND state IN ('HELD','REQUESTED','CONFIRMED')) OR
 ("bookingRoomId" IS NULL AND state IN ('MANUAL_BLOCK','MAINTENANCE','CHARTER_BLOCK') AND "blockKey" IS NOT NULL)),
 EXCLUDE USING gist ("roomId" WITH =, tsrange("startsAt","endsAt",'[)') WITH &&) WHERE(active)
);
CREATE INDEX "InventoryAllocation_roomId_startsAt_endsAt_idx" ON "InventoryAllocation"("roomId","startsAt","endsAt");
CREATE INDEX "InventoryAllocation_blockKey_idx" ON "InventoryAllocation"("blockKey");
CREATE TABLE "BookingGuest" (
 id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
 "bookingId" text NOT NULL REFERENCES "Booking"(id) ON DELETE CASCADE ON UPDATE CASCADE,
 "roomIndex" integer NOT NULL CHECK("roomIndex">=0), "fullName" text NOT NULL CHECK(length(trim("fullName")) BETWEEN 1 AND 120),
 "isChild" boolean NOT NULL DEFAULT false
);
CREATE INDEX "BookingGuest_bookingId_idx" ON "BookingGuest"("bookingId");
CREATE TABLE "BookingPayment" (
 id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
 "bookingId" text NOT NULL REFERENCES "Booking"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
 reference text NOT NULL UNIQUE, method text NOT NULL CHECK(method IN ('VISA','BANK_TRANSFER')),
 kind text NOT NULL DEFAULT 'RECEIPT' CHECK(kind IN ('RECEIPT','REFUND')),
 "amountCents" integer NOT NULL CHECK("amountCents">0), currency text NOT NULL DEFAULT 'USD' CHECK(currency='USD'),
 "receivedAt" timestamp(3) NOT NULL, "recordedAt" timestamp(3) NOT NULL DEFAULT now()
);
CREATE INDEX "BookingPayment_bookingId_idx" ON "BookingPayment"("bookingId");
CREATE TABLE "BookingPaymentSchedule" (
 id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
 "bookingId" text NOT NULL REFERENCES "Booking"(id) ON DELETE CASCADE ON UPDATE CASCADE,
 milestone text NOT NULL CHECK(milestone IN ('INITIAL','DAY_60','DAY_45')),
 "dueAt" timestamp(3), "cumulativeCents" integer NOT NULL CHECK("cumulativeCents">0),
 UNIQUE("bookingId",milestone)
);

-- Existing row locks are retained; all writers take the same vessel lock first.
-- Range exclusion remains the independent protection against overlapping writes.
CREATE FUNCTION hathor_expire_holds() RETURNS integer LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE changed int;
BEGIN
 PERFORM pg_advisory_xact_lock(734821901);
 UPDATE "Booking" SET status='EXPIRED',"updatedAt"=clock_timestamp()
 WHERE status='PENDING_HOLD' AND "holdExpiresAt"<=clock_timestamp();
 GET DIAGNOSTICS changed=ROW_COUNT;
 RETURN changed;
END $$;
CREATE FUNCTION hathor_allocate_booking_room() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE b "Booking"; s "CruiseSchedule"; r "Room"; price int;
BEGIN
 PERFORM pg_advisory_xact_lock(734821901);
 SELECT * INTO b FROM "Booking" WHERE id=NEW."bookingId";
 SELECT * INTO s FROM "CruiseSchedule" WHERE id=NEW."cruiseScheduleId";
 SELECT * INTO r FROM "Room" WHERE id=NEW."roomId";
 IF b.status<>'PENDING_HOLD' OR b."holdExpiresAt"<=clock_timestamp() OR b."deletedAt" IS NOT NULL
 OR NOT s."isBookable" OR s."departureTime"<=clock_timestamp() OR r."deletedAt" IS NOT NULL
 OR NOT EXISTS(SELECT 1 FROM "_CruiseRooms" WHERE "A"=s."cruiseId" AND "B"=r.id)
 OR EXISTS(SELECT 1 FROM "Cruise" WHERE id=s."cruiseId" AND "deletedAt" IS NOT NULL)
 OR NEW.adults+NEW.children>r.capacity THEN RAISE EXCEPTION 'Invalid room allocation'; END IF;
 SELECT "priceCents" INTO price FROM "TicketType" WHERE "cruiseId"=s."cruiseId" AND "roomType"=r."roomType";
 IF price IS NULL OR NEW."unitPriceCents" IS DISTINCT FROM price THEN RAISE EXCEPTION 'Invalid room price'; END IF;
 INSERT INTO "InventoryAllocation"("roomId","bookingRoomId","startsAt","endsAt",state,"expiresAt")
 VALUES(r.id,NEW.id,s."departureTime",s."arrivalTime",'HELD',b."holdExpiresAt");
 RETURN NEW;
END $$;
CREATE TRIGGER hathor_room_allocate AFTER INSERT ON "BookingRoom" FOR EACH ROW EXECUTE FUNCTION hathor_allocate_booking_room();
CREATE FUNCTION hathor_booking_transition() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE paid bigint; required bigint; departure timestamp;
BEGIN
 PERFORM pg_advisory_xact_lock(734821901);
 IF TG_OP='INSERT' THEN
  IF NEW.status<>'PENDING_HOLD' OR NEW."holdExpiresAt" IS NULL OR NEW."holdExpiresAt"<=clock_timestamp()
  OR NEW."acceptedAt" IS NOT NULL THEN RAISE EXCEPTION 'Booking must start as a temporary hold'; END IF;
 ELSE
  IF (NEW."totalPriceCents",NEW.currency,NEW."cruiseScheduleId",NEW."idempotencyKey",NEW."priceSnapshotAt")
    IS DISTINCT FROM (OLD."totalPriceCents",OLD.currency,OLD."cruiseScheduleId",OLD."idempotencyKey",OLD."priceSnapshotAt")
  THEN RAISE EXCEPTION 'Reservation quote is immutable'; END IF;
  IF OLD.status IN ('CANCELLED','EXPIRED') AND NEW.status<>OLD.status THEN RAISE EXCEPTION 'Released reservations cannot be reactivated'; END IF;
  IF NEW.status='REQUESTED' AND OLD.status='PENDING_HOLD' AND OLD."holdExpiresAt"<=clock_timestamp()
  THEN RAISE EXCEPTION 'Hold expired'; END IF;
  IF NEW.status='PENDING_HOLD' AND OLD.status<>'PENDING_HOLD' THEN RAISE EXCEPTION 'Invalid hold transition'; END IF;
  IF NEW.status='EXPIRED' AND OLD.status<>'PENDING_HOLD' THEN RAISE EXCEPTION 'Only checkout holds expire automatically'; END IF;
  IF OLD.status='CONFIRMED' AND NEW.status='REQUESTED' THEN RAISE EXCEPTION 'Cannot revert confirmation'; END IF;
 END IF;
 IF NEW.status IN ('REQUESTED','CONFIRMED') THEN
  IF NEW."requestedAt" IS NULL OR NEW."paymentMethod" IS NULL OR NEW."termsAcceptedAt" IS NULL
   OR coalesce(trim(NEW."firstName"),'')='' OR coalesce(trim(NEW."lastName"),'')=''
   OR coalesce(trim(NEW.country),'')='' OR coalesce(NEW."customerEmail",'')=''
   OR coalesce(NEW."customerPhone",'')!~ '^\+[1-9][0-9]{6,14}$'
  THEN RAISE EXCEPTION 'Incomplete booking request'; END IF;
  NEW."holdExpiresAt":=NULL;
 END IF;
 SELECT coalesce(sum(CASE WHEN kind='RECEIPT' THEN "amountCents" ELSE -"amountCents" END),0) INTO paid FROM "BookingPayment" WHERE "bookingId"=NEW.id;
 IF paid<0 OR paid>NEW."totalPriceCents" THEN RAISE EXCEPTION 'Payment balance outside reservation total'; END IF;
 NEW."paymentStatus":=CASE WHEN paid=0 AND EXISTS(SELECT 1 FROM "BookingPayment" WHERE "bookingId"=NEW.id AND kind='REFUND') THEN 'REFUNDED'::"BookingPaymentStatus"
 WHEN paid>=NEW."totalPriceCents" THEN 'PAID'::"BookingPaymentStatus"
 WHEN EXISTS(SELECT 1 FROM "BookingPayment" WHERE "bookingId"=NEW.id AND kind='REFUND') THEN 'PARTIALLY_REFUNDED'::"BookingPaymentStatus"
 WHEN paid>0 THEN 'PARTIALLY_PAID'::"BookingPaymentStatus" ELSE 'PENDING'::"BookingPaymentStatus" END;
 IF NEW.status='CONFIRMED' AND (TG_OP='INSERT' OR OLD.status<>'CONFIRMED') THEN
  SELECT "departureTime" INTO departure FROM "CruiseSchedule" WHERE id=NEW."cruiseScheduleId";
  required:=ceil(NEW."totalPriceCents"::numeric * CASE WHEN departure::date-(clock_timestamp() AT TIME ZONE 'UTC')::date<=45 THEN 1 WHEN departure::date-(clock_timestamp() AT TIME ZONE 'UTC')::date<=60 THEN 0.5 ELSE 0.3 END);
  IF NEW."acceptedAt" IS NULL OR paid<required THEN RAISE EXCEPTION 'Acceptance and required recorded payment are necessary'; END IF;
  NEW."confirmedAt":=clock_timestamp();
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER hathor_booking_guard BEFORE INSERT OR UPDATE ON "Booking" FOR EACH ROW EXECUTE FUNCTION hathor_booking_transition();
CREATE FUNCTION hathor_sync_allocations() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
BEGIN
 UPDATE "InventoryAllocation" a SET active=(NEW.status IN ('PENDING_HOLD','REQUESTED','CONFIRMED') AND NEW."deletedAt" IS NULL),
 state=CASE NEW.status WHEN 'REQUESTED' THEN 'REQUESTED' WHEN 'CONFIRMED' THEN 'CONFIRMED' ELSE 'HELD' END,
 "expiresAt"=CASE WHEN NEW.status IN ('REQUESTED','CONFIRMED') THEN NULL ELSE coalesce(NEW."holdExpiresAt",clock_timestamp()) END
 FROM "BookingRoom" br WHERE br."bookingId"=NEW.id AND a."bookingRoomId"=br.id;
 RETURN NEW;
END $$;
CREATE TRIGGER hathor_booking_allocations AFTER UPDATE ON "Booking" FOR EACH ROW EXECUTE FUNCTION hathor_sync_allocations();
CREATE FUNCTION hathor_booking_integrity() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE b "Booking"; lines int; total bigint; adults int; children int;
BEGIN
 SELECT * INTO b FROM "Booking" WHERE id=CASE WHEN TG_TABLE_NAME='Booking' THEN NEW.id ELSE NEW."bookingId" END;
 IF NOT FOUND OR b.status NOT IN ('PENDING_HOLD','REQUESTED','CONFIRMED') THEN RETURN NULL; END IF;
 SELECT count(*),sum("unitPriceCents"),sum(br.adults),sum(br.children) INTO lines,total,adults,children FROM "BookingRoom" br WHERE "bookingId"=b.id;
 IF lines=0 OR b."totalPriceCents" IS DISTINCT FROM total OR b."adultCount" IS DISTINCT FROM adults OR b."childCount" IS DISTINCT FROM children THEN RAISE EXCEPTION 'Booking lines do not match quote or occupancy'; END IF;
 IF b.status IN ('REQUESTED','CONFIRMED') AND (SELECT count(*) FROM "BookingGuest" WHERE "bookingId"=b.id)<>adults+children
 THEN RAISE EXCEPTION 'Passenger names are required'; END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER hathor_booking_complete AFTER INSERT OR UPDATE ON "Booking" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION hathor_booking_integrity();

-- Booking room identity and its agreed rate cannot be edited after allocation.
CREATE FUNCTION hathor_immutable_room_line() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
BEGIN
 IF TG_OP='UPDATE' THEN RAISE EXCEPTION 'Release the reservation instead of rewriting an allocation'; END IF;
 IF EXISTS(SELECT 1 FROM "Booking" WHERE id=OLD."bookingId" AND status IN ('PENDING_HOLD','REQUESTED','CONFIRMED'))
 THEN RAISE EXCEPTION 'Cannot remove a room from an active reservation'; END IF;
 RETURN OLD;
END $$;
CREATE TRIGGER hathor_room_immutable BEFORE UPDATE OR DELETE ON "BookingRoom" FOR EACH ROW EXECUTE FUNCTION hathor_immutable_room_line();
CREATE FUNCTION hathor_allocation_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE b "Booking"; br "BookingRoom"; s "CruiseSchedule";
BEGIN
 PERFORM pg_advisory_xact_lock(734821901);
 IF TG_OP='DELETE' THEN
  IF EXISTS(SELECT 1 FROM "BookingRoom" r JOIN "Booking" b ON b.id=r."bookingId" WHERE r.id=OLD."bookingRoomId" AND b.status IN ('PENDING_HOLD','REQUESTED','CONFIRMED'))
  THEN RAISE EXCEPTION 'Cannot delete an active booking allocation'; END IF;
  RETURN OLD;
 END IF;
 IF NEW."bookingRoomId" IS NOT NULL THEN
  SELECT * INTO br FROM "BookingRoom" WHERE id=NEW."bookingRoomId";
  SELECT * INTO b FROM "Booking" WHERE id=br."bookingId";
  SELECT * INTO s FROM "CruiseSchedule" WHERE id=b."cruiseScheduleId";
  IF NEW."roomId"<>br."roomId" OR NEW."startsAt"<>s."departureTime" OR NEW."endsAt"<>s."arrivalTime"
  OR NEW.active IS DISTINCT FROM (b.status IN ('PENDING_HOLD','REQUESTED','CONFIRMED') AND b."deletedAt" IS NULL)
  OR (b.status='REQUESTED' AND NEW.state<>'REQUESTED') OR (b.status='CONFIRMED' AND NEW.state<>'CONFIRMED')
  OR (b.status='PENDING_HOLD' AND (NEW.state<>'HELD' OR NEW."expiresAt" IS DISTINCT FROM b."holdExpiresAt"))
  THEN RAISE EXCEPTION 'Allocation must match its reservation'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER hathor_allocation_check BEFORE INSERT OR UPDATE OR DELETE ON "InventoryAllocation" FOR EACH ROW EXECUTE FUNCTION hathor_allocation_guard();
CREATE FUNCTION hathor_payment_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE b "Booking"; paid bigint;
BEGIN
 PERFORM pg_advisory_xact_lock(734821901);
 IF TG_OP<>'INSERT' THEN RAISE EXCEPTION 'Payment entries are immutable; record an explicit refund'; END IF;
 SELECT * INTO b FROM "Booking" WHERE id=NEW."bookingId";
 IF b.status NOT IN ('REQUESTED','CONFIRMED','CANCELLED') OR NEW."receivedAt">clock_timestamp() THEN RAISE EXCEPTION 'Invalid payment'; END IF;
 SELECT coalesce(sum(CASE WHEN kind='REFUND' THEN -"amountCents" ELSE "amountCents" END),0) INTO paid FROM "BookingPayment" WHERE "bookingId"=b.id;
 IF NEW.kind='RECEIPT' AND (b.status='CANCELLED' OR paid+NEW."amountCents">b."totalPriceCents") THEN RAISE EXCEPTION 'Invalid payment amount'; END IF;
 IF NEW.kind='REFUND' AND (b.status<>'CANCELLED' OR NEW."amountCents">greatest(0,paid-coalesce(b."cancellationFeeCents",b."totalPriceCents"))) THEN RAISE EXCEPTION 'Refund exceeds cancellation entitlement'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER hathor_payment_check BEFORE INSERT OR UPDATE OR DELETE ON "BookingPayment" FOR EACH ROW EXECUTE FUNCTION hathor_payment_guard();
CREATE FUNCTION hathor_payment_refresh() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
BEGIN
 UPDATE "Booking" SET "updatedAt"=clock_timestamp() WHERE id=NEW."bookingId";
 RETURN NEW;
END $$;
CREATE TRIGGER hathor_payment_balance AFTER INSERT ON "BookingPayment" FOR EACH ROW EXECUTE FUNCTION hathor_payment_refresh();
UPDATE "EmailTemplate" SET subject='Your Hathor booking request has been received',"heroHeading"='Request Received, {guestName}',"bodyText"='Your booking request has been sent. Hathor reservations will contact you with the invoice and payment instructions. No payment has been collected.' WHERE name='BookingReceived';
UPDATE "EmailTemplate" SET subject='New booking request — {guestName}',"heroHeading"='New Booking Request',"bodyText"='Review this request and its preferred payment method. Send the invoice and payment instructions. Confirmation requires acceptance and the required recorded payment.' WHERE name='AdminAlert';
UPDATE "EmailTemplate" SET subject='Your Hathor reservation is confirmed',"heroHeading"='Reservation Confirmed, {guestName}',"bodyText"='Hathor has accepted your reservation and the required initial payment has been recorded. Please follow the payment schedule for any remaining balance.' WHERE name='BookingConfirmed';

-- Functions are internal to the trusted server, never anonymous RPCs.
DO $$ DECLARE t text; f record; BEGIN
 FOREACH t IN ARRAY ARRAY['Booking','BookingRoom','BookingTicket','Room','Cruise','CruiseSchedule','TicketType','_CruiseRooms','SailingSector','ScheduleSector','InventoryAllocation','BookingGuest','BookingPayment','BookingPaymentSchedule'] LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON TABLE %I FROM anon, authenticated',t);
 END LOOP;
 FOR f IN SELECT oid::regprocedure AS signature FROM pg_proc WHERE pronamespace='public'::regnamespace AND proname LIKE 'hathor_%' LOOP
  EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated',f.signature);
 END LOOP;
END $$;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
SELECT cron.schedule('hathor-expire-checkout-holds','* * * * *','SELECT public.hathor_expire_holds()');
COMMIT;
