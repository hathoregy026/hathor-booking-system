"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Fragment,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useArticleEditorialScroll } from "@/hooks/useArticleEditorialScroll";
import {
  formatBlogPublishedDate,
  assignBlogImageNames,
  getBlogHeroImageName,
  getBlogSupportImageName,
  type BlogPostDetailClient,
  type BlogPostSummaryClient,
} from "@/lib/blog-display";
import { blogCommercialLink } from "@/lib/seo/blog-commercial";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";
import { useLocalizedHref, usePublicLocale } from "@/hooks/usePublicLocale";
import { blogPostHref } from "@/lib/i18n/blog-posts-it";
import { ARTICLE_COPY } from "@/lib/i18n/journal-copy";

/* ==========================================================================
   ARTICLE — LuxuryHathor folio
   One shared composition for every /blogs/[slug] dispatch.

   Narrative idea: an article is a DOCUMENT, so the page is built as a printed
   folio — masthead, specimen plate, standfirst, evidence, turn, then the
   document itself set full-page with photographic interludes between its text
   runs. Neither About nor Contact is document-shaped, so the silhouette is
   this page family's own.

   Fixed DNA kept: palette, type roles, 12-col proportional logic, the exact
   horizontal scroll signature above 950px, clipped reveals, directional
   wipes, hairlines, pill buttons, growing underlines, reduced-motion states.
   ========================================================================== */

/** Image roles — every picture declares one before it is sized. */
type MediaRole = "dominant" | "supporting" | "detail" | "background";

function ArticleMedia({
  slot,
  alt,
  role,
  priority = false,
  className = "",
  ratio,
  sizes,
}: {
  slot: string;
  alt: string;
  role: MediaRole;
  priority?: boolean;
  className?: string;
  ratio?: string;
  sizes: string;
}) {
  const image = useSiteImage(slot);
  return (
    <figure
      className={`ar-media ar-media--${role} ${className}`}
      data-site-image={image.slot ?? slot}
      style={
        ratio ? ({ ["--ar-ratio" as string]: ratio } as CSSProperties) : undefined
      }
    >
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes={sizes}
        quality={SITE_IMAGE_QUALITY}
        className="ar-media__image"
      />
    </figure>
  );
}

/** Two stacked frames; the upper wipes across as the scene travels. */
function FlipMedia({
  front,
  back,
  frontAlt,
  backAlt = "",
  role,
  className = "",
  axis,
  ratio,
  sizes,
}: {
  front: string;
  back: string;
  frontAlt: string;
  backAlt?: string;
  role: MediaRole;
  className?: string;
  axis: "up" | "left" | "right";
  ratio: string;
  sizes: string;
}) {
  return (
    <div className={`ar-flip ar-flip--${axis} ${className}`} data-ar-flip>
      <ArticleMedia
        slot={front}
        alt={frontAlt}
        role={role}
        className="ar-flip__base"
        ratio={ratio}
        sizes={sizes}
      />
      <ArticleMedia
        slot={back}
        alt={backAlt}
        role={role}
        className="ar-flip__over"
        ratio={ratio}
        sizes={sizes}
      />
    </div>
  );
}

