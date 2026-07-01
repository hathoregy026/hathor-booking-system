"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/pages/PageHero";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  formatBlogPublishedDate,
  type BlogPostDetailClient,
} from "@/lib/blog-display";

type BlogPostPageContentProps = {
  post: BlogPostDetailClient;
  heroImageName: string;
  children: React.ReactNode;
};

export function BlogPostPageContent({
  post,
  heroImageName,
  children,
}: BlogPostPageContentProps) {
  return (
    <>
      <PageHero
        title={post.title}
        subtitle={post.excerpt}
        breadcrumb="Blog"
        imageName={heroImageName}
        imageAlt={post.title}
        variant="blog"
      />

      <article className="hathor-blog-article">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="hathor-blog-article__header">
              <Link href="/blogs" className="hathor-discover-link cursor-hover">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                <span>Back to Blog</span>
              </Link>
              <time
                dateTime={post.publishedAt}
                className="hathor-blog-article__date"
              >
                {formatBlogPublishedDate(post.publishedAt)}
              </time>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <div className="hathor-blog-article__body">{children}</div>
          </ScrollReveal>
        </div>
      </article>
    </>
  );
}
