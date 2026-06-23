import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import { DashboardView } from "@/components/admin/DashboardView";

export default function AdminDashboardPage() {
  return (
    <AdminErrorBoundary>
      <DashboardView />
    </AdminErrorBoundary>
  );
}
