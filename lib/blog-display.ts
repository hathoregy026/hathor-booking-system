export const BLOG_HERO_IMAGE_NAMES = [
  "highlights-hero",
  "highlights-lifestyle",
  "landmark-hatshepsut",
  "landmark-obelisk",
  "landmark-valley-kings",
  "gastronomy-hero",
] as const;

export type BlogPostSummaryClient = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
};

export type BlogPostDetailClient = BlogPostSummaryClient & {
  content: string;
};

export function serializeBlogPostSummaries(
  posts: Array<{
    slug: string;
    title: string;
    excerpt: string;
    publishedAt: Date;
  }>,
): BlogPostSummaryClient[] {
  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt.toISOString(),
  }));
}

export function serializeBlogPostDetail(post: {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: Date;
}): BlogPostDetailClient {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    publishedAt: post.publishedAt.toISOString(),
  };
}

export function formatBlogPublishedDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getBlogHeroImageName(slug: string): (typeof BLOG_HERO_IMAGE_NAMES)[number] {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash + slug.charCodeAt(i)) % BLOG_HERO_IMAGE_NAMES.length;
  }
  return BLOG_HERO_IMAGE_NAMES[hash]!;
}

/** Supporting crop for article layouts — offset from the hero slot. */
export function getBlogSupportImageName(
  slug: string,
): (typeof BLOG_HERO_IMAGE_NAMES)[number] {
  const hero = getBlogHeroImageName(slug);
  const index = BLOG_HERO_IMAGE_NAMES.indexOf(hero);
  const next = (index + 2) % BLOG_HERO_IMAGE_NAMES.length;
  return BLOG_HERO_IMAGE_NAMES[next]!;
}

export function getBlogArticleParagraphs(
  content: string,
  excerpt: string,
): string[] {
  const trimmed = content.trim();
  if (trimmed) {
    return trimmed
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }
  return [excerpt];
}

/**
 * A deterministic run of image slots for one article, offset by the slug so
 * two articles rarely open with the same picture, and with no slot repeating
 * back-to-back inside a single piece.
 */
export function getBlogArticleImageNames(
  slug: string,
  count: number,
): Array<(typeof BLOG_HERO_IMAGE_NAMES)[number]> {
  const pool = BLOG_HERO_IMAGE_NAMES;
  const start = pool.indexOf(getBlogHeroImageName(slug));
  return Array.from(
    { length: Math.max(0, count) },
    (_, index) => pool[(start + 1 + index * 2) % pool.length]!,
  );
}
