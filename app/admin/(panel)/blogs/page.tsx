import { listBlogPostsForAdmin } from "./actions";
import { BlogsAdminClient } from "@/components/admin/BlogsAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const posts = await listBlogPostsForAdmin();
  return <BlogsAdminClient initialPosts={posts} />;
}
