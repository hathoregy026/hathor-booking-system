import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostPageContent } from "@/components/pages/BlogPostPageContent";
import {
  getBlogHeroImageName,
  serializeBlogPostDetail,
} from "@/lib/blog-display";
import { prepareBlogContentForRender } from "@/lib/blog-html";
import { getPublishedBlogPostBySlug } from "@/lib/blog-posts";

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

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <BlogPostPageContent
      post={serializeBlogPostDetail(post)}
      heroImageName={getBlogHeroImageName(post.slug)}
      contentHtml={prepareBlogContentForRender(post.content, post.excerpt)}
    />
  );
}
