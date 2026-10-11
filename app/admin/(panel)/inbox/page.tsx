import { requireAdminPage } from "@/lib/admin-server-auth";
import { Suspense } from "react";
import { DashboardInboxRoute } from "@/components/admin/DashboardInboxRoute";
import "./inbox.css";

export default async function InboxPage() {
  await requireAdminPage("inbox.view");
  return <Suspense fallback={<p className="text-sm text-muted">Loading emails…</p>}><DashboardInboxRoute /></Suspense>;
}
