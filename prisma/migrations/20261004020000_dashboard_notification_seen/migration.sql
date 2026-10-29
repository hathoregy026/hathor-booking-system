CREATE TABLE "DashboardNotificationSeen" (
  kind TEXT NOT NULL CHECK (kind IN ('booking', 'email')),
  source TEXT NOT NULL CHECK (source IN ('booking', 'general')),
  "messageId" TEXT NOT NULL,
  "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (kind <> 'booking' OR source = 'booking'),
  CONSTRAINT "DashboardNotificationSeen_pkey" PRIMARY KEY (kind, source, "messageId")
);
ALTER TABLE "DashboardNotificationSeen" ENABLE ROW LEVEL SECURITY;
