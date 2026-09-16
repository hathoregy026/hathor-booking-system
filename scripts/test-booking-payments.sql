BEGIN;
SET LOCAL idle_in_transaction_session_timeout='15s';
-- Step 4 payment lifecycle. Recorded payments are immutable by design, so every
-- synthetic booking, payment and allocation here is rolled back at the end.
DO $$
DECLARE
  s "CruiseSchedule"; hold jsonb; result jsonb; b "Booking";
  a_id text; b_id text; c_id text; total int; required int; days int;
  key_a text:=gen_random_uuid()::text; key_b text:=gen_random_uuid()::text; key_c text:=gen_random_uuid()::text;
  ref_a text:=gen_random_uuid()::text; ref_b text:=gen_random_uuid()::text; ref_rest text:=gen_random_uuid()::text;
  failed boolean; active_allocations int;
BEGIN
 BEGIN
  SELECT cs.* INTO STRICT s FROM "CruiseSchedule" cs JOIN "Cruise" c ON c.id=cs."cruiseId"
   WHERE cs."isBookable" AND cs."departureTime" > clock_timestamp() + interval '61 days'
   ORDER BY cs."departureTime" LIMIT 1;
  days := s."departureTime"::date - (clock_timestamp() AT TIME ZONE 'UTC')::date;

  -- Three submitted requests: A accepted first, B paid first, C for the decline.

  hold := hathor_acquire_hold(s.id,'[{"roomType":"Luxury King Cabin","adults":1,"children":0}]'::jsonb,'qa-step4-sql-'||key_a,'qa-step4-fp-a');
  a_id := hold->>'id'; total := (hold->>'totalPriceCents')::int;
  required := ceil(total::numeric * CASE WHEN days<=45 THEN 1 WHEN days<=60 THEN .5 ELSE .3 END);
  PERFORM hathor_submit_request(jsonb_build_object('bookingId',a_id,'firstName','QA','lastName','Payments','email','qa-step4@example.invalid',
    'phone','+201234567890','country','Egypt','paymentMethod','BANK_TRANSFER','specialRequests','Synthetic Step 4 payment test','marketingOptIn',false,
    'passengers',jsonb_build_array(jsonb_build_object('roomIndex',0,'fullName','QA Adult','isChild',false))),'qa-step4-sql-'||key_a);

  hold := hathor_acquire_hold(s.id,'[{"roomType":"Luxury King Cabin","adults":1,"children":0}]'::jsonb,'qa-step4-sql-'||key_b,'qa-step4-fp-b');
  b_id := hold->>'id';
  PERFORM hathor_submit_request(jsonb_build_object('bookingId',b_id,'firstName','QA','lastName','Payments','email','qa-step4@example.invalid',
    'phone','+201234567890','country','Egypt','paymentMethod','VISA','specialRequests','Synthetic Step 4 payment test','marketingOptIn',false,
    'passengers',jsonb_build_array(jsonb_build_object('roomIndex',0,'fullName','QA Adult','isChild',false))),'qa-step4-sql-'||key_b);

  hold := hathor_acquire_hold(s.id,'[{"roomType":"Luxury King Cabin","adults":1,"children":0}]'::jsonb,'qa-step4-sql-'||key_c,'qa-step4-fp-c');
  c_id := hold->>'id';
  PERFORM hathor_submit_request(jsonb_build_object('bookingId',c_id,'firstName','QA','lastName','Declined','email','qa-step4@example.invalid',
    'phone','+201234567890','country','Egypt','paymentMethod','BANK_TRANSFER','specialRequests','Synthetic Step 4 decline test','marketingOptIn',false,
    'passengers',jsonb_build_array(jsonb_build_object('roomIndex',0,'fullName','QA Adult','isChild',false))),'qa-step4-sql-'||key_c);

  -- 8. Acceptance without payment must not confirm.
  IF (hathor_administer_booking(a_id,'{"type":"accept"}'::jsonb)->>'status')<>'REQUESTED'
   THEN RAISE EXCEPTION 'CHECK 8: acceptance without payment confirmed the booking'; END IF;
  SELECT * INTO b FROM "Booking" WHERE id=a_id;
  IF b."acceptedAt" IS NULL THEN RAISE EXCEPTION 'CHECK 8: acceptance was not recorded'; END IF;
  RAISE NOTICE 'PASS 8. acceptance alone does not confirm';

  -- 9. Payment without acceptance must not confirm.
  result := hathor_administer_booking(b_id, jsonb_build_object('type','record-payment','payment',
    jsonb_build_object('reference',ref_b,'method','VISA','kind','RECEIPT','amountCents',required,
      'receivedAt',to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'),'recordedBySession','qa-session')));
  IF (result->>'status')<>'REQUESTED' THEN RAISE EXCEPTION 'CHECK 9: payment without acceptance confirmed the booking'; END IF;
  IF (result->>'paymentStatus')<>'PARTIALLY_PAID' THEN RAISE EXCEPTION 'CHECK 9: payment state is %',result->>'paymentStatus'; END IF;
  IF (SELECT "recordedBySession" FROM "BookingPayment" WHERE reference=ref_b)<>'qa-session'
   THEN RAISE EXCEPTION 'CHECK 9: staff session was not stored'; END IF;
  IF (SELECT currency FROM "BookingPayment" WHERE reference=ref_b)<>'USD'
   THEN RAISE EXCEPTION 'CHECK 9: currency was not stored'; END IF;
  RAISE NOTICE 'PASS 9. recorded payment without acceptance does not confirm, and carries reference, currency, method and staff session';

  -- 10. Acceptance plus the required payment confirms, from either order.
  result := hathor_administer_booking(a_id, jsonb_build_object('type','record-payment','payment',
    jsonb_build_object('reference',ref_a,'method','BANK_TRANSFER','kind','RECEIPT','amountCents',required,
      'receivedAt',to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'),'recordedBySession','qa-session')));
  IF (result->>'status')<>'CONFIRMED' THEN RAISE EXCEPTION 'CHECK 10: accepted booking with required payment did not confirm'; END IF;
  IF (result->>'confirmedAt') IS NULL THEN RAISE EXCEPTION 'CHECK 10: confirmation time missing'; END IF;
  IF (hathor_administer_booking(b_id,'{"type":"accept"}'::jsonb)->>'status')<>'CONFIRMED'
   THEN RAISE EXCEPTION 'CHECK 10: paid booking did not confirm on acceptance'; END IF;
  RAISE NOTICE 'PASS 10. acceptance plus the required payment confirms, in either order';

  -- 11. A reference cannot be recorded twice.
  failed:=false;
  BEGIN
   PERFORM hathor_administer_booking(a_id, jsonb_build_object('type','record-payment','payment',
     jsonb_build_object('reference',ref_a,'method','BANK_TRANSFER','kind','RECEIPT','amountCents',required+100,
       'receivedAt',to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'))));
  EXCEPTION WHEN SQLSTATE 'HB400' OR raise_exception OR unique_violation THEN failed:=true;
  END;
  IF NOT failed THEN RAISE EXCEPTION 'CHECK 11: a duplicate reference with different details was accepted'; END IF;
  PERFORM hathor_administer_booking(a_id, jsonb_build_object('type','record-payment','payment',
    jsonb_build_object('reference',ref_a,'method','BANK_TRANSFER','kind','RECEIPT','amountCents',required,
      'receivedAt',to_char((SELECT "receivedAt" FROM "BookingPayment" WHERE reference=ref_a) AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'))));
  IF (SELECT count(*) FROM "BookingPayment" WHERE reference=ref_a)<>1
   THEN RAISE EXCEPTION 'CHECK 11: repeating the same entry created a second payment'; END IF;
  RAISE NOTICE 'PASS 11. a duplicate payment reference is rejected and an identical retry stays one entry';

  -- 12. Paying the balance moves the booking to fully paid; overpaying is refused.
  result := hathor_administer_booking(a_id, jsonb_build_object('type','record-payment','payment',
    jsonb_build_object('reference',ref_rest,'method','BANK_TRANSFER','kind','RECEIPT','amountCents',total-required,
      'receivedAt',to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'))));
  IF (result->>'paymentStatus')<>'PAID' THEN RAISE EXCEPTION 'CHECK 12: full payment left state %',result->>'paymentStatus'; END IF;
  IF (result->>'status')<>'CONFIRMED' THEN RAISE EXCEPTION 'CHECK 12: full payment changed the booking state'; END IF;
  failed:=false;
  BEGIN
   PERFORM hathor_administer_booking(a_id, jsonb_build_object('type','record-payment','payment',
     jsonb_build_object('reference',gen_random_uuid()::text,'method','BANK_TRANSFER','kind','RECEIPT','amountCents',1,
       'receivedAt',to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'))));
  EXCEPTION WHEN raise_exception THEN failed:=true;
  END;
  IF NOT failed THEN RAISE EXCEPTION 'CHECK 12: a payment beyond the booking total was accepted'; END IF;
  RAISE NOTICE 'PASS 12. the balance completes the booking as PAID and overpayment is refused';

  -- 14a. A declined request releases its cabin with no cancellation fee.
  result := hathor_administer_booking(c_id,'{"type":"decline"}'::jsonb);
  IF (result->>'status')<>'CANCELLED' THEN RAISE EXCEPTION 'CHECK 14: decline did not cancel the request'; END IF;
  IF (result->>'cancellationReason')<>'HATHOR_DECLINED' THEN RAISE EXCEPTION 'CHECK 14: decline reason missing'; END IF;
  IF (result->>'cancellationFeeCents')::int<>0 THEN RAISE EXCEPTION 'CHECK 14: a declined request was charged a fee'; END IF;
  SELECT count(*) INTO active_allocations FROM "InventoryAllocation" a
   JOIN "BookingRoom" br ON br.id=a."bookingRoomId" WHERE br."bookingId"=c_id AND a.active;
  IF active_allocations<>0 THEN RAISE EXCEPTION 'CHECK 14: declined request still holds inventory'; END IF;

  -- 14b. A cancelled confirmed booking also releases its cabin, and a refund
  -- stays inside the cancellation entitlement.
  result := hathor_administer_booking(b_id,'{"type":"cancel","reason":"CANCELLATION"}'::jsonb);
  IF (result->>'status')<>'CANCELLED' THEN RAISE EXCEPTION 'CHECK 14: cancel did not cancel the booking'; END IF;
  SELECT count(*) INTO active_allocations FROM "InventoryAllocation" a
   JOIN "BookingRoom" br ON br.id=a."bookingRoomId" WHERE br."bookingId"=b_id AND a.active;
  IF active_allocations<>0 THEN RAISE EXCEPTION 'CHECK 14: cancelled booking still holds inventory'; END IF;
  failed:=false;
  BEGIN
   PERFORM hathor_administer_booking(b_id, jsonb_build_object('type','record-payment','payment',
     jsonb_build_object('reference',gen_random_uuid()::text,'method','VISA','kind','REFUND','amountCents',total,
       'receivedAt',to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'))));
  EXCEPTION WHEN raise_exception THEN failed:=true;
  END;
  IF NOT failed THEN RAISE EXCEPTION 'CHECK 14: a refund beyond the cancellation entitlement was accepted'; END IF;
  RAISE NOTICE 'PASS 14. declined and cancelled bookings release their cabins, and refunds stay within the policy';

  RAISE EXCEPTION USING ERRCODE='ZQ004',MESSAGE='all payment checks passed; rolling back synthetic records';
 EXCEPTION WHEN SQLSTATE 'ZQ004' THEN
  RAISE NOTICE 'PAYMENT LIFECYCLE CHECKS PASSED; synthetic records rolled back';
 END;
END $$;
ROLLBACK;
