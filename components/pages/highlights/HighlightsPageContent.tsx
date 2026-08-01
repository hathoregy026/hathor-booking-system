"use client";

import { useRef } from "react";
import "@/app/luxury-editorial-pages.css";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { HighlightsChapterIndex } from "@/components/public/luxury-editorial/HighlightsChapterIndex";
import { LuxMedia } from "@/components/public/luxury-editorial/LuxMedia";
import { ManagedImage } from "@/components/ui/ManagedImage";
import {
  extractHighlightsPullQuote,
  HIGHLIGHTS_JOURNEY_LINKS,
  HIGHLIGHTS_LANDMARK_META,
  layoutHighlightsIntro,
} from "@/lib/highlights-content";
import { HIGHLIGHTS_PAGE } from "@/lib/page-content";
import { useLuxuryEditorialMotion } from "@/hooks/useLuxuryEditorialMotion";

const INDEX_ITEMS = [
  {
    id: "hl-vessel",
    title: "The vessel",
    descriptor: "Private Dahabiya elegance",
    imageSlot: "highlights-hero",
    imageAlt: "Hathor Dahabiya on the Nile",
  },
  {
    id: "hl-suites",
    title: "Suites",
    descriptor: "Cabins of Nile light",
    imageSlot: "room-royal",
    imageAlt: "Royal suite aboard Hathor",
  },
  {
    id: "hl-dining",
    title: "Dining",
    descriptor: "Gastronomy at river pace",
    imageSlot: "gastronomy-restaurant",
    imageAlt: "Fine dining aboard Hathor",
  },
  {
    id: "hl-decks",
    title: "Pool and decks",
    descriptor: "Open air, quiet water",
    imageSlot: "highlights-lifestyle",
    imageAlt: "Deck living aboard Hathor",
  },
  {
    id: "hl-landscapes",
    title: "Nile landscapes",
    descriptor: "Light, banks, horizon",
    imageSlot: "landmark-hatshepsut",
    imageAlt: "Temple of Hatshepsut",
  },
  {
    id: "hl-service",
    title: "Private service",
    descriptor: "Attentive without noise",
    imageSlot: "charter-service",
    imageAlt: "Private hospitality aboard Hathor",
  },
  {
    id: "hl-landmarks",
    title: "Ancient places",
    descriptor: "Temples with time",
    imageSlot: "landmark-obelisk",
    imageAlt: "Unfinished Obelisk, Aswan",
  },
  {
    id: "hl-after-dark",
    title: "After dark",
    descriptor: "Candlelight and return",
    imageSlot: "home-cinematic-still",
    imageAlt: "Evening aboard Hathor",
  },
] as const;

const RAIL_FRAMES = [
  { slot: "highlights-lifestyle", alt: "Lifestyle aboard Hathor", caption: "Deck light" },
  { slot: "room-suite", alt: "Suite interiors", caption: "Suite hush" },
  { slot: "gastronomy-hero", alt: "Gastronomy", caption: "Table ritual" },
  { slot: "landmark-valley-kings", alt: "Valley of the Kings", caption: "West bank" },
  { slot: "wellness-hero", alt: "Wellness aboard", caption: "Quiet restoration" },
  { slot: "home-story-dining", alt: "Dining atmosphere", caption: "Evening table" },
] as const;

