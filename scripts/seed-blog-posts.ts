/**
 * Seeds all 44 BlogPost records with full scraped article content.
 *
 * Prerequisites:
 *   1. node scripts/scrape-blog-posts.mjs
 *   2. node scripts/generate-blog-posts-seed.mjs
 *
 * Run:
 *   npx tsx scripts/seed-blog-posts.ts
 */
import { config } from "dotenv";

config();

import { prisma } from "../lib/prisma";
import { createSupabaseAdminClient } from "../lib/supabase-server";
import { BLOG_POSTS } from "./data/blog-posts";

export { BLOG_POSTS };
export type { BlogPostSeedRecord } from "./data/blog-posts";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry<T>(
  label: string,
  fn: () => Promise<T>,
  attempts = 4,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      console.warn(`  ↻ retry ${attempt}/${attempts - 1} for ${label}`);
      await sleep(attempt * 1_500);
    }
  }

  throw lastError;
}

async function main() {
  if (BLOG_POSTS.length !== 44) {
    throw new Error(`Expected 44 blog posts, found ${BLOG_POSTS.length}`);
  }

  const slugSet = new Set<string>();
  for (const post of BLOG_POSTS) {
    if (slugSet.has(post.slug)) {
      throw new Error(`Duplicate blog slug: ${post.slug}`);
    }
    slugSet.add(post.slug);

    if (!post.content.trim()) {
      throw new Error(`Missing content for slug: ${post.slug}`);
    }
  }

  console.log(`Seeding ${BLOG_POSTS.length} blog posts with full content...`);

  let useSupabase = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    useSupabase = true;
    console.log("Prisma unreachable — using Supabase REST fallback.");
  }

  for (const post of BLOG_POSTS) {
    const publishedAt = new Date(post.publishedAt);
    const createdAt = new Date(post.createdAt);
    const updatedAt = new Date(post.updatedAt);

    if (useSupabase) {
      await withRetry(post.slug, async () => {
        const supabase = createSupabaseAdminClient();
        const { data, error } = await supabase
          .from("BlogPost")
          .update({
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            publishedAt: publishedAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
          })
          .eq("slug", post.slug)
          .select("id");

        if (error) {
          throw error;
        }

        if (!data?.length) {
          throw new Error(`Blog post not found for slug: ${post.slug}`);
        }
      });
    } else {
      await prisma.blogPost.upsert({
        where: { slug: post.slug },
        create: {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          publishedAt,
          createdAt,
          updatedAt,
        },
        update: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          publishedAt,
          updatedAt,
        },
      });
    }

    console.log(`  ✓ ${post.slug} (${post.content.length} chars)`);
  }

  if (useSupabase) {
    const supabase = createSupabaseAdminClient();
    const { count, error } = await supabase
      .from("BlogPost")
      .select("slug", { count: "exact", head: true })
      .neq("content", "");

    if (error) {
      throw error;
    }

    console.log(`\nDone. Blog posts with content: ${count ?? 0}/44`);
    return;
  }

  const withContent = await prisma.blogPost.count({
    where: {
      NOT: {
        content: "",
      },
    },
  });

  console.log(`\nDone. Blog posts with content: ${withContent}/44`);
}

main()
  .catch((error) => {
    console.error("Blog seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
