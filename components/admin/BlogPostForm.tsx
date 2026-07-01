"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ActionButton } from "@/components/admin/ActionButton";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
import { slugifyBlogTitle } from "@/lib/blog-slug";
import type { AdminBlogPostRow } from "@/lib/admin-blog";

type BlogPostFormProps =
  | { mode: "create" }
  | { mode: "edit"; postId: string };

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

function formValuesToJson(formData: FormData): Record<string, string> {
  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    content: String(formData.get("content") ?? ""),
    publishedAt: String(formData.get("publishedAt") ?? ""),
  };
}

export function BlogPostForm(props: BlogPostFormProps) {
  const { mode } = props;
  const postId = mode === "edit" ? props.postId : undefined;

  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [loadFailed, setLoadFailed] = useState(false);
  const loadIdRef = useRef(0);

  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [publishedAt, setPublishedAt] = useState(toDatetimeLocalValue());

  useEffect(() => {
    if (mode !== "edit" || !postId) return;

    const loadId = ++loadIdRef.current;

    async function loadPost(attempt = 0) {
      setIsLoading(true);
      setLoadFailed(false);

      try {
        const response = await adminFetch(`/api/admin/blog-posts/${postId}`);
        if (loadId !== loadIdRef.current) return;

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load blog post");
        }

        const post = data.post as AdminBlogPostRow;
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt);
        setContent(post.content);
        setPublishedAt(toDatetimeLocalValue(post.publishedAt));
        setLoadFailed(false);
        setIsLoading(false);
      } catch (err) {
        if (loadId !== loadIdRef.current) return;

        if (attempt < 1 && isTransientFetchError(err)) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          return loadPost(attempt + 1);
        }

        setLoadFailed(true);
        showToast(
          "error",
          err instanceof Error ? err.message : "Failed to load blog post",
        );
        setIsLoading(false);
      }
    }

    void loadPost();
  }, [mode, postId, showToast]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugifyBlogTitle(value));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const body = formValuesToJson(formData);

    startTransition(async () => {
      try {
        const response =
          mode === "create"
            ? await adminFetch("/api/admin/blog-posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              })
            : await adminFetch(`/api/admin/blog-posts/${postId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              });

        const data = await response.json();

        if (!response.ok) {
          showToast("error", data.error ?? "Could not save post.");
          return;
        }

        showToast(
          "success",
          mode === "create" ? "Blog post created." : "Blog post saved.",
        );

        if (mode === "create" && data.post?.id) {
          router.push(`/admin/blogs/${data.post.id}`);
          router.refresh();
          return;
        }

        router.push("/admin/blogs");
        router.refresh();
      } catch (err) {
        showToast(
          "error",
          err instanceof Error ? err.message : "Could not save post.",
        );
      }
    });
  };

  if (mode === "edit" && isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Loading post…
      </div>
    );
  }

  if (mode === "edit" && loadFailed) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 py-12 text-center">
        <p className="admin-subheading">
          This post could not be loaded. The database may be busy — try again.
        </p>
        <Link href="/admin/blogs" className="admin-btn-outline inline-block px-4 py-2.5 text-sm">
          Back to all posts
        </Link>
      </div>
    );
  }

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

        <div
          className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end"
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
