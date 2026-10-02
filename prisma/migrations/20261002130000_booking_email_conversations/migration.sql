CREATE TABLE "BookingEmailThread" (
  "bookingId" TEXT PRIMARY KEY REFERENCES "Booking"(id) ON DELETE CASCADE,
  "replyToken" TEXT NOT NULL UNIQUE CHECK ("replyToken" ~ '^[a-f0-9]{48}$'),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "BookingMessage" (
  id TEXT PRIMARY KEY,
  "bookingId" TEXT NOT NULL REFERENCES "Booking"(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'RECEIVED')),
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  "bodyText" TEXT NOT NULL,
  "resendEmailId" TEXT UNIQUE,
  "internetMessageId" TEXT,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  "senderMatchesGuest" BOOLEAN NOT NULL DEFAULT TRUE,
  "recordedBySession" TEXT,
  "notificationSentAt" TIMESTAMP(3),
  "notificationLeaseUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "BookingMessage_bookingId_createdAt_id_idx"
  ON "BookingMessage" ("bookingId", "createdAt", id);

ALTER TABLE "BookingEmailThread" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BookingMessage" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "BookingEmailThread", "BookingMessage" FROM anon, authenticated;
