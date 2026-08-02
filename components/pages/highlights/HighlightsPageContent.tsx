"use client";

import { useRef, useState } from "react";
import "@/app/luxury-editorial-shared.css";
import "@/app/highlights-luxury.css";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import {
  LuxuryImageReveal,
  LuxuryMagneticLink,
} from "@/components/public/luxury-editorial/LuxuryPrimitives";
import { ManagedImage } from "@/components/ui/ManagedImage";
import {
  extractHighlightsPullQuote,
  HIGHLIGHTS_LANDMARK_META,
  layoutHighlightsIntro,
} from "@/lib/highlights-content";
import { HIGHLIGHTS_PAGE } from "@/lib/page-content";
import { useLuxuryEditorialMotion } from "@/hooks/useLuxuryEditorialMotion";

const BOARD = [
  {
    title: "Breakfast in open air",
    caption: "Linen, soft light, and the river still carrying the coolness of night.",
    slot: "gastronomy-restaurant",
    alt: "Breakfast in open air aboard Hathor",
  },
  {
    title: "A quiet hour by the pool",
    caption: "Heat softens. The deck holds silence between shore and sky.",
    slot: "highlights-lifestyle",
    alt: "Quiet hour by the pool aboard Hathor",
  },
  {
    title: "Afternoon tea in the salon",
    caption: "Shade, conversation, and the unhurried hospitality of a private house.",
    slot: "home-collage-living",
    alt: "Afternoon tea in the salon",
  },
  {
    title: "Sunset from the upper deck",
    caption: "The Nile turns gold, then violet, then a deep quiet blue.",
    slot: "home-call-to-action",
    alt: "Sunset from the upper deck",
  },
] as const;

const RIVER = [
  {
    title: "Temple Stone",
    body: "Centuries of shadow remain between the columns. Arriving early allows the place to reveal itself slowly, before voices fill the courtyards.",
    meta: "Luxor West Bank · first light",
    slot: "landmark-hatshepsut",
    alt: HIGHLIGHTS_LANDMARK_META[1].caption,
  },
  {
    title: "Village Shore",
    body: "Children call from the bank, palms lean over the water, and daily life passes close enough to feel unedited.",
    meta: "Upper Nile · midday",
    slot: "landmark-obelisk",
    alt: HIGHLIGHTS_LANDMARK_META[0].caption,
  },
  {
    title: "Desert Horizon",
    body: "Beyond the green edge of the Nile, the land becomes almost abstract—sand, sky, silence, and the long gold of evening.",
    meta: "West bank · blue hour",
    slot: "landmark-valley-kings",
    alt: HIGHLIGHTS_LANDMARK_META[2].caption,
  },
] as const;

const EVENING = [
  {
    id: "ingredient",
    label: "The Ingredient",
    body: "Seasonal produce and Nile-side flavours prepared with quiet precision—never a performance, always a craft.",
  },
  {
    id: "table",
    label: "The Table",
    body: "Warm light, unhurried service, and conversation that becomes part of the landscape beyond the glass.",
  },
  {
    id: "night",
    label: "The Night",
    body: "When the river darkens, the final course arrives with the soft ceremony of evening itself.",
  },
] as const;

const DETAILS = [
  { slot: "home-story-craft-large", caption: "Linen catching the morning air", alt: "Linen detail" },
  { slot: "home-story-legacy-large", caption: "Brass warmed by late sunlight", alt: "Brass detail" },
  { slot: "highlights-lifestyle", caption: "The river reflected on the ceiling", alt: "Water reflection" },
  { slot: "about-dining", caption: "A note left before dinner", alt: "Handwritten note atmosphere" },
  { slot: "home-story-dining", caption: "Craft held close enough to notice", alt: "Table craft detail" },
  { slot: "home-cinematic-still", caption: "The hour when every surface turns gold", alt: "Golden hour light" },
] as const;

