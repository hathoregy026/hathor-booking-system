import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { buildPageMetadata } from "@/lib/seo/metadata";
import { clipMetaDescription, seoAbsoluteUrl } from "@/lib/seo/site";
import "../../../article-editorial.css";
import "../../../editorial-chrome.css";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog Post Not Found",
      robots: { index: false, follow: false },
    };
  }

  const imageUrl = "/media/hathor/r2/blog-hero.webp";

  return buildPageMetadata({
    title: `${post.title} | Hathor Journal`,
    description: clipMetaDescription(post.excerpt),
    path: `/blogs/${post.slug}`,
    ogType: "article",
    publishedTime: post.publishedAt.toISOString(),
    image: {
      url: imageUrl,
      width: 1920,
      height: 1280,
      alt: post.title,
    },
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const contentHtml = prepareBlogContentForRender(post.content, post.excerpt);

  /*
   * The reading section threads photographs between the prose. Splitting here
   * (server-side, where cheerio already runs) keeps the HTML balanced and
   * avoids shipping a parser to the browser. Four runs gives three interludes,
   * which suits article lengths from ~400 to ~2000 words; shorter pieces
   * simply yield fewer blocks and fewer pictures.
   */
  const articleBlocks = splitBlogHtmlIntoBlocks(contentHtml, 4);
  const interludeSlots = getBlogArticleImageNames(
    post.slug,
    Math.max(0, articleBlocks.length - 1),
  );

  const related = serializeBlogPostSummaries(
    (await getPublishedBlogPosts())
      .filter((entry) => entry.slug !== post.slug)
      .slice(0, 3),
  );

  const pageUrl = seoAbsoluteUrl(`/blogs/${post.slug}`);
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
              inLanguage: "en",
              mainEntityOfPage: pageUrl,
              image: seoAbsoluteUrl("/media/hathor/r2/blog-hero.webp"),
              author: { "@type": "Organization", name: "Hathor Dahabiya" },
              publisher: { "@id": `${origin}#organization` },
            },
            breadcrumbList(`/blogs/${post.slug}`, [
              { name: "Home", path: "/" },
              { name: "Journal", path: "/blogs" },
              { name: post.title, path: `/blogs/${post.slug}` },
            ]),
          ],
        }}
      />
      <BlogPostPageContent
        post={serializeBlogPostDetail(post)}
        heroImageName={getBlogHeroImageName(post.slug)}
        related={related}
        interludeSlots={interludeSlots}
        articleBlocks={articleBlocks.map((block, index) => (
          <BlogArticleBody key={index} html={block} />
        ))}
      />
    </>
  );
}
