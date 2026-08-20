import { PageVisibilityPanel } from "@/components/admin/PageVisibilityPanel";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { LayoutGrid } from "lucide-react";

export default function AdminPagesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CmsPageHeader
        title="Pages"
        description="Turn each public page live or Coming Soon. When a page is off, visitors on your custom domain see Coming Soon. Your Vercel link still shows the real page so you can keep working."
        icon={LayoutGrid}
      />
      <PageVisibilityPanel />
    </div>
  );
}