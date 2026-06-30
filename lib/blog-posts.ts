import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export type BlogPostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: Date;
};

export type BlogPostDetail = BlogPostSummary & {
  content: string;
};

type BlogPostRow = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Direct Supabase DB hosts are often unreachable locally; prefer REST for blog reads. */
function prefersSupabaseBlogData(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return /db\.[a-z0-9-]+\.supabase\.co(?::5432)?/i.test(url);
}

const BLOG_POST_LIST_SELECT = {
  slug: true,
  title: true,
  excerpt: true,
  publishedAt: true,
} as const;

const BLOG_POST_DETAIL_SELECT = {
  ...BLOG_POST_LIST_SELECT,
  content: true,
} as const;

export function isValidBlogSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && slug.length <= 200;
}

function mapBlogPostSummary(row: BlogPostRow): BlogPostSummary {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    publishedAt: new Date(row.publishedAt),
  };
}

function mapBlogPostDetail(
  row: BlogPostRow & { content: string },
): BlogPostDetail {
  return {
    ...mapBlogPostSummary(row),
    content: row.content,
  };
}

async function getPublishedBlogPostsViaPrisma(): Promise<BlogPostSummary[]> {
  return prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
    select: BLOG_POST_LIST_SELECT,
  });
}

async function getPublishedBlogPostBySlugViaPrisma(
  slug: string,
): Promise<BlogPostDetail | null> {
  return prisma.blogPost.findUnique({
    where: { slug },
    select: BLOG_POST_DETAIL_SELECT,
  });
}

async function getPublishedBlogPostsViaSupabase(): Promise<BlogPostSummary[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("BlogPost")
    .select("slug, title, excerpt, publishedAt")
    .order("publishedAt", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapBlogPostSummary(row as BlogPostRow));
}

async function getPublishedBlogPostBySlugViaSupabase(
  slug: string,
): Promise<BlogPostDetail | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("BlogPost")
    .select("slug, title, excerpt, content, publishedAt")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapBlogPostDetail(data as BlogPostRow & { content: string });
}

export async function getPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  if (prefersSupabaseBlogData()) {
    try {
      return await getPublishedBlogPostsViaSupabase();
    } catch (fallbackError) {
      console.error("[blog-posts] supabase-first load failed:", fallbackError);
    }
  }

  try {
    return await getPublishedBlogPostsViaPrisma();
  } catch (prismaError) {
    console.error(
      "[blog-posts] prisma failed, trying supabase fallback:",
      prismaError,
    );
  }

  try {
    return await getPublishedBlogPostsViaSupabase();
  } catch (fallbackError) {
    console.error("[blog-posts] failed to load posts:", fallbackError);
    return [];
  }
}

export async function getPublishedBlogPostBySlug(
  slug: string,
): Promise<BlogPostDetail | null> {
  if (!isValidBlogSlug(slug)) {
    return null;
  }

  if (prefersSupabaseBlogData()) {
    try {
      return await getPublishedBlogPostBySlugViaSupabase(slug);
    } catch (fallbackError) {
      console.error("[blog-posts] supabase-first slug load failed:", fallbackError);
    }
  }

  try {
    return await getPublishedBlogPostBySlugViaPrisma(slug);
  } catch (prismaError) {
    console.error(
      "[blog-posts] prisma failed, trying supabase fallback:",
      prismaError,
    );
  }

  try {
    return await getPublishedBlogPostBySlugViaSupabase(slug);
  } catch (fallbackError) {
    console.error("[blog-posts] failed to load post:", fallbackError);
    return null;
  }
}
