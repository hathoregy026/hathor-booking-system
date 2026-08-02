"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "@/app/luxury-editorial-pages.css";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import {
  HighlightsEditorialIndex,
  HighlightsGallery,
  HighlightsRituals,
} from "@/components/public/luxury-editorial/HighlightsModules";
import { LuxuryMedia } from "@/components/public/luxury-editorial/LuxuryMedia";
import { LuxuryTextLink } from "@/components/public/luxury-editorial/LuxuryTextLink";
import { ManagedImage } from "@/components/ui/ManagedImage";
import {
  extractHighlightsPullQuote,
  HIGHLIGHTS_LANDMARK_META,
  layoutHighlightsIntro,
} from "@/lib/highlights-content";
import { HIGHLIGHTS_PAGE } from "@/lib/page-content";
import { useLuxuryEditorialMotion } from "@/hooks/useLuxuryEditorialMotion";

gsap.registerPlugin(ScrollTrigger);

const INDEX_CHAPTERS = [
  {
    id: "hl-story-1",
    title: "The Nile at first light",
    imageSlot: "highlights-hero",
    imageAlt: "Nile at first light",
  },
  {
    id: "hl-story-2",
    title: "Ancient places, privately encountered",
    imageSlot: "landmark-hatshepsut",
    imageAlt: "Temple of Hatshepsut",
  },
  {
    id: "hl-story-3",
    title: "Life on deck",
    imageSlot: "highlights-lifestyle",
    imageAlt: "Life on deck aboard Hathor",
  },
  {
    id: "hl-story-4",
    title: "Dining as ceremony",
    imageSlot: "gastronomy-restaurant",
    imageAlt: "Dining aboard Hathor",
  },
  {
    id: "hl-story-5",
    title: "Night on the river",
    imageSlot: "home-cinematic-still",
    imageAlt: "Night on the Nile",
  },
] as const;

const RHYTHM = [
  {
    phrase: "Light arrives slowly.",
    slot: "highlights-hero",
    alt: "Dawn light on the Nile",
  },
  {
    phrase: "History appears at the river’s edge.",
    slot: "landmark-obelisk",
    alt: "Ancient stone at the river’s edge",
  },
  {
    phrase: "Afternoons dissolve into gold.",
    slot: "highlights-lifestyle",
    alt: "Golden afternoon on deck",
  },
  {
    phrase: "The Nile becomes silence.",
    slot: "home-cinematic-still",
    alt: "Night silence on the Nile",
  },
] as const;

const RITUALS = [
  {
    id: "morning",
    title: "Morning service",
    body: "Coffee and quiet attention before the day opens.",
    imageSlot: "gastronomy-restaurant",
    imageAlt: "Morning service aboard Hathor",
  },
  {
    id: "guiding",
    title: "Private guiding",
    body: "Temples and sites encountered with time and context.",
    imageSlot: "landmark-hatshepsut",
    imageAlt: "Private temple encounter",
  },
  {
    id: "aperitif",
    title: "Sunset aperitif",
    body: "A soft pause as the river turns to bronze.",
    imageSlot: "highlights-lifestyle",
    imageAlt: "Sunset aperitif on deck",
  },
  {
    id: "dining",
    title: "Chef-led dining",
    body: "Cuisine paced to the voyage, never to a clock.",
    imageSlot: "home-story-dining",
    imageAlt: "Chef-led dining aboard Hathor",
  },
  {
    id: "turndown",
    title: "Turndown ritual",
    body: "Suites restored with the same care as the day.",
    imageSlot: "room-suite",
    imageAlt: "Suite turndown aboard Hathor",
  },
  {
    id: "attention",
    title: "Discreet personal attention",
    body: "Needs met before they are spoken.",
    imageSlot: "charter-service",
    imageAlt: "Discreet hospitality aboard Hathor",
  },
] as const;

