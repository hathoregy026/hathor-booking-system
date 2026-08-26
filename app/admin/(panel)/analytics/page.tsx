import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

export default function AdminAnalyticsPage() {
  return (
    <AdminErrorBoundary>
      <AnalyticsDashboard />
    </AdminErrorBoundary>
  );
}
