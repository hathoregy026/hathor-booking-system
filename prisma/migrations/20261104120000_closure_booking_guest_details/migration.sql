-- A cabin closed for a guest (a phone or WhatsApp booking, or one entered from
-- Dashboard -> Bookings -> Add booking) records the same guest details as a
-- website booking. Additive and nullable: existing closures keep working.
ALTER TABLE "ClosureBooking"
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS adults integer CHECK (adults IS NULL OR adults BETWEEN 0 AND 60),
  ADD COLUMN IF NOT EXISTS children integer CHECK (children IS NULL OR children BETWEEN 0 AND 60),
  ADD COLUMN IF NOT EXISTS notes text;
