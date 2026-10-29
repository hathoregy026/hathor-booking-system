BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE "InboxMessage" ADD COLUMN origin TEXT NOT NULL DEFAULT 'EMAIL';
ALTER TABLE "InboxMessage" ADD CONSTRAINT "InboxMessage_origin_check" CHECK (origin IN ('EMAIL', 'CONTACT_FORM', 'CHARTER_FORM'));
ALTER TABLE "InboxMessage" DROP CONSTRAINT "InboxMessage_delivery_check";
ALTER TABLE "InboxMessage" ADD CONSTRAINT "InboxMessage_delivery_check" CHECK (
  (direction = 'INBOUND' AND status = 'RECEIVED' AND (
    (origin = 'EMAIL' AND "resendEmailId" IS NOT NULL)
    OR (origin = 'CONTACT_FORM' AND "mailboxId" = 'info' AND "resendEmailId" IS NULL AND "bodyHtml" IS NOT NULL)
    OR (origin = 'CHARTER_FORM' AND "mailboxId" = 'reservations' AND "resendEmailId" IS NULL AND "bodyHtml" IS NOT NULL)
  ))
  OR (direction = 'OUTBOUND' AND origin = 'EMAIL' AND status IN ('PENDING', 'SENT', 'FAILED'))
);
COMMIT;
