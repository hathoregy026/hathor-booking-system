import { requireAdminPage } from "@/lib/admin-server-auth";
import { AdminSettingsPanel } from "@/components/admin/AdminSettingsPanel";

export default async function AdminSettingsPage() {
  await requireAdminPage();
  return <AdminSettingsPanel />;
}
