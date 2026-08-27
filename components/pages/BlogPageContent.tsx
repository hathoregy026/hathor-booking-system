"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { AnimaSplitLine } from "@/components/public/AnimaSplitLine";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useTypographySettings } from "@/components/public/TypographySettingsProvider";
import { useJournalEditorialScroll } from "@/hooks/useJournalEditorialScroll";
import {
  formatBlogPublishedDate,
  getBlogHeroImageName,
  type BlogPostSummaryClient,
} from "@/lib/blog-display";
import { BLOG_PAGE } from "@/lib/page-content";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";
import { stackedHeroLines } from "@/lib/website-text-shared";

const ARCHIVE_PAGE_SIZE = 10;
const CONTENTS_COUNT = 6;

const JOURNAL_THEMES = [
  { word: "Temples", note: "Stone & light" },
  { word: "River", note: "Current & calm" },
  { word: "Seasons", note: "When to sail" },
  { word: "Voyage", note: "Dahabiya life" },
] as const;

function JournalMedia({
  slot,
  alt,
  priority = false,
  className = "",
  ratio,
}: {
  slot: string;
  alt: string;
  priority?: boolean;
  className?: string;
  ratio?: string;
}) {
  const image = useSiteImage(slot);
  return (
    <figure
      className={`jn-media ${className}`}
      style={
        ratio ? ({ ["--jn-ratio" as string]: ratio } as CSSProperties) : undefined
      }
    >
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes="(max-width: 950px) 100vw, 70vw"
        quality={SITE_IMAGE_QUALITY}
        className="jn-media__image"
      />
    </figure>
  );
}

function FlipImage({
  front,
  back,
  frontAlt,
  backAlt = "",
  className = "",
  axis = "left",
  ratio,
}: {
  front: string;
  back: string;
  frontAlt: string;
  backAlt?: string;
  className?: string;
  axis?: "up" | "left" | "right";
  ratio?: string;
}) {
  return (
    <div className={`jn-flip jn-flip--${axis} ${className}`} data-jn-flip>
      <JournalMedia slot={front} alt={frontAlt} className="jn-flip__base" ratio={ratio} />
      <JournalMedia slot={back} alt={backAlt} className="jn-flip__overlay" ratio={ratio} />
    </div>
  );
}

