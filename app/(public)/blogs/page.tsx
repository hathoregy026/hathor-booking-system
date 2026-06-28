import type { Metadata } from "next";
import { BlogPageContent } from "@/components/pages/BlogPageContent";
import { getPublishedBlogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Luxury Nile Cruise Egypt | Travel Tips & Stories Blog",
  description:
    "Stories from the Nile — travel tips, ancient wonders, and inspiration for your Hathor Dahabiya luxury cruise in Egypt.",
  openGraph: {
    title: "Hathor Dahabiya Blog",
    description:
      "Explore Egypt through stories of timeless landmarks, culture, and gentle journeys on the Nile.",
  },
};

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const posts = await getPublishedBlogPosts();
  return <BlogPageContent posts={posts} />;
}
