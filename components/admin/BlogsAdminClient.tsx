"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { deleteBlogPost } from "@/app/admin/(panel)/blogs/actions";
import { ActionButton } from "@/components/admin/ActionButton";
import { DataTable } from "@/components/admin/DataTable";
import { useToast } from "@/components/admin/ToastProvider";
import type { AdminBlogPostRow } from "@/lib/admin-blog";

type BlogsAdminClientProps = {
  initialPosts: AdminBlogPostRow[];
};

function formatPublishedDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function BlogsAdminClient({ initialPosts }: BlogsAdminClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [posts, setPosts] = useState(initialPosts);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return posts;
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(normalized) ||
        post.slug.toLowerCase().includes(normalized),
    );
  }, [posts, query]);

  const handleDelete = (post: AdminBlogPostRow) => {
    const confirmed = window.confirm(
      `Delete "${post.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(post.id);
    startTransition(async () => {
      const result = await deleteBlogPost(post.id, true);
      setDeletingId(null);

      if (!result.success) {
        showToast("error", result.error);
        return;
      }

      setPosts((current) => current.filter((item) => item.id !== post.id));
      showToast("success", "Blog post deleted.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="admin-section-label">Content</p>
        <h1 className="admin-heading mt-1 text-2xl sm:text-3xl">Blog Posts</h1>
        <p className="admin-subheading mt-2 max-w-2xl">
          Create, edit, and publish stories for the public blog. Content is stored
          as HTML.
        </p>
      </div>

      <DataTable
        title="All posts"
        description={`${posts.length} post${posts.length === 1 ? "" : "s"} in the database`}
        action={
          <ActionButton href="/admin/blogs/new" icon={Plus}>
            Create New Post
          </ActionButton>
        }
        isEmpty={filtered.length === 0}
        emptyMessage={
          query.trim()
            ? "No posts match your search."
            : "No blog posts yet. Create your first post."
        }
      >
        <div
          className="border-b px-4 py-4 sm:px-6"
          style={{ borderColor: "var(--border)" }}
        >
          <label className="relative block max-w-md">
            <span className="sr-only">Search posts by title</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title or slug…"
              className="admin-input w-full py-2.5 pl-10 pr-3 text-sm"
            />
          </label>
        </div>

        <table className="admin-table w-full min-w-[640px]">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Published</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((post) => {
              const isDeleting = deletingId === post.id && isPending;
              return (
                <tr key={post.id}>
                  <td className="max-w-[240px]">
                    <p className="truncate font-medium">{post.title}</p>
                    <p
                      className="mt-1 truncate text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {post.excerpt}
                    </p>
                  </td>
                  <td className="font-mono text-xs">{post.slug}</td>
                  <td>{formatPublishedDate(post.publishedAt)}</td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/blogs/${post.id}`}
                        className="admin-btn-outline inline-flex items-center gap-1.5 px-3 py-2 text-xs"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(post)}
                        disabled={isDeleting}
                        className="admin-btn-outline inline-flex items-center gap-1.5 px-3 py-2 text-xs disabled:opacity-60"
                        style={{
                          borderColor: "color-mix(in srgb, #ef4444 35%, var(--border))",
                          color: "#ef4444",
                        }}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        )}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
