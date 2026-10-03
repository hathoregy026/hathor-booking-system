/**
 * Italian article text by slug, for the /it/blogs/<slug> route only (server
 * side: the article HTML never ships to the browser bundle).
 */
import { BLOG_ARTICLES_IT_1 } from "@/lib/i18n/blog-articles-it/batch-1";
import { BLOG_ARTICLES_IT_2 } from "@/lib/i18n/blog-articles-it/batch-2";
import { BLOG_ARTICLES_IT_3 } from "@/lib/i18n/blog-articles-it/batch-3";

export const BLOG_ARTICLES_IT: Record<string, string> = {
  ...BLOG_ARTICLES_IT_1,
  ...BLOG_ARTICLES_IT_2,
  ...BLOG_ARTICLES_IT_3,
};
