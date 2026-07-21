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
      secondTitle={WELLNESS_PAGE.hero.secondTitle}
      subtitle={WELLNESS_PAGE.hero.subtitle}
      breadcrumb="Wellness"
      imageName="wellness-hero"
    >
      <div ref={rootRef} className="venetian-page lux-page">
        <section className="lux-shell">
          <header className="spx-intro" id="performance">
            <h2 className="lux-gold lux-gold-xl" data-lux-title>
              {WELLNESS_PAGE.spa.title}
            </h2>
            <p className="lux-kicker" data-lux-reveal>
              Wellness aboard Hathor
            </p>
            <p className="lux-lead" data-lux-reveal>
              Health and well-being — Seneb — shaped by timeless Egyptian wisdom.
            </p>
            <div className="lux-copy" data-lux-reveal>
              <p>{WELLNESS_PAGE.spa.paragraphs[3]}</p>
            </div>
          </header>
        </section>

        <div className="spx">
          {FRAMES.map((frame) => (
            <section
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
                    previewAnchor={!frame.right}
                  />
                </div>
              </div>
              <div className="spx-frame-shade" aria-hidden="true" />
              <div className="spx-frame-ui">
                <h2 className="lux-gold lux-gold-lg" data-lux-title>
                  {frame.title}
                </h2>
                <p className="lux-kicker">{frame.kicker}</p>
                <p className="lux-lead">{frame.lead}</p>
                <div className="lux-copy">
                  <p>{frame.body}</p>
                </div>
                <BookNowTrigger className="btn btn-light">Book Now</BookNowTrigger>
              </div>
            </section>
          ))}
        </div>

        <section className="spx-atelier">
          <div className="lux-wrap">
            <div className="spx-atelier-grid">
              <div className="spx-atelier-media">
                <div className="lux-mask">
                  <ManagedImage
                    name="wellness-fitness"
                    alt="Historia Fitness aboard Hathor"
                    fill
                    className="object-cover"
                    sizes="(max-width: 900px) 100vw, 50vw"
                    previewAnchor={false}
                  />
                </div>
              </div>
              <div className="spx-atelier-copy">
                <h2 className="lux-gold lux-gold-lg" data-lux-title>
                  {WELLNESS_PAGE.fitness.title}
                </h2>
                <p className="lux-kicker" data-lux-reveal>
                  Historia Fitness
                </p>
                <p className="lux-lead" data-lux-reveal>
                  Your personal oasis overlooking the River Nile.
                </p>
                <div className="lux-copy" data-lux-reveal>
                  <p>{WELLNESS_PAGE.fitness.body}</p>
                </div>
                <BookNowTrigger className="btn btn-dark">Book Now</BookNowTrigger>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section" id="reserve">
          <div className="cta-inner">
            <h2 className="lux-gold lux-gold-md" data-lux-title>
              Book Your Cruise Now
            </h2>
            <p data-lux-reveal>
              Reserve your voyage and step into Seneb Spa and Historia Fitness on the Nile.
            </p>
            <BookNowTrigger className="btn btn-filled">Book Now</BookNowTrigger>
            <div style={{ marginTop: "1rem" }}>
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
