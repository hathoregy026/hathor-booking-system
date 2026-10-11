import { requireAdminPage } from "@/lib/admin-server-auth";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

export default async function AdminAnalyticsPage() {
  await requireAdminPage("analytics.view");
  return (
    <AdminErrorBoundary>
      <AnalyticsDashboard />
    </AdminErrorBoundary>
  );
}
