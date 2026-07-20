"use client";

import { useRef } from "react";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useHathorLuxBodyMotion } from "@/hooks/useHathorLuxBodyMotion";
import { ROOMS_PAGE } from "@/lib/page-content";

export function RoomsPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useHathorLuxBodyMotion(rootRef);

  return (
    <PageScrollTransition
      title={ROOMS_PAGE.hero.title}
      subtitle={ROOMS_PAGE.hero.subtitle}
      breadcrumb="Accommodations"
      imageName="room-luxury"
      imageAlt="Luxury cabin aboard Hathor Dahabiya"
    >
      <div ref={rootRef} className="hathor-lux">
        <section className="cruise-intro" id="intro">
          <div className="section-inner cruise-intro-inner">
            <p className="cruise-eyebrow" data-lux-reveal>
              The Collection
            </p>
            <h2 className="lux-gold lux-gold-xl" data-lux-title>
              {ROOMS_PAGE.accommodations.title}
            </h2>
            <p className="cruise-intro-copy" data-lux-reveal>
              {ROOMS_PAGE.accommodations.intro}
            </p>
            <div className="cruise-stats" data-lux-reveal>
              {ROOMS_PAGE.accommodations.stats.map((stat) => (
                <div key={stat} className="cruise-stat">
                  <span className="cruise-stat-num">
                    {stat.match(/^\d+/)?.[0]}
                  </span>
                  <span className="cruise-stat-label">
                    {stat.replace(/^\d+\s*/, "")}
                  </span>
                </div>
              ))}
            </div>
            <div className="lux-copy" data-lux-reveal style={{ marginTop: "2rem" }}>
              {ROOMS_PAGE.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
              <p>{ROOMS_PAGE.accommodations.outro}</p>
            </div>
          </div>
        </section>

        {ROOMS_PAGE.categories.map((category, index) => {
          const href = "href" in category ? category.href : undefined;
          const hrefLabel =
            "hrefLabel" in category ? category.hrefLabel : undefined;
          return (
            <article
              key={category.title}
              className={`acc-fs${index % 2 === 1 ? " acc-fs--right" : ""}`}
              id={`site-image-${category.imageName}`}
              data-site-image={category.imageName}
            >
              <div className="acc-fs-media">
                <div className="lux-mask">
                  <ManagedImage
                    name={category.imageName}
                    alt={`${category.title} aboard Hathor Dahabiya`}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
              </div>
              <div className="acc-fs-shade" aria-hidden />
              <div className="acc-fs-ui">
                <p className="lux-kicker">
                  0{index + 1} / Accommodation
                </p>
                <h3 className="lux-gold lux-gold-lg">{category.title}</h3>
                <div className="lux-copy">
                  <p>{category.body}</p>
                </div>
                {href && hrefLabel ? (
                  <Link href={href}>{hrefLabel}</Link>
                ) : (
                  <Link href="/cruises">View cruises</Link>
                )}
              </div>
            </article>
          );
        })}

        <section className="spx-suite" id="suites">
          <div className="lux-wrap">
            <p className="lux-kicker" data-lux-reveal>
              Suites
            </p>
            <h2 className="lux-gold lux-gold-lg" data-lux-title>
              {ROOMS_PAGE.suites.title}
            </h2>
            <p className="lux-lead" data-lux-reveal>
              {ROOMS_PAGE.suites.body}
            </p>
            <div className="spx-suite-grid" style={{ marginTop: "2rem" }}>
              {ROOMS_PAGE.suites.features.map((feature) => (
                <article key={feature} className="spx-suite-card">
                  <div className="spx-suite-body">
                    <h3>{feature}</h3>
                    <p>Included in your suite sanctuary aboard Hathor Dahabiya.</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section" id="reserve">
          <div className="cta-inner">
            <h2 className="lux-gold lux-gold-md" data-lux-title>
              {ROOMS_PAGE.cruisesCta.title}
            </h2>
            <p data-lux-reveal>{ROOMS_PAGE.cruisesCta.body}</p>
            <p className="lux-lead" data-lux-reveal>
              {ROOMS_PAGE.welcome.subtitle}
            </p>
            <p data-lux-reveal className="lux-copy">
              {ROOMS_PAGE.welcome.body}
            </p>
            <div
              data-lux-reveal
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link className="btn btn-filled" href="/cruises">
                {ROOMS_PAGE.cruisesCta.hrefLabel}
              </Link>
              <BookNowTrigger className="btn btn-dark">Book Now</BookNowTrigger>
              <Link className="btn btn-dark" href="/gastronomy">
                Dining
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageScrollTransition>
  );
}
