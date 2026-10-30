import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BlogArticleBody } from "@/components/pages/BlogArticleBody";
import { BlogPageContent } from "@/components/pages/BlogPageContent";
import { BlogPostPageContent } from "@/components/pages/BlogPostPageContent";
import { LocaleContentPage } from "@/components/pages/locale/LocaleContentPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbList } from "@/components/seo/PageStructuredData";
import {
  getBlogArticleImageNames,
  getBlogHeroImageName,
  serializeBlogPostDetail,
  serializeBlogPostSummaries,
} from "@/lib/blog-display";
import {
  prepareBlogContentForRender,
  splitBlogHtmlIntoBlocks,
} from "@/lib/blog-html";
import {
  getPublishedBlogPostBySlug,
  getPublishedBlogPosts,
} from "@/lib/blog-posts";
import { BLOG_ARTICLES } from "@/lib/i18n/blog-articles";
import { blogPostIn } from "@/lib/i18n/blog-posts";
import {
  isTranslatedPath,
  localizedHref,
  PUBLIC_LOCALE_HTML_LANG,
  type TranslatedLocale,
} from "@/lib/i18n/locale";
import { LOCALE_BLOG_WORDS, LOCALE_CRUMBS, LOCALE_PAGES } from "@/lib/i18n/locale-pages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { clipMetaDescription, seoAbsoluteUrl } from "@/lib/seo/site";

/** The article in this language, or null while the post is only in English. */
function translatedArticle(locale: TranslatedLocale, slug: string): string | null {
  return isTranslatedPath(`/blogs/${slug}`, locale) ? (BLOG_ARTICLES[locale][slug] ?? null) : null;
}

/** Internal links in the article lead to this language's pages where those exist. */
function localizeLinks(html: string, locale: TranslatedLocale): string {
  return html.replace(/href="(\/[^"]*)"/g, (_, href: string) => `href="${localizedHref(href, locale)}"`);
}

/** The journal index in a translated language. */
export async function LocaleBlogIndexPage({ locale }: { locale: TranslatedLocale }) {
  const posts = serializeBlogPostSummaries(await getPublishedBlogPosts()).map(
    (post) => blogPostIn(post, locale),
  );
  return (
    <LocaleContentPage
      locale={locale}
      page={LOCALE_PAGES[locale].blogs}
      image="/media/hathor/r2/blog-hero.webp"
    >
      <BlogPageContent posts={posts} />
    </LocaleContentPage>
  );
}

export async function localeBlogPostMetadata(
  locale: TranslatedLocale,
  slug: string,
): Promise<Metadata> {
  const source = translatedArticle(locale, slug) ? await getPublishedBlogPostBySlug(slug) : null;

  if (!source) {
    return {
      title: LOCALE_BLOG_WORDS[locale].notFound,
      robots: { index: false, follow: false },
    };
  }

  const post = blogPostIn(source, locale);
  /* Translated titles run longer than English; past 60 characters the journal
     suffix only pushes the article's own words out of the search snippet. */
  const titleWithBrand = `${post.title} | Hathor Journal`;

  return buildPageMetadata({
    title: titleWithBrand.length <= 60 ? titleWithBrand : post.title,
    description: clipMetaDescription(post.excerpt),
    path: `/${locale}/blogs/${post.slug}`,
    ogType: "article",
    publishedTime: post.publishedAt.toISOString(),
    image: {
      url: "/media/hathor/r2/blog-hero.webp",
      width: 1920,
      height: 1280,
      alt: post.title,
    },
  });
}

/** A journal article in a translated language. */
export async function LocaleBlogPostPage({
  locale,
  slug,
}: {
  locale: TranslatedLocale;
  slug: string;
}) {
  const article = translatedArticle(locale, slug);
  const source = await getPublishedBlogPostBySlug(slug);
  /* An address that matches no post gets this language's 404, not an English one. */
  if (!source) notFound();
  /* A post not yet translated opens in English. */
  if (!article) redirect(`/blogs/${slug}`);

  const post = { ...blogPostIn(source, locale), content: article };
  const contentHtml = localizeLinks(prepareBlogContentForRender(post.content, post.excerpt), locale);

  /* Same reading layout as the English article: four runs, three interludes. */
  const articleBlocks = splitBlogHtmlIntoBlocks(contentHtml, 4);
  const interludeSlots = getBlogArticleImageNames(
    post.slug,
    Math.max(0, articleBlocks.length - 1),
  );

  const related = serializeBlogPostSummaries(
    (await getPublishedBlogPosts())
      .filter((entry) => entry.slug !== post.slug)
      .slice(0, 3),
  ).map((entry) => blogPostIn(entry, locale));

  const path = `/${locale}/blogs/${post.slug}`;
  const pageUrl = seoAbsoluteUrl(path);
  const origin = seoAbsoluteUrl("/");
  const description = clipMetaDescription(post.excerpt);
  const crumbs = LOCALE_CRUMBS[locale];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "@id": `${pageUrl}#article`,
              headline: post.title,
              description,
              datePublished: post.publishedAt.toISOString(),
              dateModified: post.publishedAt.toISOString(),
              inLanguage: PUBLIC_LOCALE_HTML_LANG[locale],
              mainEntityOfPage: pageUrl,
              image: seoAbsoluteUrl("/media/hathor/r2/blog-hero.webp"),
              author: { "@type": "Organization", name: "Hathor Dahabiya" },
              publisher: { "@id": `${origin}#organization` },
            },
            breadcrumbList(path, [
              { name: crumbs.home, path: `/${locale}` },
              { name: crumbs.journal, path: `/${locale}/blogs` },
              { name: post.title, path },
            ]),
          ],
        }}
      />
      <BlogPostPageContent
        post={serializeBlogPostDetail(post)}
        heroImageName={getBlogHeroImageName(post.slug)}
        related={related}
        interludeSlots={interludeSlots}
        sourceTitle={source.title}
        articleBlocks={articleBlocks.map((block, index) => (
          <BlogArticleBody key={index} html={block} />
        ))}
      />
    </>
  );
}
