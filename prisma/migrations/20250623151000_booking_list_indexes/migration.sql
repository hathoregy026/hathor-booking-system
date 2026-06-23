-- CreateIndex
CREATE INDEX IF NOT EXISTS "Booking_deletedAt_createdAt_idx" ON "Booking"("deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Booking_status_deletedAt_createdAt_idx" ON "Booking"("status", "deletedAt", "createdAt");
