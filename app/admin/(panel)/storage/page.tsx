import { StorageAnalyzePanel } from "@/components/admin/StorageAnalyzePanel";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { HardDrive } from "lucide-react";

export default function AdminStoragePage() {
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