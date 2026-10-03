import { Suspense } from "react";
import { DashboardInboxRoute } from "@/components/admin/DashboardInboxRoute";
import "./inbox.css";

export default function InboxPage() {
  return <Suspense fallback={<p className="text-sm text-muted">Loading emails…</p>}><DashboardInboxRoute /></Suspense>;
}
