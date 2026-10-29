-- Card surcharge and a staff-set invoice split.
--
-- 1. A guest who chooses Visa / card pays a 2.5% online surcharge on top of the
--    cabin quote. The quote itself ("totalPriceCents") stays immutable and equal
--    to its lines; the surcharge is its own snapshot, taken when the request is
--    sent, so what the guest owes is quote + surcharge. Bank transfer adds none.
-- 2. When sending the first invoice the team may set the first payment and a
--    due date for the rest. That replaces the schedule with INITIAL + BALANCE,
--    and the booking is then confirmed once that first payment is recorded.
-- Both can change only while no payment has been recorded.

ALTER TABLE "Booking" ADD COLUMN "cardSurchargeCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_cardSurchargeCents_check"
  CHECK ("cardSurchargeCents" >= 0 AND ("cardSurchargeCents" = 0 OR "paymentMethod" = 'VISA'));

ALTER TABLE "BookingPaymentSchedule" DROP CONSTRAINT "BookingPaymentSchedule_milestone_check";
ALTER TABLE "BookingPaymentSchedule" ADD CONSTRAINT "BookingPaymentSchedule_milestone_check"
  CHECK (milestone IN ('INITIAL','DAY_60','DAY_45','BALANCE'));

-- What confirms a booking: the team's own first payment when they split the
-- invoice (INITIAL + BALANCE), otherwise the standard share of what is owed.
CREATE OR REPLACE FUNCTION hathor_required_payment(booking_id text, owed bigint, departure timestamp) RETURNS bigint
LANGUAGE sql STABLE SET search_path=public,pg_catalog AS $$
 SELECT coalesce(
  (SELECT s."cumulativeCents"::bigint FROM "BookingPaymentSchedule" s WHERE s."bookingId"=booking_id AND s.milestone='INITIAL'
    AND EXISTS(SELECT 1 FROM "BookingPaymentSchedule" x WHERE x."bookingId"=booking_id AND x.milestone='BALANCE')),
  ceil(owed::numeric * CASE WHEN departure::date-(clock_timestamp() AT TIME ZONE 'UTC')::date<=45 THEN 1
   WHEN departure::date-(clock_timestamp() AT TIME ZONE 'UTC')::date<=60 THEN 0.5 ELSE 0.3 END)::bigint)
$$;

-- Each stage carries the surcharge in proportion; the last stage is the whole amount owed.
CREATE OR REPLACE FUNCTION hathor_rescale_schedule(booking_id text, old_owed bigint, new_owed bigint) RETURNS void
LANGUAGE sql SET search_path=public,pg_catalog AS $$
 UPDATE "BookingPaymentSchedule" SET "cumulativeCents"=CASE WHEN "cumulativeCents">=old_owed THEN new_owed
  ELSE ceil("cumulativeCents"::numeric*new_owed/old_owed) END
 WHERE "bookingId"=booking_id AND old_owed>0;
$$;

