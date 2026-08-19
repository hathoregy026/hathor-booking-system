import { TypographyEditorTabs } from "@/components/admin/TypographyEditorTabs";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { Type } from "lucide-react";

export default function AdminTypographyPage() {
  return (
    <div className="space-y-6">
      <CmsPageHeader
        title="Typography & Styles"
        description="Type roles, hero wording, amenities sequence, dining, and Suites type — all wired to the public site."
        icon={Type}
        compact
      />
      <TypographyEditorTabs />
    </div>
  );
}