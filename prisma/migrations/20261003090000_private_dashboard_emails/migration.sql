ALTER TABLE "InboxMessage" ALTER COLUMN "resendEmailId" DROP NOT NULL;
ALTER TABLE "InboxMessage"
  ADD COLUMN direction TEXT NOT NULL DEFAULT 'INBOUND',
  ADD COLUMN status TEXT NOT NULL DEFAULT 'RECEIVED',
  ADD COLUMN "correspondentName" TEXT,
  ADD COLUMN "bodyHtml" TEXT,
  ADD COLUMN "requestFingerprint" TEXT,
  ADD COLUMN "recordedBySession" TEXT,
  ADD COLUMN "sendLeaseUntil" TIMESTAMP(3),
  ADD CONSTRAINT "InboxMessage_direction_check" CHECK (direction IN ('INBOUND', 'OUTBOUND')),
  ADD CONSTRAINT "InboxMessage_status_check" CHECK (status IN ('RECEIVED', 'PENDING', 'SENT', 'FAILED')),
  ADD CONSTRAINT "InboxMessage_delivery_check" CHECK (
    (direction = 'INBOUND' AND status = 'RECEIVED' AND "resendEmailId" IS NOT NULL)
    OR (direction = 'OUTBOUND' AND status IN ('PENDING', 'SENT', 'FAILED'))
  );
CREATE INDEX "InboxMessage_direction_createdAt_id_idx" ON "InboxMessage" (direction, "createdAt", id);
