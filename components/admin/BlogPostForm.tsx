"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  createBlogPost,
  updateBlogPost,
} from "@/app/admin/(panel)/blogs/actions";
import { ActionButton } from "@/components/admin/ActionButton";
import { useToast } from "@/components/admin/ToastProvider";
import { slugifyBlogTitle } from "@/lib/blog-slug";
import type { AdminBlogPostRow } from "@/lib/admin-blog";

type BlogPostFormProps = {
  mode: "create" | "edit";
  post?: AdminBlogPostRow;
};

function toDatetimeLocalValue(iso?: string): string {
  if (!iso) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  const date = new Date(iso);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function BlogPostForm({ mode, post }: BlogPostFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [publishedAt, setPublishedAt] = useState(toDatetimeLocalValue(post?.publishedAt));

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugifyBlogTitle(value));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createBlogPost(formData)
          : await updateBlogPost(post!.id, formData);

      if (!result.success) {
        showToast("error", result.error);
        return;
      }

      showToast(
        "success",
        mode === "create" ? "Blog post created." : "Blog post saved.",
      );

      if (mode === "create" && result.data?.id) {
        router.push(`/admin/blogs/${result.data.id}`);
        router.refresh();
        return;
      }

      router.push("/admin/blogs");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="admin-section-label">Blog</p>
        <h1 className="admin-heading mt-1 text-2xl sm:text-3xl">
          {mode === "create" ? "Create New Post" : "Edit Post"}
        </h1>
        <p className="admin-subheading mt-2">
          Paste or edit HTML directly in the content field.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="admin-card space-y-6 p-4 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="admin-section-label mb-2 block">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={300}
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              className="admin-input w-full px-3 py-2.5 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="slug" className="admin-section-label mb-2 block">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              maxLength={200}
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              placeholder="auto-generated-from-title"
              className="admin-input w-full px-3 py-2.5 font-mono text-sm"
            />
            <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
              Lowercase letters, numbers, and hyphens only. Leave blank to
              auto-generate from the title.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="excerpt" className="admin-section-label mb-2 block">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              required
              rows={3}
              maxLength={2000}
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              className="admin-input w-full resize-y px-3 py-2.5 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="content" className="admin-section-label mb-2 block">
              Content (HTML)
            </label>
            <textarea
              id="content"
              name="content"
              rows={18}
              maxLength={500000}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="admin-input w-full resize-y px-3 py-2.5 font-mono text-xs leading-relaxed sm:text-sm"
              placeholder="<h2>Your article HTML…</h2>"
            />
          </div>

          <div>
            <label
              htmlFor="publishedAt"
              className="admin-section-label mb-2 block"
            >
              Published Date
            </label>
            <input
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
              required
              value={publishedAt}
              onChange={(event) => setPublishedAt(event.target.value)}
              className="admin-input w-full px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end"
          style={{ borderColor: "var(--border)" }}
        >
          <Link href="/admin/blogs" className="admin-btn-outline px-4 py-2.5 text-center text-sm">
            Cancel
          </Link>
          <ActionButton type="submit" disabled={isPending} className="px-5 py-2.5">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : mode === "create" ? (
              "Create Post"
            ) : (
              "Save Post"
            )}
          </ActionButton>
        </div>
      </form>
    </div>
  );
}
