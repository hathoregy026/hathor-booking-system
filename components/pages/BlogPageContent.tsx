"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingCtaBand } from "@/components/pages/MarketingCtaBand";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  formatBlogPublishedDate,
  type BlogPostSummaryClient,
} from "@/lib/blog-display";
import { BLOG_PAGE } from "@/lib/page-content";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";

const BLOG_IMAGE_NAMES = [
  "highlights-hero",
  "highlights-lifestyle",
  "landmark-hatshepsut",
  "landmark-obelisk",
  "landmark-valley-kings",
  "gastronomy-hero",
] as const;

const PAGE_SIZE = 12;

type BlogPageContentProps = {
  posts: BlogPostSummaryClient[];
};

export function BlogPageContent({ posts }: BlogPageContentProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visiblePosts = useMemo(
    () => posts.slice(0, visibleCount),
    [posts, visibleCount],
  );
  const { pages } = useWebsiteText();

  return (
    <PageScrollTransition
      title={BLOG_PAGE.hero.title}
      subtitle={BLOG_PAGE.hero.subtitle}
      breadcrumb="Blog"
      imageName="blog-hero"
      heroPage="blog"
    >

      <section className="hathor-section hathor-section--dark">
        <div className="page-container">
          <ScrollReveal>
            <div className="section-header">
              <p className="section-body typo-body-text mx-auto max-w-3xl text-center">
                {pages.blog.intro}
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePosts.map((post, index) => (
              <ScrollReveal key={post.slug} delay={(index % PAGE_SIZE) * 40}>
                <article className="hathor-blog-card group">
                  <Link href={`/blogs/${post.slug}`} className="block">
                    <div className="hathor-blog-card__image">
                      <ManagedImage
                        name={BLOG_IMAGE_NAMES[index % BLOG_IMAGE_NAMES.length]}
                        alt=""
                        fill
                        previewAnchor={false}
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="hathor-blog-card__body">
                      <time
                        dateTime={post.publishedAt}
                        className="section-indication typo-page-subtitle"
                      >
                        {formatBlogPublishedDate(post.publishedAt)}
                      </time>
                      <h2 className="hathor-blog-card__title">{post.title}</h2>
                      <p className="hathor-blog-card__excerpt">{post.excerpt}</p>
                      <span className="btn btn-primary mt-4">
                        <span>Read more</span>
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </article>
              </ScrollReveal>
            ))}
          </div>

          {visibleCount < posts.length ? (
            <div className="mt-12 text-center">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                Show More
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <MarketingCtaBand />
    </PageScrollTransition>
  );
}