export function HighlightsPageContent() {
  const rootRef = useRef<HTMLElement>(null);
  useLuxuryEditorialMotion(rootRef, "highlights");

  const intro = layoutHighlightsIntro([...HIGHLIGHTS_PAGE.intro]);
  const quote = extractHighlightsPullQuote([...HIGHLIGHTS_PAGE.intro]);
  const landmarks = HIGHLIGHTS_PAGE.landmarks;

  return (
    <main
      ref={rootRef}
      className="lux-page"
      data-highlights-page=""
      data-lux-page="highlights"
    >
      {/* HI-01 Exhibition hero */}
      <section className="hl-lux-hero" aria-labelledby="hl-hero-title">
        <div className="lux-shell lux-grid">
          <p className="lux-kicker" style={{ gridColumn: "1 / -1", marginBottom: "1.5rem" }}>
            THE HATHOR COLLECTION
          </p>
          <h1 id="hl-hero-title" className="lux-display hl-lux-hero__title">
            <span className="lux-lineMask">
              <span data-lux-line="">Moments Worth</span>
            </span>
            <span className="lux-lineMask">
              <span data-lux-line="">Crossing the</span>
            </span>
            <span className="lux-lineMask">
              <span data-lux-line="">World For</span>
            </span>
          </h1>
          <p className="lux-lead hl-lux-hero__desc">
            {HIGHLIGHTS_PAGE.hero.subtitle}. {intro.lead}
          </p>
          <LuxMedia
            name="highlights-hero"
            alt="Hathor Dahabiya cruise highlights"
            sizes="(max-width: 1024px) 100vw, 40vw"
            direction="right"
            className="hl-lux-hero__mediaA"
            priority
          />
          <LuxMedia
            name="highlights-lifestyle"
            alt="Lifestyle detail aboard Hathor"
            sizes="(max-width: 1024px) 100vw, 32vw"
            direction="bottom"
            parallax={3}
            className="hl-lux-hero__mediaB"
          />
          <p className="hl-lux-hero__meta">
            08 chapters · {landmarks.length} landmarks · exhibition
          </p>
        </div>
      </section>

      {/* HI-02 Index */}
      <HighlightsChapterIndex items={[...INDEX_ITEMS]} />

      {/* HI-03 Alternating chapters */}
      <section
        id="hl-vessel"
        className="lux-section hl-lux-chapter hl-lux-chapter--monument"
        aria-labelledby="hl-vessel-title"
      >
        <div className="lux-shell lux-grid">
          <LuxMedia
            name="charter-hero"
            alt="Hathor vessel on the Nile"
            sizes="(max-width: 1024px) 100vw, 66vw"
            direction="left"
          />
          <div className="hl-lux-chapter__copy">
            <p className="lux-kicker">01 / THE VESSEL</p>
            <h2 id="hl-vessel-title" className="lux-editorialTitle" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              {HIGHLIGHTS_PAGE.hero.title}
            </h2>
            <div className="lux-rule" data-lux-rule="" style={{ marginBlock: "1.25rem" }} />
            <p className="lux-body">{intro.groups[0]?.[0] ?? intro.lead}</p>
          </div>
        </div>
      </section>

      <section
        id="hl-suites"
        className="lux-section hl-lux-chapter hl-lux-chapter--diptych"
        aria-labelledby="hl-suites-title"
      >
        <div className="lux-shell lux-grid">
          <LuxMedia
            name="room-royal"
            alt="Royal suite"
            sizes="(max-width: 1024px) 100vw, 40vw"
            direction="bottom"
            className="hl-lux-chapter__a"
          />
          <LuxMedia
            name="room-suite"
            alt="Elegant suite"
            sizes="(max-width: 1024px) 100vw, 35vw"
            direction="right"
            className="hl-lux-chapter__b"
            previewAnchor={false}
          />
          <div className="hl-lux-chapter__copy">
            <p className="lux-kicker">02 / SUITES</p>
            <h2 id="hl-suites-title" className="lux-editorialTitle" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Private quarters of Nile light
            </h2>
            <p className="lux-body" style={{ marginTop: "1rem" }}>
              Eight cabins and four suites — two of them royal — composed for privacy,
              warm hospitality and an atmosphere of unhurried elegance.
            </p>
          </div>
        </div>
      </section>

      <section
        id="hl-dining"
        className="lux-section hl-lux-chapter hl-lux-chapter--dark"
        aria-labelledby="hl-dining-title"
      >
        <LuxMedia
          name="gastronomy-restaurant"
          alt="Dining aboard Hathor"
          sizes="100vw"
          direction="top"
        />
        <div className="lux-shell lux-grid" style={{ position: "relative", zIndex: 1 }}>
          <div className="hl-lux-chapter__island">
            <p className="lux-kicker">03 / DINING</p>
            <h2 id="hl-dining-title" className="lux-editorialTitle" style={{ fontSize: "clamp(1.85rem, 3.5vw, 3rem)" }}>
              Hathor Gastronomy
            </h2>
            <p className="lux-body" style={{ marginTop: "1rem" }}>
              {intro.groups[2]?.[0] ??
                "Authentic Egyptian flavours meet international cuisine — prepared fresh, served with genuine care as the sky turns to sunset colour."}
            </p>
          </div>
        </div>
      </section>

      <section
        id="hl-decks"
        className="lux-section hl-lux-chapter hl-lux-chapter--facts"
        aria-labelledby="hl-decks-title"
      >
        <div className="lux-shell lux-grid">
          <div className="hl-lux-chapter__facts">
            <p className="lux-kicker">04 / DECKS</p>
            <h2 id="hl-decks-title" className="lux-editorialTitle" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Pool, breeze, horizon
            </h2>
            <div className="lux-rule lux-rule--gold" data-lux-rule="" style={{ marginBlock: "1.5rem" }} />
            <dl style={{ margin: 0, display: "grid", gap: "1.25rem" }}>
              <div>
                <dt className="lux-kicker">Rhythm</dt>
                <dd className="lux-body" style={{ margin: "0.35rem 0 0" }}>
                  A relaxed Nile sailing experience that lets guests savor serene views
                  away from the crowds.
                </dd>
              </div>
              <div>
                <dt className="lux-kicker">Passage</dt>
                <dd className="lux-body" style={{ margin: "0.35rem 0 0" }}>
                  Aswan to Luxor — and the quieter corridors between — at Dahabiya pace.
                </dd>
              </div>
            </dl>
          </div>
          <LuxMedia
            name="highlights-lifestyle"
            alt="Deck living"
            sizes="(max-width: 1024px) 100vw, 45vw"
            direction="right"
            previewAnchor={false}
          />
        </div>
      </section>

      <section
        id="hl-landscapes"
        className="lux-section hl-lux-chapter hl-lux-chapter--monument"
        aria-labelledby="hl-landscapes-title"
      >
        <div className="lux-shell lux-grid">
          <LuxMedia
            name="landmark-hatshepsut"
            alt={HIGHLIGHTS_LANDMARK_META[1].caption}
            sizes="(max-width: 1024px) 100vw, 66vw"
            direction="left"
            objectPosition={HIGHLIGHTS_LANDMARK_META[1].objectPosition}
          />
          <div className="hl-lux-chapter__copy">
            <p className="lux-kicker">05 / LANDSCAPES</p>
            <h2 id="hl-landscapes-title" className="lux-editorialTitle" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              {landmarks[1]?.title ?? "Mortuary Temple of Hatshepsut"}
            </h2>
            <p className="lux-body" style={{ marginTop: "1rem" }}>
              {landmarks[1]?.body ?? HIGHLIGHTS_LANDMARK_META[1].fact}
            </p>
            <p className="lux-kicker" style={{ marginTop: "1.25rem" }}>
              {HIGHLIGHTS_LANDMARK_META[1].location}
            </p>
          </div>
        </div>
      </section>

      <section
        id="hl-service"
        className="lux-section hl-lux-chapter hl-lux-chapter--diptych"
        aria-labelledby="hl-service-title"
      >
        <div className="lux-shell lux-grid">
          <LuxMedia
            name="charter-service"
            alt="Private service"
            sizes="40vw"
            direction="bottom"
            className="hl-lux-chapter__a"
            previewAnchor={false}
          />
          <LuxMedia
            name="wellness-hero"
            alt="Wellness detail"
            sizes="35vw"
            direction="right"
            className="hl-lux-chapter__b"
          />
          <div className="hl-lux-chapter__copy">
            <p className="lux-kicker">06 / SERVICE</p>
            <h2 id="hl-service-title" className="lux-editorialTitle" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Attentive without noise
            </h2>
            <p className="lux-body" style={{ marginTop: "1rem" }}>
              There is not a detail, no matter how small, that goes overlooked — the
              signature feel of luxury available only on a Dahabiya Nile cruise in Egypt.
            </p>
          </div>
        </div>
      </section>

      <section
        id="hl-landmarks"
        className="lux-section hl-lux-chapter hl-lux-chapter--facts"
        aria-labelledby="hl-landmarks-title"
      >
        <div className="lux-shell lux-grid">
          <div className="hl-lux-chapter__facts">
            <p className="lux-kicker">07 / ANCIENT PLACES</p>
            <h2 id="hl-landmarks-title" className="lux-editorialTitle" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              {landmarks[0]?.title ?? "The Unfinished Obelisk"}
            </h2>
            <p className="lux-body" style={{ marginTop: "1rem" }}>
              {landmarks[0]?.body}
            </p>
            <p className="lux-kicker" style={{ marginTop: "1.5rem" }}>
              {HIGHLIGHTS_LANDMARK_META[0].fact}
            </p>
          </div>
          <LuxMedia
            name="landmark-obelisk"
            alt={HIGHLIGHTS_LANDMARK_META[0].caption}
            sizes="45vw"
            direction="right"
            objectPosition={HIGHLIGHTS_LANDMARK_META[0].objectPosition}
          />
        </div>
      </section>

      <section
        id="hl-after-dark"
        className="lux-section hl-lux-chapter hl-lux-chapter--dark"
        aria-labelledby="hl-after-dark-title"
      >
        <LuxMedia
          name="home-cinematic-still"
          alt="After dark aboard Hathor"
          sizes="100vw"
          direction="bottom"
        />
        <div className="lux-shell lux-grid" style={{ position: "relative", zIndex: 1 }}>
          <div className="hl-lux-chapter__island">
            <p className="lux-kicker">08 / AFTER DARK</p>
            <h2 id="hl-after-dark-title" className="lux-editorialTitle" style={{ fontSize: "clamp(1.85rem, 3.5vw, 3rem)" }}>
              {landmarks[2]?.title ?? "The Valley of the Kings"}
            </h2>
            <p className="lux-body" style={{ marginTop: "1rem" }}>
              Temples by day, sanctuary by night — return to a private vessel waiting
              after every discovery along the west bank.
            </p>
          </div>
        </div>
      </section>

      {/* HI-04 Horizontal rail */}
      <section
        className="lux-section--dark hl-lux-rail"
        aria-labelledby="hl-rail-heading"
        data-lux-horizontal=""
      >
        <div className="hl-lux-rail__pin lux-shell">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
            <div>
              <p className="lux-kicker">SIGNATURE MOMENTS</p>
              <h2 id="hl-rail-heading" className="lux-editorialTitle" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
                Collectible frames
              </h2>
            </div>
            <p className="lux-kicker">01 — {String(RAIL_FRAMES.length).padStart(2, "0")}</p>
          </div>
          <div className="hl-lux-rail__track" data-lux-horizontal-track="">
            {RAIL_FRAMES.map((frame) => (
              <figure key={frame.slot} className="hl-lux-rail__card lux-mediaFrame">
                <ManagedImage
                  name={frame.slot}
                  alt={frame.alt}
                  fill
                  sizes="(max-width: 1024px) 70vw, 42vw"
                  className="object-cover"
                  previewAnchor={false}
                />
                <figcaption
                  className="lux-kicker"
                  style={{
                    position: "absolute",
                    left: "1rem",
                    bottom: "1rem",
                    color: "var(--lux-paper)",
                    zIndex: 1,
                  }}
                >
                  {frame.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* HI-05 Material study */}
      <section className="lux-section" aria-labelledby="hl-material-heading">
        <div className="lux-shell">
          <p className="lux-kicker">MATERIAL STUDY</p>
          <h2 id="hl-material-heading" className="lux-editorialTitle" style={{ maxWidth: "16ch" }}>
            <span className="lux-lineMask">
              <span data-lux-line="">The expense</span>
            </span>
            <span className="lux-lineMask">
              <span data-lux-line="">of quiet detail</span>
            </span>
          </h2>
          <div className="lux-grid" style={{ marginTop: "3rem" }}>
            <LuxMedia
              name="home-story-craft-large"
              alt="Craft and material detail aboard Hathor"
              sizes="(max-width: 1024px) 100vw, 66vw"
              direction="bottom"
              className="hl-lux-material__hero"
            />
            <LuxMedia
              name="home-story-legacy-large"
              alt="Legacy texture detail"
              sizes="30vw"
              direction="right"
              className="hl-lux-material__a"
              previewAnchor={false}
            />
            <LuxMedia
              name="home-story-dining"
              alt="Table detail"
              sizes="30vw"
              direction="right"
              className="hl-lux-material__b"
              previewAnchor={false}
            />
          </div>
        </div>
      </section>

      {/* HI-06 Quote */}
      <section className="lux-section" aria-labelledby="hl-quote-heading">
        <div className="lux-shell lux-grid">
          <blockquote className="hl-lux-quote__text" id="hl-quote-heading">
            <span className="lux-lineMask">
              <span data-lux-line="">{quote}</span>
            </span>
          </blockquote>
          <p className="hl-lux-quote__meta">Hathor · Signature hospitality</p>
          <LuxMedia
            name="about-dining"
            alt="Atmospheric dining portrait"
            sizes="30vw"
            direction="bottom"
            className="hl-lux-quote__media"
            previewAnchor={false}
          />
        </div>
      </section>

      {/* HI-07 Immersive gallery */}
      <section className="lux-section" aria-label="Immersive gallery">
        <div className="lux-shell">
          <p className="lux-kicker" style={{ marginBottom: "2rem" }}>
            IMMERSIVE GALLERY
          </p>
          <div className="hl-lux-immersive">
            <div className="hl-lux-immersive__col lux-mediaFrame" data-lux-immerse="">
              <ManagedImage
                name="landmark-obelisk"
                alt={HIGHLIGHTS_LANDMARK_META[0].caption}
                fill
                sizes="33vw"
                className="object-cover"
                previewAnchor={false}
              />
            </div>
            <div className="hl-lux-immersive__col lux-mediaFrame" data-lux-immerse="">
              <ManagedImage
                name="landmark-hatshepsut"
                alt={HIGHLIGHTS_LANDMARK_META[1].caption}
                fill
                sizes="40vw"
                className="object-cover"
                previewAnchor={false}
              />
            </div>
            <div className="hl-lux-immersive__col lux-mediaFrame" data-lux-immerse="">
              <ManagedImage
                name="landmark-valley-kings"
                alt={HIGHLIGHTS_LANDMARK_META[2].caption}
                fill
                sizes="30vw"
                className="object-cover"
                previewAnchor={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Journey links */}
      <section className="lux-section" aria-label="Continue the journey">
        <div className="lux-shell" style={{ display: "grid", gap: "0" }}>
          {HIGHLIGHTS_JOURNEY_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hl-lux-index__row"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <span className="lux-kicker">Voyage</span>
              <p className="hl-lux-index__title">{link.label}</p>
              <span className="hl-lux-index__line" aria-hidden="true" />
              <span className="lux-body" style={{ gridColumn: "2", margin: 0 }}>
                {link.body}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* HI-08 Final CTA */}
      <section className="hl-lux-final" aria-labelledby="hl-final-heading">
        <div className="hl-lux-final__media">
          <ManagedImage
            name="home-call-to-action"
            alt="Sunset on the Nile — book your place"
            fill
            sizes="100vw"
            className="object-cover"
            previewAnchor={false}
          />
          <div className="hl-lux-final__shade" aria-hidden="true" />
        </div>
        <div className="lux-shell hl-lux-final__inner">
          <p className="lux-kicker">YOUR PLACE</p>
          <h2 id="hl-final-heading" className="lux-display" style={{ fontSize: "clamp(3rem, 7vw, 7rem)" }}>
            <span className="lux-lineMask">
              <span data-lux-line="">Your Place</span>
            </span>
            <span className="lux-lineMask">
              <span data-lux-line="">on the Nile</span>
            </span>
          </h2>
          <div className="hl-lux-final__actions">
            <BookNowTrigger className="lux-btn lux-btn--solid">
              Book your voyage
            </BookNowTrigger>
            <a className="lux-btn lux-btn--ghost-light" href="/charter">
              Enquire privately
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
