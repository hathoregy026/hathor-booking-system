"use client";

import { useRef } from "react";
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

export type ResidenceScrollPageProps = {
  heroTitle: string;
  heroSubtitle: string;
  breadcrumb: string;
  heroImageName: string;
  heroImageAlt: string;
  intro: {
    eyebrow: string;
    title: string;
    copy: readonly string[];
    stats?: readonly string[];
  };
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

export function ResidenceScrollPage({
  heroTitle,
  heroSubtitle,
  breadcrumb,
  heroImageName,
  heroImageAlt,
  intro,
  chapters,
  amenities,
  cta,
}: ResidenceScrollPageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useAccommodationMotion(rootRef);

  return (
    <PageScrollTransition
      title={heroTitle}
      subtitle={heroSubtitle}
      breadcrumb={breadcrumb}
      imageName={heroImageName}
      imageAlt={heroImageAlt}
    >
      <div ref={rootRef} className="venetian-page page-accommodation">
        <section className="about-section acc-intro-block" id="intro">
          <div className="section-inner acc-intro-inner">
            <p className="acc-eyebrow acc-reveal">{intro.eyebrow}</p>
            <h2 className="acc-intro-title">
              <span className="acc-intro-line">{intro.title}</span>
            </h2>
            {intro.copy.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="acc-intro-copy acc-reveal"
                style={{ marginTop: "1.25rem" }}
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

        <div className="room-stack" id="rooms">
          {chapters.map((chapter, chapterIndex) => (
            <section
              key={chapter.id}
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
                      previewAnchor={i === 0 && chapterIndex === 0}
                      priority={chapterIndex === 0 && i === 0}
                    />
                  </div>
                ))}
              </div>
              <div className="room-fs-shade" aria-hidden="true" />
              <div className="room-fs-ui">
                <div className="room-fs-top">
                  <span className="room-fs-count">
                    <i className="room-fs-current">01</i> / 04
                  </span>
                  <span className="room-fs-label">{chapter.label}</span>
                </div>
                <div className="room-fs-copy">
                  <h2 className="room-fs-title">{chapter.title}</h2>
                  <p className="room-fs-meta">{chapter.meta}</p>
                  <p className="room-fs-desc">{chapter.desc}</p>
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
          ))}
        </div>

        {amenities ? (
          <section className="spx-suite" id="amenities">
            <div className="lux-wrap">
              <header
                className="spx-intro"
                style={{ paddingTop: 0, paddingBottom: "2rem" }}
              >
                <p className="lux-kicker acc-reveal">Amenities</p>
                <h2 className="lux-gold lux-gold-lg">{amenities.title}</h2>
                <p className="lux-lead acc-reveal">{amenities.body}</p>
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
            <h2>{cta.title}</h2>
            <p>{cta.body}</p>
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
