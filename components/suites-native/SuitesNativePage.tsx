"use client";

import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { SuitesMosaicHero } from "@/components/suites-native/SuitesMosaicHero";
import { SuitesComfortExperience } from "@/components/suites-native/SuitesComfortExperience";
import {
  SUITES_NATIVE_CONTENT,
  SUITES_NATIVE_CTAS,
  resolveSuitesImage,
} from "@/lib/suites-native-content";

type Props = {
  images: Record<string, string>;
};

export function SuitesNativePage({ images }: Props) {
  const c = SUITES_NATIVE_CONTENT;

  return (
    <div className="suites-native-page">
      <div className="suites-native-preview-banner" role="status">
        <span>Suites native preview — production /suites unchanged</span>
        <a href="/suites">Compare current Suites</a>
      </div>

      <SuitesMosaicHero images={images} />

      {/* 02 Unrivaled Views */}
      <section
        className="sn-section sn-section--cream"
        id="suites-unrivaled"
        aria-label="Unrivaled Views"
      >
        <div className="sn-editorial">
          <div className="sn-editorial__copy">
            <p className="sn-eyebrow">{c.unrivaled.eyebrow}</p>
            <div className="sn-rule" aria-hidden="true" />
            <h2 className="sn-display sn-display--section">{c.unrivaled.title}</h2>
            <p className="sn-body" style={{ marginTop: "1rem" }}>
              {c.unrivaled.body}
            </p>
            <div className="sn-actions">
              <Link
                href={SUITES_NATIVE_CTAS.discoverCollection.href}
                className="sn-btn sn-btn--outline"
              >
                {SUITES_NATIVE_CTAS.discoverCollection.label}
              </Link>
            </div>
          </div>
          <div className="sn-editorial__media-col sn-editorial__stack">
            {(
              [
                "scraped-suites-luxury-suites",
                "scraped-suites-luxury-rooms",
                "scraped-suites-royal",
              ] as const
            ).map((slot) => (
              <div key={slot} className="sn-editorial__stack-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveSuitesImage(images, slot)}
                  alt=""
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 Step Aboard */}
      <section
        className="sn-section sn-section--soft"
        id="suites-step"
        aria-label="Step Aboard"
      >
        <div className="sn-editorial sn-editorial--reverse">
          <div className="sn-editorial__media-col">
            <div className="sn-editorial__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveSuitesImage(images, "scraped-luxsuite-6")}
                alt="Step aboard Hathor"
                decoding="async"
              />
            </div>
          </div>
          <div className="sn-editorial__copy">
            <p className="sn-eyebrow">{c.stepAboard.eyebrow}</p>
            <div className="sn-rule" aria-hidden="true" />
            <h2 className="sn-display sn-display--section">{c.stepAboard.title}</h2>
            <p className="sn-body" style={{ marginTop: "1rem" }}>
              {c.stepAboard.body}
            </p>
            <div className="sn-actions">
              <a
                href={SUITES_NATIVE_CTAS.compareSuites.href}
                className="sn-btn sn-btn--outline"
              >
                {SUITES_NATIVE_CTAS.compareSuites.label}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 04 Comfort */}
      <SuitesComfortExperience images={images} />

      {/* 05 The Nile */}
      <section className="sn-section sn-section--cream" id="suites-nile" aria-label="The Nile">
        <div style={{ maxWidth: "42rem", margin: "0 auto", textAlign: "center" }}>
          <p className="sn-eyebrow">{c.nile.eyebrow}</p>
          <div className="sn-rule" style={{ marginInline: "auto" }} aria-hidden="true" />
          <h2 className="sn-display sn-display--section">{c.nile.title}</h2>
          <p className="sn-eyebrow" style={{ marginTop: "1rem" }}>
            {c.nile.subtitle}
          </p>
          <p className="sn-body" style={{ marginTop: "0.85rem" }}>
            {c.nile.body}
          </p>
        </div>
        <div className="sn-nile__grid">
          {c.nile.imageSlots.map((slot, index) => (
            <article key={slot} className="sn-nile__card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveSuitesImage(images, slot)}
                alt=""
                decoding="async"
              />
              <p>{c.nile.captions[index]}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 06 Statement / panels */}
      <section
        className="sn-section sn-section--soft"
        id="suites-statement"
        aria-label="River light statement"
      >
        <div className="sn-statement">
          <p className="sn-eyebrow">{c.statement.eyebrow}</p>
          <div className="sn-rule" style={{ marginInline: "auto" }} aria-hidden="true" />
          <h2 className="sn-display sn-display--section">{c.statement.title}</h2>
          <p className="sn-body" style={{ marginTop: "1rem" }}>
            {c.statement.body}
          </p>
          <p className="sn-body" style={{ marginTop: "0.85rem" }}>
            {c.statement.secondary}
          </p>
        </div>
        <div className="sn-panels">
          {c.statement.panels.map((slot) => (
            <div key={slot} className="sn-panels__item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveSuitesImage(images, slot)}
                alt=""
                decoding="async"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 07 Map */}
      <section className="sn-section sn-section--cream" id="suites-map" aria-label="Voyage map">
        <div className="sn-map">
          <div className="sn-map__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveSuitesImage(images, c.map.imageSlot)}
              alt="Sail between Luxor and Aswan"
              decoding="async"
            />
          </div>
          <div>
            <p className="sn-eyebrow">{c.map.eyebrow}</p>
            <div className="sn-rule" aria-hidden="true" />
            <h2 className="sn-display sn-display--section">{c.map.title}</h2>
            <p className="sn-body" style={{ marginTop: "1rem" }}>
              {c.map.caption}
            </p>
            <div className="sn-map__stats">
              {c.map.stats.map((stat) => (
                <div key={stat.label} className="sn-map__stat">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 08 Craft */}
      <section className="sn-section sn-section--soft" id="suites-craft" aria-label="Nile craft">
        <div style={{ maxWidth: "40rem", margin: "0 auto", textAlign: "center" }}>
          <p className="sn-eyebrow">{c.craft.eyebrow}</p>
          <div className="sn-rule" style={{ marginInline: "auto" }} aria-hidden="true" />
          <h2 className="sn-display sn-display--section">{c.craft.title}</h2>
          <p className="sn-eyebrow" style={{ marginTop: "0.85rem" }}>
            {c.craft.subtitle}
          </p>
          <p className="sn-body" style={{ marginTop: "0.85rem" }}>
            {c.craft.body}
          </p>
          {c.craft.followOns.map((line) => (
            <p key={line.slice(0, 24)} className="sn-body" style={{ marginTop: "0.75rem" }}>
              {line}
            </p>
          ))}
        </div>
        <div className="sn-craft__media-row">
          {c.craft.imageSlots.map((slot) => (
            <figure key={slot}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveSuitesImage(images, slot)}
                alt=""
                decoding="async"
              />
            </figure>
          ))}
        </div>
      </section>

      {/* 09 Collection */}
      <section
        className="sn-section sn-section--cream"
        id="suites-collection"
        aria-label="Suites collection"
      >
        <header className="sn-collection__header">
          <p className="sn-eyebrow">{c.collection.eyebrow}</p>
          <div className="sn-rule" style={{ marginInline: "auto" }} aria-hidden="true" />
          <h2 className="sn-display sn-display--section">{c.collection.title}</h2>
          <p className="sn-body" style={{ marginTop: "0.85rem" }}>
            {c.collection.subtitle}
          </p>
        </header>
        <ul className="sn-collection__grid">
          {c.collection.cards.map((card) => (
            <li key={card.index}>
              <Link href={card.href} className="sn-collection-card">
                <div className="sn-collection-card__media">
                  <span className="sn-collection-card__index">{card.index}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveSuitesImage(images, card.imageSlot)}
                    alt={card.title}
                    decoding="async"
                  />
                </div>
                <div className="sn-collection-card__body">
                  <span className="sn-collection-card__label">{card.label}</span>
                  <span className="sn-collection-card__title">{card.title}</span>
                  <span className="sn-collection-card__hint">{card.hint}</span>
                  <span className="sn-btn sn-btn--outline sn-collection-card__cta">
                    {card.cta}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 10 Interiors */}
      <section
        className="sn-section sn-section--soft"
        id="suites-interiors"
        aria-label="Interiors"
      >
        <div className="sn-interiors">
          <div className="sn-interiors__gallery">
            {c.interiors.imageSlots.map((slot) => (
              <figure key={slot}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveSuitesImage(images, slot)}
                  alt=""
                  decoding="async"
                />
              </figure>
            ))}
          </div>
          <div>
            <p className="sn-eyebrow">{c.interiors.eyebrow}</p>
            <div className="sn-rule" aria-hidden="true" />
            <h2 className="sn-display sn-display--section">{c.interiors.title}</h2>
            <p className="sn-eyebrow" style={{ marginTop: "0.85rem" }}>
              {c.interiors.subtitle}
            </p>
            <p className="sn-body" style={{ marginTop: "1rem" }}>
              {c.interiors.body}
            </p>
            <p className="sn-body" style={{ marginTop: "0.85rem" }}>
              {c.interiors.closing}
            </p>
          </div>
        </div>
      </section>

      {/* 11 Closing CTA */}
      <footer className="sn-cta" id="suites-closing" aria-label="Begin your journey">
        <div className="sn-cta__inner">
          <p className="sn-eyebrow">{c.closing.eyebrow}</p>
          <h2 className="sn-display sn-display--section">{c.closing.title}</h2>
          <p className="sn-body" style={{ margin: "0.85rem 0 1.5rem" }}>
            {c.closing.body}
          </p>
          <div className="sn-cta__actions">
            <BookNowTrigger className="sn-btn sn-btn--solid">
              {SUITES_NATIVE_CTAS.requestAvailability.label}
            </BookNowTrigger>
            <Link
              href={SUITES_NATIVE_CTAS.speakConcierge.href}
              className="sn-btn sn-btn--outline"
            >
              {SUITES_NATIVE_CTAS.speakConcierge.label}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
