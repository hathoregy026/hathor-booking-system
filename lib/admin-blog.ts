import { z } from "zod";
import { resolveBlogSlug } from "@/lib/blog-slug";

export type AdminBlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export const blogPostFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  slug: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => value ?? ""),
  excerpt: z.string().trim().min(1, "Excerpt is required").max(2000),
  content: z.string().max(500_000),
  publishedAt: z.string().min(1, "Published date is required"),
});

export type BlogPostFormInput = z.infer<typeof blogPostFormSchema>;

export { resolveBlogSlug, slugifyBlogTitle } from "@/lib/blog-slug";

export function parsePublishedAt(value: string): Date {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid published date.");
  }
  return parsed;
}

export function serializeAdminBlogPost(post: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}): AdminBlogPostRow {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    publishedAt: post.publishedAt.toISOString(),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export function parseBlogPostFormData(formData: FormData): BlogPostFormInput {
  return blogPostFormSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    publishedAt: formData.get("publishedAt"),
  });
}