REVOKE ALL ON FUNCTION hathor_required_payment(text,bigint,timestamp) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION hathor_rescale_schedule(text,bigint,bigint) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION hathor_payment_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE b "Booking"; paid bigint;
BEGIN
 PERFORM pg_advisory_xact_lock(734821901);
 IF TG_OP<>'INSERT' THEN RAISE EXCEPTION 'Payment entries are immutable; record an explicit refund'; END IF;
 SELECT * INTO b FROM "Booking" WHERE id=NEW."bookingId";
 IF b.status NOT IN ('REQUESTED','CONFIRMED','CANCELLED') OR NEW."receivedAt">clock_timestamp() THEN RAISE EXCEPTION 'Invalid payment'; END IF;
 SELECT coalesce(sum(CASE WHEN kind='REFUND' THEN -"amountCents" ELSE "amountCents" END),0) INTO paid FROM "BookingPayment" WHERE "bookingId"=b.id;
 IF NEW.kind='RECEIPT' AND (b.status='CANCELLED' OR paid+NEW."amountCents">b."totalPriceCents"+b."cardSurchargeCents") THEN RAISE EXCEPTION 'Invalid payment amount'; END IF;
 IF NEW.kind='REFUND' AND (b.status<>'CANCELLED' OR NEW."amountCents">greatest(0,paid-coalesce(b."cancellationFeeCents",b."totalPriceCents"))) THEN RAISE EXCEPTION 'Refund exceeds cancellation entitlement'; END IF;
 RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION hathor_booking_transition() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
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
  IF NEW."cardSurchargeCents" IS DISTINCT FROM OLD."cardSurchargeCents" AND EXISTS(SELECT 1 FROM "BookingPayment" WHERE "bookingId"=NEW.id)
  THEN RAISE EXCEPTION 'Card surcharge is fixed once a payment is recorded'; END IF;
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
 IF paid<0 OR paid>NEW."totalPriceCents"+NEW."cardSurchargeCents" THEN RAISE EXCEPTION 'Payment balance outside reservation total'; END IF;
 NEW."paymentStatus":=CASE WHEN paid=0 AND EXISTS(SELECT 1 FROM "BookingPayment" WHERE "bookingId"=NEW.id AND kind='REFUND') THEN 'REFUNDED'::"BookingPaymentStatus"
 WHEN paid>=NEW."totalPriceCents"+NEW."cardSurchargeCents" THEN 'PAID'::"BookingPaymentStatus"
 WHEN EXISTS(SELECT 1 FROM "BookingPayment" WHERE "bookingId"=NEW.id AND kind='REFUND') THEN 'PARTIALLY_REFUNDED'::"BookingPaymentStatus"
 WHEN paid>0 THEN 'PARTIALLY_PAID'::"BookingPaymentStatus" ELSE 'PENDING'::"BookingPaymentStatus" END;
 IF NEW.status='CONFIRMED' AND (TG_OP='INSERT' OR OLD.status<>'CONFIRMED') THEN
  SELECT "departureTime" INTO departure FROM "CruiseSchedule" WHERE id=NEW."cruiseScheduleId";
  required:=hathor_required_payment(NEW.id,NEW."totalPriceCents"+NEW."cardSurchargeCents",departure);
  IF NEW."acceptedAt" IS NULL OR paid<required THEN RAISE EXCEPTION 'Acceptance and required recorded payment are necessary'; END IF;
  NEW."confirmedAt":=clock_timestamp();
 END IF;
 RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION hathor_submit_request(payload jsonb, attempt_key text) RETURNS jsonb LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE b "Booking"; br "BookingRoom"; bid text:=payload->>'bookingId'; surcharge integer:=0;
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
 -- The guest saw this surcharge with the card choice; it is snapshotted with the request.
 IF payload->>'paymentMethod'='VISA' THEN surcharge:=round(coalesce(b."totalPriceCents",0)::numeric*0.025)::integer; END IF;
 INSERT INTO "BookingGuest"(id,"bookingId","roomIndex","fullName","isChild") SELECT gen_random_uuid()::text,bid,(p->>'roomIndex')::int,p->>'fullName',(p->>'isChild')::boolean FROM jsonb_array_elements(payload->'passengers') p;
 UPDATE "Booking" SET status='REQUESTED',"requestedAt"=clock_timestamp(),"holdExpiresAt"=NULL,"firstName"=payload->>'firstName',"lastName"=payload->>'lastName',"customerName"=concat(payload->>'firstName',' ',payload->>'lastName'),"customerEmail"=payload->>'email',"customerPhone"=payload->>'phone',country=payload->>'country',"paymentMethod"=payload->>'paymentMethod',"cardSurchargeCents"=surcharge,"specialRequests"=payload->>'specialRequests',"termsAcceptedAt"=clock_timestamp(),"marketingOptIn"=coalesce((payload->>'marketingOptIn')::boolean,false),"marketingOptInAt"=CASE WHEN (payload->>'marketingOptIn')::boolean THEN clock_timestamp() END,"updatedAt"=clock_timestamp() WHERE id=bid;
 IF surcharge>0 THEN PERFORM hathor_rescale_schedule(bid,b."totalPriceCents",b."totalPriceCents"+surcharge); END IF;
 RETURN jsonb_build_object('booking',hathor_reservation_json(bid),'replay',false);
END $$;

