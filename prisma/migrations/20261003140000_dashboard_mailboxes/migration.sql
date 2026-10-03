ALTER TABLE "InboxMessage" ADD COLUMN "mailboxId" TEXT NOT NULL DEFAULT 'reservations';
ALTER TABLE "InboxMessage" ADD CONSTRAINT "InboxMessage_mailboxId_check"
  CHECK ("mailboxId" IN ('ceo', 'acc', 'sales', 'reservations', 'reception', 'info'));
CREATE INDEX "InboxMessage_mailboxId_createdAt_id_idx" ON "InboxMessage"("mailboxId", "createdAt", id);
CREATE UNIQUE INDEX "InboxMessage_resendEmailId_mailboxId_key" ON "InboxMessage"("resendEmailId", "mailboxId");

CREATE TABLE "DashboardEmailDeletion" (
  source TEXT NOT NULL CHECK (source IN ('booking', 'general')),
  "messageId" TEXT NOT NULL,
  "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DashboardEmailDeletion_pkey" PRIMARY KEY (source, "messageId")
);