const GALLERY = [
  { id: "g1", label: "River", imageSlot: "highlights-hero", imageAlt: "Nile river light" },
  { id: "g2", label: "Deck", imageSlot: "highlights-lifestyle", imageAlt: "Deck living" },
  { id: "g3", label: "Suite", imageSlot: "room-royal", imageAlt: "Royal suite" },
  { id: "g4", label: "Table", imageSlot: "gastronomy-hero", imageAlt: "Dining table" },
  { id: "g5", label: "Temple", imageSlot: "landmark-valley-kings", imageAlt: "Valley of the Kings" },
  { id: "g6", label: "Night", imageSlot: "home-call-to-action", imageAlt: "Night on the Nile" },
] as const;

function HighlightsRhythm() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const setIdx = (idx: number) => {
      root.querySelectorAll<HTMLElement>("[data-lux-rhythm-slide]").forEach((el) => {
        el.toggleAttribute("data-active", Number(el.dataset.index) === idx);
      });
      const phrase = root.querySelector<HTMLElement>("[data-lux-rhythm-phrase]");
      if (phrase) phrase.textContent = RHYTHM[idx]?.phrase ?? "";
    };

    setIdx(0);

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1025px)", () => {
      const bar = root.querySelector<HTMLElement>("[data-lux-rhythm-bar]");
      const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const idx = Math.min(
            RHYTHM.length - 1,
            Math.floor(self.progress * RHYTHM.length),
          );
          setIdx(idx);
          if (bar) bar.style.transform = `scaleX(${Math.max(0.08, self.progress)})`;
        },
      });
      return () => trigger.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="luxSection hlRhythm"
      data-lux-rhythm=""
      aria-labelledby="hl-rhythm-heading"
    >
      <div className="luxShell" style={{ marginBottom: "1.5rem" }}>
        <p className="luxMeta">04 / RHYTHM</p>
        <h2 id="hl-rhythm-heading" className="luxDisplay luxDisplay--md">
          The rhythm of the river
        </h2>
      </div>

      <div className="hlRhythm__pin luxShell">
        <div className="hlRhythm__media luxMedia">
          {RHYTHM.map((item, index) => (
            <div
              key={item.phrase}
              className="hlRhythm__slide"
              data-lux-rhythm-slide=""
              data-index={index}
              data-active={index === 0 ? "true" : "false"}
            >
              <ManagedImage
                name={item.slot}
                alt={item.alt}
                fill
                sizes="100vw"
                className="object-cover"
                previewAnchor={index === 0}
              />
            </div>
          ))}
        </div>
        <p className="hlRhythm__phrase" data-lux-rhythm-phrase="">
          {RHYTHM[0].phrase}
        </p>
        <div className="hlRhythm__progress" aria-hidden="true">
          <span data-lux-rhythm-bar="" style={{ transform: "scaleX(0.08)" }} />
        </div>
      </div>

      <div className="hlRhythm__stack luxShell">
        {RHYTHM.map((item) => (
          <article key={item.phrase}>
            <LuxuryMedia
              name={item.slot}
              alt={item.alt}
              sizes="100vw"
              className="luxMedia--16x10"
              previewAnchor={false}
            />
            <p className="hlRhythm__phrase">{item.phrase}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HighlightsPageContent() {
  const rootRef = useRef<HTMLElement>(null);
  useLuxuryEditorialMotion(rootRef);

  const intro = layoutHighlightsIntro([...HIGHLIGHTS_PAGE.intro]);
  const quote = extractHighlightsPullQuote([...HIGHLIGHTS_PAGE.intro]);
  const landmarks = HIGHLIGHTS_PAGE.landmarks;

  return (
    <main
      ref={rootRef}
      className="luxPage"
      data-highlights-page=""
      data-lux-page="highlights"
    >
      {/* HL-01 */}
      <section className="hlHero" data-lux-hero="" aria-labelledby="hl-hero-title">
        <div className="hlHero__media">
          <div data-lux-hero-img="" style={{ position: "absolute", inset: "-2%", height: "104%" }}>
            <ManagedImage
              name="highlights-hero"
              alt="Hathor Dahabiya on the Nile"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="hlHero__veil" aria-hidden="true" />
        </div>
        <div className="luxShell hlHero__content">
          <div className="luxGrid" style={{ width: "100%", flex: 1 }}>
            <p className="luxMeta hlHero__label">THE HATHOR EXPERIENCE</p>
            <h1 id="hl-hero-title" className="luxDisplay luxDisplay--xl hlHero__title">
              <span className="luxLineMask">
                <span data-lux-line="">Moments That</span>
              </span>
              <span className="luxLineMask">
                <span data-lux-line="">Stay With You</span>
              </span>
            </h1>
            <p className="luxLead hlHero__intro">
              A journey shaped by light, history, ritual and rare access.
            </p>
            <nav className="hlHero__index" aria-label="Chapter index">
              {INDEX_CHAPTERS.map((c, i) => (
                <a key={c.id} href={`#${c.id}`}>
                  {String(i + 1).padStart(2, "0")} {c.title.split(",")[0]}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {/* HL-02 */}
      <HighlightsEditorialIndex chapters={[...INDEX_CHAPTERS]} />

      {/* HL-03 Story 1 */}
      <section
        id="hl-story-1"
        className="luxSection hlStory hlStory--light"
        aria-labelledby="hl-s1-title"
      >
        <div className="luxShell luxGrid">
          <LuxuryMedia
            name="highlights-hero"
            alt="The Nile at first light"
            sizes="(max-width: 1024px) 100vw, 75vw"
            className="luxMedia--16x10 hlStory__mediaA"
            hover
            previewAnchor={false}
          />
          <p className="hlStory__num" aria-hidden="true">
            01
          </p>
          <h2 id="hl-s1-title" className="luxDisplay luxDisplay--md hlStory__title">
            The Nile at first light
          </h2>
          <div className="hlStory__copy">
            <p className="luxLead">{intro.lead}</p>
            <p className="luxCaption">Dawn · soft mist · private deck</p>
          </div>
        </div>
      </section>

      {/* Story 2 */}
      <section
        id="hl-story-2"
        className="luxSection hlStory hlStory--ink"
        aria-labelledby="hl-s2-title"
      >
        <div className="luxShell luxGrid">
          <h2 id="hl-s2-title" className="luxDisplay luxDisplay--md hlStory__title">
            Ancient places, privately encountered
          </h2>
          <LuxuryMedia
            name="landmark-hatshepsut"
            alt={HIGHLIGHTS_LANDMARK_META[1].caption}
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="luxMedia--3x4 hlStory__mediaA"
            objectPosition={HIGHLIGHTS_LANDMARK_META[1].objectPosition}
            hover
          />
          <LuxuryMedia
            name="landmark-obelisk"
            alt={HIGHLIGHTS_LANDMARK_META[0].caption}
            sizes="(max-width: 1024px) 100vw, 30vw"
            className="luxMedia--4x3 hlStory__mediaB"
            objectPosition={HIGHLIGHTS_LANDMARK_META[0].objectPosition}
            previewAnchor={false}
          />
          <div className="hlStory__copy">
            <p className="luxBody">
              {landmarks[1]?.body ?? HIGHLIGHTS_LANDMARK_META[1].fact}
            </p>
            <p className="luxCaption">{HIGHLIGHTS_LANDMARK_META[1].location}</p>
          </div>
        </div>
      </section>

      {/* Story 3 */}
      <section
        id="hl-story-3"
        className="luxSection luxSection--parchment hlStory hlStory--deck"
        aria-labelledby="hl-s3-title"
      >
        <div className="luxShell luxGrid">
          <div className="hlStory__stage luxMedia" data-lux-media="">
            <ManagedImage
              name="highlights-lifestyle"
              alt="Life on deck aboard Hathor"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <h2 id="hl-s3-title" className="luxDisplay luxDisplay--md hlStory__overlayTitle">
              Life on deck
            </h2>
          </div>
          <p className="luxBody hlStory__copy" data-lux-reveal="">
            Open air, quiet water, and the unhurried hospitality that makes a Dahabiya
            voyage feel like a private house on the river.
          </p>
        </div>
      </section>

      {/* Story 4 */}
      <section
        id="hl-story-4"
        className="luxSection luxSection--paper hlStory hlStory--dining"
        aria-labelledby="hl-s4-title"
      >
        <div className="luxShell luxGrid">
          <h2 id="hl-s4-title" className="luxDisplay luxDisplay--md hlStory__title">
            Dining as ceremony
          </h2>
          <LuxuryMedia
            name="gastronomy-restaurant"
            alt="Dining detail aboard Hathor"
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="luxMedia--3x4 hlStory__mediaA"
            hover
          />
          <LuxuryMedia
            name="home-story-dining"
            alt="Lifestyle dining aboard Hathor"
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="luxMedia--16x10 hlStory__mediaB"
            hover
            previewAnchor={false}
          />
          <div className="hlStory__copy">
            <p className="luxLead">
              {intro.groups[2]?.[0] ??
                "Egyptian flavours and international cuisine, prepared fresh and served with genuine care."}
            </p>
            <p className="luxCaption">Table · light · unhurried service</p>
          </div>
        </div>
      </section>

      {/* Story 5 */}
      <section
        id="hl-story-5"
        className="hlStory hlStory--night"
        aria-labelledby="hl-s5-title"
      >
        <div className="hlStory__mediaFull">
          <ManagedImage
            name="home-cinematic-still"
            alt="Night on the river"
            fill
            sizes="100vw"
            className="object-cover"
            previewAnchor={false}
          />
          <div className="hlStory__veil" aria-hidden="true" />
        </div>
        <div className="luxShell hlStory__inner luxGrid">
          <p className="luxMeta" style={{ gridColumn: "1 / -1" }}>
            05 / NIGHT
          </p>
          <h2 id="hl-s5-title" className="luxDisplay hlStory__phrase">
            Night on the river
          </h2>
          <p className="luxLead" style={{ gridColumn: "1 / 8", marginTop: "1.25rem" }}>
            {landmarks[2]?.title
              ? `After ${landmarks[2].title}, return to a private vessel waiting in silence.`
              : "Return to a private vessel waiting after every discovery."}
          </p>
        </div>
      </section>

      {/* HL-04 */}
      <HighlightsRhythm />

      {/* HL-05 */}
      <HighlightsRituals rows={[...RITUALS]} />

      {/* HL-06 */}
      <HighlightsGallery slides={[...GALLERY]} />

      {/* HL-07 */}
      <section className="luxSection" aria-labelledby="hl-close-heading">
        <div className="luxShell luxGrid">
          <h2 id="hl-close-heading" className="luxDisplay luxDisplay--lg hlClose__title">
            <span className="luxLineMask">
              <span data-lux-line="">There are journeys</span>
            </span>
            <span className="luxLineMask">
              <span data-lux-line="">you remember.</span>
            </span>
            <span className="luxLineMask">
              <span data-lux-line="">And journeys that change</span>
            </span>
            <span className="luxLineMask">
              <span data-lux-line="">how time feels.</span>
            </span>
          </h2>
          <p className="luxBody hlClose__body" data-lux-reveal="">
            {quote}
          </p>
          <div className="luxRule luxRule--full hlClose__rule" data-lux-rule="" />
          <div className="hlClose__actions">
            <BookNowTrigger className="luxTextLink">
              <span>Book your voyage</span>
              <span aria-hidden="true" className="luxTextLink__arrow">
                ↗
              </span>
            </BookNowTrigger>
            <LuxuryTextLink href="/charter">Enquire for private charter</LuxuryTextLink>
          </div>
          <LuxuryMedia
            name="about-dining"
            alt="Final atmospheric detail"
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="luxMedia--3x4 hlClose__media"
            previewAnchor={false}
          />
        </div>
      </section>
    </main>
  );
}
