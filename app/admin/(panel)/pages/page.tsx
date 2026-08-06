import { PageVisibilityPanel } from "@/components/admin/PageVisibilityPanel";
import { LayoutGrid } from "lucide-react";

export default function AdminPagesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <LayoutGrid
            className="h-6 w-6"
            style={{ color: "var(--accent)" }}
            aria-hidden
          />
          <h1 className="admin-page-title">Pages</h1>
        </div>
        <p className="admin-page-subtitle">
          Turn each public page live or under construction. When a page is off,
          visitors see a single under-construction message instead of the page
          content. Saves publish to the live site immediately.
        </p>
      </div>

      <PageVisibilityPanel />
    </div>
  );
}
