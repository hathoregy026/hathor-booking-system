-- A guest's cabins are held only at Confirm request. If the request itself then
-- fails, the booking page releases that hold at once so the cabins return to
-- other guests immediately instead of after the 15-minute expiry. Only a
-- temporary hold can be released; a sent request or a confirmed booking is
-- returned unchanged. The allocation trigger frees the cabins.
CREATE OR REPLACE FUNCTION hathor_release_hold(booking_id text) RETURNS jsonb LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE b "Booking";
BEGIN
 PERFORM pg_advisory_xact_lock(734821901);
 SELECT * INTO b FROM "Booking" WHERE id=booking_id AND "deletedAt" IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Reservation not found'; END IF;
 IF b.status='PENDING_HOLD' THEN
  UPDATE "Booking" SET status='EXPIRED',"holdExpiresAt"=clock_timestamp(),"updatedAt"=clock_timestamp() WHERE id=b.id;
 END IF;
 RETURN hathor_reservation_json(b.id);
END $$;

REVOKE ALL ON FUNCTION hathor_release_hold(text) FROM PUBLIC,anon,authenticated;
