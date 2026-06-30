import { fetchBlogPostsForAdmin } from "@/lib/admin-blog-data";
import { BlogsAdminClient } from "@/components/admin/BlogsAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const posts = await fetchBlogPostsForAdmin();

  if (posts.length === 0) {
    const hasSupabase =
      Boolean(process.env.SUPABASE_URL) &&
      Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY,
      );

    return (
      <div className="space-y-6">
        <div>
          <p className="admin-section-label">Content</p>
          <h1 className="admin-heading mt-1 text-2xl sm:text-3xl">Blog Posts</h1>
        </div>
        <div className="admin-card mx-auto max-w-xl p-8 text-center">
          <h2 className="admin-heading text-xl">No posts loaded</h2>
          <p className="admin-subheading mt-3">
            {hasSupabase
              ? "The blog table is empty or all data sources failed. Check Vercel function logs for [admin-blog-data]."
              : "Supabase is not configured on this deployment. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel, then redeploy."}
          </p>
        </div>
      </div>
    );
  }

  return <BlogsAdminClient initialPosts={posts} />;
}
