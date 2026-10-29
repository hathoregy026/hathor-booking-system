import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/admin-server-auth";
import { hasAdminPermission, firstAdminPage } from "@/lib/admin-permissions";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import { DashboardView } from "@/components/admin/DashboardView";

export default async function AdminDashboardPage() {
  const identity = await requireAdminPage();
  if (!hasAdminPermission(identity, "dashboard.view")) redirect(firstAdminPage(identity));
  return (
    <AdminErrorBoundary>
      <DashboardView />
    </AdminErrorBoundary>
  );
}
