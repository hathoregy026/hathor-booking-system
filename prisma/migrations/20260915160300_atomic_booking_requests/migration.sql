CREATE FUNCTION hathor_reservation_json(booking_id text) RETURNS jsonb LANGUAGE sql STABLE SET search_path=public,pg_catalog AS $$
 SELECT to_jsonb(b)||jsonb_build_object(
 'bookingRooms',coalesce((SELECT jsonb_agg(to_jsonb(br)||jsonb_build_object('room',to_jsonb(r)) ORDER BY br."roomIndex") FROM "BookingRoom" br JOIN "Room" r ON r.id=br."roomId" WHERE br."bookingId"=b.id),'[]'),
 'cruiseSchedule',(SELECT to_jsonb(s)||jsonb_build_object('cruise',to_jsonb(c)) FROM "CruiseSchedule" s JOIN "Cruise" c ON c.id=s."cruiseId" WHERE s.id=b."cruiseScheduleId"),
 'guests',coalesce((SELECT jsonb_agg(g) FROM "BookingGuest" g WHERE g."bookingId"=b.id),'[]'),
 'payments',coalesce((SELECT jsonb_agg(p) FROM "BookingPayment" p WHERE p."bookingId"=b.id),'[]'),
 'paymentSchedule',coalesce((SELECT jsonb_agg(p ORDER BY p."cumulativeCents") FROM "BookingPaymentSchedule" p WHERE p."bookingId"=b.id),'[]')) FROM "Booking" b WHERE b.id=booking_id;
$$;
CREATE FUNCTION hathor_acquire_hold(sailing_id text, requested_rooms jsonb, attempt_key text, fingerprint text) RETURNS jsonb LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE b "Booking"; s "CruiseSchedule"; item jsonb; room_id text; price integer; idx integer:=0; total integer:=0; adults integer:=0; children integer:=0; selections jsonb:='[]'; bid text:=gen_random_uuid()::text;
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
 INSERT INTO "BookingTicket"(id,"bookingId","ticketTypeId",quantity,"unitPriceCents") SELECT gen_random_uuid()::text,bid,t.id,count(*)::int,t."priceCents" FROM jsonb_array_elements(selections) x JOIN "TicketType" t ON t."cruiseId"=s."cruiseId" AND t."roomType"=x->>'roomType' GROUP BY t.id;
 INSERT INTO "BookingPaymentSchedule"(id,"bookingId",milestone,"dueAt","cumulativeCents") VALUES(gen_random_uuid()::text,bid,'INITIAL',NULL,ceil(total*.3)),(gen_random_uuid()::text,bid,'DAY_60',s."departureTime"-interval '60 days',ceil(total*.5)),(gen_random_uuid()::text,bid,'DAY_45',s."departureTime"-interval '45 days',total);
 RETURN hathor_reservation_json(bid);
END $$;
CREATE FUNCTION hathor_submit_request(payload jsonb, attempt_key text) RETURNS jsonb LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE b "Booking"; br "BookingRoom"; bid text:=payload->>'bookingId';
BEGIN
 PERFORM hathor_expire_holds();
 SELECT * INTO b FROM "Booking" WHERE id=bid AND "idempotencyKey"=attempt_key AND "deletedAt" IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Booking attempt not found'; END IF;
 IF b.status IN ('REQUESTED','CONFIRMED') THEN RETURN jsonb_build_object('booking',hathor_reservation_json(bid),'replay',true); END IF;
 IF b.status<>'PENDING_HOLD' OR b."holdExpiresAt"<=clock_timestamp() THEN RAISE EXCEPTION USING ERRCODE='HB409',MESSAGE='Hold expired. Select rooms again.'; END IF;
 IF NOT EXISTS(SELECT 1 FROM "CruiseSchedule" s JOIN "Cruise" c ON c.id=s."cruiseId" WHERE s.id=b."cruiseScheduleId" AND s."isBookable" AND s."departureTime">clock_timestamp() AND c."deletedAt" IS NULL) THEN RAISE EXCEPTION USING ERRCODE='HB409',MESSAGE='Sailing is no longer open'; END IF;
 FOR br IN SELECT * FROM "BookingRoom" WHERE "bookingId"=bid LOOP
  IF (SELECT count(*) FROM jsonb_array_elements(payload->'passengers') p WHERE (p->>'roomIndex')::int=br."roomIndex" AND (p->>'isChild')::boolean)=br.children
   AND (SELECT count(*) FROM jsonb_array_elements(payload->'passengers') p WHERE (p->>'roomIndex')::int=br."roomIndex" AND NOT (p->>'isChild')::boolean)=br.adults THEN NULL;
  ELSE RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Passenger names must match every room'; END IF;
 END LOOP;
 IF jsonb_array_length(payload->'passengers')<>b."adultCount"+b."childCount" THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Passenger count does not match'; END IF;
 INSERT INTO "BookingGuest"(id,"bookingId","roomIndex","fullName","isChild") SELECT gen_random_uuid()::text,bid,(p->>'roomIndex')::int,p->>'fullName',(p->>'isChild')::boolean FROM jsonb_array_elements(payload->'passengers') p;
 UPDATE "Booking" SET status='REQUESTED',"requestedAt"=clock_timestamp(),"holdExpiresAt"=NULL,"firstName"=payload->>'firstName',"lastName"=payload->>'lastName',"customerName"=concat(payload->>'firstName',' ',payload->>'lastName'),"customerEmail"=payload->>'email',"customerPhone"=payload->>'phone',country=payload->>'country',"paymentMethod"=payload->>'paymentMethod',"specialRequests"=payload->>'specialRequests',"termsAcceptedAt"=clock_timestamp(),"marketingOptIn"=coalesce((payload->>'marketingOptIn')::boolean,false),"marketingOptInAt"=CASE WHEN (payload->>'marketingOptIn')::boolean THEN clock_timestamp() END,"updatedAt"=clock_timestamp() WHERE id=bid;
 RETURN jsonb_build_object('booking',hathor_reservation_json(bid),'replay',false);
END $$;
REVOKE ALL ON FUNCTION hathor_reservation_json(text),hathor_acquire_hold(text,jsonb,text,text),hathor_submit_request(jsonb,text) FROM PUBLIC,anon,authenticated;
