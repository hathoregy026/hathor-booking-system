/**
 * Generates scripts/data/blog-posts.ts from scraped JSON.
 * Run: node scripts/generate-blog-posts-seed.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT = path.join(__dirname, "./data/blog-posts-content.json");
const OUTPUT = path.join(__dirname, "./data/blog-posts.ts");

function escapeString(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

const scraped = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const now = new Date().toISOString();

const posts = scraped.map((post) => ({
  slug: post.slug,
  title: post.scrapedTitle || post.title,
  excerpt: post.excerpt,
  content: post.content,
  publishedAt: post.scrapedPublishedAt || post.publishedAt,
  createdAt: post.publishedAt || now,
  updatedAt: now,
  author: post.author || "Hathor Dahabiya Cruise",
  sourceUrl: post.sourceUrl,
  urlSlug: post.urlSlug,
}));

const body = `/** Auto-generated from scripts/data/blog-posts-content.json — do not edit by hand. */
/** Regenerate: node scripts/generate-blog-posts-seed.mjs */

export type BlogPostSeedRecord = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  sourceUrl: string;
  urlSlug: string;
};

export const BLOG_POSTS: BlogPostSeedRecord[] = [
${posts
  .map(
    (post) => `  {
    slug: ${JSON.stringify(post.slug)},
    title: ${JSON.stringify(post.title)},
    excerpt: ${JSON.stringify(post.excerpt)},
    content: ${JSON.stringify(post.content)},
    publishedAt: ${JSON.stringify(post.publishedAt)},
    createdAt: ${JSON.stringify(post.createdAt)},
    updatedAt: ${JSON.stringify(post.updatedAt)},
    author: ${JSON.stringify(post.author)},
    sourceUrl: ${JSON.stringify(post.sourceUrl)},
    urlSlug: ${JSON.stringify(post.urlSlug)},
  }`,
  )
  .join(",\n")}
];
`;

fs.writeFileSync(OUTPUT, body, "utf8");
console.log(`Wrote ${posts.length} posts to ${OUTPUT}`);