function Scene({
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section className={`jn-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="jn-eyebrow">{children}</p>;
}

/** Pull a short display stem from a long editorial title. */
function displayStem(title: string): string {
  const cleaned = title.replace(/[:?].*$/, "").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length <= 2) return cleaned;
  return words.slice(0, 2).join(" ");
}

type BlogPageContentProps = {
  posts: BlogPostSummaryClient[];
};

export function BlogPageContent({ posts }: BlogPageContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [archiveCount, setArchiveCount] = useState(ARCHIVE_PAGE_SIZE);
  const { pages } = useWebsiteText();
  const typography = useTypographySettings();
  const blogHero = resolveHeroPageCopy(typography, "blog");
  const blogHeroLines = stackedHeroLines(blogHero.main, blogHero.second);
  const lineClass = ["jn-line--a", "jn-line--b", "jn-line--c"] as const;
  useJournalEditorialScroll({ rootRef, runRef, trackRef });

  const intro =
    pages.blog.intro.trim() || BLOG_PAGE.intro;

  const featured = posts[0] ?? null;
  const openings = posts.slice(1, 3);
  const contents = posts.slice(0, Math.min(CONTENTS_COUNT, posts.length));
  const archivePosts = useMemo(
    () => posts.slice(0, archiveCount),
    [posts, archiveCount],
  );
  const issueCount = String(posts.length).padStart(2, "0");

  return (
    <div ref={rootRef} className="journal-editorial">
      <div className="jn-progress" aria-hidden="true">
        <i data-jn-progress />
      </div>

      <main>
        <section
          ref={runRef}
          className="jn-run"
          aria-label="Hathor journal stories"
        >
          <div className="jn-stage">
            <div ref={trackRef} className="jn-track">
              {/* 01 — Masthead folio (typography-led; not a photo hero) */}
              <Scene className="jn-folio">
                <p className="jn-folio__mast">
                  <span>Hathor Journal</span>
                  <i />
                  <span>Vol. 01</span>
                  <i />
                  <span>Egypt 2026</span>
                </p>

                <nav className="jn-folio__nav" aria-label="Journal sections">
                  <a href="#journal">Journal</a>
                  <a href="#feature">Feature</a>
                  <a href="#contents">Index</a>
                  <a href="#archive">Archive</a>
                </nav>

                <div className="jn-folio__inner">
                  <Eyebrow>From the river</Eyebrow>

                  <div className="jn-folio__title" id="journal" data-anima-title>
                    <h1 className="jn-display jn-display--xl wt-page-hero">
                      {blogHeroLines.map((line, index) => (
                        <span
                          key={`${line}-${index}`}
                          className={`jn-line ${lineClass[index] ?? ""}`}
                        >
                          <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
                        </span>
                      ))}
                    </h1>
                  </div>

                  <p className="jn-folio__count jn-edit" aria-hidden="true">
                    {issueCount}
                  </p>
                </div>

                <p className="jn-folio__body wt-page-body">{intro}</p>

                <p className="jn-folio__mark">
                  Hathor Cruise <span className="jn-reg">®</span> Journal
                </p>
                <p className="jn-folio__scroll">
                  <i />
                  Scroll
                </p>
              </Scene>

              {/* 02 — Featured story as immersive reading plane */}
              {featured ? (
                <Scene className="jn-feature" id="feature">
                  <JournalMedia
                    slot={getBlogHeroImageName(featured.slug)}
                    alt={`Editorial view for ${featured.title}`}
                    priority
                    className="jn-feature__media"
                    ratio="1279 / 960"
                  />
                  <div className="jn-feature__plate">
                    <Eyebrow>Lead story</Eyebrow>
                    <time
                      dateTime={featured.publishedAt}
                      className="jn-feature__date"
                    >
                      {formatBlogPublishedDate(featured.publishedAt)}
                    </time>
                    <h2 className="jn-display jn-display--l" data-anima-title>
                      {featured.title}
                    </h2>
                    <p className="jn-meta-copy">{featured.excerpt}</p>
                    <Link href={`/blogs/${featured.slug}`} className="jn-btn">
                      <span>Read the story</span>
                    </Link>
                  </div>
                </Scene>
              ) : (
                <Scene className="jn-feature jn-feature--empty" id="feature">
                  <div className="jn-feature__plate">
                    <Eyebrow>Lead story</Eyebrow>
                    <h2 className="jn-display jn-display--l">Arriving soon</h2>
                    <p className="jn-meta-copy">
                      New journal notes from the Nile will appear here.
                    </p>
                  </div>
                </Scene>
              )}

              {/* 03 — Issue datum: quiet framed count + lyrical line */}
              <Scene className="jn-issue">
                <div className="jn-issue__frame">
                  <span className="jn-issue__corner jn-issue__corner--tl">
                    Issue
                  </span>
                  <span className="jn-issue__corner jn-issue__corner--tr">
                    Egypt · Nile
                  </span>

                  <p className="jn-issue__num jn-edit">{issueCount}</p>
                  <p className="jn-issue__label">Published notes</p>

                  <span className="jn-issue__corner jn-issue__corner--bl">
                    Hathor Journal
                  </span>
                  <span className="jn-issue__corner jn-issue__corner--br">
                    Luxor — Aswan
                  </span>
                </div>

                <div className="jn-issue__lyric" data-anima-title>
                  <h2 className="jn-edit jn-edit--xl">
                    <span className="jn-line">
                      <AnimaSplitLine line={0}>Stories written</AnimaSplitLine>
                    </span>
                    <span className="jn-line">
                      <AnimaSplitLine line={1}>for the journey</AnimaSplitLine>
                    </span>
                    <span className="jn-line jn-line--indent">
                      <AnimaSplitLine line={2}>ahead</AnimaSplitLine>
                    </span>
                  </h2>
                </div>
              </Scene>

              {/* 04 — Contents index: archive ledger of stories */}
              <Scene className="jn-contents" id="contents">
                <div className="jn-contents__head">
                  <Eyebrow>Contents</Eyebrow>
                  <p className="jn-meta-copy">
                    An index of recent notes — temples, river villages, packing
                    guidance, and the slower pace of Dahabiya travel.
                  </p>
                </div>

                {contents.length ? (
                  <ol className="jn-contents__list">
                    {contents.map((post, index) => (
                      <li key={post.slug} className="jn-entry">
                        <span className="jn-entry__num">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="jn-entry__word jn-display">
                          {displayStem(post.title)}
                        </h3>
                        <div className="jn-entry__detail">
                          <time
                            dateTime={post.publishedAt}
                            className="jn-entry__date"
                          >
                            {formatBlogPublishedDate(post.publishedAt)}
                          </time>
                          <p className="jn-entry__title">{post.title}</p>
                          <p className="jn-entry__excerpt">{post.excerpt}</p>
                        </div>
                        <Link
                          href={`/blogs/${post.slug}`}
                          className="jn-btn"
                        >
                          <span>Read</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="jn-meta-copy">The first chapter is being set.</p>
                )}
              </Scene>

              {/* 05 — Openings: asymmetric visual essay of two stories */}
              {openings.length > 0 ? (
                <Scene className="jn-openings" aria-label="Story openings">
                  {openings.map((post, index) => (
                    <article
                      key={post.slug}
                      className={`jn-opening jn-opening--${index + 1}`}
                    >
                      <Link
                        href={`/blogs/${post.slug}`}
                        className="jn-opening__frame"
                        aria-label={`Read ${post.title}`}
                      >
                        <JournalMedia
                          slot={getBlogHeroImageName(post.slug)}
                          alt={`Editorial view for ${post.title}`}
                          className="jn-opening__media"
                          ratio={index === 0 ? "4 / 5" : "5 / 6"}
                        />
                      </Link>
                      <div className="jn-opening__copy">
                        <span className="jn-opening__meta">
                          {String(index + 2).padStart(2, "0")} ·{" "}
                          {formatBlogPublishedDate(post.publishedAt)}
                        </span>
                        <h3 className="jn-display">{displayStem(post.title)}</h3>
                        <p className="jn-meta-copy">{post.excerpt}</p>
                        <Link href={`/blogs/${post.slug}`} className="jn-link">
                          Open the note
                        </Link>
                      </div>
                    </article>
                  ))}
                </Scene>
              ) : null}

              {/* 06 — Themes pause on olive wash */}
              <Scene className="jn-themes">
                <Eyebrow>Reading paths</Eyebrow>
                <ul className="jn-themes__list">
                  {JOURNAL_THEMES.map((theme) => (
                    <li key={theme.word} className="jn-theme">
                      <span className="jn-theme__word jn-display">
                        {theme.word}
                      </span>
                      <span className="jn-theme__note">{theme.note}</span>
                    </li>
                  ))}
                </ul>
              </Scene>

              {/* 07 — Closing cue before vertical archive */}
              <Scene className="jn-closing">
                <FlipImage
                  className="jn-closing__media"
                  axis="up"
                  ratio="1483 / 960"
                  front="blog-hero"
                  back="home-voyage-nile-majesty"
                  frontAlt="Hathor journal on the Nile"
                  backAlt="Sailing the Nile aboard Hathor"
                />
                <div className="jn-closing__copy">
                  <Eyebrow>Next</Eyebrow>
                  <p className="jn-display jn-display--l">Continue reading</p>
                </div>
              </Scene>
            </div>
          </div>
        </section>

        {/* Epilogue — vertical archive + conversion */}
        <section className="jn-epilogue" id="archive">
          <header className="jn-epilogue__head">
            <Eyebrow>Archive</Eyebrow>
            <h2 className="jn-display jn-display--l" data-anima-title>
              <span className="jn-line">
                <AnimaSplitLine line={0}>The full</AnimaSplitLine>
              </span>
              <span className="jn-line jn-line--indent">
                <AnimaSplitLine line={1}>journal</AnimaSplitLine>
              </span>
            </h2>
            <p className="jn-meta-copy">
              Browse every published note. Each piece is written to inform your
              next journey aboard Hathor.
            </p>
          </header>

          {archivePosts.length ? (
            <ol className="jn-archive">
              {archivePosts.map((post, index) => (
                <li key={post.slug} className="jn-archive__row">
                  <span className="jn-archive__num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="jn-archive__body">
                    <time dateTime={post.publishedAt}>
                      {formatBlogPublishedDate(post.publishedAt)}
                    </time>
                    <h3>
                      <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p>{post.excerpt}</p>
                  </div>
                  <Link href={`/blogs/${post.slug}`} className="jn-btn">
                    <span>Read</span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="jn-meta-copy" aria-live="polite">
              Stories are arriving soon.
            </p>
          )}

          {archiveCount < posts.length ? (
            <div className="jn-epilogue__more">
              <button
                type="button"
                className="jn-btn"
                onClick={() =>
                  setArchiveCount((count) => count + ARCHIVE_PAGE_SIZE)
                }
              >
                <span>Show more stories</span>
              </button>
            </div>
          ) : null}

          <div className="jn-epilogue__board">
            <div className="jn-epilogue__statement">
              <p className="jn-edit jn-edit--l">
                When the reading ends, the river begins — reserve a private
                Dahabiya voyage between Luxor and Aswan.
              </p>
              <div className="jn-epilogue__pills">
                <BookNowTrigger className="jn-btn jn-btn--solid">
                  Book Now
                </BookNowTrigger>
                <Link href="/cruises-list" className="jn-btn">
                  <span>Explore cruises</span>
                </Link>
                <Link href="/contact" className="jn-btn">
                  <span>Ask concierge</span>
                </Link>
              </div>
            </div>

            <aside className="jn-epilogue__card">
              <span className="jn-card__tag">Journal</span>
              <JournalMedia
                slot="blog-hero"
                alt="Hathor journal on the Nile"
                className="jn-epilogue__card-media"
                ratio="356 / 460"
              />
              <h3 className="jn-display">Notes</h3>
              <p className="jn-epilogue__card-body">
                Temples, villages, and quieter travel
                <br />
                written for guests of Hathor
              </p>
              <div className="jn-epilogue__card-links">
                <a
                  className="jn-link"
                  href="https://www.instagram.com/hathorcruise/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
                <Link className="jn-link" href="/contact">
                  Write to us
                </Link>
              </div>
            </aside>
          </div>

          <div className="jn-epilogue__legal">
            <span>
              Hathor Cruise <span className="jn-reg">®</span> 2026
            </span>
            <nav aria-label="Legal">
              <Link href="/contact">Privacy</Link>
              <Link href="/contact">Cookies</Link>
              <Link href="/contact">Legal</Link>
            </nav>
          </div>
        </section>
      </main>
    </div>
  );
}
