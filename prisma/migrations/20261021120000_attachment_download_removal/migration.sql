-- Server-only receipts and minimal audit trail. No file contents, filenames,
-- addresses, provider URLs, cookies or raw session identifiers are retained.
CREATE TABLE "MailAttachmentDownload" (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('general', 'booking')),
  "messageId" TEXT NOT NULL,
  "attachmentId" TEXT NOT NULL,
  "sessionHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "removedAt" TIMESTAMP(3),
  "saveMethod" TEXT CHECK ("saveMethod" IN ('file-system', 'employee-confirmation')),
  CONSTRAINT "MailAttachmentDownload_confirmation_check" CHECK (("removedAt" IS NULL) = ("saveMethod" IS NULL))
);
CREATE INDEX "MailAttachmentDownload_expiresAt_idx" ON "MailAttachmentDownload" ("expiresAt");
CREATE INDEX "MailAttachmentDownload_removedAt_idx" ON "MailAttachmentDownload" ("removedAt");
ALTER TABLE "MailAttachmentDownload" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "MailAttachmentDownload" FROM PUBLIC, anon, authenticated;
