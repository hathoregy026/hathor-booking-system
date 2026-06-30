import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { serializeAdminBlogPost, type AdminBlogPostRow } from "@/lib/admin-blog";

const ADMIN_BLOG_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  content: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

type BlogPostRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
};

function mapAdminBlogPost(row: BlogPostRecord): AdminBlogPostRow {
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

async function listViaPrisma(): Promise<AdminBlogPostRow[]> {
  const posts = await prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
    select: ADMIN_BLOG_SELECT,
  });
  return posts.map(serializeAdminBlogPost);
}

async function listViaSupabase(): Promise<AdminBlogPostRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("BlogPost")
    .select("id, slug, title, excerpt, content, publishedAt, createdAt, updatedAt")
    .order("publishedAt", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapAdminBlogPost(row as BlogPostRecord));
}

export async function fetchBlogPostsForAdmin(): Promise<AdminBlogPostRow[]> {
  if (prefersSupabaseBlogData()) {
    try {
      return await listViaSupabase();
    } catch (error) {
      console.error("[admin-blog-data] supabase list failed:", error);
    }
  }

  try {
    return await listViaPrisma();
  } catch (error) {
    console.error("[admin-blog-data] prisma list failed:", error);
  }

  return listViaSupabase();
}

async function getByIdViaPrisma(id: string): Promise<AdminBlogPostRow | null> {
  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: ADMIN_BLOG_SELECT,
  });
  return post ? serializeAdminBlogPost(post) : null;
}

async function getByIdViaSupabase(id: string): Promise<AdminBlogPostRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("BlogPost")
    .select("id, slug, title, excerpt, content, publishedAt, createdAt, updatedAt")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapAdminBlogPost(data as BlogPostRecord) : null;
}

export async function fetchBlogPostForAdminById(
  id: string,
): Promise<AdminBlogPostRow | null> {
  if (prefersSupabaseBlogData()) {
    try {
      return await getByIdViaSupabase(id);
    } catch (error) {
      console.error("[admin-blog-data] supabase get failed:", error);
    }
  }

  try {
    return await getByIdViaPrisma(id);
  } catch (error) {
    console.error("[admin-blog-data] prisma get failed:", error);
  }

  return getByIdViaSupabase(id);
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
