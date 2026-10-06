-- Additive migration: existing rows and all current mailbox workflows are retained.
ALTER TABLE "InboxMessage" ADD COLUMN "folder" TEXT NOT NULL DEFAULT 'inbox',
  ADD COLUMN "screeningReasons" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "BookingMessage" ADD COLUMN "folder" TEXT NOT NULL DEFAULT 'inbox',
  ADD COLUMN "screeningReasons" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "InboxMessage" ADD CONSTRAINT "InboxMessage_folder_check" CHECK ("folder" IN ('inbox', 'spam', 'security'));
ALTER TABLE "BookingMessage" ADD CONSTRAINT "BookingMessage_folder_check" CHECK ("folder" IN ('inbox', 'spam', 'security'));
CREATE INDEX "InboxMessage_folder_createdAt_id_idx" ON "InboxMessage" ("folder", "createdAt", "id");
CREATE INDEX "BookingMessage_direction_folder_createdAt_id_idx" ON "BookingMessage" (direction, "folder", "createdAt", "id");