CREATE OR REPLACE FUNCTION hathor_administer_booking(booking_id text, action jsonb) RETURNS jsonb LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE b "Booking"; p "BookingPayment"; paid bigint; required bigint; departure timestamp; days integer; fee integer; payment jsonb:=action->'payment';
 owed bigint; surcharge integer; first_cents bigint; balance_due date;
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
  IF (action ? 'paymentMethod' OR action ? 'split') AND EXISTS(SELECT 1 FROM "BookingPayment" WHERE "bookingId"=b.id) THEN
   RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='The invoice amounts are fixed once a payment is recorded';
  END IF;
  owed:=b."totalPriceCents"+b."cardSurchargeCents";
  -- The payment method decides the surcharge: 2.5% of the quote for Visa / card, nothing for bank transfer.
  IF action ? 'paymentMethod' THEN
   IF coalesce(action->>'paymentMethod','') NOT IN ('VISA','BANK_TRANSFER') THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Invalid payment method'; END IF;
   surcharge:=CASE WHEN action->>'paymentMethod'='VISA' THEN round(b."totalPriceCents"::numeric*0.025)::integer ELSE 0 END;
   IF surcharge<>b."cardSurchargeCents" THEN PERFORM hathor_rescale_schedule(b.id,owed,b."totalPriceCents"+surcharge); END IF;
   UPDATE "Booking" SET "paymentMethod"=action->>'paymentMethod',"cardSurchargeCents"=surcharge WHERE id=b.id;
   owed:=b."totalPriceCents"+surcharge;
  END IF;
  -- The team's own split: this invoice, then everything else by one due date.
  IF action ? 'split' THEN
   first_cents:=(action->'split'->>'firstCents')::bigint;
   IF first_cents IS NULL OR first_cents<=0 OR first_cents>owed THEN
    RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='The first payment must be more than zero and no more than the booking total';
   END IF;
   DELETE FROM "BookingPaymentSchedule" WHERE "bookingId"=b.id;
   IF first_cents=owed THEN
    INSERT INTO "BookingPaymentSchedule"(id,"bookingId",milestone,"dueAt","cumulativeCents") VALUES(gen_random_uuid()::text,b.id,'INITIAL',NULL,owed);
   ELSE
    balance_due:=(action->'split'->>'balanceDueOn')::date;
    IF balance_due IS NULL OR balance_due<=(clock_timestamp() AT TIME ZONE 'UTC')::date OR balance_due>departure::date THEN
     RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='The remaining balance needs a due date after today and no later than departure';
    END IF;
    INSERT INTO "BookingPaymentSchedule"(id,"bookingId",milestone,"dueAt","cumulativeCents") VALUES
     (gen_random_uuid()::text,b.id,'INITIAL',NULL,first_cents),
     (gen_random_uuid()::text,b.id,'BALANCE',balance_due::timestamp,owed);
   END IF;
  END IF;
  UPDATE "Booking" SET "acceptedAt"=coalesce("acceptedAt",clock_timestamp()),"updatedAt"=clock_timestamp() WHERE id=b.id;
 ELSIF action->>'type'='record-payment' THEN
  SELECT * INTO p FROM "BookingPayment" WHERE reference=payment->>'reference';
  IF FOUND THEN
   IF p."bookingId"<>b.id OR p."amountCents"<>(payment->>'amountCents')::int OR p.method<>payment->>'method' OR p.kind<>payment->>'kind' OR p."receivedAt"<>(payment->>'receivedAt')::timestamptz AT TIME ZONE 'UTC' THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Payment reference already used for different details'; END IF;
   RETURN hathor_reservation_json(b.id);
  END IF;
  IF payment->>'kind'='REFUND' THEN
   SELECT coalesce(sum(CASE WHEN kind='RECEIPT' THEN "amountCents" ELSE -"amountCents" END),0) INTO paid FROM "BookingPayment" WHERE "bookingId"=b.id;
   IF (payment->>'amountCents')::int > paid THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Refund exceeds the amount actually received for this booking'; END IF;
  END IF;
  INSERT INTO "BookingPayment"(id,"bookingId",reference,method,kind,"amountCents","receivedAt","recordedBySession") VALUES(gen_random_uuid()::text,b.id,payment->>'reference',payment->>'method',payment->>'kind',(payment->>'amountCents')::int,(payment->>'receivedAt')::timestamptz AT TIME ZONE 'UTC',payment->>'recordedBySession');
 ELSE RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Invalid staff action'; END IF;
 SELECT * INTO b FROM "Booking" WHERE id=booking_id;
 SELECT coalesce(sum(CASE WHEN kind='RECEIPT' THEN "amountCents" ELSE -"amountCents" END),0) INTO paid FROM "BookingPayment" WHERE "bookingId"=b.id;
 required:=hathor_required_payment(b.id,b."totalPriceCents"+b."cardSurchargeCents",departure);
 IF b.status='REQUESTED' AND b."acceptedAt" IS NOT NULL AND paid>=required THEN UPDATE "Booking" SET status='CONFIRMED',"updatedAt"=clock_timestamp() WHERE id=b.id; END IF;
 RETURN hathor_reservation_json(b.id);
END $$;

REVOKE ALL ON FUNCTION hathor_administer_booking(text,jsonb) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION hathor_submit_request(jsonb,text) FROM PUBLIC,anon,authenticated;
