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
  getBlogHeroImageName,
  getBlogSupportImageName,
  type BlogPostDetailClient,
  type BlogPostSummaryClient,
} from "@/lib/blog-display";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";

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
};

export function BlogPostPageContent({
  post,
  heroImageName,
  related,
  articleBlocks,
  interludeSlots,
}: BlogPostPageContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useArticleEditorialScroll({ rootRef, runRef, trackRef });

  const publishedLabel = formatBlogPublishedDate(post.publishedAt);
  const supportSlot = getBlogSupportImageName(post.slug);

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
          aria-label={`${post.title} — journal dispatch`}
        >
          <div className="ar-stage">
            <div ref={trackRef} className="ar-track">
              {/* 01 — masthead: three rows on hairlines, all in flow */}
              <Scene className="ar-masthead">
                <div className="ar-masthead__top">
                  <p className="ar-meta">Hathor Journal</p>
                  <nav className="ar-masthead__nav" aria-label="Article sections">
                    <a className="ar-link" href="#article">
                      Read
                    </a>
                    <Link className="ar-link" href="/blogs">
                      All dispatches
                    </Link>
                  </nav>
                </div>

                <div className="ar-masthead__mid">
                  <Eyebrow>Dispatch</Eyebrow>
                  <h1 className="ar-display ar-display--xl">{post.title}</h1>
                </div>

                <div className="ar-masthead__bot">
                  <p className="ar-meta">
                    Published{" "}
                    <time dateTime={post.publishedAt}>{publishedLabel}</time>
                  </p>
                  <p className="ar-meta ar-masthead__cue">
                    <i aria-hidden="true" />
                    Scroll
                  </p>
                </div>
              </Scene>

              {/* 02 — specimen plate: one dominant crop, no type */}
              <Scene className="ar-plate">
                <ArticleMedia
                  slot={heroImageName}
                  alt={`Editorial view accompanying ${post.title}`}
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
                  <Eyebrow>Standfirst</Eyebrow>
                  <p className="ar-edit ar-standfirst__quote">{post.excerpt}</p>
                </div>

                <dl className="ar-datum">
                  <div>
                    <dt>Published</dt>
                    <dd>
                      <time dateTime={post.publishedAt}>{publishedLabel}</time>
                    </dd>
                  </div>
                  <div>
                    <dt>Waters</dt>
                    <dd>Luxor — Aswan</dd>
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
                  frontAlt="Along the river"
                  backAlt="Sailing the Nile aboard Hathor"
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
                    frontAlt="Life aboard the dahabiya"
                    backAlt="The table aboard"
                    sizes="(max-width: 950px) 100vw, 32vw"
                  />
                  <p className="ar-caption">
                    <span>Along the river</span>
                    Temples, villages, and the slower pace of Dahabiya travel.
                  </p>
                </div>
              </Scene>

              {/* 05 — quiet bridge into the document */}
              <Scene className="ar-turn">
                <Eyebrow>Continue</Eyebrow>
                <p className="ar-display ar-display--l">The note</p>
                <i className="ar-turn__rule" aria-hidden="true" />
                <a className="ar-link" href="#article">
                  Read below
                </a>
              </Scene>
            </div>
          </div>
        </section>

        {/* ============ the document, full page ============ */}
        <section className="ar-read" id="article">
          <header className="ar-read__head">
            <p className="ar-meta">
              Hathor Journal · <time dateTime={post.publishedAt}>{publishedLabel}</time>
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
              const secondSlot =
                interludeSlots[(index + 1) % Math.max(1, interludeSlots.length)];

              return (
                <Fragment key={index}>
                  <div className="ar-prose-run">{block}</div>

                  {!isLast && slot ? (
                    <figure className={`ar-interlude ar-interlude--${shape}`}>
                      {shape === "pair" ? (
                        <>
                          <ArticleMedia
                            slot={slot}
                            alt=""
                            role="supporting"
                            ratio="4 / 5"
                            sizes="(max-width: 950px) 100vw, 34vw"
                          />
                          <ArticleMedia
                            slot={secondSlot ?? slot}
                            alt=""
                            role="detail"
                            className="ar-interlude__second"
                            ratio="4 / 3"
                            sizes="(max-width: 950px) 100vw, 26vw"
                          />
                        </>
                      ) : (
                        <ArticleMedia
                          slot={slot}
                          alt=""
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
          <section className="ar-further" aria-label="Further dispatches">
            <header className="ar-further__head">
              <Eyebrow>Further notes</Eyebrow>
              <h2 className="ar-display ar-display--l">Continue reading</h2>
            </header>
            <ul className="ar-further__list">
              {related.map((item, index) => (
                <li key={item.slug} className="ar-further__row">
                  <span className="ar-further__num ar-edit">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Link href={`/blogs/${item.slug}`} className="ar-further__thumb">
                    <ArticleMedia
                      slot={getBlogHeroImageName(item.slug)}
                      alt=""
                      role="detail"
                      ratio="5 / 4"
                      sizes="(max-width: 950px) 40vw, 14vw"
                    />
                  </Link>
                  <h3 className="ar-further__title">
                    <Link href={`/blogs/${item.slug}`}>{item.title}</Link>
                  </h3>
                  <time className="ar-meta" dateTime={item.publishedAt}>
                    {formatBlogPublishedDate(item.publishedAt)}
                  </time>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ============ close ============ */}
        <footer className="ar-close">
          <ArticleMedia
            slot="highlights-hero"
            alt=""
            role="background"
            className="ar-close__bg"
            sizes="100vw"
          />
          <div className="ar-close__inner">
            <p className="ar-edit ar-close__line">
              When the reading ends, the river begins.
            </p>
            <div className="ar-close__actions">
              <BookNowTrigger className="ar-btn ar-btn--solid">
                Book Now
              </BookNowTrigger>
              <Link href="/cruises-list" className="ar-btn">
                <span>Explore cruises</span>
              </Link>
              <Link href="/blogs" className="ar-btn">
                <span>Full journal</span>
              </Link>
            </div>
          </div>

          <div className="ar-close__legal">
            <span>
              Hathor Cruise <span className="ar-reg">®</span> 2026
            </span>
            <nav aria-label="Legal">
              <Link href="/contact">Contact</Link>
              <Link href="/cruises-list">Cruises</Link>
              <Link href="/blogs">Journal</Link>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  );
}
