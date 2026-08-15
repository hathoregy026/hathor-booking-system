import { HieroglyphTunePanel } from "@/components/admin/HieroglyphTunePanel";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { Shapes } from "lucide-react";

export default function AdminHieroglyphTunePage() {
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