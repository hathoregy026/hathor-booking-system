import { requireAdminPage } from "@/lib/admin-server-auth";
import { HieroglyphTunePanel } from "@/components/admin/HieroglyphTunePanel";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { Shapes } from "lucide-react";

export default async function AdminHieroglyphTunePage() {
  await requireAdminPage("website.view");
  return (
    <div className="space-y-6">
      <CmsPageHeader
        title="Background Glyphs"
        description="Tune the hieroglyph layer behind public pages."
        icon={Shapes}
      />
      <HieroglyphTunePanel />
    </div>
  );
}