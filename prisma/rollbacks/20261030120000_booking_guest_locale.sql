-- Rollback for 20261030120000_booking_guest_locale. Bookings made in another language fall back to English emails.

ALTER TABLE "Booking" DROP CONSTRAINT "Booking_locale_check";
ALTER TABLE "Booking" DROP COLUMN "locale";
