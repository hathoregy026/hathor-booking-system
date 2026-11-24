-- Which ad or link brought a website booking request: Google Ads click id,
-- UTM tags and landing page, written once after the request is saved.
-- Additive and nullable: existing bookings and every booking path keep working.
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS attribution jsonb;
