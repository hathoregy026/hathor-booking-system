"use client";

import { useRef } from "react";
import Link from "next/link";
import "@/app/voyages-page.css";
import "@/app/immersive-voyage.css";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ManagedImage } from "@/components/ui/ManagedImage";
import {
  useTypographyInlineStyle,
  useTypographySettings,
} from "@/components/public/TypographySettingsProvider";
import { useVoyagesPageMotion } from "@/hooks/useVoyagesPageMotion";
import type { HomepageAccordionCruise } from "@/lib/homepage-accordion-cruises";
import { resolveVoyagePanelContent } from "@/lib/voyage-accordion-panels";
import { VOYAGES_PAGE } from "@/lib/voyages-page-content";

export type VoyagesPageContentProps = {
  voyages: HomepageAccordionCruise[];
};

export function VoyagesPageContent({ voyages }: VoyagesPageContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useVoyagesPageMotion(rootRef);

  const { our_voyages_copy: voyagesCopy } = useTypographySettings();
  const titleStyle = useTypographyInlineStyle("our_voyages_title");
  const indicationStyle = useTypographyInlineStyle("our_voyages_indication");
  const nameStyle = useTypographyInlineStyle("our_voyages_main_hover");
  const metaStyle = useTypographyInlineStyle("our_voyages_indication_hover");
  const bodyStyle = useTypographyInlineStyle("our_voyages_body_hover");

  const sectionTitle =
    (voyagesCopy?.title ?? "").trim() || VOYAGES_PAGE.hero.title;
  const sectionIndication =
    (voyagesCopy?.indication ?? "").trim() || "Private dahabiya itineraries";

  const total = voyages.length;

  return (
    <PageScrollTransition
      title={VOYAGES_PAGE.hero.title}
      secondTitle={VOYAGES_PAGE.hero.secondTitle}
      subtitle={VOYAGES_PAGE.hero.subtitle}
      breadcrumb="Voyages"
      imageName="home-voyage-7n-roundtrip"
      imageAlt="Hathor voyages on the Nile"
    >
      <div ref={rootRef} className="venetian-page lux-page" data-voyages-page="">
        {/* Opening editorial */}
        <section className="voy-opening" aria-labelledby="voy-opening-title">
          <div className="voy-wrap voy-opening__grid">
            <div>
              <p className="voy-kicker" data-lux-reveal>
                {VOYAGES_PAGE.opening.eyebrow}
              </p>
              <h2
                id="voy-opening-title"
                className="voy-display"
                data-lux-title
              >
                {VOYAGES_PAGE.opening.title}
              </h2>
              <p className="voy-script" data-lux-reveal>
                {VOYAGES_PAGE.opening.script}
              </p>
              {VOYAGES_PAGE.opening.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="voy-body" data-lux-reveal>
                  {paragraph}
                </p>
              ))}
              <div className="voy-cta-row">
                <Link
                  className="btn btn-dark"
                  href={VOYAGES_PAGE.opening.primaryCta.href}
                >
                  {VOYAGES_PAGE.opening.primaryCta.label}
                </Link>
                <Link
                  className="public-btn-outline-gold"
                  href={VOYAGES_PAGE.opening.secondaryCta.href}
                >
                  {VOYAGES_PAGE.opening.secondaryCta.label}
                </Link>
              </div>
            </div>
            <div className="voy-opening__media lux-mask" data-lux-reveal>
              <ManagedImage
                name="home-voyage-4n-luxor-aswan"
                alt="Hathor sailing the Nile"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
                priority
              />
            </div>
          </div>
        </section>

        {/* Manifesto */}
        <section className="voy-manifesto" aria-label="The Hathor voyage promise">
          <div className="voy-wrap voy-manifesto__grid">
            {VOYAGES_PAGE.manifesto.map((item) => (
              <article key={item.numeral} data-lux-reveal>
                <p className="voy-manifesto__numeral">{item.numeral}</p>
                <h3 className="voy-manifesto__title">{item.title}</h3>
                <p className="voy-body">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Sticky voyage chapters */}
        <section className="voy-chapters" aria-label={sectionTitle}>
          {voyages.map((item, index) => {
            const panel = resolveVoyagePanelContent({
              slug: item.slug,
              name: item.name,
              description: item.description,
              href: item.href,
            });
            const isFirst = index === 0;
            const isLast = index === total - 1;

            return (
              <article
                key={item.id}
                className={`voy-chapter${isLast ? " voy-chapter--last" : ""}`}
              >
                <div className="voy-chapter__frame">
                  <div className="voy-chapter__media" aria-hidden="true">
                    <ManagedImage
                      name={item.imageName}
                      alt=""
                      fill
                      sizes="100vw"
                      loading={index < 2 ? "eager" : "lazy"}
                      className="object-cover"
                    />
                  </div>
                  <div className="voy-chapter__wash" aria-hidden="true" />
                  <span className="voy-chapter__horizon" aria-hidden="true" />

                  <div
                    className="voy-chapter__index"
                    aria-label={`Voyage ${index + 1} of ${total}`}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span className="voy-chapter__index-total">
                      {" "}
                      / {String(total).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="voy-chapter__copy">
                    {isFirst ? (
                      <header className="voy-chapter__section-head">
                        <p
                          className="voy-chapter__section-title typo-our-voyages-title"
                          style={titleStyle}
                        >
                          {sectionTitle}
                        </p>
                        {sectionIndication ? (
                          <p
                            className="voy-chapter__section-indication typo-our-voyages-indication"
                            style={indicationStyle}
                          >
                            {sectionIndication}
                          </p>
                        ) : null}
                      </header>
                    ) : null}

                    <h3
                      className="voy-chapter__name typo-our-voyages-main-hover"
                      style={nameStyle}
                    >
                      {panel.routeTitle}
                    </h3>
                    <p
                      className="voy-chapter__meta typo-our-voyages-indication-hover"
                      style={metaStyle}
                    >
                      {panel.durationLabel}
                      {item.meta?.trim() ? ` · ${item.meta}` : ""}
                    </p>
                    <p className="voy-chapter__quote">{panel.railQuote}</p>
                    <p
                      className="voy-chapter__summary typo-our-voyages-body-hover"
                      style={bodyStyle}
                    >
                      {panel.summary}
                    </p>
                    <ul className="voy-chapter__highlights">
                      {panel.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                    <div className="voy-chapter__actions">
                      <Link
                        className="btn btn-dark"
                        href={panel.detailsHref}
                      >
                        {panel.detailsLabel}
                      </Link>
                      <Link
                        className="public-btn-outline-gold"
                        href="/contact"
                      >
                        {panel.enquireLabel}
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Features rail */}
        <section className="voy-features" aria-labelledby="voy-features-title">
          <div className="voy-wrap">
            <header className="voy-features__head">
              <p className="voy-kicker" data-lux-reveal>
                {VOYAGES_PAGE.features.eyebrow}
              </p>
              <h2
                id="voy-features-title"
                className="voy-display voy-display--gold"
                data-lux-title
              >
                {VOYAGES_PAGE.features.title}
              </h2>
            </header>
            <div className="voy-features__rail">
              <ul className="voy-features__tabs" role="list">
                {VOYAGES_PAGE.features.items.map((item, index) => (
                  <li
                    key={item.id}
                    className={`voy-features__tab${index === 0 ? " is-active" : ""}`}
                    data-label={item.label}
                    data-body={item.body}
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
              <div className="voy-features__panel" aria-live="polite">
                <h3 className="voy-features__panel-title">
                  {VOYAGES_PAGE.features.items[0]!.label}
                </h3>
                <p className="voy-body voy-features__panel-body">
                  {VOYAGES_PAGE.features.items[0]!.body}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* River rhythm scrub */}
        <section
          className="iv-scrub"
          data-iv-scrub="voyages-rhythm"
          aria-labelledby="voy-rhythm-title"
        >
          <div className="iv-wrap iv-scrub__head">
            <p className="iv-kicker" data-lux-reveal>
              {VOYAGES_PAGE.rhythm.eyebrow}
            </p>
            <h2
              id="voy-rhythm-title"
              className="lux-gold lux-gold-lg"
              data-lux-title
            >
              {VOYAGES_PAGE.rhythm.title}
            </h2>
          </div>

          <div className="iv-scrub__pin">
            <div className="iv-scrub__stage">
              <div className="iv-scrub__media">
                {VOYAGES_PAGE.rhythm.chapters.map((chapter, i) => (
                  <div
                    key={chapter.kicker}
                    className={`iv-scrub__slide${i === 0 ? " is-active" : ""}`}
                  >
                    <ManagedImage
                      name={chapter.slot}
                      alt={chapter.title}
                      fill
                      className="object-cover"
                      sizes="60vw"
                    />
                  </div>
                ))}
                <div className="iv-scrub__rail" aria-hidden="true">
                  {VOYAGES_PAGE.rhythm.chapters.map((chapter, i) => (
                    <span
                      key={chapter.kicker}
                      className={i === 0 ? "is-active" : undefined}
                    >
                      {chapter.kicker}
                    </span>
                  ))}
                </div>
              </div>
              <div className="iv-scrub__copy">
                {VOYAGES_PAGE.rhythm.chapters.map((chapter, i) => (
                  <div
                    key={chapter.title}
                    className={`iv-scrub__chapter${i === 0 ? " is-active" : ""}`}
                  >
                    <p className="iv-kicker">{chapter.kicker}</p>
                    <h3>{chapter.title}</h3>
                    <p className="iv-copy">{chapter.body}</p>
                  </div>
                ))}
              </div>
              <div className="iv-scrub__progress" aria-hidden="true">
                <i />
              </div>
            </div>
          </div>

          <div className="iv-wrap iv-scrub__stack">
            {VOYAGES_PAGE.rhythm.chapters.map((chapter) => (
              <article key={chapter.kicker} className="iv-stack-card">
                <div className="iv-stack-card__media lux-mask">
                  <ManagedImage
                    name={chapter.slot}
                    alt={chapter.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
                <p className="iv-kicker">{chapter.kicker}</p>
                <h3>{chapter.title}</h3>
                <p className="iv-copy">{chapter.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Private charter */}
        <section className="voy-charter" aria-labelledby="voy-charter-title">
          <div className="voy-charter__media" aria-hidden="true">
            <ManagedImage
              name={VOYAGES_PAGE.charter.image}
              alt="Nile Majesty private charter"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <div className="voy-charter__shade" aria-hidden="true" />
          <div className="voy-charter__panel">
            <p className="voy-kicker" data-lux-reveal>
              {VOYAGES_PAGE.charter.eyebrow}
            </p>
            <h2 id="voy-charter-title" className="voy-display" data-lux-title>
              {VOYAGES_PAGE.charter.title}
            </h2>
            <p className="voy-script" data-lux-reveal>
              {VOYAGES_PAGE.charter.script}
            </p>
            <p className="voy-body" data-lux-reveal>
              {VOYAGES_PAGE.charter.body}
            </p>
            <div className="voy-cta-row">
              <Link className="btn btn-dark" href={VOYAGES_PAGE.charter.cta.href}>
                {VOYAGES_PAGE.charter.cta.label}
              </Link>
              <BookNowTrigger className="public-btn-outline-gold">
                Enquire Now
              </BookNowTrigger>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="voy-final-cta" aria-labelledby="voy-cta-title">
          <div className="voy-wrap">
            <h2 id="voy-cta-title" className="voy-display" data-lux-title>
              {VOYAGES_PAGE.cta.title}
            </h2>
            <p className="voy-body" data-lux-reveal>
              {VOYAGES_PAGE.cta.body}
            </p>
            <div className="voy-cta-row">
              <BookNowTrigger className="btn btn-dark">
                {VOYAGES_PAGE.cta.primary}
              </BookNowTrigger>
              <Link
                className="public-btn-outline-gold"
                href={VOYAGES_PAGE.cta.secondary.href}
              >
                {VOYAGES_PAGE.cta.secondary.label}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageScrollTransition>
  );
}
