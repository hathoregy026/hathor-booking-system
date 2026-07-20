"use client";

import { useRef } from "react";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useHathorLuxBodyMotion } from "@/hooks/useHathorLuxBodyMotion";
import { WELLNESS_PAGE } from "@/lib/page-content";

const FRAMES = [
  {
    kicker: "01 / Seneb Spa",
    title: "A floating oasis",
    lead: WELLNESS_PAGE.hero.subtitle,
    body: WELLNESS_PAGE.spa.paragraphs[0]!,
    imageName: "wellness-hero" as const,
    right: false,
  },
  {
    kicker: "02 / Nile rhythm",
    title: "Surrender to calm",
    lead: "Ancient wisdom · Holistic care",
    body: WELLNESS_PAGE.spa.paragraphs[1]!,
    imageName: "wellness-fitness" as const,
    right: true,
  },
  {
    kicker: "03 / Signature therapies",
    title: "Rituals restored",
    lead: "Aromatherapy · Herbal wraps",
    body: WELLNESS_PAGE.spa.paragraphs[2]!,
    imageName: "wellness-hero" as const,
    right: false,
  },
  {
    kicker: "04 / Historia Fitness",
    title: WELLNESS_PAGE.fitness.title,
    lead: "Train with a view of the Nile",
    body: WELLNESS_PAGE.fitness.body,
    imageName: "wellness-fitness" as const,
    right: true,
  },
] as const;

export function WellnessPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useHathorLuxBodyMotion(rootRef);

  return (
    <PageScrollTransition
      title={WELLNESS_PAGE.hero.title}
      subtitle={WELLNESS_PAGE.hero.subtitle}
      breadcrumb="Wellness"
      imageName="wellness-hero"
    >
      <div ref={rootRef} className="hathor-lux">
        <section className="lux-shell">
          <header className="spx-intro" id="performance">
            <p className="lux-kicker" data-lux-reveal>
              Wellness aboard Hathor
            </p>
            <h2 className="lux-gold lux-gold-xl" data-lux-title>
              {WELLNESS_PAGE.spa.title}
            </h2>
            <p className="lux-lead" data-lux-reveal>
              Health and well-being — Seneb — shaped by timeless Egyptian wisdom.
            </p>
            <div className="lux-copy" data-lux-reveal>
              <p>{WELLNESS_PAGE.spa.paragraphs[3]}</p>
            </div>
          </header>

          {FRAMES.map((frame) => (
            <article
              key={frame.kicker}
              className={`spx-frame${frame.right ? " spx-frame--right" : ""}`}
            >
              <div className="spx-frame-media">
                <div className="lux-mask">
                  <ManagedImage
                    name={frame.imageName}
                    alt={frame.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
              </div>
              <div className="spx-frame-shade" aria-hidden />
              <div className="spx-frame-ui">
                <p className="lux-kicker">{frame.kicker}</p>
                <h3 className="lux-gold lux-gold-lg">{frame.title}</h3>
                <p className="lux-lead">{frame.lead}</p>
                <div className="lux-copy">
                  <p>{frame.body}</p>
                </div>
                <BookNowTrigger className="btn btn-light">Book Now</BookNowTrigger>
              </div>
            </article>
          ))}

          <div className="spx-metrics-wrap">
            <div className="spx-metrics">
              <div className="spx-metric">
                <strong>7,000+</strong>
                <span>Years of wellness tradition</span>
              </div>
              <div className="spx-metric">
                <strong>Seneb</strong>
                <span>Health &amp; well-being</span>
              </div>
              <div className="spx-metric">
                <strong>Nile</strong>
                <span>Views from Historia Fitness</span>
              </div>
              <div className="spx-metric">
                <strong>Private</strong>
                <span>Intimate Dahabiya sanctuary</span>
              </div>
            </div>
          </div>

          <section className="cta-section">
            <div className="cta-inner">
              <h2 className="lux-gold lux-gold-md" data-lux-title>
                Renew Your Soul on the Nile
              </h2>
              <p data-lux-reveal>
                Book your journey and discover Seneb Spa — where ancient Egyptian
                wellness meets modern tranquility.
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
                <BookNowTrigger className="btn btn-filled">Book Now</BookNowTrigger>
                <Link className="btn btn-dark" href="/gastronomy">
                  Dining
                </Link>
                <Link className="btn btn-dark" href="/rooms">
                  Suites
                </Link>
              </div>
            </div>
          </section>
        </section>
      </div>
    </PageScrollTransition>
  );
}
