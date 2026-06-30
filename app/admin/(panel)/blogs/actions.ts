"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { assertAdminSession, AdminAuthError } from "@/lib/admin-server-auth";
import {
  parseBlogPostFormData,
  parsePublishedAt,
  resolveBlogSlug,
  serializeAdminBlogPost,
  type AdminBlogPostRow,
} from "@/lib/admin-blog";
import { withDb } from "@/lib/db-safe";
import { prisma } from "@/lib/prisma";
import { ZodError } from "zod";

export type BlogActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

function formatActionError(error: unknown): string {
  if (error instanceof AdminAuthError) {
    return "Your session has expired. Please sign in again.";
  }

  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Invalid form data.";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "A post with this slug already exists. Choose a different slug.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export async function listBlogPostsForAdmin(): Promise<AdminBlogPostRow[]> {
  await assertAdminSession();

  const posts = await withDb(() =>
    prisma.blogPost.findMany({
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  );

  return posts.map(serializeAdminBlogPost);
}

export async function getBlogPostForAdmin(
  id: string,
): Promise<AdminBlogPostRow | null> {
  await assertAdminSession();

  const post = await withDb(() =>
    prisma.blogPost.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  );

  return post ? serializeAdminBlogPost(post) : null;
}

export async function createBlogPost(
  formData: FormData,
): Promise<BlogActionResult<{ id: string }>> {
  try {
    await assertAdminSession();

    const input = parseBlogPostFormData(formData);
    const slug = resolveBlogSlug(input.title, input.slug);
    const publishedAt = parsePublishedAt(input.publishedAt);

    const post = await withDb(() =>
      prisma.blogPost.create({
        data: {
          title: input.title,
          slug,
          excerpt: input.excerpt,
          content: input.content,
          publishedAt,
        },
        select: { id: true },
      }),
    );

    revalidatePath("/admin/blogs");
    revalidatePath("/blogs");

    return { success: true, data: { id: post.id } };
  } catch (error) {
    console.error("[admin.blogs.create]", error);
    return { success: false, error: formatActionError(error) };
  }
}

export async function updateBlogPost(
  id: string,
  formData: FormData,
): Promise<BlogActionResult> {
  try {
    await assertAdminSession();

    if (!id?.trim()) {
      return { success: false, error: "Post ID is required." };
    }

    const input = parseBlogPostFormData(formData);
    const slug = resolveBlogSlug(input.title, input.slug);
    const publishedAt = parsePublishedAt(input.publishedAt);

    await withDb(() =>
      prisma.blogPost.update({
        where: { id },
        data: {
          title: input.title,
          slug,
          excerpt: input.excerpt,
          content: input.content,
          publishedAt,
        },
      }),
    );

    revalidatePath("/admin/blogs");
    revalidatePath("/blogs");
    revalidatePath(`/blogs/${slug}`);

    return { success: true };
  } catch (error) {
    console.error("[admin.blogs.update]", error);
    return { success: false, error: formatActionError(error) };
  }
}

export async function deleteBlogPost(
  id: string,
  confirm: boolean,
): Promise<BlogActionResult> {
  try {
    await assertAdminSession();

    if (!confirm) {
      return { success: false, error: "Deletion was not confirmed." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Post ID is required." };
    }

    const existing = await withDb(() =>
      prisma.blogPost.findUnique({
        where: { id },
        select: { slug: true },
      }),
    );

    if (!existing) {
      return { success: false, error: "Post not found." };
    }

    await withDb(() => prisma.blogPost.delete({ where: { id } }));

    revalidatePath("/admin/blogs");
    revalidatePath("/blogs");
    revalidatePath(`/blogs/${existing.slug}`);

    return { success: true };
  } catch (error) {
    console.error("[admin.blogs.delete]", error);
    return { success: false, error: formatActionError(error) };
  }
}
