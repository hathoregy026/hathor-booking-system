import { PageVisibilityPanel } from "@/components/admin/PageVisibilityPanel";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { LayoutGrid } from "lucide-react";

export default function AdminPagesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CmsPageHeader
        title="Pages"
        description="Turn each public page live or under construction. When a page is off, visitors see a single under-construction message instead of the page content. Saves publish to the live site immediately."
        icon={LayoutGrid}
      />
      <PageVisibilityPanel />
    </div>
  );
}