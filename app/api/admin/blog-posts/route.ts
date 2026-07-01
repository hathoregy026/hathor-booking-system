import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import {
  createBlogPostRecord,
  fetchBlogPostsForAdmin,
} from "@/lib/admin-blog-data";
import {
  parseBlogPostFormData,
  parsePublishedAt,
  resolveBlogSlug,
} from "@/lib/admin-blog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const posts = await fetchBlogPostsForAdmin();
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[admin.blog-posts.GET]", error);
    return NextResponse.json(
      {
        error: "Could not load blog posts. Wait a moment and refresh.",
        posts: [],
      },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = parseBlogPostFormData(
      objectToFormData(body as Record<string, string>),
    );
    const slug = resolveBlogSlug(input.title, input.slug);
    const publishedAt = parsePublishedAt(input.publishedAt);

    const post = await createBlogPostRecord({
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: input.content,
      publishedAt,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[admin.blog-posts.POST]", error);
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
