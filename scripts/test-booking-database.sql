BEGIN;
SET LOCAL idle_in_transaction_session_timeout='15s';
-- All synthetic bookings, payments and blocks are rolled back inside this DO block.
DO $$
DECLARE b text:=gen_random_uuid()::text; line text:=gen_random_uuid()::text; s "CruiseSchedule"; failed boolean; p text:=gen_random_uuid()::text;
BEGIN
 BEGIN
 SELECT cs.* INTO STRICT s FROM "CruiseSchedule" cs JOIN "Cruise" c ON c.id=cs."cruiseId" WHERE c.slug='4-nights-luxor-aswan' AND cs."departureTime"='2026-10-17' AND cs."isBookable";
 INSERT INTO "Booking"(id,"cruiseScheduleId","idempotencyKey","holdExpiresAt","adultCount","childCount","totalPriceCents","priceSnapshotAt","updatedAt") VALUES(b,s.id,b,now()+interval '15 minutes',1,1,400000,now(),now());
 INSERT INTO "BookingRoom"(id,"bookingId","roomId","cruiseScheduleId","unitPriceCents",adults,children,"roomIndex") VALUES(line,b,'K01',s.id,400000,1,1,0);
 SET CONSTRAINTS ALL IMMEDIATE; SET CONSTRAINTS ALL DEFERRED;
 IF NOT EXISTS(SELECT 1 FROM "InventoryAllocation" WHERE "bookingRoomId"=line AND active AND state='HELD') THEN RAISE EXCEPTION 'Hold allocation missing'; END IF;
 failed:=false; BEGIN
 INSERT INTO "InventoryAllocation"("roomId","startsAt","endsAt",state,"blockKey",reason) VALUES('K01',s."departureTime",s."arrivalTime",'MANUAL_BLOCK',p,'QA');
 EXCEPTION WHEN exclusion_violation THEN failed:=true; END;
 IF NOT failed THEN RAISE EXCEPTION 'Overlap guard failed'; END IF;
 -- Adjacent 3N sector is compatible, while 7N overlaps the 4N hold.
 INSERT INTO "InventoryAllocation"("roomId","startsAt","endsAt",state,"blockKey",reason) VALUES('K01',s."arrivalTime",s."arrivalTime"+interval '3 days','MANUAL_BLOCK',p,'QA');
 failed:=false; BEGIN
 INSERT INTO "InventoryAllocation"("roomId","startsAt","endsAt",state,"blockKey",reason) VALUES('K01',s."departureTime",s."arrivalTime"+interval '3 days','CHARTER_BLOCK',p,'QA');
 EXCEPTION WHEN exclusion_violation THEN failed:=true; END;
 IF NOT failed THEN RAISE EXCEPTION '7N overlap guard failed'; END IF;
 failed:=false; BEGIN UPDATE "InventoryAllocation" SET "bookingRoomId"=NULL,state='MANUAL_BLOCK',"blockKey"=p,"expiresAt"=NULL WHERE "bookingRoomId"=line; EXCEPTION WHEN raise_exception THEN failed:=true; END;
 IF NOT failed THEN RAISE EXCEPTION 'Allocation reassignment was accepted'; END IF;
 INSERT INTO "BookingGuest"(id,"bookingId","roomIndex","fullName","isChild") VALUES(gen_random_uuid()::text,b,0,'QA Adult',false),(gen_random_uuid()::text,b,0,'QA Child',true);
 UPDATE "Booking" SET status='REQUESTED',"requestedAt"=now(),"paymentMethod"='BANK_TRANSFER',"firstName"='QA',"lastName"='Test',country='Egypt',"customerEmail"='delivered@resend.dev',"customerPhone"='+201234567890',"termsAcceptedAt"=now() WHERE id=b;
 SET CONSTRAINTS ALL IMMEDIATE; SET CONSTRAINTS ALL DEFERRED;
 IF NOT EXISTS(SELECT 1 FROM "Booking" WHERE id=b AND status='REQUESTED' AND "holdExpiresAt" IS NULL) THEN RAISE EXCEPTION 'Request state failed'; END IF;
 UPDATE "Booking" SET "acceptedAt"=now() WHERE id=b;
 failed:=false; BEGIN UPDATE "Booking" SET status='CONFIRMED' WHERE id=b; EXCEPTION WHEN raise_exception THEN failed:=true; END;
 IF NOT failed THEN RAISE EXCEPTION 'Unpaid confirmation was accepted'; END IF;
 INSERT INTO "BookingPayment"(id,"bookingId",reference,method,kind,"amountCents","receivedAt") VALUES(p,b,p,'BANK_TRANSFER','RECEIPT',400000,now());
 failed:=false; BEGIN INSERT INTO "BookingPayment"(id,"bookingId",reference,method,kind,"amountCents","receivedAt") VALUES(gen_random_uuid()::text,b,p,'BANK_TRANSFER','RECEIPT',1,now()); EXCEPTION WHEN unique_violation OR raise_exception THEN failed:=true; END;
 IF NOT failed THEN RAISE EXCEPTION 'Duplicate payment accepted'; END IF;
 UPDATE "Booking" SET status='CONFIRMED' WHERE id=b;
 IF NOT EXISTS(SELECT 1 FROM "Booking" WHERE id=b AND status='CONFIRMED' AND "paymentStatus"='PAID') THEN RAISE EXCEPTION 'Paid acceptance did not confirm'; END IF;
 failed:=false; BEGIN UPDATE "Booking" SET "totalPriceCents"=1 WHERE id=b; EXCEPTION WHEN raise_exception THEN failed:=true; END;
 IF NOT failed THEN RAISE EXCEPTION 'Snapshot changed'; END IF;
 UPDATE "Booking" SET status='CANCELLED',"cancellationFeeCents"=400000 WHERE id=b;
 IF EXISTS(SELECT 1 FROM "InventoryAllocation" WHERE "bookingRoomId"=line AND active) THEN RAISE EXCEPTION 'Cancellation failed to release'; END IF;
 failed:=false; BEGIN UPDATE "Booking" SET status='CONFIRMED' WHERE id=b; EXCEPTION WHEN raise_exception THEN failed:=true; END;
 IF NOT failed THEN RAISE EXCEPTION 'Cancelled booking reactivated'; END IF;
 SET CONSTRAINTS ALL IMMEDIATE;
 RAISE EXCEPTION USING ERRCODE='ZQ001',MESSAGE='Rollback successful QA records';
 EXCEPTION WHEN SQLSTATE 'ZQ001' THEN NULL;
 END;
END $$;

ROLLBACK;
