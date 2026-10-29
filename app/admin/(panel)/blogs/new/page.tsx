import { requireAdminPage } from "@/lib/admin-server-auth";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export default async function AdminNewBlogPostPage() {
  await requireAdminPage("blogs.manage");
  return <BlogPostForm mode="create" />;
}
