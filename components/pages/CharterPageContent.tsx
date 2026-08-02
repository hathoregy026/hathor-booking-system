"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import "@/app/charter-private.css";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { CharterRequestForm } from "@/components/pages/charter/CharterRequestForm";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useHathorLuxBodyMotion } from "@/hooks/useHathorLuxBodyMotion";
import { CHARTER_PRIVATE } from "@/lib/charter-private-content";
import { CHARTER_PAGE } from "@/lib/page-content";

export function CharterPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useHathorLuxBodyMotion(rootRef);

  const { pages } = useWebsiteText();
  const charter = pages.charter;
  const routes = CHARTER_PAGE.overview.routes;
  const [preferredRoute, setPreferredRoute] = useState<string>(routes[0] ?? "");

  const copy = CHARTER_PRIVATE;

  return (
    <PageScrollTransition
      title={copy.hero.headline}
      secondTitle={copy.hero.secondLine}
      subtitle={CHARTER_PAGE.hero.subtitle}
      breadcrumb="Charter"
      imageName="charter-hero"
      heroPage="charter"
      sheetBelowLanding={
        <div className="cp-hero-cta">
          <a className="btn btn-primary" href="#charter-request">
            {copy.hero.primaryCta}
          </a>
          <BookNowTrigger className="btn btn-secondary">
            {copy.hero.secondaryCta}
          </BookNowTrigger>
        </div>
      }
    >
      <div ref={rootRef} className="venetian-page lux-page" data-charter-page="">
        {/* 2 — Inquiry widget */}
        <section className="cp-inquiry" aria-label="Charter inquiry">
          <div className="cp-wrap">
            <div className="cp-inquiry__card">
              <div className="cp-inquiry__aside">
                <p className="cp-kicker" data-lux-reveal>
                  {copy.hero.kicker}
                </p>
                <h2 className="cp-title lux-gold-md" data-lux-title>
                  {copy.inquiry.title}
                </h2>
                <p className="cp-lead" data-lux-reveal>
                  {charter.cta || copy.inquiry.lead}
                </p>
                <p className="cp-script" data-lux-reveal>
                  Preferred · {preferredRoute}
                </p>
                <div className="cp-inquiry__actions" data-lux-reveal>
                  <a className="btn btn-primary" href={`mailto:${copy.finale.email}`}>
                    Email reservations
                  </a>
                  <a
                    className="btn btn-secondary"
                    href={copy.finale.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp specialist
                  </a>
                </div>
              </div>
              <CharterRequestForm
                preferredRoute={preferredRoute}
                routes={routes}
                onPreferredRouteChange={setPreferredRoute}
                compact
              />
            </div>
          </div>
        </section>

        {/* 3 — Value proposition */}
        <section className="cp-section" aria-labelledby="cp-value-title">
          <div className="cp-wrap">
            <p className="cp-kicker" data-lux-reveal>
              {copy.value.kicker}
            </p>
            <h2 id="cp-value-title" className="cp-title lux-gold-lg" data-lux-title>
              {copy.value.title}
            </h2>
            <p className="cp-lead" data-lux-reveal>
              {charter.benefitsIntro || copy.value.intro}
            </p>
            <div className="cp-pillars">
              {copy.value.pillars.map((pillar) => (
                <article key={pillar.title} className="cp-pillar" data-lux-reveal>
                  <div className="cp-pillar__media lux-mask">
                    <ManagedImage
                      name={pillar.image}
                      alt={pillar.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>
                  <h3>{pillar.title}</h3>
                  <p className="cp-copy">{pillar.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 4 — Fleet / residence showcase */}
        <section className="cp-section cp-section--soft" aria-labelledby="cp-fleet-title">
          <div className="cp-wrap">
            <p className="cp-kicker" data-lux-reveal>
              {copy.fleet.kicker}
            </p>
            <h2 id="cp-fleet-title" className="cp-title lux-gold-lg" data-lux-title>
              {copy.fleet.title}
            </h2>
            <p className="cp-lead" data-lux-reveal>
              {copy.fleet.intro}
            </p>
            <ul className="cp-fleet-stats" data-lux-reveal>
              {copy.fleet.stats.map((stat) => (
                <li key={stat}>{stat}</li>
              ))}
            </ul>
            <p className="cp-copy" data-lux-reveal style={{ marginTop: "1rem", maxWidth: "52ch" }}>
              {copy.fleet.outro}
            </p>
            <div className="cp-fleet-grid">
              {copy.fleet.cards.map((card) => (
                <article key={card.title} className="cp-fleet-card" data-lux-reveal>
                  <div className="cp-fleet-card__media lux-mask">
                    <ManagedImage
                      name={card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>
                  <div className="cp-fleet-card__body">
                    <h3>{card.title}</h3>
                    <p className="cp-fleet-meta">
                      {card.capacity} · {card.detail}
                    </p>
                    <p className="cp-copy">{card.body}</p>
                    <ul className="cp-fleet-amenities">
                      {card.amenities.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <Link href={card.href}>{card.hrefLabel}</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 5 — Bespoke experiences */}
        <section className="cp-section" aria-labelledby="cp-exp-title">
          <div className="cp-wrap">
            <p className="cp-kicker" data-lux-reveal>
              {copy.experiences.kicker}
            </p>
            <h2 id="cp-exp-title" className="cp-title lux-gold-lg" data-lux-title>
              {copy.experiences.title}
            </h2>
            <div className="cp-exp-grid">
              {copy.experiences.items.map((item) => (
                <article key={item.title} className="cp-exp" data-lux-reveal>
                  <div className="cp-exp__media lux-mask">
                    <ManagedImage
                      name={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 28vw"
                      previewAnchor={false}
                    />
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p className="cp-copy">{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6 — Featured passages */}
        <section className="cp-section cp-section--soft" aria-labelledby="cp-passages-title">
          <div className="cp-wrap">
            <p className="cp-kicker" data-lux-reveal>
              {copy.passages.kicker}
            </p>
            <h2 id="cp-passages-title" className="cp-title lux-gold-lg" data-lux-title>
              {copy.passages.title}
            </h2>
            <p className="cp-lead" data-lux-reveal>
              {copy.passages.lead}
            </p>
            <div className="cp-passages" role="list">
              {copy.passages.routes.map((route) => {
                const active = preferredRoute === route;
                return (
                  <button
                    key={route}
                    type="button"
                    role="listitem"
                    className={`cp-passage${active ? " is-active" : ""}`}
                    onClick={() => {
                      setPreferredRoute(route);
                      document
                        .getElementById("charter-request")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    <span className="cp-passage__route">{route}</span>
                    <span className="cp-passage__cta">
                      {active ? "Selected · Request quote" : "Secure this passage"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7 — Process */}
        <section className="cp-section" aria-labelledby="cp-process-title">
          <div className="cp-wrap">
            <p className="cp-kicker" data-lux-reveal>
              {copy.process.kicker}
            </p>
            <h2 id="cp-process-title" className="cp-title lux-gold-lg" data-lux-title>
              {copy.process.title}
            </h2>
            <div className="cp-steps">
              {copy.process.steps.map((step) => (
                <article key={step.n} className="cp-step" data-lux-reveal>
                  <span className="cp-step__n" aria-hidden="true">
                    {step.n}
                  </span>
                  <h3>{step.title}</h3>
                  <p className="cp-copy">{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 8 — Trust */}
        <section className="cp-section cp-section--ink" aria-labelledby="cp-trust-title">
          <div className="cp-wrap">
            <p className="cp-kicker" data-lux-reveal>
              {copy.trust.kicker}
            </p>
            <h2 id="cp-trust-title" className="cp-title lux-gold-lg" data-lux-title>
              {copy.trust.title}
            </h2>
            <div className="cp-trust-layout">
              <ul className="cp-facts" data-lux-reveal>
                {(charter.benefits.length ? charter.benefits : copy.trust.facts).map(
                  (fact) => (
                    <li key={fact}>{fact}</li>
                  ),
                )}
              </ul>
              <div className="cp-quotes">
                {copy.trust.quotes.map((item) => (
                  <figure key={item.attribution} className="cp-quote" data-lux-reveal>
                    <blockquote>{item.quote}</blockquote>
                    <cite>{item.attribution}</cite>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 9 — Finale CTA */}
        <section className="cp-finale" aria-labelledby="cp-finale-title">
          <div className="cp-finale__media">
            <ManagedImage
              name="charter-rhythm"
              alt="Private Hathor charter at dusk on the Nile"
              fill
              className="object-cover"
              sizes="100vw"
              previewAnchor={false}
            />
          </div>
          <div className="cp-finale__shade" aria-hidden="true" />
          <div className="cp-wrap cp-finale__inner">
            <p className="cp-kicker" data-lux-reveal>
              Private concierge
            </p>
            <h2 id="cp-finale-title" className="cp-title lux-gold-lg" data-lux-title>
              {copy.finale.title}
            </h2>
            <p className="cp-lead" data-lux-reveal style={{ color: "rgb(236 232 223 / 0.78)" }}>
              {charter.overviewIntro || copy.finale.body}
            </p>
            <div className="cp-finale__contacts" data-lux-reveal>
              <a href={copy.finale.phoneHref}>{copy.finale.phone}</a>
              <a href={`mailto:${copy.finale.email}`}>{copy.finale.email}</a>
              <span style={{ opacity: 0.65, fontSize: "0.85rem" }}>{copy.finale.hours}</span>
            </div>
            <div className="cp-finale__actions" data-lux-reveal>
              <a className="btn btn-secondary" href="#charter-request">
                Request a Bespoke Quote
              </a>
              <a
                className="btn btn-primary"
                href={copy.finale.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp a specialist
              </a>
              <BookNowTrigger className="btn btn-secondary">Book Now</BookNowTrigger>
            </div>
          </div>
        </section>
      </div>
    </PageScrollTransition>
  );
}
