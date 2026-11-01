/**
 * Article text by language and slug, for the /<locale>/blogs/<slug> routes only
 * (server side: the article HTML never ships to the browser bundle).
 */
import { BLOG_ARTICLES_DE } from "@/lib/i18n/blog-articles-de";
import { BLOG_ARTICLES_IT } from "@/lib/i18n/blog-articles-it";
import type { TranslatedLocale } from "@/lib/i18n/locale";

export const BLOG_ARTICLES: Record<TranslatedLocale, Record<string, string>> = {
  it: BLOG_ARTICLES_IT,
  de: BLOG_ARTICLES_DE,
};
