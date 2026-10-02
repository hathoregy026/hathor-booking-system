ALTER TABLE "BookingMessage" ADD COLUMN "readAt" TIMESTAMP(3);
CREATE INDEX "BookingMessage_direction_createdAt_id_idx" ON "BookingMessage" (direction, "createdAt", id);

CREATE TABLE "InboxMessage" (
  id TEXT PRIMARY KEY,
  "resendEmailId" TEXT NOT NULL UNIQUE,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  "bodyText" TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "InboxMessage_createdAt_id_idx" ON "InboxMessage" ("createdAt", id);
ALTER TABLE "InboxMessage" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "InboxMessage" FROM anon, authenticated;
