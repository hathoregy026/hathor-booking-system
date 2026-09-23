-- A rate belongs to one actual departure and one accommodation ticket type.
-- Existing TicketType prices remain the fallback for dates with no override.
CREATE TABLE "SailingPrice" (
  "cruiseScheduleId" text NOT NULL REFERENCES "CruiseSchedule"(id) ON DELETE CASCADE,
  "ticketTypeId" text NOT NULL REFERENCES "TicketType"(id) ON DELETE CASCADE,
  "priceCents" integer NOT NULL CHECK ("priceCents" BETWEEN 100 AND 100000000),
  "updatedAt" timestamp(3) NOT NULL DEFAULT now(),
  PRIMARY KEY ("cruiseScheduleId", "ticketTypeId")
);
CREATE INDEX "SailingPrice_ticketTypeId_idx" ON "SailingPrice"("ticketTypeId");
ALTER TABLE "SailingPrice" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "SailingPrice" FROM PUBLIC, anon, authenticated;

CREATE FUNCTION hathor_validate_sailing_price() RETURNS trigger
LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "CruiseSchedule" s
    JOIN "TicketType" t ON t."cruiseId" = s."cruiseId"
    WHERE s.id = NEW."cruiseScheduleId" AND t.id = NEW."ticketTypeId"
  ) THEN
    RAISE EXCEPTION 'Sailing rate must match its voyage';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER hathor_sailing_price_guard
BEFORE INSERT OR UPDATE ON "SailingPrice"
FOR EACH ROW EXECUTE FUNCTION hathor_validate_sailing_price();

CREATE FUNCTION hathor_sailing_price(sailing_id text, room_type text) RETURNS integer
LANGUAGE sql STABLE SET search_path=public,pg_catalog AS $$
  SELECT COALESCE(p."priceCents", t."priceCents")
  FROM "CruiseSchedule" s
  JOIN "TicketType" t ON t."cruiseId" = s."cruiseId" AND t."roomType" = room_type
  LEFT JOIN "SailingPrice" p ON p."cruiseScheduleId" = s.id AND p."ticketTypeId" = t.id
  WHERE s.id = sailing_id
$$;
REVOKE ALL ON FUNCTION hathor_validate_sailing_price(),
  hathor_sailing_price(text,text) FROM PUBLIC, anon, authenticated;

-- Use the same selected-date rate when taking the hold, validating the
-- allocated cabin, and snapshotting BookingTicket. Older bookings are untouched.
CREATE OR REPLACE FUNCTION hathor_allocate_booking_room() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
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
 SELECT hathor_sailing_price(s.id, r."roomType") INTO price;
 IF price IS NULL OR NEW."unitPriceCents" IS DISTINCT FROM price THEN RAISE EXCEPTION 'Invalid room price'; END IF;
 INSERT INTO "InventoryAllocation"("roomId","bookingRoomId","startsAt","endsAt",state,"expiresAt")
 VALUES(r.id,NEW.id,s."departureTime",s."arrivalTime",'HELD',b."holdExpiresAt");
 RETURN NEW;
END $$;

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
  SELECT hathor_sailing_price(s.id, item->>'roomType') INTO price;
  IF price IS NULL OR price<=0 THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='No valid room rate configured'; END IF;
  selections:=selections||jsonb_build_array(item||jsonb_build_object('roomId',room_id,'price',price));
  total:=total+price; adults:=adults+(item->>'adults')::int; children:=children+(item->>'children')::int;
 END LOOP;
 INSERT INTO "Booking"(id,"cruiseScheduleId","idempotencyKey","requestFingerprint","holdExpiresAt","adultCount","childCount","totalPriceCents","priceSnapshotAt","updatedAt") VALUES(bid,s.id,attempt_key,fingerprint,clock_timestamp()+interval '15 minutes',adults,children,total,clock_timestamp(),clock_timestamp());
 FOR item IN SELECT value FROM jsonb_array_elements(selections) LOOP
  INSERT INTO "BookingRoom"(id,"bookingId","roomId","cruiseScheduleId","unitPriceCents",adults,children,"roomIndex") VALUES(gen_random_uuid()::text,bid,item->>'roomId',s.id,(item->>'price')::int,(item->>'adults')::int,(item->>'children')::int,idx);idx:=idx+1;
 END LOOP;
 INSERT INTO "BookingTicket"(id,"bookingId","ticketTypeId",quantity,"unitPriceCents","updatedAt")
 SELECT gen_random_uuid()::text,bid,t.id,count(*)::int,max((x->>'price')::int),clock_timestamp()
 FROM jsonb_array_elements(selections) x
 JOIN "TicketType" t ON t."cruiseId"=s."cruiseId" AND t."roomType"=x->>'roomType'
 GROUP BY t.id;
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

