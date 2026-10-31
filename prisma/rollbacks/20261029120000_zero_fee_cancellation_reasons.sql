-- Rollback for 20261029120000_zero_fee_cancellation_reasons: the live hathor_administer_booking
-- read with pg_get_functiondef on 2026-10-29 (md5 58c3e7dc5b6472e9136e4ef29edb9302), identical to
-- 20261004120000_card_surcharge_and_invoice_split, plus the original reason CHECK. Restoring that
-- CHECK fails while any booking stores a new reason; such bookings keep their fee of 0 and need a
-- decision (relabel or keep the wider CHECK) before the constraint part is rolled back.

ALTER TABLE "Booking" DROP CONSTRAINT "Booking_cancellationReason_check";
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_cancellationReason_check"
  CHECK ("cancellationReason" IN ('CANCELLATION','NO_SHOW','EARLY_DEPARTURE','HATHOR_DECLINED'));

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
