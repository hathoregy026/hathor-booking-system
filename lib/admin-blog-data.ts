import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  serializeAdminBlogPost,
  type AdminBlogPostListItem,
  type AdminBlogPostRow,
} from "@/lib/admin-blog";

const ADMIN_BLOG_LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  publishedAt: true,
  updatedAt: true,
} as const;

const ADMIN_BLOG_DETAIL_SELECT = {
  ...ADMIN_BLOG_LIST_SELECT,
  content: true,
  createdAt: true,
} as const;

type BlogPostListRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | Date;
  updatedAt: string | Date;
};

type BlogPostDetailRecord = BlogPostListRecord & {
  content: string;
  createdAt: string | Date;
};

function mapAdminBlogListItem(row: BlogPostListRecord): AdminBlogPostListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    publishedAt: new Date(row.publishedAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

function mapAdminBlogDetail(row: BlogPostDetailRecord): AdminBlogPostRow {
  return serializeAdminBlogPost({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    publishedAt: new Date(row.publishedAt),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  });
}

function prefersSupabaseBlogData(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return /db\.[a-z0-9-]+\.supabase\.co(?::5432)?/i.test(url);
}

async function listViaPrisma(): Promise<AdminBlogPostListItem[]> {
  const posts = await prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
    select: ADMIN_BLOG_LIST_SELECT,
  });

  return posts.map((post) =>
    mapAdminBlogListItem({
      ...post,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
    }),
  );
}

async function listViaSupabase(): Promise<AdminBlogPostListItem[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("BlogPost")
    .select("id, slug, title, excerpt, publishedAt, updatedAt")
    .order("publishedAt", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapAdminBlogListItem(row as BlogPostListRecord));
}

export async function fetchBlogPostsForAdmin(): Promise<AdminBlogPostListItem[]> {
  const attempts: Array<() => Promise<AdminBlogPostListItem[]>> = prefersSupabaseBlogData()
    ? [listViaSupabase, listViaPrisma, listViaSupabase]
    : [listViaPrisma, listViaSupabase];

  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (error) {
      console.error("[admin-blog-data] list attempt failed:", error);
    }
  }

  return [];
}

async function getByIdViaPrisma(id: string): Promise<AdminBlogPostRow | null> {
  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: ADMIN_BLOG_DETAIL_SELECT,
  });

  return post
    ? mapAdminBlogDetail({
        ...post,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })
    : null;
}

async function getByIdViaSupabase(id: string): Promise<AdminBlogPostRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("BlogPost")
    .select("id, slug, title, excerpt, content, publishedAt, createdAt, updatedAt")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapAdminBlogDetail(data as BlogPostDetailRecord) : null;
}

export async function fetchBlogPostForAdminById(
  id: string,
): Promise<AdminBlogPostRow | null> {
  const attempts: Array<() => Promise<AdminBlogPostRow | null>> = prefersSupabaseBlogData()
    ? [() => getByIdViaSupabase(id), () => getByIdViaPrisma(id), () => getByIdViaSupabase(id)]
    : [() => getByIdViaPrisma(id), () => getByIdViaSupabase(id)];

  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (error) {
      console.error("[admin-blog-data] get attempt failed:", error);
    }
  }

  return null;
}

export async function createBlogPostRecord(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: Date;
}): Promise<{ id: string }> {
  try {
    const post = await prisma.blogPost.create({
      data,
      select: { id: true },
    });
    return post;
  } catch (error) {
    console.error("[admin-blog-data] prisma create failed:", error);
  }

  const supabase = createSupabaseAdminClient();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const { data: row, error } = await supabase
    .from("BlogPost")
    .insert({
      id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      publishedAt: data.publishedAt.toISOString(),
      createdAt: now,
      updatedAt: now,
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: row.id };
}

export async function updateBlogPostRecord(
  id: string,
  data: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    publishedAt: Date;
  },
): Promise<void> {
  try {
    await prisma.blogPost.update({ where: { id }, data });
    return;
  } catch (error) {
    console.error("[admin-blog-data] prisma update failed:", error);
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("BlogPost")
    .update({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      publishedAt: data.publishedAt.toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteBlogPostRecord(id: string): Promise<string | null> {
  let slug: string | null = null;

  try {
    const existing = await prisma.blogPost.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!existing) return null;
    slug = existing.slug;
    await prisma.blogPost.delete({ where: { id } });
    return slug;
  } catch (error) {
    console.error("[admin-blog-data] prisma delete failed:", error);
  }

  const supabase = createSupabaseAdminClient();
  const { data: existing, error: fetchError } = await supabase
    .from("BlogPost")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!existing) return null;

  const { error: deleteError } = await supabase
    .from("BlogPost")
    .delete()
    .eq("id", id);

  if (deleteError) throw deleteError;
  return existing.slug;
}