REVOKE ALL ON FUNCTION hathor_acquire_hold(text,jsonb,text,text),
  hathor_allocate_booking_room() FROM PUBLIC, anon, authenticated;

-- Migration prepares weekly sailings through 2029 now. A yearly January job
-- adds the next three-year block in 2029, 2032, etc. It does not recreate
-- sailings removed later by staff during the rest of the year.
CREATE FUNCTION hathor_extend_weekly_sailings(today date, horizon_year integer, start_date date) RETURNS integer
LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE inserted_count integer;
BEGIN
  IF horizon_year < 2029 OR horizon_year > extract(year FROM today)::integer + 4 THEN
    RAISE EXCEPTION 'Invalid calendar horizon';
  END IF;
  IF start_date < today + 1 OR start_date > make_date(horizon_year, 12, 31) THEN
    RAISE EXCEPTION 'Invalid extension start';
  END IF;
  WITH candidates AS (
    SELECT c.id AS "cruiseId", d.day::timestamp AS "departureTime",
      d.day::timestamp + make_interval(days => itinerary.nights) AS "arrivalTime"
    FROM "Cruise" c
    JOIN (VALUES
      ('3-nights-aswan-luxor', 3, 3),
      ('4-nights-luxor-aswan', 4, 6),
      ('7-nights-luxor-aswan-luxor', 7, 6)
    ) AS itinerary(slug, nights, weekday) ON itinerary.slug = c.slug
    CROSS JOIN generate_series(start_date::timestamp, make_date(horizon_year, 12, 31)::timestamp, interval '1 day') AS d(day)
    WHERE c."deletedAt" IS NULL AND extract(dow FROM d.day) = itinerary.weekday
      AND EXISTS (
        SELECT 1 FROM "_CruiseRooms" cr
        JOIN "Room" r ON r.id = cr."B" AND r."deletedAt" IS NULL
        WHERE cr."A" = c.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM "CruiseSchedule" s
        WHERE s."cruiseId" = c.id AND s."departureTime" >= d.day::timestamp
          AND s."departureTime" < d.day::timestamp + interval '1 day'
      )
  ), inserted AS (
    INSERT INTO "CruiseSchedule"
      (id, "cruiseId", "departureTime", "arrivalTime", "isBookable", "updatedAt")
    SELECT gen_random_uuid()::text, "cruiseId", "departureTime", "arrivalTime", true, clock_timestamp()
    FROM candidates ON CONFLICT DO NOTHING RETURNING id
  )
  SELECT count(*)::integer INTO inserted_count FROM inserted;
  RETURN inserted_count;
END $$;
REVOKE ALL ON FUNCTION hathor_extend_weekly_sailings(date,integer,date) FROM PUBLIC, anon, authenticated;

SELECT hathor_extend_weekly_sailings(
  (clock_timestamp() AT TIME ZONE 'UTC')::date,
  CASE WHEN extract(year FROM clock_timestamp() AT TIME ZONE 'UTC')::integer < 2029
    THEN 2029
    ELSE 2029 + 3 * (floor((extract(year FROM clock_timestamp() AT TIME ZONE 'UTC')::integer - 2029) / 3.0)::integer + 1)
  END,
  (clock_timestamp() AT TIME ZONE 'UTC')::date + 1
);
