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
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useTypographySettings } from "@/components/public/TypographySettingsProvider";
import { useJournalEditorialScroll } from "@/hooks/useJournalEditorialScroll";
import {
  formatBlogPublishedDate,
  assignBlogImageNames,
  getBlogHeroImageName,
  type BlogPostSummaryClient,
} from "@/lib/blog-display";
import { BLOG_PAGE } from "@/lib/page-content";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";
import { stackedHeroLines } from "@/lib/website-text-shared";
import { useLocalizedHref, usePublicLocale } from "@/hooks/usePublicLocale";
import { blogPostHref } from "@/lib/i18n/blog-posts-it";
import { JOURNAL_COPY } from "@/lib/i18n/journal-copy";

const ARCHIVE_PAGE_SIZE = 10;
const CONTENTS_COUNT = 4;
const GALLERY_COUNT = 3;
const OPENINGS_COUNT = 3;

/* Reading paths; words come from JOURNAL_COPY.themes, in this order. */
const JOURNAL_THEMES = [
  "landmark-hatshepsut",
  "home-voyage-nile-majesty",
  "highlights-lifestyle",
  "blog-hero",
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
      data-site-image={image.slot ?? slot}
      style={
        ratio ? ({ ["--jn-ratio" as string]: ratio } as CSSProperties) : undefined
      }
    >
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes="(max-width: 950px) 100vw, 55vw"
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

/** Whole-line title without character splitting (avoids mid-word visual breaks). */
function TitleLines({
  lines,
  as: Tag = "h1",
  className = "",
}: {
  lines: string[];
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <Tag className={className} data-anima-title>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className="jn-line">
          <span className="jn-line__text">{line}</span>
        </span>
      ))}
    </Tag>
  );
}

type BlogPageContentProps = {
  posts: BlogPostSummaryClient[];
};

