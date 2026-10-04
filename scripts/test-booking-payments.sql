BEGIN;
SET LOCAL idle_in_transaction_session_timeout='15s';
-- Step 4 payment lifecycle. Recorded payments are immutable by design, so every
-- synthetic booking, payment and allocation here is rolled back at the end.
DO $$
DECLARE
  s "CruiseSchedule"; hold jsonb; result jsonb; b "Booking";
  a_id text; b_id text; c_id text; d_id text; e_id text; f_id text; total int; required int; days int;
  owed_b int; required_b int; first_cents int; balance_due date;
  key_a text:=gen_random_uuid()::text; key_b text:=gen_random_uuid()::text; key_c text:=gen_random_uuid()::text;
  key_d text:=gen_random_uuid()::text; key_e text:=gen_random_uuid()::text; key_f text:=gen_random_uuid()::text;
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

  -- 15. A Visa request owes the quote plus a 2.5% card surcharge, snapshotted
  -- with the request; each stage carries it in proportion. Bank transfer adds none.
  owed_b := total + round(total*0.025);
  required_b := ceil(owed_b::numeric * CASE WHEN days<=45 THEN 1 WHEN days<=60 THEN .5 ELSE .3 END);
  SELECT * INTO b FROM "Booking" WHERE id=b_id;
  IF b."totalPriceCents"<>total THEN RAISE EXCEPTION 'CHECK 15: the quote itself changed'; END IF;
  IF b."cardSurchargeCents"<>owed_b-total THEN RAISE EXCEPTION 'CHECK 15: Visa surcharge is %',b."cardSurchargeCents"; END IF;
  IF (SELECT "cardSurchargeCents" FROM "Booking" WHERE id=a_id)<>0 THEN RAISE EXCEPTION 'CHECK 15: bank transfer carries a surcharge'; END IF;
  IF (SELECT max("cumulativeCents") FROM "BookingPaymentSchedule" WHERE "bookingId"=b_id)<>owed_b
   THEN RAISE EXCEPTION 'CHECK 15: Visa schedule does not end at quote plus surcharge'; END IF;
  IF (SELECT "cumulativeCents" FROM "BookingPaymentSchedule" WHERE "bookingId"=b_id AND milestone='INITIAL')<>ceil(ceil(total*.3)::numeric*owed_b/total)
   THEN RAISE EXCEPTION 'CHECK 15: Visa deposit does not carry its share of the surcharge'; END IF;
  IF (SELECT max("cumulativeCents") FROM "BookingPaymentSchedule" WHERE "bookingId"=a_id)<>total
   THEN RAISE EXCEPTION 'CHECK 15: bank transfer schedule changed'; END IF;
  RAISE NOTICE 'PASS 15. a Visa request owes the quote plus the 2.5%% card surcharge; bank transfer adds none';

  -- 8. Acceptance without payment must not confirm.
  IF (hathor_administer_booking(a_id,'{"type":"accept"}'::jsonb)->>'status')<>'REQUESTED'
   THEN RAISE EXCEPTION 'CHECK 8: acceptance without payment confirmed the booking'; END IF;
  SELECT * INTO b FROM "Booking" WHERE id=a_id;
  IF b."acceptedAt" IS NULL THEN RAISE EXCEPTION 'CHECK 8: acceptance was not recorded'; END IF;
  RAISE NOTICE 'PASS 8. acceptance alone does not confirm';

  -- 9. Payment without acceptance must not confirm.
  result := hathor_administer_booking(b_id, jsonb_build_object('type','record-payment','payment',
    jsonb_build_object('reference',ref_b,'method','VISA','kind','RECEIPT','amountCents',required_b,
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
  EXCEPTION WHEN SQLSTATE 'HB400' OR raise_exception THEN failed:=true;
  END;
  IF NOT failed THEN RAISE EXCEPTION 'CHECK 14: a refund beyond the cancellation entitlement was accepted'; END IF;
  RAISE NOTICE 'PASS 14. declined and cancelled bookings release their cabins, and refunds stay within the policy';

  -- 16. A Visa booking is paid in full at quote plus surcharge, and never beyond.
  hold := hathor_acquire_hold(s.id,'[{"roomType":"Luxury King Cabin","adults":1,"children":0}]'::jsonb,'qa-step4-sql-'||key_d,'qa-step4-fp-d');
  d_id := hold->>'id';
  PERFORM hathor_submit_request(jsonb_build_object('bookingId',d_id,'firstName','QA','lastName','Card','email','qa-step4@example.invalid',
    'phone','+201234567890','country','Egypt','paymentMethod','VISA','specialRequests','Synthetic surcharge test','marketingOptIn',false,
    'passengers',jsonb_build_array(jsonb_build_object('roomIndex',0,'fullName','QA Adult','isChild',false))),'qa-step4-sql-'||key_d);
  PERFORM hathor_administer_booking(d_id,'{"type":"accept"}'::jsonb);
  result := hathor_administer_booking(d_id, jsonb_build_object('type','record-payment','payment',
    jsonb_build_object('reference',gen_random_uuid()::text,'method','VISA','kind','RECEIPT','amountCents',owed_b,
      'receivedAt',to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'))));
  IF (result->>'status')<>'CONFIRMED' OR (result->>'paymentStatus')<>'PAID' THEN RAISE EXCEPTION 'CHECK 16: paying quote plus surcharge left % / %',result->>'status',result->>'paymentStatus'; END IF;
  failed:=false;
  BEGIN
   PERFORM hathor_administer_booking(d_id, jsonb_build_object('type','record-payment','payment',
     jsonb_build_object('reference',gen_random_uuid()::text,'method','VISA','kind','RECEIPT','amountCents',1,
       'receivedAt',to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'))));
  EXCEPTION WHEN raise_exception THEN failed:=true;
  END;
  IF NOT failed THEN RAISE EXCEPTION 'CHECK 16: a payment beyond quote plus surcharge was accepted'; END IF;
  RAISE NOTICE 'PASS 16. a Visa booking is paid in full at quote plus surcharge, and overpayment is refused';

  -- 17. Before any payment the team may change the method; the surcharge follows it.
  hold := hathor_acquire_hold(s.id,'[{"roomType":"Luxury King Cabin","adults":1,"children":0}]'::jsonb,'qa-step4-sql-'||key_e,'qa-step4-fp-e');
  e_id := hold->>'id';
  PERFORM hathor_submit_request(jsonb_build_object('bookingId',e_id,'firstName','QA','lastName','Switch','email','qa-step4@example.invalid',
    'phone','+201234567890','country','Egypt','paymentMethod','VISA','specialRequests','Synthetic method switch test','marketingOptIn',false,
    'passengers',jsonb_build_array(jsonb_build_object('roomIndex',0,'fullName','QA Adult','isChild',false))),'qa-step4-sql-'||key_e);
  result := hathor_administer_booking(e_id,'{"type":"accept","paymentMethod":"BANK_TRANSFER"}'::jsonb);
  IF (result->>'cardSurchargeCents')::int<>0 OR (result->>'paymentMethod')<>'BANK_TRANSFER' OR (result->>'acceptedAt') IS NULL
   THEN RAISE EXCEPTION 'CHECK 17: switching to bank transfer kept the surcharge'; END IF;
  IF (SELECT max("cumulativeCents") FROM "BookingPaymentSchedule" WHERE "bookingId"=e_id)<>total
   OR (SELECT "cumulativeCents" FROM "BookingPaymentSchedule" WHERE "bookingId"=e_id AND milestone='INITIAL')<>ceil(total*.3)
   THEN RAISE EXCEPTION 'CHECK 17: bank transfer schedule still carries the surcharge'; END IF;
  result := hathor_administer_booking(e_id,'{"type":"accept","paymentMethod":"VISA"}'::jsonb);
  IF (result->>'cardSurchargeCents')::int<>owed_b-total OR (SELECT max("cumulativeCents") FROM "BookingPaymentSchedule" WHERE "bookingId"=e_id)<>owed_b
   THEN RAISE EXCEPTION 'CHECK 17: switching back to Visa did not restore the surcharge'; END IF;
  RAISE NOTICE 'PASS 17. before any payment the method can change and the surcharge follows it';

  -- 18. The team's own split: this invoice, then the rest by one date. The
  -- booking confirms once that first payment is recorded, even below 30%%.
  first_cents := ceil(owed_b*0.2);
  balance_due := s."departureTime"::date - 50;
  FOR result IN SELECT x FROM jsonb_array_elements(jsonb_build_array(
    jsonb_build_object('firstCents',owed_b+1,'balanceDueOn',balance_due),
    jsonb_build_object('firstCents',0,'balanceDueOn',balance_due),
    jsonb_build_object('firstCents',first_cents),
    jsonb_build_object('firstCents',first_cents,'balanceDueOn',(clock_timestamp() AT TIME ZONE 'UTC')::date),
    jsonb_build_object('firstCents',first_cents,'balanceDueOn',s."departureTime"::date+1))) x LOOP
   failed:=false;
   BEGIN
    PERFORM hathor_administer_booking(e_id, jsonb_build_object('type','accept','split',result));
   EXCEPTION WHEN SQLSTATE 'HB400' THEN failed:=true;
   END;
   IF NOT failed THEN RAISE EXCEPTION 'CHECK 18: an invalid split was accepted: %',result; END IF;
  END LOOP;
  result := hathor_administer_booking(e_id, jsonb_build_object('type','accept','split',jsonb_build_object('firstCents',first_cents,'balanceDueOn',balance_due)));
  IF (result->>'status')<>'REQUESTED' THEN RAISE EXCEPTION 'CHECK 18: a split confirmed the booking without payment'; END IF;
  IF (SELECT count(*) FROM "BookingPaymentSchedule" WHERE "bookingId"=e_id)<>2
   OR (SELECT "cumulativeCents" FROM "BookingPaymentSchedule" WHERE "bookingId"=e_id AND milestone='INITIAL')<>first_cents
   OR (SELECT "cumulativeCents" FROM "BookingPaymentSchedule" WHERE "bookingId"=e_id AND milestone='BALANCE')<>owed_b
   OR (SELECT "dueAt"::date FROM "BookingPaymentSchedule" WHERE "bookingId"=e_id AND milestone='BALANCE')<>balance_due
   THEN RAISE EXCEPTION 'CHECK 18: the split was not stored as the schedule'; END IF;
  result := hathor_administer_booking(e_id, jsonb_build_object('type','record-payment','payment',
    jsonb_build_object('reference',gen_random_uuid()::text,'method','VISA','kind','RECEIPT','amountCents',first_cents,
      'receivedAt',to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'))));
  IF (result->>'status')<>'CONFIRMED' THEN RAISE EXCEPTION 'CHECK 18: paying the team''s first payment did not confirm'; END IF;
  FOR result IN SELECT x FROM jsonb_array_elements('[{"type":"accept","paymentMethod":"BANK_TRANSFER"},{"type":"accept","split":{"firstCents":100}}]'::jsonb) x LOOP
   failed:=false;
   BEGIN
    PERFORM hathor_administer_booking(e_id, result);
   EXCEPTION WHEN SQLSTATE 'HB400' THEN failed:=true;
   END;
   IF NOT failed THEN RAISE EXCEPTION 'CHECK 18: invoice amounts changed after a payment: %',result; END IF;
  END LOOP;
  IF (hathor_administer_booking(e_id,'{"type":"accept"}'::jsonb)->>'status')<>'CONFIRMED' THEN RAISE EXCEPTION 'CHECK 18: resending the invoice failed'; END IF;
  RAISE NOTICE 'PASS 18. the team''s first payment and balance date become the schedule, and confirm the booking';

  -- 19. A one-payment split is the whole amount in a single stage.
  hold := hathor_acquire_hold(s.id,'[{"roomType":"Luxury King Cabin","adults":1,"children":0}]'::jsonb,'qa-step4-sql-'||key_f,'qa-step4-fp-f');
  f_id := hold->>'id';
  PERFORM hathor_submit_request(jsonb_build_object('bookingId',f_id,'firstName','QA','lastName','Whole','email','qa-step4@example.invalid',
    'phone','+201234567890','country','Egypt','paymentMethod','BANK_TRANSFER','specialRequests','Synthetic full split test','marketingOptIn',false,
    'passengers',jsonb_build_array(jsonb_build_object('roomIndex',0,'fullName','QA Adult','isChild',false))),'qa-step4-sql-'||key_f);
  PERFORM hathor_administer_booking(f_id, jsonb_build_object('type','accept','split',jsonb_build_object('firstCents',total)));
  IF (SELECT count(*) FROM "BookingPaymentSchedule" WHERE "bookingId"=f_id)<>1
   OR (SELECT "cumulativeCents" FROM "BookingPaymentSchedule" WHERE "bookingId"=f_id AND milestone='INITIAL')<>total
   THEN RAISE EXCEPTION 'CHECK 19: a one-payment split is not a single stage'; END IF;
  RAISE NOTICE 'PASS 19. a one-payment split asks for the whole amount at once';

  RAISE EXCEPTION USING ERRCODE='ZQ004',MESSAGE='all payment checks passed; rolling back synthetic records';
 EXCEPTION WHEN SQLSTATE 'ZQ004' THEN
  RAISE NOTICE 'PAYMENT LIFECYCLE CHECKS PASSED; synthetic records rolled back';
 END;
END $$;
ROLLBACK;
