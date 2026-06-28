import { prisma } from "@/lib/prisma";

export type BlogPostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: Date;
};

export async function getPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  try {
    return await prisma.blogPost.findMany({
      orderBy: { publishedAt: "desc" },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        publishedAt: true,
      },
    });
  } catch (error) {
    console.error("[blog-posts] failed to load posts:", error);
    return [];
  }
}
