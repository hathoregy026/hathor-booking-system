"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import "@/app/hathor-editorial-pages.css";
import { MarketingCtaBand } from "@/components/pages/MarketingCtaBand";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import {
  formatBlogPublishedDate,
  type BlogPostSummaryClient,
} from "@/lib/blog-display";

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
      title="Journal"
      secondTitle="Stories of the Nile"
      breadcrumb="Journal"
      imageName="blog-hero"
      heroPage="blog"
      editorial
    >
      <main className="hathor-editorial-page hep-journal">
        <section className="hep-intro" aria-labelledby="journal-intro-title">
          <p className="hep-kicker">Hathor Journal · Egypt</p>
          <h2 id="journal-intro-title" className="hep-title">
            Notes from<br />the river
          </h2>
          <p className="hep-intro__copy">
            {pages.blog.intro}
          </p>
          <p className="hep-folio" aria-hidden="true">Vol. 01 · 2026</p>
        </section>

        {visiblePosts.length ? (
          <ol className="hep-journal__list">
            {visiblePosts.map((post, index) => (
              <li key={post.slug} className="hep-journal__item">
                <Link
                  href={`/blogs/${post.slug}`}
                  className="hep-journal__media"
                  aria-label={`Read ${post.title}`}
                >
                  <ManagedImage
                    name={BLOG_IMAGE_NAMES[index % BLOG_IMAGE_NAMES.length]}
                    alt={`Editorial view for ${post.title}`}
                    fill
                    previewAnchor={false}
                    className="object-cover"
                    sizes="(max-width: 900px) 100vw, 58vw"
                  />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </Link>
                <article className="hep-journal__copy">
                  <time dateTime={post.publishedAt} className="hep-kicker">
                    {formatBlogPublishedDate(post.publishedAt)}
                  </time>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <Link href={`/blogs/${post.slug}`} className="hep-link">
                    Read the story <ArrowRight aria-hidden="true" />
                  </Link>
                </article>
              </li>
            ))}
          </ol>
        ) : (
          <section className="hep-empty" aria-live="polite">
            <p className="hep-kicker">The next chapter</p>
            <h2 className="hep-title">Stories are arriving soon.</h2>
          </section>
        )}

        {visibleCount < posts.length ? (
          <div className="hep-more">
            <button
              type="button"
              className="hep-button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              Show more stories
            </button>
          </div>
        ) : null}

        <MarketingCtaBand />
      </main>
    </PageScrollTransition>
  );
}
