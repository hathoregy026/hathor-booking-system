"use client";

import { WebsiteTextPanel } from "@/components/admin/WebsiteTextPanel";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { FileText } from "lucide-react";

export default function AdminWebsiteTextPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <CmsPageHeader
        title="Website Text"
        description="Pick a page tag, then edit that page's copy, fonts, and sizes. Desktop and phone versions save separately."
        icon={FileText}
        compact
      />
      <WebsiteTextPanel />
    </div>
  );
}