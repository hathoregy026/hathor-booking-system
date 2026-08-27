"use client";

import Image from "next/image";
import Link from "next/link";
import {
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

function ArticleMedia({
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
      className={`ar-media ${className}`}
      style={
        ratio ? ({ ["--ar-ratio" as string]: ratio } as CSSProperties) : undefined
      }
    >
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes="(max-width: 950px) 100vw, 55vw"
        quality={SITE_IMAGE_QUALITY}
        className="ar-media__image"
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
    <div className={`ar-flip ar-flip--${axis} ${className}`} data-ar-flip>
      <ArticleMedia
        slot={front}
        alt={frontAlt}
        className="ar-flip__base"
        ratio={ratio}
      />
      <ArticleMedia
        slot={back}
        alt={backAlt}
        className="ar-flip__overlay"
        ratio={ratio}
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
  return <p className="ar-eyebrow">{children}</p>;
}

type BlogPostPageContentProps = {
  post: BlogPostDetailClient;
  heroImageName: string;
  related: BlogPostSummaryClient[];
  children: React.ReactNode;
};

export function BlogPostPageContent({
  post,
  heroImageName,
  related,
  children,
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
        <section
          ref={runRef}
          className="ar-run"
          aria-label={`${post.title} — journal dispatch`}
        >
          <div className="ar-stage">
            <div ref={trackRef} className="ar-track">
              {/* 01 — Colophon: date rail + title + edge crop */}
              <Scene className="ar-colophon">
                <div className="ar-colophon__grid">
                  <aside className="ar-colophon__rail" aria-label="Article folio">
                    <div className="ar-colophon__rail-top">
                      <span>Journal</span>
                      <Link href="/blogs">All notes</Link>
                    </div>
                    <div className="ar-colophon__rail-mid">
                      <span>Published</span>
                      <time dateTime={post.publishedAt}>{publishedLabel}</time>
                    </div>
                    <div className="ar-colophon__rail-bot">
                      <span>Egypt</span>
                      <span>Luxor — Aswan</span>
                    </div>
                  </aside>

                  <div className="ar-colophon__copy">
                    <Eyebrow>Dispatch</Eyebrow>
                    <h1 className="ar-display ar-display--xl ar-colophon__title">
                      {post.title}
                    </h1>
                  </div>

                  <ArticleMedia
                    slot={heroImageName}
                    alt={`Editorial view for ${post.title}`}
                    priority
                    className="ar-colophon__edge"
                    ratio="3 / 5"
                  />
                </div>

                <footer className="ar-colophon__bar">
                  <p className="ar-colophon__mark">
                    Hathor Cruise <span className="ar-reg">®</span> Journal
                  </p>
                  <p className="ar-colophon__scroll">
                    <i />
                    Scroll
                  </p>
                  <nav className="ar-colophon__nav" aria-label="Article sections">
                    <a href="#lede">Lede</a>
                    <a href="#evidence">View</a>
                    <a href="#article">Read</a>
                    <Link href="/blogs">Journal</Link>
                  </nav>
                </footer>
              </Scene>

              {/* 02 — Lede wash: excerpt as statement + framed date */}
              <Scene className="ar-lede" id="lede">
                <div className="ar-lede__inner">
                  <div className="ar-lede__statement">
                    <Eyebrow>Opening line</Eyebrow>
                    <p className="ar-edit ar-edit--xl ar-lede__quote">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="ar-lede__frame">
                    <span>Published</span>
                    <time dateTime={post.publishedAt}>{publishedLabel}</time>
                    <span>Hathor · Nile</span>
                  </div>
                </div>
              </Scene>

              {/* 03 — Evidence field: asymmetric visual essay */}
              <Scene className="ar-evidence" id="evidence">
                <div className="ar-evidence__layout">
                  <ArticleMedia
                    slot={heroImageName}
                    alt={`Primary editorial view for ${post.title}`}
                    className="ar-evidence__dominant"
                    ratio="5 / 4"
                  />
                  <div className="ar-evidence__side">
                    <FlipImage
                      className="ar-evidence__support"
                      axis="up"
                      ratio="4 / 5"
                      front={supportSlot}
                      back="home-voyage-nile-majesty"
                      frontAlt="Supporting Nile scene"
                      backAlt="Sailing the Nile aboard Hathor"
                    />
                    <div className="ar-evidence__caption">
                      <span>Along the river</span>
                      <p className="ar-meta-copy">
                        Imagery chosen for this note — temples, villages, and
                        the quieter pace of Dahabiya travel.
                      </p>
                    </div>
                  </div>
                </div>
              </Scene>

              {/* 04 — Threshold into vertical reading */}
              <Scene className="ar-threshold">
                <div className="ar-threshold__inner">
                  <Eyebrow>Continue</Eyebrow>
                  <p className="ar-display ar-display--l ar-threshold__word">
                    The note
                  </p>
                  <i className="ar-threshold__rule" aria-hidden="true" />
                  <a className="ar-threshold__cue ar-link" href="#article">
                    Read below
                  </a>
                </div>
              </Scene>
            </div>
          </div>
        </section>

        <section className="ar-epilogue" id="article">
          <div className="ar-epilogue__reading">
            <aside className="ar-epilogue__aside">
              <Eyebrow>Article</Eyebrow>
              <time dateTime={post.publishedAt}>{publishedLabel}</time>
              <p className="ar-epilogue__aside-title">{post.title}</p>
              <Link href="/blogs" className="ar-btn">
                <span>Back to journal</span>
              </Link>
            </aside>

            <article className="ar-article">
              <div className="ar-article__kicker">
                <span>Hathor Journal</span>
                <span aria-hidden="true">·</span>
                <time dateTime={post.publishedAt}>{publishedLabel}</time>
              </div>
              {children}
            </article>
          </div>

          {related.length > 0 ? (
            <div className="ar-further">
              <header className="ar-further__head">
                <Eyebrow>Further notes</Eyebrow>
                <h2 className="ar-display ar-display--l">Continue reading</h2>
              </header>
              <ul className="ar-further__list">
                {related.map((item) => (
                  <li key={item.slug} className="ar-further__item">
                    <Link
                      href={`/blogs/${item.slug}`}
                      className="ar-further__thumb"
                      aria-label={`Read ${item.title}`}
                    >
                      <ArticleMedia
                        slot={getBlogHeroImageName(item.slug)}
                        alt=""
                        ratio="5 / 4"
                      />
                    </Link>
                    <time dateTime={item.publishedAt}>
                      {formatBlogPublishedDate(item.publishedAt)}
                    </time>
                    <h3>
                      <Link href={`/blogs/${item.slug}`}>{item.title}</Link>
                    </h3>
                    <Link href={`/blogs/${item.slug}`} className="ar-link">
                      Open note
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="ar-epilogue__board">
            <div className="ar-epilogue__statement">
              <p className="ar-edit ar-edit--l">
                When the reading ends, the river begins — reserve a private
                Dahabiya voyage between Luxor and Aswan.
              </p>
              <div className="ar-epilogue__pills">
                <BookNowTrigger className="ar-btn ar-btn--solid">
                  Book Now
                </BookNowTrigger>
                <Link href="/cruises-list" className="ar-btn">
                  <span>Explore cruises</span>
                </Link>
                <Link href="/contact" className="ar-btn">
                  <span>Ask concierge</span>
                </Link>
              </div>
            </div>

            <aside className="ar-epilogue__card">
              <span className="ar-card__tag">Journal</span>
              <ArticleMedia
                slot="blog-hero"
                alt="Hathor journal on the Nile"
                className="ar-epilogue__card-media"
                ratio="356 / 460"
              />
              <h3 className="ar-display">Notes</h3>
              <p className="ar-epilogue__card-body">
                Temples, villages, and quieter travel written for guests of
                Hathor
              </p>
              <div className="ar-epilogue__card-links">
                <Link className="ar-link" href="/blogs">
                  Full journal
                </Link>
                <Link className="ar-link" href="/contact">
                  Write to us
                </Link>
              </div>
            </aside>
          </div>

          <div className="ar-epilogue__legal">
            <span>
              Hathor Cruise <span className="ar-reg">®</span> 2026
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
