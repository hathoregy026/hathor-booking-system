import type { Metadata } from "next";
import { BlogPageContent } from "@/components/pages/BlogPageContent";
import { LocaleWebsiteText } from "@/components/public/LocaleWebsiteText";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { serializeBlogPostSummaries } from "@/lib/blog-display";
import { getPublishedBlogPosts } from "@/lib/blog-posts";
import { blogPostIn } from "@/lib/i18n/blog-posts-it";
import { ITALIAN_PAGES } from "@/lib/i18n/pages-seo-it";
import "../../../journal-editorial.css";
import "../../../editorial-chrome.css";

const PAGE = ITALIAN_PAGES.blogs;

export const metadata: Metadata = PAGE.metadata;

export const dynamic = "force-dynamic";

export default async function ItalianBlogsPage() {
  const posts = serializeBlogPostSummaries(await getPublishedBlogPosts()).map(
    (post) => blogPostIn(post, "it"),
  );
  return (
    <>
      <PageStructuredData
        path={PAGE.path}
        name={PAGE.name}
        description={PAGE.description}
        breadcrumbs={[
          { name: "Home", path: "/it" },
          { name: PAGE.crumb, path: PAGE.path },
        ]}
        image="/media/hathor/r2/blog-hero.webp"
      />
      <LocaleWebsiteText locale="it">
        <BlogPageContent posts={posts} />
      </LocaleWebsiteText>
    </>
  );
}
