import { requireAdminPage } from "@/lib/admin-server-auth";
import { BlogsAdminClient } from "@/components/admin/BlogsAdminClient";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { Newspaper } from "lucide-react";

export default async function AdminBlogsPage() {
  await requireAdminPage("blogs.view");
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