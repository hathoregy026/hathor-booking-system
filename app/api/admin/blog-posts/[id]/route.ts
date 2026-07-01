import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import {
  deleteBlogPostRecord,
  fetchBlogPostForAdminById,
  updateBlogPostRecord,
} from "@/lib/admin-blog-data";
import {
  parseBlogPostFormData,
  parsePublishedAt,
  resolveBlogSlug,
} from "@/lib/admin-blog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const post = await fetchBlogPostForAdminById(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("[admin.blog-posts.[id].GET]", error);
    return NextResponse.json(
      { error: "Could not load this blog post." },
      { status: 503 },
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const input = parseBlogPostFormData(
      objectToFormData(body as Record<string, string>),
    );
    const slug = resolveBlogSlug(input.title, input.slug);
    const publishedAt = parsePublishedAt(input.publishedAt);

    await updateBlogPostRecord(id, {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: input.content,
      publishedAt,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin.blog-posts.[id].PUT]", error);
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const slug = await deleteBlogPostRecord(id);

    if (!slug) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin.blog-posts.[id].DELETE]", error);
    return handleRouteError(error);
  }
}

function objectToFormData(obj: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(obj)) {
    formData.set(key, value ?? "");
  }
  return formData;
}
