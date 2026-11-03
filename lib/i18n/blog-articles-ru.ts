/**
 * Russian article text by slug, for the /ru/blogs/<slug> route only (server
 * side: the article HTML never ships to the browser bundle).
 */
import { BLOG_ARTICLES_RU_1 } from "@/lib/i18n/blog-articles-ru/batch-1";
import { BLOG_ARTICLES_RU_2 } from "@/lib/i18n/blog-articles-ru/batch-2";
import { BLOG_ARTICLES_RU_3 } from "@/lib/i18n/blog-articles-ru/batch-3";
import { BLOG_ARTICLES_RU_4 } from "@/lib/i18n/blog-articles-ru/batch-4";
import { BLOG_ARTICLES_RU_5 } from "@/lib/i18n/blog-articles-ru/batch-5";
import { BLOG_ARTICLES_RU_6 } from "@/lib/i18n/blog-articles-ru/batch-6";
import { BLOG_ARTICLES_RU_7 } from "@/lib/i18n/blog-articles-ru/batch-7";
import { BLOG_ARTICLES_RU_8 } from "@/lib/i18n/blog-articles-ru/batch-8";

export const BLOG_ARTICLES_RU: Record<string, string> = {
  ...BLOG_ARTICLES_RU_1,
  ...BLOG_ARTICLES_RU_2,
  ...BLOG_ARTICLES_RU_3,
  ...BLOG_ARTICLES_RU_4,
  ...BLOG_ARTICLES_RU_5,
  ...BLOG_ARTICLES_RU_6,
  ...BLOG_ARTICLES_RU_7,
  ...BLOG_ARTICLES_RU_8,
};
