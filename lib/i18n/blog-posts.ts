import { BLOG_POSTS_DE } from "@/lib/i18n/blog-posts-de";
import { BLOG_POSTS_IT, type PostWords } from "@/lib/i18n/blog-posts-it";
import { TRANSLATED_BLOG_SLUGS_DE } from "@/lib/i18n/blog-slugs-de";
import { TRANSLATED_BLOG_SLUGS_IT } from "@/lib/i18n/blog-slugs-it";
import type { PublicLocale, TranslatedLocale } from "@/lib/i18n/locale";

const BLOG_POSTS: Record<TranslatedLocale, Record<string, PostWords>> = {
  it: BLOG_POSTS_IT,
  de: BLOG_POSTS_DE,
};

const TRANSLATED: Record<TranslatedLocale, Set<string>> = {
  it: new Set(TRANSLATED_BLOG_SLUGS_IT),
  de: new Set(TRANSLATED_BLOG_SLUGS_DE),
};

/** A post's title and excerpt in a language; English, and untranslated posts, pass through. */
export function blogPostIn<T extends { slug: string; title: string; excerpt: string }>(
  post: T,
  locale: PublicLocale,
): T {
  if (locale === "en") return post;
  const words = BLOG_POSTS[locale][post.slug];
  return words ? { ...post, title: words.title, excerpt: words.excerpt } : post;
}

/** The posts a language's journal lists: in a translated language, only the translated ones. */
export function blogPostsListedIn<T extends { slug: string }>(
  posts: readonly T[],
  locale: PublicLocale,
): T[] {
  if (locale === "en") return [...posts];
  return posts.filter((post) => TRANSLATED[locale].has(post.slug) && BLOG_POSTS[locale][post.slug]);
}

/** Where a post opens: its article in this language once translated, otherwise the English one. */
export function blogPostHref(slug: string, locale: PublicLocale): string {
  return locale !== "en" && TRANSLATED[locale].has(slug)
    ? `/${locale}/blogs/${slug}`
    : `/blogs/${slug}`;
}
