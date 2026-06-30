"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { assertAdminSession, AdminAuthError } from "@/lib/admin-server-auth";
import {
  createBlogPostRecord,
  deleteBlogPostRecord,
  fetchBlogPostForAdminById,
  fetchBlogPostsForAdmin,
  updateBlogPostRecord,
} from "@/lib/admin-blog-data";
import {
  parseBlogPostFormData,
  parsePublishedAt,
  resolveBlogSlug,
  type AdminBlogPostRow,
} from "@/lib/admin-blog";
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
    if (error.message.includes("duplicate key")) {
      return "A post with this slug already exists. Choose a different slug.";
    }
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export async function listBlogPostsForAdmin(): Promise<AdminBlogPostRow[]> {
  await assertAdminSession();
  return fetchBlogPostsForAdmin();
}

export async function getBlogPostForAdmin(
  id: string,
): Promise<AdminBlogPostRow | null> {
  await assertAdminSession();
  return fetchBlogPostForAdminById(id);
}

export async function createBlogPost(
  formData: FormData,
): Promise<BlogActionResult<{ id: string }>> {
  try {
    await assertAdminSession();

    const input = parseBlogPostFormData(formData);
    const slug = resolveBlogSlug(input.title, input.slug);
    const publishedAt = parsePublishedAt(input.publishedAt);

    const post = await createBlogPostRecord({
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: input.content,
      publishedAt,
    });

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

    await updateBlogPostRecord(id, {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: input.content,
      publishedAt,
    });

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

    const slug = await deleteBlogPostRecord(id);

    if (!slug) {
      return { success: false, error: "Post not found." };
    }

    revalidatePath("/admin/blogs");
    revalidatePath("/blogs");
    revalidatePath(`/blogs/${slug}`);

    return { success: true };
  } catch (error) {
    console.error("[admin.blogs.delete]", error);
    return { success: false, error: formatActionError(error) };
  }
}