function Scene({
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section className={`ar-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="ar-eyebrow">({children})</p>;
}

/**
 * Interlude shapes cycled between prose runs. Each breaks out of the reading
 * measure by a named grid line, never by absolute positioning — so a figure
 * can never land on top of the text.
 */
const INTERLUDE_SHAPES = ["bleed", "pair", "inset"] as const;

type BlogPostPageContentProps = {
  post: BlogPostDetailClient;
  heroImageName: string;
  related: BlogPostSummaryClient[];
  articleBlocks: ReactNode[];
  interludeSlots: string[];
  /** The post's English title, for picking its voyage link on a translated page. */
  sourceTitle?: string;
};

export function BlogPostPageContent({
  post,
  heroImageName,
  related,
  articleBlocks,
  interludeSlots,
  sourceTitle,
}: BlogPostPageContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useArticleEditorialScroll({ rootRef, runRef, trackRef });
  const locale = usePublicLocale();
  const t = ARTICLE_COPY[locale];
  const localHref = useLocalizedHref();

  const publishedLabel = formatBlogPublishedDate(post.publishedAt, t.dateLocale);
  const supportSlot = getBlogSupportImageName(post.slug);
  /* Two dispatches side by side must not carry the same photograph. */
  const relatedImages = assignBlogImageNames([
    post.slug,
    ...related.map((item) => item.slug),
  ]);
  const commercial = blogCommercialLink(post.slug, sourceTitle ?? post.title);

  return (
    <div ref={rootRef} className="article-editorial">
      <div className="ar-progress" aria-hidden="true">
        <i data-ar-progress />
      </div>

      <main>
        {/* ============ the rightward act ============ */}
        <section
          ref={runRef}
          className="ar-run"
          aria-label={t.runLabel(post.title)}
        >
          <div className="ar-stage">
            <div ref={trackRef} className="ar-track">
              {/* 01 — masthead: three rows on hairlines, all in flow */}
              <Scene className="ar-masthead">
                <div className="ar-masthead__top">
                  <p className="ar-meta">{t.meta}</p>
                  <nav className="ar-masthead__nav" aria-label={t.navLabel}>
                    <a className="ar-link" href="#article">
                      {t.read}
                    </a>
                    <Link className="ar-link" href={localHref("/blogs")}>
                      {t.allDispatches}
                    </Link>
                  </nav>
                </div>

                <div className="ar-masthead__mid">
                  <Eyebrow>{t.dispatch}</Eyebrow>
                  <h1 className="ar-display ar-display--xl">{post.title}</h1>
                </div>

                <div className="ar-masthead__bot">
                  <p className="ar-meta">
                    {t.publishedOn}{" "}
                    <time dateTime={post.publishedAt}>{publishedLabel}</time>
                  </p>
                  <p className="ar-meta ar-masthead__cue">
                    <i aria-hidden="true" />
                    {t.scroll}
                  </p>
                </div>
              </Scene>

              {/* 02 — specimen plate: one dominant crop, no type */}
              <Scene className="ar-plate">
                <ArticleMedia
                  slot={heroImageName}
                  alt={t.heroAlt(post.title)}
                  role="dominant"
                  priority
                  className="ar-plate__frame"
                  ratio="3 / 4"
                  sizes="(max-width: 950px) 100vw, 55vw"
                />
              </Scene>

              {/* 03 — standfirst + framed datum, both in flow */}
              <Scene className="ar-standfirst">
                <div className="ar-standfirst__statement">
                  <Eyebrow>{t.standfirst}</Eyebrow>
                  <p className="ar-edit ar-standfirst__quote">{post.excerpt}</p>
                </div>

                <dl className="ar-datum">
                  <div>
                    <dt>{t.published}</dt>
                    <dd>
                      <time dateTime={post.publishedAt}>{publishedLabel}</time>
                    </dd>
                  </div>
                  <div>
                    <dt>{t.waters}</dt>
                    <dd>{t.watersValue}</dd>
                  </div>
                </dl>
              </Scene>

              {/* 04 — evidence: unequal pair, opposite wipes, offset baselines */}
              <Scene className="ar-essay">
                <FlipMedia
                  className="ar-essay__dominant"
                  role="dominant"
                  axis="right"
                  ratio="4 / 5"
                  front={supportSlot}
                  back="home-voyage-nile-majesty"
                  frontAlt={t.alts.alongRiver}
                  backAlt={t.alts.sailing}
                  sizes="(max-width: 950px) 100vw, 40vw"
                />
                <div className="ar-essay__side">
                  <FlipMedia
                    className="ar-essay__supporting"
                    role="supporting"
                    axis="left"
                    ratio="5 / 4"
                    front="highlights-lifestyle"
                    back="gastronomy-hero"
                    frontAlt={t.alts.life}
                    backAlt={t.alts.table}
                    sizes="(max-width: 950px) 100vw, 32vw"
                  />
                  <p className="ar-caption">
                    <span>{t.captionLead}</span>
                    {t.caption}
                  </p>
                </div>
              </Scene>

              {/* 05 — quiet bridge into the document */}
              <Scene className="ar-turn">
                <Eyebrow>{t.continueEyebrow}</Eyebrow>
                <p className="ar-display ar-display--l">{t.theNote}</p>
                <i className="ar-turn__rule" aria-hidden="true" />
                <a className="ar-link" href="#article">
                  {t.readBelow}
                </a>
              </Scene>
            </div>
          </div>
        </section>

        {/* ============ the document, full page ============ */}
        <section className="ar-read" id="article">
          <header className="ar-read__head">
            <p className="ar-meta">
              {t.meta} · <time dateTime={post.publishedAt}>{publishedLabel}</time>
            </p>
            <h2 className="ar-display ar-read__title">{post.title}</h2>
          </header>

          {/*
            One grid owns the whole document. Text runs sit in the [measure]
            column; figures break out to [wide] or [full] by named grid line.
            Because both are children of the same grid, a figure cannot
            overlap the prose — the geometry forbids it.
          */}
          <div className="ar-read__flow">
            {articleBlocks.map((block, index) => {
              const slot = interludeSlots[index];
              const shape = INTERLUDE_SHAPES[index % INTERLUDE_SHAPES.length]!;
              const isLast = index === articleBlocks.length - 1;
              /* Two steps on, so the pair's detail plate is not the very next
                 interlude's photograph shown twice in succession. */
              const secondSlot =
                interludeSlots[(index + 2) % Math.max(1, interludeSlots.length)];

              return (
                <Fragment key={index}>
                  <div className="ar-prose-run">{block}</div>

                  {!isLast && slot ? (
                    <figure className={`ar-interlude ar-interlude--${shape}`}>
                      {shape === "pair" ? (
                        <>
                          <ArticleMedia
                            slot={slot}
                            alt={t.slotAlt(slot)}
                            role="supporting"
                            ratio="4 / 5"
                            sizes="(max-width: 950px) 100vw, 34vw"
                          />
                          <ArticleMedia
                            slot={secondSlot ?? slot}
                            alt={t.slotAlt(secondSlot ?? slot)}
                            role="detail"
                            className="ar-interlude__second"
                            ratio="4 / 3"
                            sizes="(max-width: 950px) 100vw, 26vw"
                          />
                        </>
                      ) : (
                        <ArticleMedia
                          slot={slot}
                          alt={t.slotAlt(slot)}
                          role={shape === "bleed" ? "dominant" : "supporting"}
                          ratio={shape === "bleed" ? "16 / 9" : "5 / 4"}
                          sizes={shape === "bleed" ? "100vw" : "(max-width: 950px) 100vw, 74vw"}
                        />
                      )}
                    </figure>
                  ) : null}
                </Fragment>
              );
            })}
          </div>
        </section>

        {/* ============ continue reading — a hairline ledger ============ */}
        {related.length > 0 ? (
          <section className="ar-further" aria-label={t.furtherLabel}>
            <header className="ar-further__head">
              <Eyebrow>{t.furtherNotes}</Eyebrow>
              <h2 className="ar-display ar-display--l">{t.continueReading}</h2>
            </header>
            <ul className="ar-further__list">
              {related.map((item, index) => (
                <li key={item.slug} className="ar-further__row">
                  <span className="ar-further__num ar-edit">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Link href={blogPostHref(item.slug, locale)} className="ar-further__thumb">
                    <ArticleMedia
                      slot={relatedImages[item.slug] ?? getBlogHeroImageName(item.slug)}
                      alt={t.slotAlt(relatedImages[item.slug] ?? getBlogHeroImageName(item.slug))}
                      role="detail"
                      ratio="5 / 4"
                      sizes="(max-width: 950px) 40vw, 14vw"
                    />
                  </Link>
                  <h3 className="ar-further__title">
                    <Link href={blogPostHref(item.slug, locale)}>{item.title}</Link>
                  </h3>
                  <time className="ar-meta" dateTime={item.publishedAt}>
                    {formatBlogPublishedDate(item.publishedAt, t.dateLocale)}
                  </time>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ============ close ============ */}
        {/* A closing scene, not a footer: the site footer is the only <footer>. */}
        <section className="ar-close" aria-label={t.continueReading}>
          <ArticleMedia
            slot="blog-hero"
            alt={t.slotAlt("blog-hero")}
            role="background"
            className="ar-close__bg"
            sizes="100vw"
          />
          <div className="ar-close__inner">
            <p className="ar-edit ar-close__line">{t.closeLine}</p>
            <div className="ar-close__actions">
              <BookNowTrigger className="ar-btn ar-btn--solid">
                {t.bookNow}
              </BookNowTrigger>
              <Link href={localHref(commercial.href)} className="ar-btn">
                <span>{t.commercial(commercial.label)}</span>
              </Link>
              <Link href={localHref("/blogs")} className="ar-btn">
                <span>{t.fullJournal}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
