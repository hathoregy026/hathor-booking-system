"use client";

import { WebsiteTextPanel } from "@/components/admin/WebsiteTextPanel";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { FileText } from "lucide-react";

export default function AdminWebsiteTextPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <CmsPageHeader
        title="Website Text"
        description="Homepage and page copy for desktop and phone. Changes publish to the live CMS bundle."
        icon={FileText}
        compact
      />
      <WebsiteTextPanel />
    </div>
  );
}