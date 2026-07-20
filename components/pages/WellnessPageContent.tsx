"use client";

import { useRef } from "react";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { useHathorLuxBodyMotion } from "@/hooks/useHathorLuxBodyMotion";
import { WELLNESS_PAGE } from "@/lib/page-content";

const FRAMES = [
  {
    kicker: "Seneb Spa",
    title: "A floating oasis.",
    lead: WELLNESS_PAGE.hero.subtitle,
    body: WELLNESS_PAGE.spa.paragraphs[0]!,
    src: "/pages-redesign/wellness-1.webp",
    right: false,
  },
  {
    kicker: "Ritual",
    title: "Surrender to calm.",
    lead: "Ancient wisdom · Holistic care",
    body: WELLNESS_PAGE.spa.paragraphs[1]!,
    src: "/pages-redesign/wellness-2.webp",
    right: true,
  },
  {
    kicker: "Therapies",
    title: "Rituals restored.",
    lead: "Aromatherapy · Herbal wraps",
    body: WELLNESS_PAGE.spa.paragraphs[2]!,
    src: "/pages-redesign/wellness-hero.webp",
    right: false,
  },
  {
    kicker: "Historia Fitness",
    title: WELLNESS_PAGE.fitness.title,
    lead: "Train with a view of the Nile",
    body: WELLNESS_PAGE.fitness.body,
    src: "/pages-redesign/sport-1.webp",
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
      <div ref={rootRef} className="venetian-page lux-page">
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
        </section>

        <div className="spx">
          {FRAMES.map((frame) => (
            <section
              key={frame.kicker}
              className={`spx-frame${frame.right ? " spx-frame--right" : ""}`}
            >
              <div className="spx-frame-media">
                <div className="lux-mask">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={frame.src} alt={frame.title} />
                </div>
              </div>
              <div className="spx-frame-shade" aria-hidden="true" />
              <div className="spx-frame-ui">
                <p className="lux-kicker">{frame.kicker}</p>
                <h2 className="lux-gold lux-gold-lg" data-lux-title>
                  {frame.title}
                </h2>
                <p className="lux-lead">{frame.lead}</p>
                <div className="lux-copy">
                  <p>{frame.body}</p>
                </div>
                <BookNowTrigger className="btn btn-light">
                  Book Your Cruise Now
                </BookNowTrigger>
              </div>
            </section>
          ))}
        </div>

        <section className="spx-metrics-wrap">
          <div className="spx-metrics">
            <div className="spx-metric">
              <strong>Seneb</strong>
              <span>Spa Sanctuary</span>
            </div>
            <div className="spx-metric">
              <strong>Nile</strong>
              <span>River Light</span>
            </div>
            <div className="spx-metric">
              <strong>Historia</strong>
              <span>Fitness Deck</span>
            </div>
            <div className="spx-metric">
              <strong>∞</strong>
              <span>Quiet Hours</span>
            </div>
          </div>
        </section>

        <section className="spx-atelier">
          <div className="lux-wrap">
            <div className="spx-atelier-grid">
              <div className="spx-atelier-media">
                <div className="lux-mask">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/pages-redesign/hl-lux-2.webp"
                    alt="Wellness consultation aboard Hathor"
                  />
                </div>
              </div>
              <div className="spx-atelier-copy">
                <p className="lux-kicker" data-lux-reveal>
                  The Hathor Method
                </p>
                <h2 className="lux-gold lux-gold-lg" data-lux-title>
                  Measured. Personal. Unhurried.
                </h2>
                <p className="lux-lead" data-lux-reveal>
                  A wellness philosophy shaped by the Nile and silence.
                </p>
                <div className="lux-copy" data-lux-reveal>
                  <p>
                    Every guest begins with a discreet rhythm — spa rituals, breath, and
                    rest timed to the river. From there, your voyage becomes a living
                    protocol of calm.
                  </p>
                </div>
                <ul className="spx-atelier-list" data-lux-reveal>
                  <li>Seneb Spa with Nile-facing light</li>
                  <li>Signature therapies drawn from Egyptian tradition</li>
                  <li>Historia Fitness overlooking the river</li>
                  <li>Concierge scheduling around temples and dinners</li>
                </ul>
                <BookNowTrigger className="btn btn-dark" data-lux-reveal>
                  Book Your Cruise Now
                </BookNowTrigger>
              </div>
            </div>
          </div>
        </section>

        <section className="spx-quote">
          <blockquote>
            Excellence needs no audience — only attention, repetition, and room to breathe.
            <cite>Hathor Wellness</cite>
          </blockquote>
        </section>

        <section className="spx-suite" id="suites">
          <div className="lux-wrap">
            <header className="spx-intro" style={{ paddingTop: 0, paddingBottom: "2.5rem" }}>
              <p className="lux-kicker" data-lux-reveal>
                Onboard Ateliers
              </p>
              <h2 className="lux-gold lux-gold-lg" data-lux-title>
                Spaces composed for calm.
              </h2>
              <p className="lux-lead" data-lux-reveal>
                Every room is quiet. Every ritual is intentional.
              </p>
            </header>

            <div className="spx-suite-grid">
              <article className="spx-suite-card">
                <div className="lux-mask">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/pages-redesign/wellness-1.webp" alt="Seneb Spa" />
                </div>
                <div className="spx-suite-body">
                  <p className="lux-kicker">Spa</p>
                  <h3>Seneb Sanctuary</h3>
                  <p>
                    A floating oasis of treatments, steam, and Nile light — health as the
                    Egyptians named it.
                  </p>
                  <BookNowTrigger className="btn btn-dark">
                    Book Your Cruise Now
                  </BookNowTrigger>
                </div>
              </article>
              <article className="spx-suite-card">
                <div className="lux-mask">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/pages-redesign/sport-3.webp" alt="Historia Fitness" />
                </div>
                <div className="spx-suite-body">
                  <p className="lux-kicker">Fitness</p>
                  <h3>Historia Deck</h3>
                  <p>
                    Train with a view — mobility, strength, and breath overlooking the
                    majestic Nile.
                  </p>
                  <BookNowTrigger className="btn btn-dark">
                    Book Your Cruise Now
                  </BookNowTrigger>
                </div>
              </article>
              <article className="spx-suite-card">
                <div className="lux-mask">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/pages-redesign/sport-5.webp" alt="Recovery" />
                </div>
                <div className="spx-suite-body">
                  <p className="lux-kicker">Recovery</p>
                  <h3>Quiet Chamber</h3>
                  <p>
                    Guided restoration between temples — where adaptation is protected as
                    carefully as the journey itself.
                  </p>
                  <BookNowTrigger className="btn btn-dark">
                    Book Your Cruise Now
                  </BookNowTrigger>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="cta-section" id="reserve">
          <div className="cta-inner">
            <h2 className="lux-gold lux-gold-md" data-lux-title>
              Book Your Cruise Now
            </h2>
            <p data-lux-reveal>
              Reserve your voyage and step into a wellness sanctuary on the Nile —
              spa, fitness, and quiet excellence, composed entirely around you.
            </p>
            <BookNowTrigger className="btn btn-filled">
              Book Your Cruise Now
            </BookNowTrigger>
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
