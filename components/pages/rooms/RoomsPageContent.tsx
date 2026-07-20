"use client";

import { useRef } from "react";
import Link from "next/link";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useAccommodationMotion } from "@/hooks/useAccommodationMotion";
import { ROOMS_PAGE } from "@/lib/page-content";

/** Hathor residences — your content; redesign room-stack motion/style only. */
const RESIDENCES = [
  {
    id: "1",
    label: "Residence 01",
    title: "Luxury Rooms",
    meta: "22 m² · Nile view · Smart cabin",
    desc: ROOMS_PAGE.categories[0]!.body,
    href: "/luxury-cabins-Nile-Cruise",
    hrefLabel: ROOMS_PAGE.categories[0]!.hrefLabel ?? "Discover",
    slides: ["room-luxury", "room-suite", "room-luxury", "room-royal"] as const,
  },
  {
    id: "2",
    label: "Residence 02",
    title: "Luxury Suites",
    meta: "46 m² · Jacuzzi · Dual baths",
    desc: ROOMS_PAGE.categories[1]!.body,
    href: "/rooms#suites",
    hrefLabel: "Discover",
    slides: ["room-suite", "room-luxury", "room-suite", "room-royal"] as const,
  },
  {
    id: "3",
    label: "Residence 03",
    title: "Luxury Royal Suites",
    meta: "56 m² · Main Deck · Nile glass",
    desc: ROOMS_PAGE.categories[2]!.body,
    href: "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
    hrefLabel: ROOMS_PAGE.categories[2]!.hrefLabel ?? "Discover",
    slides: ["room-royal", "room-suite", "room-royal", "room-luxury"] as const,
  },
] as const;

export function RoomsPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useAccommodationMotion(rootRef);

  return (
    <PageScrollTransition
      title={ROOMS_PAGE.hero.title}
      subtitle={ROOMS_PAGE.hero.subtitle}
      breadcrumb="Accommodations"
      imageName="room-luxury"
      imageAlt="Luxury cabin aboard Hathor Dahabiya"
    >
      <div ref={rootRef} className="venetian-page page-accommodation">
        <section className="about-section acc-intro-block" id="intro">
          <div className="section-inner acc-intro-inner">
            <p className="acc-eyebrow acc-reveal">The Collection</p>
            <h2 className="acc-intro-title">
              <span className="acc-intro-line">
                {ROOMS_PAGE.accommodations.title}
              </span>
            </h2>
            <p className="acc-intro-copy acc-reveal">
              {ROOMS_PAGE.accommodations.intro}{" "}
              {ROOMS_PAGE.accommodations.stats.join(" · ")}.
            </p>
            <p className="acc-intro-copy acc-reveal" style={{ marginTop: "1.25rem" }}>
              {ROOMS_PAGE.accommodations.outro}
            </p>
          </div>
        </section>

        <div className="room-stack" id="rooms">
          {RESIDENCES.map((room) => (
            <section
              key={room.id}
              className="room-fs"
              data-room={room.id}
              aria-label={room.title}
            >
              <div className="room-fs-slides">
                {room.slides.map((imageName, i) => (
                  <div
                    key={`${room.id}-${imageName}-${i}`}
                    className={`room-fs-slide${i === 0 ? " is-first" : ""}`}
                  >
                    <ManagedImage
                      name={imageName}
                      alt={`${room.title} view ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="100vw"
                      previewAnchor={i === 0}
                      priority={room.id === "1" && i === 0}
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
                  <span className="room-fs-label">{room.label}</span>
                </div>
                <div className="room-fs-copy">
                  <h2 className="room-fs-title">{room.title}</h2>
                  <p className="room-fs-meta">{room.meta}</p>
                  <p className="room-fs-desc">{room.desc}</p>
                  <Link className="btn btn-light room-fs-cta" href={room.href}>
                    {room.hrefLabel}
                  </Link>
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

        <section className="spx-suite" id="suites">
          <div className="lux-wrap">
            <p className="lux-kicker acc-reveal">Suites</p>
            <h2 className="lux-gold lux-gold-lg">{ROOMS_PAGE.suites.title}</h2>
            <p className="lux-lead acc-reveal">{ROOMS_PAGE.suites.body}</p>
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
            <h2>{ROOMS_PAGE.cruisesCta.title}</h2>
            <p>{ROOMS_PAGE.cruisesCta.body}</p>
            <p className="lux-lead" style={{ color: "rgba(255,255,255,0.75)" }}>
              {ROOMS_PAGE.welcome.subtitle}
            </p>
            <p style={{ color: "rgba(255,255,255,0.7)" }}>{ROOMS_PAGE.welcome.body}</p>
            <Link className="btn btn-filled" href="/cruises">
              {ROOMS_PAGE.cruisesCta.hrefLabel}
            </Link>
          </div>
        </section>
      </div>
    </PageScrollTransition>
  );
}
