import { requireAdminPage } from "@/lib/admin-server-auth";
import { StorageAnalyzePanel } from "@/components/admin/StorageAnalyzePanel";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { HardDrive } from "lucide-react";

export default async function AdminStoragePage() {
  await requireAdminPage("storage.view");
  return (
    <div className="space-y-6">
      <CmsPageHeader
        title="Storage"
        description="Read-only inventory of local public assets, cloud uploads, and CMS payload sizes."
        icon={HardDrive}
        compact
      />
      <StorageAnalyzePanel />
    </div>
  );
}