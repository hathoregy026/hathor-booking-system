import type { Metadata } from "next";
import { BlogPageContent } from "@/components/pages/BlogPageContent";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { serializeBlogPostSummaries } from "@/lib/blog-display";
import { getPublishedBlogPosts } from "@/lib/blog-posts";
import { BLOGS_SEO } from "@/lib/seo/page-metadata";
import "../../journal-editorial.css";
import "../../editorial-chrome.css";

export const metadata: Metadata = BLOGS_SEO;

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const posts = serializeBlogPostSummaries(await getPublishedBlogPosts());
  return (
    <>
      <PageStructuredData
        path="/blogs"
        name="Nile Cruise Journal | Hathor Dahabiya Stories"
        description={
          typeof BLOGS_SEO.description === "string" ? BLOGS_SEO.description : ""
        }
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Journal", path: "/blogs" },
        ]}
        image="/media/hathor/r2/blog-hero.webp"
      />
      <BlogPageContent posts={posts} />
    </>
  );
}