export function HighlightsPageContent() {
  const rootRef = useRef<HTMLElement>(null);
  useLuxuryEditorialMotion(rootRef, "highlights");

  const intro = layoutHighlightsIntro([...HIGHLIGHTS_PAGE.intro]);
  const quote = extractHighlightsPullQuote([...HIGHLIGHTS_PAGE.intro]);
  const [board, setBoard] = useState(0);
  const [evening, setEvening] = useState(0);
  const nextBoard = (board + 1) % BOARD.length;

  return (
    <main
      ref={rootRef}
      className="lux-page"
      data-highlights-page=""
      data-lux-page="highlights"
    >
      {/* 1 Hero */}
      <section className="hl-hero" data-lux-hero="" aria-labelledby="hl-hero-title">
        <div className="hl-hero__media">
          <div data-lux-hero-img="" style={{ position: "absolute", inset: "-3%", height: "106%" }}>
            <ManagedImage
              name="highlights-hero"
              alt="Hathor Dahabiya moments along the Nile"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="hl-hero__veil" aria-hidden="true" />
        </div>
        <div className="lux-shell hl-hero__content">
          <div className="lux-grid" style={{ width: "100%" }} data-lux-reveal-group="">
            <p className="lux-kicker hl-hero__kicker">HIGHLIGHTS · MOMENTS ALONG THE NILE</p>
            <h1 id="hl-hero-title" className="lux-display hl-hero__title">
              <span className="lux-line-mask">
                <span data-lux-line="">The river is</span>
              </span>
              <span className="lux-line-mask">
                <span data-lux-line="">
                  <span className="lux-gold-text">Remembered</span> in
                </span>
              </span>
              <span className="lux-line-mask">
                <span data-lux-line="">fragments of light.</span>
              </span>
            </h1>
            <p className="lux-body hl-hero__body" data-lux-body="">
              Morning stone, linen moving in the breeze, distant palms, a table glowing after
              sunset—each day leaves behind a different image.
            </p>
            <div className="hl-hero__index" data-lux-body="">
              <span>01 / 07</span>
              <span>Scroll to begin</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2 First light */}
      <section className="lux-section lux-section--cream" aria-labelledby="hl-first-title">
        <div className="lux-shell lux-grid" data-lux-reveal-group="">
          <h2 id="hl-first-title" className="lux-display lux-display--medium hl-first__title">
            <span className="lux-line-mask">
              <span data-lux-line="">The day arrives</span>
            </span>
            <span className="lux-line-mask">
              <span data-lux-line="">softly.</span>
            </span>
          </h2>
          <p className="lux-body hl-first__body" data-lux-body="">
            At first light, the river is silver and the air still carries the coolness of night.
            The ship moves before the world feels awake.
          </p>
          <p className="hl-first__time" data-lux-body="">
            05:48 · Upper Nile
          </p>
          <LuxuryImageReveal
            name="highlights-hero"
            alt="Panoramic Nile at first light"
            sizes="100vw"
            className="hl-first__panorama lux-image-link"
            mediaClassName="lux-media--16x9"
            previewAnchor={false}
          />
          <LuxuryImageReveal
            name="gastronomy-restaurant"
            alt="Morning coffee detail"
            sizes="(max-width: 1024px) 100vw, 24vw"
            className="hl-first__detail lux-image-link"
            mediaClassName="lux-media--2x3"
            previewAnchor={false}
            caption="Coffee · linen · quiet"
          />
        </div>
      </section>

      {/* 3 Life on board */}
      <section className="lux-section lux-section--cream-50 hl-board" aria-labelledby="hl-board-title">
        <div className="lux-shell" data-lux-reveal-group="">
          <p className="lux-kicker">03 · LIFE ON BOARD</p>
          <h2 id="hl-board-title" className="lux-display lux-display--medium" style={{ maxWidth: "12ch", marginTop: "1rem" }}>
            <span className="lux-line-mask">
              <span data-lux-line="">Hours that feel</span>
            </span>
            <span className="lux-line-mask">
              <span data-lux-line="">like rooms.</span>
            </span>
          </h2>

          <div className="hl-board__stage" style={{ marginTop: "2.5rem" }}>
            <div className="hl-board__active lux-media lux-image-link">
              <ManagedImage
                key={BOARD[board].slot + board}
                name={BOARD[board].slot}
                alt={BOARD[board].alt}
                fill
                sizes="(max-width: 1024px) 100vw, 64vw"
                className="object-cover"
                previewAnchor={false}
              />
            </div>
            <div className="hl-board__next lux-media">
              <ManagedImage
                name={BOARD[nextBoard].slot}
                alt={BOARD[nextBoard].alt}
                fill
                sizes="30vw"
                className="object-cover"
                previewAnchor={false}
              />
            </div>
          </div>

          <div className="hl-board__copy">
            <p className="lux-kicker">
              {String(board + 1).padStart(2, "0")} / {String(BOARD.length).padStart(2, "0")}
            </p>
            <div>
              <h3 className="hl-board__title">{BOARD[board].title}</h3>
              <p className="hl-board__caption">{BOARD[board].caption}</p>
            </div>
            <div className="hl-board__nav">
              <button
                type="button"
                aria-label="Previous moment"
                onClick={() => setBoard((b) => (b - 1 + BOARD.length) % BOARD.length)}
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next moment"
                onClick={() => setBoard((b) => (b + 1) % BOARD.length)}
              >
                →
              </button>
            </div>
          </div>
          <div className="hl-board__progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${(board + 1) / BOARD.length})` }} />
          </div>

          <div className="hl-board__mobile" aria-label="Life on board">
            {BOARD.map((item) => (
              <article key={item.title} className="hl-board__mobileSlide">
                <div className="lux-media">
                  <ManagedImage
                    name={item.slot}
                    alt={item.alt}
                    fill
                    sizes="86vw"
                    className="object-cover"
                    previewAnchor={false}
                  />
                </div>
                <h3 className="hl-board__title" style={{ marginTop: "1rem" }}>
                  {item.title}
                </h3>
                <p className="hl-board__caption">{item.caption}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4 River opens */}
      <section
        className="hl-river"
        data-hl-river=""
        aria-labelledby="hl-river-title"
      >
        <h2 id="hl-river-title" className="visually-hidden" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          The river opens
        </h2>
        <div className="hl-river__pin">
          <div className="hl-river__media">
            {RIVER.map((chapter, index) => (
              <div
                key={chapter.title}
                className="hl-river__slide"
                data-hl-river-slide=""
                data-active={index === 0 ? "true" : undefined}
              >
                <ManagedImage
                  name={chapter.slot}
                  alt={chapter.alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  previewAnchor={index === 0}
                />
              </div>
            ))}
            <div className="hl-river__veil" aria-hidden="true" />
          </div>
          {RIVER.map((chapter, index) => (
            <div
              key={chapter.title}
              className="lux-shell hl-river__overlay lux-grid"
              data-hl-river-copy=""
              style={{
                position: index === 0 ? "relative" : "absolute",
                inset: index === 0 ? undefined : 0,
                opacity: index === 0 ? 1 : 0,
                alignContent: "end",
              }}
            >
              <p className="lux-kicker hl-river__num">
                04 · {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="lux-display lux-display--medium hl-river__title">{chapter.title}</h3>
              <p className="lux-body hl-river__copy">{chapter.body}</p>
              <p className="lux-kicker hl-river__meta">{chapter.meta}</p>
              <span className="lux-rule hl-river__rule" />
            </div>
          ))}
        </div>

        <div className="hl-river__stack">
          {RIVER.map((chapter, index) => (
            <article key={chapter.title} className="hl-river__stackArticle">
              <ManagedImage
                name={chapter.slot}
                alt={chapter.alt}
                fill
                sizes="100vw"
                className="object-cover"
                previewAnchor={false}
              />
              <div className="hl-river__veil" aria-hidden="true" />
              <div className="lux-shell" style={{ position: "relative", zIndex: 2, paddingBlock: "3rem" }}>
                <p className="lux-kicker">
                  04 · {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="lux-display lux-display--small" style={{ marginTop: "1rem" }}>
                  {chapter.title}
                </h3>
                <p className="lux-body" style={{ marginTop: "1rem", color: "rgba(251,247,239,0.78)" }}>
                  {chapter.body}
                </p>
                <p className="lux-kicker" style={{ marginTop: "1rem", color: "var(--lux-gold-light)" }}>
                  {chapter.meta}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5 Evening */}
      <section className="lux-section lux-section--cream" aria-labelledby="hl-evening-title">
        <div className="lux-shell lux-grid" data-lux-reveal-group="">
          <h2 id="hl-evening-title" className="lux-display lux-display--medium hl-evening__title">
            <span className="lux-line-mask">
              <span data-lux-line="">Evening gathers</span>
            </span>
            <span className="lux-line-mask">
              <span data-lux-line="">around the table.</span>
            </span>
          </h2>
          <p className="lux-body hl-evening__body" data-lux-body="">
            Dinner is not a pause between destinations. It is part of the landscape: local
            ingredients, warm light, conversation, and the river becoming dark beyond the glass.
          </p>
          <LuxuryImageReveal
            name="home-story-dining"
            alt="Evening dining aboard Hathor"
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="hl-evening__main lux-image-link"
            mediaClassName="lux-media--3x2"
          />
          <LuxuryImageReveal
            name="gastronomy-hero"
            alt="Food detail aboard Hathor"
            sizes="(max-width: 1024px) 100vw, 30vw"
            className="hl-evening__detail lux-image-link"
            mediaClassName="lux-media--3x4"
            previewAnchor={false}
          />
          <ul className="hl-evening__links" role="tablist" aria-label="Evening ritual">
            {EVENING.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={index === evening}
                  onClick={() => setEvening(index)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          <p className="lux-body hl-evening__story" data-lux-body="">
            {EVENING[evening].body}
          </p>
          <p className="hl-evening__quote lux-gold-text">{quote || "The final course arrives after the stars."}</p>
        </div>
      </section>

      {/* 6 Details */}
      <section className="lux-section lux-section--cream-50" aria-labelledby="hl-details-title">
        <div className="lux-shell lux-grid" data-lux-reveal-group="">
          <h2 id="hl-details-title" className="lux-display lux-display--medium hl-details__title">
            <span className="lux-line-mask">
              <span data-lux-line="">Details that remain.</span>
            </span>
          </h2>
          <div className="hl-details__grid">
            {DETAILS.map((item) => (
              <figure key={item.caption} className="hl-details__item lux-media lux-image-link" data-lux-media="">
                <ManagedImage
                  name={item.slot}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className="object-cover"
                  previewAnchor={false}
                />
                <figcaption className="hl-details__caption">{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 7 Close */}
      <section className="hl-close" aria-labelledby="hl-close-title">
        <div className="hl-close__media">
          <ManagedImage
            name="home-call-to-action"
            alt="Blue hour on the Nile"
            fill
            sizes="100vw"
            className="object-cover"
            previewAnchor={false}
          />
          <div className="hl-close__veil" aria-hidden="true" />
        </div>
        <div className="lux-shell hl-close__inner lux-grid" data-lux-reveal-group="">
          <p className="lux-kicker hl-close__chapter">07 · THE INVITATION</p>
          <h2 id="hl-close-title" className="lux-display lux-display--medium hl-close__title">
            <span className="lux-line-mask">
              <span data-lux-line="">There is more to remember</span>
            </span>
            <span className="lux-line-mask">
              <span data-lux-line="">than there is to photograph.</span>
            </span>
          </h2>
          <p className="lux-body hl-close__body" data-lux-body="">
            Step aboard and let the Nile reveal itself at the pace it deserves.{" "}
            {intro.lead}
          </p>
          <div className="hl-close__actions" data-lux-body="">
            <BookNowTrigger className="lux-magnetic-link lux-magnetic-link--inverse">
              <span className="lux-magnetic-link__label">Explore the Voyages</span>
              <span className="lux-magnetic-link__line" aria-hidden="true" />
              <span className="lux-magnetic-link__circle" aria-hidden="true">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </span>
            </BookNowTrigger>
            <LuxuryMagneticLink href="/charter" inverse>
              View Private Charter
            </LuxuryMagneticLink>
          </div>
        </div>
      </section>
    </main>
  );
}
