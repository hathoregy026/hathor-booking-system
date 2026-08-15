import { HeroLogoTunePanel } from "@/components/admin/HeroLogoTunePanel";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { Aperture } from "lucide-react";

export default function AdminHeroLogoTunePage() {
  return (
    <div className="space-y-6">
      <CmsPageHeader
        title="Hero Logo Tune"
        description="Adjust HATHOR letter layout, colour, and spacing for the homepage hero."
        icon={Aperture}
        compact
      />
      <HeroLogoTunePanel />
    </div>
  );
}