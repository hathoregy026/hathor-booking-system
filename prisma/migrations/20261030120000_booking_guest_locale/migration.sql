-- The language a guest booked in, so emails the team sends later (invoice, confirmation, decline) reach them in it.
-- NULL means English, so every existing booking and every English booking stays as it is. Two lower-case letters
-- leave room for further site languages without another migration. No database function changes:
-- hathor_reservation_json reads the whole row, and the request route saves the value after hathor_submit_request.
-- Rollback: prisma/rollbacks/20261030120000_booking_guest_locale.sql

ALTER TABLE "Booking" ADD COLUMN "locale" TEXT;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_locale_check" CHECK ("locale" IS NULL OR "locale" ~ '^[a-z]{2}$');
