import { BlogsAdminClient } from "@/components/admin/BlogsAdminClient";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { Newspaper } from "lucide-react";

export default function AdminBlogsPage() {
  return (
    <div className="space-y-6">
      <CmsPageHeader
        title="Blog Posts"
        description="Create, edit, and publish stories for the public journal."
        icon={Newspaper}
        compact
      />
      <BlogsAdminClient />
    </div>
  );
}