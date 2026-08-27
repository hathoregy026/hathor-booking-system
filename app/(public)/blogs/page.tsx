import type { Metadata } from "next";
import { BlogPageContent } from "@/components/pages/BlogPageContent";
import { serializeBlogPostSummaries } from "@/lib/blog-display";
import { getPublishedBlogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Hathor Journal | Luxury Nile Cruise Stories and Egypt Travel",
  description:
    "Read Hathor's Nile journal for expert Egypt travel inspiration, ancient landmark stories, Dahabiya cruise guidance, and thoughtful journeys between Luxor and Aswan.",
  keywords: [
    "luxury Nile cruise blog",
    "Egypt travel journal",
    "Dahabiya cruise guide",
    "Luxor Aswan travel stories",
    "Hathor Dahabiya journal",
  ],
  alternates: {
    canonical: "/blogs",
  },
  openGraph: {
    title: "Hathor Journal | Nile Stories and Egypt Travel",
    description:
      "Explore Egypt through stories of timeless landmarks, culture, and gentle journeys on the Nile.",
    type: "website",
    images: [
      {
        url: "/media/hathor/r2/blog-hero.webp",
        width: 1920,
        height: 1280,
        alt: "Hathor Journal stories from the Nile in Egypt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hathor Journal | Nile Stories and Egypt Travel",
    description:
      "Travel guidance, ancient wonders, and stories for an unhurried Dahabiya journey through Egypt.",
    images: ["/media/hathor/r2/blog-hero.webp"],
  },
};

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const posts = serializeBlogPostSummaries(await getPublishedBlogPosts());
  return <BlogPageContent posts={posts} />;
}
