CREATE FUNCTION hathor_administer_booking(booking_id text, action jsonb) RETURNS jsonb LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE b "Booking"; p "BookingPayment"; paid bigint; departure timestamp; days integer; needed bigint; fee integer; payment jsonb:=action->'payment';
BEGIN
 PERFORM hathor_expire_holds();
 SELECT * INTO b FROM "Booking" WHERE id=booking_id AND "deletedAt" IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Reservation not found'; END IF;
 SELECT "departureTime" INTO departure FROM "CruiseSchedule" WHERE id=b."cruiseScheduleId";
 days:=departure::date-(clock_timestamp() AT TIME ZONE 'UTC')::date;
 IF action->>'type'='cancel' THEN
  IF b.status IN ('EXPIRED','CANCELLED') THEN RETURN hathor_reservation_json(b.id); END IF;
  fee:=ceil(b."totalPriceCents"::numeric * CASE WHEN coalesce(action->>'reason','CANCELLATION')<>'CANCELLATION' OR days<=45 THEN 1 WHEN days<=60 THEN .5 WHEN days<90 THEN .25 ELSE 0 END);
  UPDATE "Booking" SET status='CANCELLED',"holdExpiresAt"=NULL,"cancelledAt"=clock_timestamp(),"cancellationFeeCents"=fee,"updatedAt"=clock_timestamp() WHERE id=b.id;
  RETURN hathor_reservation_json(b.id);
 END IF;
 IF action->>'type'='accept' THEN
  IF b.status NOT IN ('REQUESTED','CONFIRMED') THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Only submitted requests can be accepted'; END IF;
  UPDATE "Booking" SET "acceptedAt"=coalesce("acceptedAt",clock_timestamp()),"updatedAt"=clock_timestamp() WHERE id=b.id;
 ELSIF action->>'type'='record-payment' THEN
  SELECT * INTO p FROM "BookingPayment" WHERE reference=payment->>'reference';
  IF FOUND THEN
   IF p."bookingId"<>b.id OR p."amountCents"<>(payment->>'amountCents')::int OR p.method<>payment->>'method' OR p.kind<>payment->>'kind' OR p."receivedAt"<>(payment->>'receivedAt')::timestamptz AT TIME ZONE 'UTC' THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Payment reference already used for different details'; END IF;
   RETURN hathor_reservation_json(b.id);
  END IF;
  INSERT INTO "BookingPayment"(id,"bookingId",reference,method,kind,"amountCents","receivedAt") VALUES(gen_random_uuid()::text,b.id,payment->>'reference',payment->>'method',payment->>'kind',(payment->>'amountCents')::int,(payment->>'receivedAt')::timestamptz AT TIME ZONE 'UTC');
 ELSE RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Invalid staff action'; END IF;
 SELECT * INTO b FROM "Booking" WHERE id=booking_id;
 SELECT coalesce(sum(CASE WHEN kind='RECEIPT' THEN "amountCents" ELSE -"amountCents" END),0) INTO paid FROM "BookingPayment" WHERE "bookingId"=b.id;
 needed:=ceil(b."totalPriceCents"::numeric * CASE WHEN days<=45 THEN 1 WHEN days<=60 THEN .5 ELSE .3 END);
 IF b.status='REQUESTED' AND b."acceptedAt" IS NOT NULL AND paid>=needed THEN UPDATE "Booking" SET status='CONFIRMED',"updatedAt"=clock_timestamp() WHERE id=b.id; END IF;
 RETURN hathor_reservation_json(b.id);
END $$;
REVOKE ALL ON FUNCTION hathor_administer_booking(text,jsonb) FROM PUBLIC,anon,authenticated;
