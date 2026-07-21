"use client";

import { Fragment, useRef, type CSSProperties } from "react";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useAccommodationMotion } from "@/hooks/useAccommodationMotion";

export type ResidenceChapter = {
  id: string;
  label: string;
  title: string;
  meta: string;
  desc: string;
  slides: readonly string[];
  ctaHref?: string;
  ctaLabel?: string;
};

export type ResidenceCopyPlacement = {
  afterHero?: readonly string[];
  beforeGallery?: readonly string[];
  /** One breath of copy between consecutive image blocks (same words, spread out) */
  betweenChapters?: readonly string[];
  beforeAmenities?: readonly string[];
};

export type ResidenceScrollPageProps = {
  heroTitle: string;
  /** Elegant second hero line (script) — keeps full title on the main line */
  heroSecondTitle?: string;
  heroSubtitle: string;
  breadcrumb: string;
  heroImageName: string;
  heroImageAlt: string;
  intro: {
    eyebrow: string;
    title: string;
    /** Fallback when copyPlacement is omitted */
    copy: readonly string[];
    stats?: readonly string[];
  };
  /** Split copy distributed between existing UI blocks */
  copyPlacement?: ResidenceCopyPlacement;
  chapters: readonly ResidenceChapter[];
  amenities?: {
    title: string;
    body: string;
    features: readonly string[];
  };
  cta: {
    title: string;
    body: string;
    href: string;
    hrefLabel: string;
  };
};

const COPY_BLOCK_STYLE: CSSProperties = {
  padding: "60px 0",
  marginBottom: "80px",
};

const COPY_PARA_STYLE: CSSProperties = {
  marginTop: "1.25rem",
};

function scriptLineFromTitle(title: string): string {
  const beforeColon = title.split(":")[0]?.trim();
  return beforeColon && beforeColon.length > 0 ? beforeColon : title;
}

/** "Luxury King Bed : Luxor / Aswan / Luxor" → name + itinerary route */
function splitListingTitle(title: string): { name: string; route: string | null } {
  const idx = title.indexOf(":");
  if (idx === -1) return { name: title.trim(), route: null };
  const name = title.slice(0, idx).trim();
  const route = title.slice(idx + 1).trim();
  return {
    name: name.length > 0 ? name : title.trim(),
    route: route.length > 0 ? route : null,
  };
}

