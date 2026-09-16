-- Step 4: stage the payment schedule by how far ahead the request is made,
-- let staff decline a request, and keep reconciliation metadata on each entry.
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "cancellationReason" text
  CHECK ("cancellationReason" IN ('CANCELLATION','NO_SHOW','EARLY_DEPARTURE','HATHOR_DECLINED'));
ALTER TABLE "BookingPayment" ADD COLUMN IF NOT EXISTS "recordedBySession" text;

CREATE OR REPLACE FUNCTION hathor_acquire_hold(sailing_id text, requested_rooms jsonb, attempt_key text, fingerprint text) RETURNS jsonb LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE b "Booking"; s "CruiseSchedule"; item jsonb; room_id text; price integer; idx integer:=0; total integer:=0; adults integer:=0; children integer:=0; selections jsonb:='[]'; bid text:=gen_random_uuid()::text; days integer;
BEGIN
 PERFORM hathor_expire_holds();
 SELECT * INTO b FROM "Booking" WHERE "idempotencyKey"=attempt_key;
 IF FOUND THEN
  IF b."requestFingerprint" IS DISTINCT FROM fingerprint THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Attempt belongs to another selection'; END IF;
  IF b."deletedAt" IS NOT NULL OR b.status IN ('EXPIRED','CANCELLED') THEN RAISE EXCEPTION USING ERRCODE='HB409',MESSAGE='This attempt ended. Start a new selection.'; END IF;
  RETURN hathor_reservation_json(b.id);
 END IF;
 IF jsonb_array_length(requested_rooms) NOT BETWEEN 1 AND 12 OR length(attempt_key) NOT BETWEEN 16 AND 128 THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Invalid room request'; END IF;
 SELECT cs.* INTO s FROM "CruiseSchedule" cs JOIN "Cruise" c ON c.id=cs."cruiseId" WHERE cs.id=sailing_id AND cs."isBookable" AND cs."departureTime">clock_timestamp() AND c."deletedAt" IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Select an existing future sailing'; END IF;
 PERFORM id FROM "TicketType" WHERE "cruiseId"=s."cruiseId" ORDER BY id FOR SHARE;
 FOR item IN SELECT value FROM jsonb_array_elements(requested_rooms) LOOP
  IF (item->>'adults')::int NOT BETWEEN 1 AND 4 OR (item->>'children')::int NOT BETWEEN 0 AND 3 THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Invalid occupancy'; END IF;
  SELECT r.id INTO room_id FROM "Room" r JOIN "_CruiseRooms" cr ON cr."B"=r.id
   WHERE cr."A"=s."cruiseId" AND r."deletedAt" IS NULL AND r."roomType"=item->>'roomType' AND r.capacity>=(item->>'adults')::int+(item->>'children')::int
   AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(selections) x WHERE x->>'roomId'=r.id)
   AND NOT EXISTS(SELECT 1 FROM "InventoryAllocation" a WHERE a."roomId"=r.id AND a.active AND a."startsAt"<s."arrivalTime" AND a."endsAt">s."departureTime") ORDER BY r."roomNumber" LIMIT 1;
  IF room_id IS NULL THEN RAISE EXCEPTION USING ERRCODE='HB409',MESSAGE='The full room combination is no longer available. No partial hold was created.'; END IF;
  SELECT "priceCents" INTO price FROM "TicketType" WHERE "cruiseId"=s."cruiseId" AND "roomType"=item->>'roomType';
  IF price IS NULL OR price<=0 THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='No valid room rate configured'; END IF;
  selections:=selections||jsonb_build_array(item||jsonb_build_object('roomId',room_id,'price',price));
  total:=total+price; adults:=adults+(item->>'adults')::int; children:=children+(item->>'children')::int;
 END LOOP;
 INSERT INTO "Booking"(id,"cruiseScheduleId","idempotencyKey","requestFingerprint","holdExpiresAt","adultCount","childCount","totalPriceCents","priceSnapshotAt","updatedAt") VALUES(bid,s.id,attempt_key,fingerprint,clock_timestamp()+interval '15 minutes',adults,children,total,clock_timestamp(),clock_timestamp());
 FOR item IN SELECT value FROM jsonb_array_elements(selections) LOOP
  INSERT INTO "BookingRoom"(id,"bookingId","roomId","cruiseScheduleId","unitPriceCents",adults,children,"roomIndex") VALUES(gen_random_uuid()::text,bid,item->>'roomId',s.id,(item->>'price')::int,(item->>'adults')::int,(item->>'children')::int,idx);idx:=idx+1;
 END LOOP;
 INSERT INTO "BookingTicket"(id,"bookingId","ticketTypeId",quantity,"unitPriceCents","updatedAt") SELECT gen_random_uuid()::text,bid,t.id,count(*)::int,t."priceCents",clock_timestamp() FROM jsonb_array_elements(selections) x JOIN "TicketType" t ON t."cruiseId"=s."cruiseId" AND t."roomType"=x->>'roomType' GROUP BY t.id;
 -- Stages follow the policy at the moment of booking: 30/20/50 with more than
 -- 60 days to go, 50 then 50 inside 60 days, and the full amount inside 45.
 days:=s."departureTime"::date-(clock_timestamp() AT TIME ZONE 'UTC')::date;
 IF days>60 THEN
  INSERT INTO "BookingPaymentSchedule"(id,"bookingId",milestone,"dueAt","cumulativeCents") VALUES
   (gen_random_uuid()::text,bid,'INITIAL',NULL,ceil(total*.3)),
   (gen_random_uuid()::text,bid,'DAY_60',s."departureTime"-interval '60 days',ceil(total*.5)),
   (gen_random_uuid()::text,bid,'DAY_45',s."departureTime"-interval '45 days',total);
 ELSIF days>45 THEN
  INSERT INTO "BookingPaymentSchedule"(id,"bookingId",milestone,"dueAt","cumulativeCents") VALUES
   (gen_random_uuid()::text,bid,'INITIAL',NULL,ceil(total*.5)),
   (gen_random_uuid()::text,bid,'DAY_45',s."departureTime"-interval '45 days',total);
 ELSE
  INSERT INTO "BookingPaymentSchedule"(id,"bookingId",milestone,"dueAt","cumulativeCents") VALUES
   (gen_random_uuid()::text,bid,'INITIAL',NULL,total);
 END IF;
 RETURN hathor_reservation_json(bid);
