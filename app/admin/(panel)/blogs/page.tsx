import { listBlogPostsForAdmin } from "./actions";
import { BlogsAdminClient } from "@/components/admin/BlogsAdminClient";
import { AdminAuthError } from "@/lib/admin-server-auth";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  try {
    const posts = await listBlogPostsForAdmin();
    return <BlogsAdminClient initialPosts={posts} />;
  } catch (error) {
    if (error instanceof AdminAuthError) {
      throw error;
    }

    console.error("[admin.blogs.page]", error);

    return (
      <div className="admin-card mx-auto max-w-xl p-8 text-center">
        <h1 className="admin-heading text-xl">Could not load blog posts</h1>
        <p className="admin-subheading mt-3">
          The database connection failed. Confirm{" "}
          <code className="text-xs">DATABASE_URL</code> uses the Supabase pooler
          (port 6543) and that{" "}
          <code className="text-xs">SUPABASE_URL</code> plus{" "}
          <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> are set in
          Vercel.
        </p>
      </div>
    );
  }
}