function CopyParagraphs({
  paragraphs,
  spaced,
}: {
  paragraphs: readonly string[];
  spaced?: boolean;
}) {
  if (!paragraphs.length) return null;
  return (
    <div
      className="section-inner acc-intro-inner"
      style={spaced ? COPY_BLOCK_STYLE : undefined}
    >
      {paragraphs.map((paragraph) => (
        <p
          key={paragraph.slice(0, 64)}
          className="acc-intro-copy acc-reveal typo-body-text"
          style={COPY_PARA_STYLE}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export function ResidenceScrollPage({
  heroTitle,
  heroSecondTitle,
  heroSubtitle,
  breadcrumb,
  heroImageName,
  heroImageAlt,
  intro,
  copyPlacement,
  chapters,
  amenities,
  cta,
}: ResidenceScrollPageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useAccommodationMotion(rootRef);

  const afterHero = copyPlacement?.afterHero ?? intro.copy;
  const beforeGallery = copyPlacement?.beforeGallery ?? [];
  const betweenChapters = copyPlacement?.betweenChapters ?? [];
  const beforeAmenities = copyPlacement?.beforeAmenities ?? [];

  return (
    <PageScrollTransition
      title={heroTitle}
      secondTitle={heroSecondTitle}
      subtitle={heroSubtitle}
      breadcrumb={breadcrumb}
      imageName={heroImageName}
      imageAlt={heroImageAlt}
    >
      <div ref={rootRef} className="venetian-page page-accommodation">
        <section className="about-section acc-intro-block" id="intro">
          <div className="section-inner acc-intro-inner">
            <p className="acc-eyebrow acc-reveal typo-page-subtitle">
              {intro.eyebrow}
            </p>
            <h2 className="acc-intro-title typo-page-title">
              <span className="acc-intro-line">{intro.title}</span>
            </h2>
            {afterHero.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="acc-intro-copy acc-reveal typo-body-text"
                style={{ marginTop: "1.25rem", marginBottom: "1.5rem" }}
              >
                {paragraph}
              </p>
            ))}
            {intro.stats && intro.stats.length > 0 ? (
              <div
                className="cruise-stats acc-reveal"
                style={{ marginTop: "2.5rem" }}
              >
                {intro.stats.map((stat) => (
                  <div key={stat} className="cruise-stat">
                    <span className="cruise-stat-num">
                      {stat.match(/^\d+/)?.[0] ?? "·"}
                    </span>
                    <span className="cruise-stat-label">
                      {stat.replace(/^\d+\s*/, "")}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {beforeGallery.length > 0 ? (
          <section
            className="about-section acc-intro-block"
            aria-label="Introduction"
          >
            <CopyParagraphs paragraphs={beforeGallery} spaced />
          </section>
        ) : null}

        <div className="room-stack" id="rooms">
          {chapters.map((chapter, chapterIndex) => {
            const next = chapters[chapterIndex + 1];
            const gapCopy = betweenChapters[chapterIndex];
            const showGap =
              Boolean(next) &&
              (Boolean(gapCopy) || Boolean(next));
            const { name: titleName, route: titleRoute } = splitListingTitle(
              chapter.title,
            );

            return (
              <Fragment key={chapter.id}>
                <section
                  className="room-fs"
                  data-room={chapter.id}
                  aria-label={chapter.title}
                >
                  <div className="room-fs-slides">
                    {chapter.slides.map((imageName, i) => (
                      <div
                        key={`${chapter.id}-${imageName}-${i}`}
                        className={`room-fs-slide${i === 0 ? " is-first" : ""}`}
                      >
                        <ManagedImage
                          name={imageName}
                          alt={`${chapter.title} view ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="100vw"
                          unoptimized
                          previewAnchor={i === 0 && chapterIndex === 0}
                          priority={chapterIndex === 0 && i === 0}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="room-fs-shade" aria-hidden="true" />
                  <div className="room-fs-ui">
                    <div className="room-fs-top">
                      <span className="room-fs-count typo-page-subtitle">
                        <i className="room-fs-current">01</i> / 04
                      </span>
                      <span className="room-fs-label typo-page-subtitle">
                        {chapter.label}
                      </span>
                    </div>
                    <div className="room-fs-copy">
                      <h2 className="room-fs-title typo-page-title">
                        {titleName}
                      </h2>
                      {titleRoute ? (
                        <p className="room-fs-route typo-page-subtitle">
                          {titleRoute}
                        </p>
                      ) : null}
                      <p className="room-fs-meta typo-sub-subtitle">
                        {chapter.meta}
                      </p>
                      <p className="room-fs-desc typo-body-text">
                        {chapter.desc}
                      </p>
                      {chapter.ctaHref && chapter.ctaLabel ? (
                        <Link
                          className="btn btn-light room-fs-cta"
                          href={chapter.ctaHref}
                        >
                          {chapter.ctaLabel}
                        </Link>
                      ) : (
                        <BookNowTrigger className="btn btn-light room-fs-cta">
                          Book Now
                        </BookNowTrigger>
                      )}
                    </div>
                    <div className="room-fs-progress" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </section>

                {showGap && next ? (
                  <div
                    className="room-interstitial"
                    aria-label={`Between ${chapter.title} and ${next.title}`}
                  >
                    <div className="room-interstitial__inner">
                      <p className="room-interstitial__eyebrow typo-page-subtitle">
                        Explore · Relax · Discover
                      </p>
                      <p className="room-interstitial__script typo-sub-subtitle">
                        {scriptLineFromTitle(next.title)}
                      </p>
                      {gapCopy ? (
                        <p className="room-interstitial__body typo-body-text acc-reveal">
                          {gapCopy}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </Fragment>
            );
          })}
        </div>

        {beforeAmenities.length > 0 ? (
          <section
            className="about-section acc-intro-block"
            aria-label="Further details"
          >
            <CopyParagraphs paragraphs={beforeAmenities} spaced />
          </section>
        ) : null}

        {amenities ? (
          <section className="spx-suite" id="amenities">
            <div className="lux-wrap">
              <header
                className="spx-intro"
                style={{ paddingTop: 0, paddingBottom: "2rem" }}
              >
                <p className="lux-kicker acc-reveal typo-page-subtitle">
                  Amenities
                </p>
                <h2 className="lux-gold lux-gold-lg typo-page-title">
                  {amenities.title}
                </h2>
                <p className="lux-lead acc-reveal typo-body-text">
                  {amenities.body}
                </p>
              </header>
              <div className="spx-suite-grid">
                {amenities.features.map((feature) => (
                  <article key={feature} className="spx-suite-card">
                    <div className="spx-suite-body">
                      <h3>{feature}</h3>
                      <p>Included aboard Hathor Dahabiya.</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="cta-section" id="reserve">
          <div className="cta-inner hathor-cta-copy">
            <h2 className="typo-page-title">{cta.title}</h2>
            <p className="typo-body-text">{cta.body}</p>
            <div className="hathor-cta-actions">
              <Link className="btn btn-filled" href={cta.href}>
                {cta.hrefLabel}
              </Link>
              <BookNowTrigger className="btn btn-dark">Book Now</BookNowTrigger>
            </div>
          </div>
        </section>
      </div>
    </PageScrollTransition>
  );
}