export function BlogPageContent({ posts }: BlogPageContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [archiveCount, setArchiveCount] = useState(ARCHIVE_PAGE_SIZE);
  const locale = usePublicLocale();
  const t = JOURNAL_COPY[locale];
  const localHref = useLocalizedHref();
  const postHref = (slug: string) => blogPostHref(slug, locale);
  const dated = (value: string) => formatBlogPublishedDate(value, t.dateLocale);
  const { pages } = useWebsiteText();
  const typography = useTypographySettings();
  const blogHero = resolveHeroPageCopy(typography, "blog");
  const blogHeroLines = stackedHeroLines(blogHero.main, blogHero.second);
  useJournalEditorialScroll({ rootRef, runRef, trackRef });

  const intro = pages.blog.intro.trim() || BLOG_PAGE.intro;

  /* One photo per post across the whole page, so two cards side by side
     never carry the same picture. */
  const heroImages = useMemo(
    () => assignBlogImageNames(posts.map((post) => post.slug)),
    [posts],
  );
  const heroImageFor = (slug: string) => heroImages[slug] ?? getBlogHeroImageName(slug);

  const featured = posts[0] ?? null;
  const openings = posts.slice(1, 1 + OPENINGS_COUNT);
  const contents = posts.slice(0, Math.min(CONTENTS_COUNT, posts.length));
  const gallery = posts.slice(
    CONTENTS_COUNT,
    CONTENTS_COUNT + GALLERY_COUNT,
  );
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
          aria-label={t.runLabel}
        >
          <div className="jn-stage">
            <div ref={trackRef} className="jn-track">
              {/* 01 — Masthead with portrait image */}
              <Scene className="jn-folio">
                <div className="jn-folio__copy">
                  <p className="jn-folio__mast">
                    <span>{t.mast[0]}</span>
                    <i />
                    <span>{t.mast[1]}</span>
                    <i />
                    <span>{t.mast[2]}</span>
                  </p>

                  <nav className="jn-folio__nav" aria-label={t.navLabel}>
                    <a href="#journal">{t.nav[0]}</a>
                    <a href="#feature">{t.nav[1]}</a>
                    <a href="#contents">{t.nav[2]}</a>
                    <a href="#archive">{t.nav[3]}</a>
                  </nav>

                  <Eyebrow>{t.fromRiver}</Eyebrow>

                  <div className="jn-folio__title" id="journal">
                    <TitleLines
                      lines={blogHeroLines}
                      className="jn-display jn-display--xl wt-page-hero"
                    />
                  </div>

                  <p className="jn-folio__body wt-page-body">{intro}</p>

                  <div className="jn-folio__foot">
                    <p className="jn-folio__mark">
                      Hathor Cruise <span className="jn-reg">®</span> Journal
                    </p>
                    <p className="jn-folio__scroll">
                      <i />
                      {t.scroll}
                    </p>
                  </div>
                </div>

                <div className="jn-folio__visual">
                  <JournalMedia
                    slot="blog-hero"
                    alt={t.alts.hero}
                    priority
                    className="jn-folio__media"
                    ratio="4 / 5"
                  />
                  <p className="jn-folio__count jn-edit" aria-hidden="true">
                    {issueCount}
                  </p>
                </div>
              </Scene>

              {/* 02 — Featured story */}
              {featured ? (
                <Scene className="jn-feature" id="feature">
                  <div className="jn-feature__visual">
                    <JournalMedia
                      slot={heroImageFor(featured.slug)}
                      alt={t.editorialAlt(featured.title)}
                      priority
                      className="jn-feature__media"
                      ratio="5 / 4"
                    />
                    <FlipImage
                      className="jn-feature__inset"
                      axis="left"
                      ratio="4 / 5"
                      front="highlights-lifestyle"
                      back="landmark-valley-kings"
                      frontAlt={t.alts.life}
                      backAlt={t.alts.valley}
                    />
                  </div>
                  <div className="jn-feature__plate">
                    <Eyebrow>{t.leadStory}</Eyebrow>
                    <time
                      dateTime={featured.publishedAt}
                      className="jn-feature__date"
                    >
                      {dated(featured.publishedAt)}
                    </time>
                    <h2 className="jn-feature__title">{featured.title}</h2>
                    <p className="jn-meta-copy">{featured.excerpt}</p>
                    <Link href={postHref(featured.slug)} className="jn-btn">
                      <span>{t.readStory}</span>
                    </Link>
                  </div>
                </Scene>
              ) : (
                <Scene className="jn-feature jn-feature--empty" id="feature">
                  <div className="jn-feature__plate">
                    <Eyebrow>{t.leadStory}</Eyebrow>
                    <h2 className="jn-feature__title">{t.arrivingSoon}</h2>
                    <p className="jn-meta-copy">{t.arrivingBody}</p>
                  </div>
                </Scene>
              )}

              {/* 03 — Issue datum with imagery */}
              <Scene className="jn-issue">
                <FlipImage
                  className="jn-issue__media"
                  axis="up"
                  ratio="4 / 5"
                  front="landmark-obelisk"
                  back="gastronomy-hero"
                  frontAlt={t.alts.landmark}
                  backAlt={t.alts.dining}
                />

                <div className="jn-issue__frame">
                  <span className="jn-issue__corner jn-issue__corner--tl">
                    {t.issue.tl}
                  </span>
                  <span className="jn-issue__corner jn-issue__corner--tr">
                    {t.issue.tr}
                  </span>
                  <p className="jn-issue__num jn-edit">{issueCount}</p>
                  <p className="jn-issue__label">{t.issue.label}</p>
                  <span className="jn-issue__corner jn-issue__corner--bl">
                    {t.issue.bl}
                  </span>
                  <span className="jn-issue__corner jn-issue__corner--br">
                    {t.issue.br}
                  </span>
                </div>

                <div className="jn-issue__lyric">
                  <TitleLines
                    as="h2"
                    lines={[...t.lyric]}
                    className="jn-edit jn-edit--xl"
                  />
                </div>
              </Scene>

              {/* 04 — Contents with thumbnails */}
              <Scene className="jn-contents" id="contents">
                <div className="jn-contents__head">
                  <Eyebrow>{t.contents}</Eyebrow>
                  <p className="jn-meta-copy">{t.contentsBody}</p>
                </div>

                {contents.length ? (
                  <ol className="jn-contents__list">
                    {contents.map((post, index) => (
                      <li key={post.slug} className="jn-entry">
                        <span className="jn-entry__num">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <Link
                          href={postHref(post.slug)}
                          className="jn-entry__thumb"
                          aria-label={t.readLabel(post.title)}
                        >
                          <JournalMedia
                            slot={heroImageFor(post.slug)}
                            alt={t.slotAlt(heroImageFor(post.slug))}
                            className="jn-entry__media"
                            ratio="5 / 4"
                          />
                        </Link>
                        <div className="jn-entry__detail">
                          <time
                            dateTime={post.publishedAt}
                            className="jn-entry__date"
                          >
                            {dated(post.publishedAt)}
                          </time>
                          <h3 className="jn-entry__title">
                            <Link href={postHref(post.slug)}>{post.title}</Link>
                          </h3>
                          <p className="jn-entry__excerpt">{post.excerpt}</p>
                        </div>
                        <Link href={postHref(post.slug)} className="jn-btn">
                          <span>{t.read}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="jn-meta-copy">{t.firstChapter}</p>
                )}
              </Scene>

              {/* 05 — Gallery of story images */}
              {gallery.length > 0 ? (
                <Scene className="jn-gallery" aria-label={t.galleryLabel}>
                  {gallery.map((post, index) => (
                    <article
                      key={post.slug}
                      className={`jn-gallery__card jn-gallery__card--${index + 1}`}
                    >
                      <Link
                        href={postHref(post.slug)}
                        className="jn-gallery__frame"
                        aria-label={t.readLabel(post.title)}
                      >
                        <JournalMedia
                          slot={heroImageFor(post.slug)}
                          alt={t.editorialAlt(post.title)}
                          className="jn-gallery__media"
                          ratio={index === 1 ? "4 / 5" : "5 / 4"}
                        />
                      </Link>
                      <div className="jn-gallery__copy">
                        <span className="jn-gallery__meta">
                          {String(index + 1 + CONTENTS_COUNT).padStart(2, "0")}
                        </span>
                        <h3>
                          <Link href={postHref(post.slug)}>{post.title}</Link>
                        </h3>
                      </div>
                    </article>
                  ))}
                </Scene>
              ) : null}

              {/* 06 — Openings essay */}
              {openings.length > 0 ? (
                <Scene className="jn-openings" aria-label={t.openingsLabel}>
                  {openings.map((post, index) => (
                    <article
                      key={post.slug}
                      className={`jn-opening jn-opening--${index + 1}`}
                    >
                      <Link
                        href={postHref(post.slug)}
                        className="jn-opening__frame"
                        aria-label={t.readLabel(post.title)}
                      >
                        <JournalMedia
                          slot={heroImageFor(post.slug)}
                          alt={t.editorialAlt(post.title)}
                          className="jn-opening__media"
                          ratio="4 / 5"
                        />
                      </Link>
                      <div className="jn-opening__copy">
                        <span className="jn-opening__meta">
                          {dated(post.publishedAt)}
                        </span>
                        <h3>
                          <Link href={postHref(post.slug)}>{post.title}</Link>
                        </h3>
                        <p className="jn-meta-copy">{post.excerpt}</p>
                        <Link href={postHref(post.slug)} className="jn-link">
                          {t.openNote}
                        </Link>
                      </div>
                    </article>
                  ))}
                </Scene>
              ) : null}

              {/* 07 — Themes with images */}
              <Scene className="jn-themes">
                <Eyebrow>{t.readingPaths}</Eyebrow>
                <ul className="jn-themes__list">
                  {JOURNAL_THEMES.map((slot, index) => ({ slot, ...t.themes[index] })).map((theme) => (
                    <li key={theme.word} className="jn-theme">
                      <JournalMedia
                        slot={theme.slot}
                        alt={theme.word}
                        className="jn-theme__media"
                        ratio="1 / 1"
                      />
                      <div className="jn-theme__copy">
                        <span className="jn-theme__word jn-display">
                          {theme.word}
                        </span>
                        <span className="jn-theme__note">{theme.note}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Scene>

              {/* 08 — Closing */}
              <Scene className="jn-closing">
                <FlipImage
                  className="jn-closing__media"
                  axis="up"
                  ratio="16 / 10"
                  front="highlights-hero"
                  back="home-voyage-nile-majesty"
                  frontAlt={t.alts.hero}
                  backAlt={t.alts.sailing}
                />
                <div className="jn-closing__copy">
                  <Eyebrow>{t.next}</Eyebrow>
                  <TitleLines
                    as="h2"
                    lines={[...t.continueLines]}
                    className="jn-display jn-display--l"
                  />
                </div>
              </Scene>
            </div>
          </div>
        </section>

        <section className="jn-epilogue" id="archive">
          <header className="jn-epilogue__head">
            <Eyebrow>{t.archive}</Eyebrow>
            <TitleLines
              as="h2"
              lines={[...t.archiveLines]}
              className="jn-display jn-display--l"
            />
            <p className="jn-meta-copy">{t.archiveBody}</p>
          </header>

          {archivePosts.length ? (
            <ol className="jn-archive">
              {archivePosts.map((post, index) => (
                <li key={post.slug} className="jn-archive__row">
                  <span className="jn-archive__num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Link
                    href={postHref(post.slug)}
                    className="jn-archive__thumb"
                    aria-label={t.readLabel(post.title)}
                  >
                    <JournalMedia
                      slot={heroImageFor(post.slug)}
                      alt={t.slotAlt(heroImageFor(post.slug))}
                      className="jn-archive__media"
                      ratio="5 / 4"
                    />
                  </Link>
                  <div className="jn-archive__body">
                    <time dateTime={post.publishedAt}>
                      {dated(post.publishedAt)}
                    </time>
                    <h3>
                      <Link href={postHref(post.slug)}>{post.title}</Link>
                    </h3>
                    <p>{post.excerpt}</p>
                  </div>
                  <Link href={postHref(post.slug)} className="jn-btn">
                    <span>{t.read}</span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="jn-meta-copy" aria-live="polite">
              {t.arrivingStories}
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
                <span>{t.showMore}</span>
              </button>
            </div>
          ) : null}

          <div className="jn-epilogue__board">
            <div className="jn-epilogue__statement">
              <p className="jn-edit jn-edit--l">{t.statement}</p>
              <div className="jn-epilogue__pills">
                <BookNowTrigger className="jn-btn jn-btn--solid">
                  {t.bookNow}
                </BookNowTrigger>
                <Link href={localHref("/cruises-list")} className="jn-btn">
                  <span>{t.exploreCruises}</span>
                </Link>
                <Link href={localHref("/contact")} className="jn-btn">
                  <span>{t.askConcierge}</span>
                </Link>
              </div>
            </div>

            <aside className="jn-epilogue__card">
              <span className="jn-card__tag">{t.cardTag}</span>
              <JournalMedia
                slot="blog-hero"
                alt={t.alts.hero}
                className="jn-epilogue__card-media"
                ratio="356 / 460"
              />
              <h3 className="jn-display">{t.cardTitle}</h3>
              <p className="jn-epilogue__card-body">
                {t.cardBody[0]}
                <br />
                {t.cardBody[1]}
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
                <Link className="jn-link" href={localHref("/contact")}>
                  {t.writeToUs}
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