END $$;

CREATE OR REPLACE FUNCTION hathor_administer_booking(booking_id text, action jsonb) RETURNS jsonb LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE b "Booking"; p "BookingPayment"; paid bigint; required bigint; departure timestamp; days integer; fee integer; payment jsonb:=action->'payment';
BEGIN
 PERFORM hathor_expire_holds();
 SELECT * INTO b FROM "Booking" WHERE id=booking_id AND "deletedAt" IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Reservation not found'; END IF;
 SELECT "departureTime" INTO departure FROM "CruiseSchedule" WHERE id=b."cruiseScheduleId";
 days:=departure::date-(clock_timestamp() AT TIME ZONE 'UTC')::date;
 IF action->>'type'='decline' THEN
  -- Hathor turning down its own guest charges no cancellation fee. Refunding
  -- anything already recorded stays a staff decision, entered as a refund.
  IF b.status NOT IN ('REQUESTED','PENDING_HOLD') THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Only a request awaiting review can be declined'; END IF;
  UPDATE "Booking" SET status='CANCELLED',"holdExpiresAt"=NULL,"cancelledAt"=clock_timestamp(),
   "cancellationFeeCents"=0,"cancellationReason"='HATHOR_DECLINED',"updatedAt"=clock_timestamp() WHERE id=b.id;
  RETURN hathor_reservation_json(b.id);
 END IF;
 IF action->>'type'='cancel' THEN
  IF b.status IN ('EXPIRED','CANCELLED') THEN RETURN hathor_reservation_json(b.id); END IF;
  fee:=ceil(b."totalPriceCents"::numeric * CASE WHEN coalesce(action->>'reason','CANCELLATION')<>'CANCELLATION' OR days<=45 THEN 1 WHEN days<=60 THEN .5 WHEN days<90 THEN .25 ELSE 0 END);
  UPDATE "Booking" SET status='CANCELLED',"holdExpiresAt"=NULL,"cancelledAt"=clock_timestamp(),"cancellationFeeCents"=fee,
   "cancellationReason"=coalesce(action->>'reason','CANCELLATION'),"updatedAt"=clock_timestamp() WHERE id=b.id;
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
  INSERT INTO "BookingPayment"(id,"bookingId",reference,method,kind,"amountCents","receivedAt","recordedBySession") VALUES(gen_random_uuid()::text,b.id,payment->>'reference',payment->>'method',payment->>'kind',(payment->>'amountCents')::int,(payment->>'receivedAt')::timestamptz AT TIME ZONE 'UTC',payment->>'recordedBySession');
 ELSE RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Invalid staff action'; END IF;
 SELECT * INTO b FROM "Booking" WHERE id=booking_id;
 SELECT coalesce(sum(CASE WHEN kind='RECEIPT' THEN "amountCents" ELSE -"amountCents" END),0) INTO paid FROM "BookingPayment" WHERE "bookingId"=b.id;
 required:=ceil(b."totalPriceCents"::numeric * CASE WHEN days<=45 THEN 1 WHEN days<=60 THEN .5 ELSE .3 END);
 IF b.status='REQUESTED' AND b."acceptedAt" IS NOT NULL AND paid>=required THEN UPDATE "Booking" SET status='CONFIRMED',"updatedAt"=clock_timestamp() WHERE id=b.id; END IF;
 RETURN hathor_reservation_json(b.id);
END $$;

REVOKE ALL ON FUNCTION hathor_acquire_hold(text,jsonb,text,text),hathor_administer_booking(text,jsonb) FROM PUBLIC,anon,authenticated;
