ALTER TABLE "InboxMessage" DROP CONSTRAINT IF EXISTS "InboxMessage_resendEmailId_key";
DROP INDEX IF EXISTS "InboxMessage_resendEmailId_key";
