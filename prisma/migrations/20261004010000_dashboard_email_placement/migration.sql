CREATE TABLE "DashboardEmailPlacement" (
  source TEXT NOT NULL CHECK (source IN ('booking', 'general')),
  "messageId" TEXT NOT NULL,
  "mailboxId" TEXT NOT NULL CHECK ("mailboxId" IN ('ceo', 'acc', 'sales', 'reservations', 'reception', 'info')),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DashboardEmailPlacement_pkey" PRIMARY KEY (source, "messageId")
);
ALTER TABLE "DashboardEmailPlacement" ENABLE ROW LEVEL SECURITY;
