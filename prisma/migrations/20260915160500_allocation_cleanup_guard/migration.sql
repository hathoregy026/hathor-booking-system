CREATE OR REPLACE FUNCTION hathor_allocation_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE b "Booking"; br "BookingRoom"; s "CruiseSchedule";
BEGIN
 PERFORM pg_advisory_xact_lock(734821901);
 IF TG_OP='DELETE' THEN
  IF EXISTS(SELECT 1 FROM "BookingRoom" r JOIN "Booking" parent ON parent.id=r."bookingId" WHERE r.id=OLD."bookingRoomId" AND parent.status IN ('PENDING_HOLD','REQUESTED','CONFIRMED'))
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
