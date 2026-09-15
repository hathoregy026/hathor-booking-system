ALTER TABLE "BookingRoom" ADD COLUMN "roomIndex" integer NOT NULL DEFAULT 0;
ALTER TABLE "BookingRoom" ADD CONSTRAINT "BookingRoom_roomIndex_check" CHECK ("roomIndex" BETWEEN 0 AND 11);
CREATE UNIQUE INDEX "BookingRoom_bookingId_roomIndex_key" ON "BookingRoom"("bookingId","roomIndex");
CREATE OR REPLACE FUNCTION hathor_booking_integrity() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE b "Booking"; lines int; total bigint; adults int; children int;
BEGIN
 SELECT * INTO b FROM "Booking" WHERE id=NEW.id;
 IF NOT FOUND OR b.status NOT IN ('PENDING_HOLD','REQUESTED','CONFIRMED') THEN RETURN NULL; END IF;
 SELECT count(*),sum("unitPriceCents"),sum(br.adults),sum(br.children) INTO lines,total,adults,children FROM "BookingRoom" br WHERE "bookingId"=b.id;
 IF lines=0 OR b."totalPriceCents" IS DISTINCT FROM total OR b."adultCount" IS DISTINCT FROM adults OR b."childCount" IS DISTINCT FROM children THEN RAISE EXCEPTION 'Booking lines do not match quote or occupancy'; END IF;
 IF b.status IN ('REQUESTED','CONFIRMED') AND (SELECT count(*) FROM "BookingGuest" WHERE "bookingId"=b.id)<>adults+children
 THEN RAISE EXCEPTION 'Passenger names are required'; END IF;
 RETURN NULL;
END $$;
CREATE OR REPLACE FUNCTION hathor_allocation_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE b "Booking"; br "BookingRoom"; s "CruiseSchedule";
BEGIN
 PERFORM pg_advisory_xact_lock(734821901);
 IF TG_OP='DELETE' THEN
  IF EXISTS(SELECT 1 FROM "BookingRoom" r JOIN "Booking" b ON b.id=r."bookingId" WHERE r.id=OLD."bookingRoomId" AND b.status IN ('PENDING_HOLD','REQUESTED','CONFIRMED'))
  THEN RAISE EXCEPTION 'Cannot delete an active booking allocation'; END IF;
  RETURN OLD;
 END IF;
 IF TG_OP='UPDATE' AND (NEW."bookingRoomId" IS DISTINCT FROM OLD."bookingRoomId" OR NEW."roomId"<>OLD."roomId" OR NEW."startsAt"<>OLD."startsAt" OR NEW."endsAt"<>OLD."endsAt" OR NEW."blockKey" IS DISTINCT FROM OLD."blockKey") THEN RAISE EXCEPTION 'Allocation identity is immutable'; END IF;
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
