"use client";

import { WebsiteTextPanel } from "@/components/admin/WebsiteTextPanel";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { FileText } from "lucide-react";
import "../../../admin-website-text.css";

export default function AdminWebsiteTextPage() {
  return (
    <div className="wt-page space-y-4">
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