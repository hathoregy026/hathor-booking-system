import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BlogArticleBody } from "@/components/pages/BlogArticleBody";
import { BlogPostPageContent } from "@/components/pages/BlogPostPageContent";
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
import { BLOG_ARTICLES_IT } from "@/lib/i18n/blog-articles-it";
import { blogPostIn } from "@/lib/i18n/blog-posts-it";
import { TRANSLATED_BLOG_SLUGS_IT } from "@/lib/i18n/blog-slugs-it";
import { localizedHref } from "@/lib/i18n/locale";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { clipMetaDescription, seoAbsoluteUrl } from "@/lib/seo/site";
import "../../../../article-editorial.css";
import "../../../../editorial-chrome.css";

type ItalianBlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

/** The Italian article, or null while the post is only in English. */
function italianArticle(slug: string): string | null {
  return TRANSLATED_BLOG_SLUGS_IT.includes(slug) ? (BLOG_ARTICLES_IT[slug] ?? null) : null;
}

/** Internal links in the article lead to their Italian pages where those exist. */
function italianLinks(html: string): string {
  return html.replace(/href="(\/[^"]*)"/g, (_, href: string) => `href="${localizedHref(href, "it")}"`);
}

export async function generateMetadata({
  params,
}: ItalianBlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const source = italianArticle(slug) ? await getPublishedBlogPostBySlug(slug) : null;

  if (!source) {
    return {
      title: "Articolo non trovato",
      robots: { index: false, follow: false },
    };
  }

  const post = blogPostIn(source, "it");

  return buildPageMetadata({
    title: `${post.title} | Hathor Journal`,
    description: clipMetaDescription(post.excerpt),
    path: `/it/blogs/${post.slug}`,
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

export default async function ItalianBlogPostPage({ params }: ItalianBlogPostPageProps) {
  const { slug } = await params;
  const article = italianArticle(slug);
  /* A post not yet in Italian opens in English. */
  if (!article) redirect(`/blogs/${slug}`);

  const source = await getPublishedBlogPostBySlug(slug);
  if (!source) notFound();

  const post = { ...blogPostIn(source, "it"), content: article };
  const contentHtml = italianLinks(prepareBlogContentForRender(post.content, post.excerpt));

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
  ).map((entry) => blogPostIn(entry, "it"));

  const path = `/it/blogs/${post.slug}`;
  const pageUrl = seoAbsoluteUrl(path);
  const origin = seoAbsoluteUrl("/");
  const description = clipMetaDescription(post.excerpt);

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
              inLanguage: "it",
              mainEntityOfPage: pageUrl,
              image: seoAbsoluteUrl("/media/hathor/r2/blog-hero.webp"),
              author: { "@type": "Organization", name: "Hathor Dahabiya" },
              publisher: { "@id": `${origin}#organization` },
            },
            breadcrumbList(path, [
              { name: "Home", path: "/it" },
              { name: "Journal", path: "/it/blogs" },
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
