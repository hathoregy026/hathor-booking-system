-- Staff control of what a guest pays, and sales made through Availability.
--
-- 1. The team can replace a booking's payment plan at any time before it is
--    cancelled: pay in full, the standard schedule, or their own payments with
--    their own names and dates. "set-plan" in hathor_administer_booking is the
--    only way in; every change is kept in "BookingPlanChange".
-- 2. A saved plan decides what confirms the booking: its first payment.
-- 3. The plan may change what the guest owes. The quote stays equal to its
--    cabin lines (hathor_booking_integrity), so the lines move with it, and the
--    "quote is immutable" guard opens only inside that one step.
-- 4. A cabin closed for a sale made outside the website can carry that sale's
--    guest and money in "ClosureBooking", keyed by the closure's block.

CREATE TABLE "BookingPlanChange" (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "bookingId" text NOT NULL REFERENCES "Booking"(id) ON DELETE CASCADE,
  "previousTotalCents" integer NOT NULL,
  "totalCents" integer NOT NULL,
  reason text,
  schedule jsonb NOT NULL,
  "recordedBySession" text,
  "createdAt" timestamp(3) NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX "BookingPlanChange_bookingId_idx" ON "BookingPlanChange"("bookingId");

CREATE TABLE "ClosureBooking" (
  "blockKey" text PRIMARY KEY,
  "guestName" text NOT NULL CHECK (length(trim("guestName")) > 0),
  source text NOT NULL,
  "customerEmail" text,
  "customerPhone" text,
  "totalPriceCents" integer NOT NULL CHECK ("totalPriceCents" > 0),
  "receivedCents" integer NOT NULL DEFAULT 0 CHECK ("receivedCents" >= 0 AND "receivedCents" <= "totalPriceCents"),
  "updatedBySession" text,
  "createdAt" timestamp(3) NOT NULL DEFAULT clock_timestamp(),
  "updatedAt" timestamp(3) NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE "BookingPlanChange" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClosureBooking" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "BookingPlanChange" FROM anon, authenticated;
REVOKE ALL ON TABLE "ClosureBooking" FROM anon, authenticated;

-- Staff name their own payments, so a milestone is no longer a fixed list.
ALTER TABLE "BookingPaymentSchedule" DROP CONSTRAINT "BookingPaymentSchedule_milestone_check";
ALTER TABLE "BookingPaymentSchedule" ADD CONSTRAINT "BookingPaymentSchedule_milestone_check"
  CHECK (length(trim(milestone)) BETWEEN 1 AND 80);

-- What confirms a booking: the first payment of a plan the team set, otherwise
-- the standard share of what is owed.
CREATE OR REPLACE FUNCTION hathor_required_payment(booking_id text, owed bigint, departure timestamp) RETURNS bigint
LANGUAGE sql STABLE SET search_path=public,pg_catalog AS $$
 SELECT coalesce(
  (SELECT min(s."cumulativeCents")::bigint FROM "BookingPaymentSchedule" s WHERE s."bookingId"=booking_id
    AND (EXISTS(SELECT 1 FROM "BookingPlanChange" c WHERE c."bookingId"=booking_id)
     OR EXISTS(SELECT 1 FROM "BookingPaymentSchedule" x WHERE x."bookingId"=booking_id AND x.milestone='BALANCE'))),
  ceil(owed::numeric * CASE WHEN departure::date-(clock_timestamp() AT TIME ZONE 'UTC')::date<=45 THEN 1
   WHEN departure::date-(clock_timestamp() AT TIME ZONE 'UTC')::date<=60 THEN 0.5 ELSE 0.3 END)::bigint)
$$;

CREATE OR REPLACE FUNCTION hathor_booking_transition() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE paid bigint; required bigint; departure timestamp;
BEGIN
 PERFORM pg_advisory_xact_lock(734821901);
 IF TG_OP='INSERT' THEN
  IF NEW.status<>'PENDING_HOLD' OR NEW."holdExpiresAt" IS NULL OR NEW."holdExpiresAt"<=clock_timestamp()
  OR NEW."acceptedAt" IS NOT NULL THEN RAISE EXCEPTION 'Booking must start as a temporary hold'; END IF;
 ELSE
  IF (NEW.currency,NEW."cruiseScheduleId",NEW."idempotencyKey",NEW."priceSnapshotAt")
    IS DISTINCT FROM (OLD.currency,OLD."cruiseScheduleId",OLD."idempotencyKey",OLD."priceSnapshotAt")
  OR (NEW."totalPriceCents" IS DISTINCT FROM OLD."totalPriceCents" AND coalesce(current_setting('hathor.plan_edit',true),'')<>'on')
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

-- A cabin line's identity never changes; its rate moves only with a plan change.
CREATE OR REPLACE FUNCTION hathor_immutable_room_line() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
BEGIN
 IF TG_OP='UPDATE' THEN
  IF coalesce(current_setting('hathor.plan_edit',true),'')='on'
   AND (NEW.id,NEW."bookingId",NEW."roomId",NEW."cruiseScheduleId",NEW."roomIndex",NEW.adults,NEW.children)
    IS NOT DISTINCT FROM (OLD.id,OLD."bookingId",OLD."roomId",OLD."cruiseScheduleId",OLD."roomIndex",OLD.adults,OLD.children)
  THEN RETURN NEW; END IF;
  RAISE EXCEPTION 'Release the reservation instead of rewriting an allocation';
 END IF;
 IF EXISTS(SELECT 1 FROM "Booking" WHERE id=OLD."bookingId" AND status IN ('PENDING_HOLD','REQUESTED','CONFIRMED'))
 THEN RAISE EXCEPTION 'Cannot remove a room from an active reservation'; END IF;
 RETURN OLD;
END $$;

-- Replaces the payment plan, and moves the quote with it when the total changes.
CREATE FUNCTION hathor_set_payment_plan(b "Booking", plan jsonb, session text) RETURNS void
LANGUAGE plpgsql SET search_path=public,pg_catalog AS $$
DECLARE paid bigint; owed bigint:=b."totalPriceCents"+b."cardSurchargeCents"; new_owed bigint:=(plan->>'totalCents')::bigint;
 old_quote bigint:=b."totalPriceCents"; new_quote bigint; used bigint:=0; left_rooms integer; price bigint;
 stages jsonb:=plan->'stages'; stage jsonb; previous bigint:=0; line "BookingRoom"; note text:=nullif(trim(coalesce(plan->>'reason','')),'');
BEGIN
 IF b.status NOT IN ('REQUESTED','CONFIRMED') THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Only a live booking has a payment plan to change'; END IF;
 SELECT coalesce(sum(CASE WHEN kind='RECEIPT' THEN "amountCents" ELSE -"amountCents" END),0) INTO paid FROM "BookingPayment" WHERE "bookingId"=b.id;
 IF new_owed IS NULL OR new_owed<=b."cardSurchargeCents" THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='The total must be more than zero'; END IF;
 IF new_owed<paid THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='The total cannot be less than what has already been received'; END IF;
 IF new_owed<>owed AND note IS NULL THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Say why the total changed'; END IF;
 IF jsonb_typeof(stages) IS DISTINCT FROM 'array' OR jsonb_array_length(stages)=0 THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='A plan needs at least one payment'; END IF;
 IF stages->0->>'milestone' IS DISTINCT FROM 'INITIAL' THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='The first payment must stay the one that confirms the booking'; END IF;
 IF (SELECT count(DISTINCT lower(e->>'milestone')) FROM jsonb_array_elements(stages) e)<>jsonb_array_length(stages) THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Give each payment its own name'; END IF;
 FOR stage IN SELECT value FROM jsonb_array_elements(stages) LOOP
  IF (stage->>'cumulativeCents')::bigint IS NULL OR (stage->>'cumulativeCents')::bigint<=previous THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Every payment needs an amount above zero'; END IF;
  previous:=(stage->>'cumulativeCents')::bigint;
 END LOOP;
 IF previous<>new_owed THEN RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='The payments must add up to the total'; END IF;

 IF new_owed<>owed THEN
  new_quote:=new_owed-b."cardSurchargeCents";
  SELECT count(*) INTO left_rooms FROM "BookingRoom" WHERE "bookingId"=b.id;
  PERFORM set_config('hathor.plan_edit','on',true);
  FOR line IN SELECT * FROM "BookingRoom" WHERE "bookingId"=b.id ORDER BY "roomIndex" LOOP
   left_rooms:=left_rooms-1;
   price:=CASE WHEN left_rooms=0 THEN new_quote-used ELSE round(coalesce(line."unitPriceCents",0)::numeric*new_quote/old_quote)::bigint END;
   used:=used+price;
   UPDATE "BookingRoom" SET "unitPriceCents"=price WHERE id=line.id;
  END LOOP;
  UPDATE "Booking" SET "totalPriceCents"=new_quote,"updatedAt"=clock_timestamp() WHERE id=b.id;
  PERFORM set_config('hathor.plan_edit','',true);
 END IF;

 DELETE FROM "BookingPaymentSchedule" WHERE "bookingId"=b.id;
 FOR stage IN SELECT value FROM jsonb_array_elements(stages) LOOP
  INSERT INTO "BookingPaymentSchedule"(id,"bookingId",milestone,"dueAt","cumulativeCents")
  VALUES(gen_random_uuid()::text,b.id,trim(stage->>'milestone'),nullif(stage->>'dueOn','')::timestamp,(stage->>'cumulativeCents')::integer);
 END LOOP;
 INSERT INTO "BookingPlanChange"("bookingId","previousTotalCents","totalCents",reason,schedule,"recordedBySession")
 VALUES(b.id,owed,new_owed,note,stages,session);
END $$;
REVOKE ALL ON FUNCTION hathor_set_payment_plan("Booking",jsonb,text) FROM PUBLIC,anon,authenticated;

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
  IF coalesce(action->>'reason','CANCELLATION') NOT IN ('CANCELLATION','NO_SHOW','EARLY_DEPARTURE','HATHOR_CANCELLED','UNAVOIDABLE_CIRCUMSTANCES','SIGNIFICANT_CHANGE') THEN
   RAISE EXCEPTION USING ERRCODE='HB400',MESSAGE='Invalid cancellation reason';
  END IF;
  -- Terms 13 (Hathor cancels), 2 (unavoidable circumstances) and 12 (guest cancels after a
  -- significant change) owe a full refund: no fee, so the payment guard allows refunding
  -- everything received, card surcharge included.
  fee:=CASE WHEN action->>'reason' IN ('HATHOR_CANCELLED','UNAVOIDABLE_CIRCUMSTANCES','SIGNIFICANT_CHANGE') THEN 0
   ELSE ceil(b."totalPriceCents"::numeric * CASE WHEN coalesce(action->>'reason','CANCELLATION')<>'CANCELLATION' OR days<=45 THEN 1 WHEN days<=60 THEN .5 WHEN days<90 THEN .25 ELSE 0 END) END;
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
 ELSIF action->>'type'='set-plan' THEN
  PERFORM hathor_set_payment_plan(b,action->'plan',action->>'recordedBySession');
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

REVOKE ALL ON FUNCTION hathor_required_payment(text,bigint,timestamp) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION hathor_administer_booking(text,jsonb) FROM PUBLIC,anon,authenticated;
