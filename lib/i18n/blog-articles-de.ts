/**
 * German article text by slug, for the /de/blogs/<slug> route only (server
 * side: the article HTML never ships to the browser bundle).
 */
import { BLOG_ARTICLES_DE_1 } from "@/lib/i18n/blog-articles-de/batch-1";
import { BLOG_ARTICLES_DE_2 } from "@/lib/i18n/blog-articles-de/batch-2";
import { BLOG_ARTICLES_DE_3 } from "@/lib/i18n/blog-articles-de/batch-3";
import { BLOG_ARTICLES_DE_4 } from "@/lib/i18n/blog-articles-de/batch-4";
import { BLOG_ARTICLES_DE_5 } from "@/lib/i18n/blog-articles-de/batch-5";
import { BLOG_ARTICLES_DE_6 } from "@/lib/i18n/blog-articles-de/batch-6";
import { BLOG_ARTICLES_DE_7 } from "@/lib/i18n/blog-articles-de/batch-7";
import { BLOG_ARTICLES_DE_8 } from "@/lib/i18n/blog-articles-de/batch-8";

export const BLOG_ARTICLES_DE: Record<string, string> = {
  ...BLOG_ARTICLES_DE_1,
  ...BLOG_ARTICLES_DE_2,
  ...BLOG_ARTICLES_DE_3,
  ...BLOG_ARTICLES_DE_4,
  ...BLOG_ARTICLES_DE_5,
  ...BLOG_ARTICLES_DE_6,
  ...BLOG_ARTICLES_DE_7,
  ...BLOG_ARTICLES_DE_8,
};
