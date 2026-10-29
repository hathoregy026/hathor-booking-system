"use client";

import { useSearchParams } from "next/navigation";
import { DashboardInbox } from "./DashboardInbox";

export function DashboardInboxRoute() {
  const params = useSearchParams();
  return <DashboardInbox requestedEmail={`${params.get("source") ?? ""}/${params.get("message") ?? ""}`} />;
}
