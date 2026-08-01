"use client";

import { useRef, useState } from "react";
import "@/app/luxury-editorial-pages.css";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { CharterDirectionChapters } from "@/components/public/luxury-editorial/CharterDirectionChapters";
import { LuxuryEditorialSlider } from "@/components/public/luxury-editorial/LuxuryEditorialSlider";
import { LuxMedia } from "@/components/public/luxury-editorial/LuxMedia";
import { CharterRequestForm } from "@/components/pages/charter/CharterRequestForm";
import { CharterRouteSelector } from "@/components/pages/charter/CharterRouteSelector";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { CHARTER_CHAPTER_MEDIA } from "@/lib/charter-chapters";
import { CHARTER_PAGE } from "@/lib/page-content";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { useLuxuryEditorialMotion } from "@/hooks/useLuxuryEditorialMotion";

const DAY_MOMENTS = [
  {
    time: "Dawn",
    title: "Light before the world wakes",
    body: "Coffee on the private deck as mist lifts from the Nile — the vessel wholly yours.",
    slot: "charter-privacy",
    alt: "Private dawn on the Hathor sun deck",
  },
  {
    time: "Morning",
    title: "Temples at your pace",
    body: "Shore excursions composed around your party — no shared timetable, no crowded departures.",
    slot: "charter-itinerary",
    alt: "Morning voyage composed around your itinerary",
  },
  {
    time: "Midday",
    title: "Shade, still water, quiet service",
    body: "Lunch wherever the light is softest. The crew anticipates; you decide.",
    slot: "charter-service",
    alt: "Dedicated midday hospitality aboard Hathor",
  },
  {
    time: "Golden hour",
    title: "The river turns to bronze",
    body: "Sail or stay. The deck becomes a private theatre of sky and current.",
    slot: "charter-rhythm",
    alt: "Golden hour sailing rhythm on the Nile",
  },
  {
    time: "After dark",
    title: "A world sealed for the night",
    body: "Candlelight dining, soft music, absolute privacy from bow to stern.",
    slot: "home-cinematic-still",
    alt: "Evening atmosphere aboard a private Hathor charter",
  },
] as const;

const SPACE_SLIDES = [
  {
    id: "upper-deck",
    label: "Upper deck",
    title: "Open sky, closed doors",
    body: "The upper deck becomes your salon of light — reserved for your party alone.",
    imageSlot: "charter-privacy",
    imageAlt: "Private upper deck aboard Hathor",
    meta: "Sun · shade · stillness",
  },
  {
    id: "private-dining",
    label: "Private dining",
    title: "A table without a timetable",
    body: "Cuisine shaped around your guests. Breakfast at noon. Dinner under stars.",
    imageSlot: "gastronomy-restaurant",
    imageAlt: "Private dining aboard Hathor",
    meta: "Chef · service · ceremony",
  },
  {
    id: "suites",
    label: "Suites",
    title: "Sanctuaries of Nile light",
    body: "Royal and elegant suites composed for unhurried mornings and absolute quiet.",
    imageSlot: "room-royal",
    imageAlt: "Royal suite aboard Hathor",
    meta: "Panorama · linen · hush",
  },
  {
    id: "pool-deck",
    label: "Pool deck",
    title: "Water within water",
    body: "A private pool terrace where the Nile’s horizon becomes the only neighbour.",
    imageSlot: "charter-rhythm",
    imageAlt: "Pool deck on a private Hathor charter",
    meta: "Heat · breeze · reflection",
  },
  {
    id: "salon",
    label: "Salon",
    title: "Gathered, never crowded",
    body: "Intimate interiors for conversation, rest and the soft rituals of evening.",
    imageSlot: "home-collage-living",
    imageAlt: "Salon interiors aboard Hathor",
    meta: "Texture · shadow · ease",
  },
  {
    id: "night-terrace",
    label: "Night terrace",
    title: "Stars above a sealed world",
    body: "The night terrace holds celebrations, quiet toasts and desert constellations.",
    imageSlot: "home-call-to-action",
    imageAlt: "Night terrace aboard Hathor",
    meta: "Candlelight · celebration · sky",
  },
] as const;

const INCLUDES = [
  {
    title: "Full privacy onboard",
    body: "No other guests. The Dahabiya is sealed for your party alone.",
  },
  {
    title: "Dedicated crew & chef",
    body: "Hospitality composed around your rhythm, preferences and celebrations.",
  },
  {
    title: "Luxury accommodation",
    body: "Cabins and suites retained exclusively for your voyage.",
  },
  {
    title: "Customized itinerary",
    body: "Stops, timing and private access arranged around your party.",
  },
  {
    title: "Private dining without a clock",
    body: "Meals appear when you wish — deck, salon or candlelit night.",
  },
  {
    title: "Celebrations beyond the expected",
    body: "Anniversaries, proposals and gatherings crafted with quiet precision.",
  },
] as const;

export function CharterPageContent() {
  const rootRef = useRef<HTMLElement>(null);
  useLuxuryEditorialMotion(rootRef, "charter");

  const routes = CHARTER_PAGE.overview.routes;
  const [preferredRoute, setPreferredRoute] = useState<string>(routes[0] ?? "");

  const directionChapters = [
    {
      id: "privacy",
      title: "Absolute privacy",
      body: CHARTER_PAGE.overview.benefits[0] ?? "No other guests onboard — 100% yours.",
      imageSlot: CHARTER_CHAPTER_MEDIA[0].slot,
      imageAlt: CHARTER_CHAPTER_MEDIA[0].alt,
      objectPosition: CHARTER_CHAPTER_MEDIA[0].objectPosition,
    },
    {
      id: "route",
      title: "A route composed for you",
      body: "Timing, stops and shore access arranged around your party — not a shared schedule.",
      imageSlot: CHARTER_CHAPTER_MEDIA[3].slot,
      imageAlt: CHARTER_CHAPTER_MEDIA[3].alt,
      objectPosition: CHARTER_CHAPTER_MEDIA[3].objectPosition,
    },
    {
      id: "crew",
      title: "A crew devoted to your rhythm",
      body: CHARTER_PAGE.overview.benefits[1] ?? "Dedicated crew and chef for your voyage alone.",
      imageSlot: CHARTER_CHAPTER_MEDIA[1].slot,
      imageAlt: CHARTER_CHAPTER_MEDIA[1].alt,
      objectPosition: CHARTER_CHAPTER_MEDIA[1].objectPosition,
    },
    {
      id: "dining",
      title: "Private dining without a timetable",
      body: "Cuisine and ceremony follow your day — never a fixed dinner gong.",
      imageSlot: "gastronomy-hero",
      imageAlt: "Private dining ceremony aboard Hathor",
    },
    {
      id: "celebration",
      title: "Celebrations beyond the expected",
      body: "Milestones staged with restraint — the river as your private theatre.",
      imageSlot: CHARTER_CHAPTER_MEDIA[2].slot,
      imageAlt: CHARTER_CHAPTER_MEDIA[2].alt,
      objectPosition: CHARTER_CHAPTER_MEDIA[2].objectPosition,
    },
  ];

  return (
    <main
      ref={rootRef}
      className="lux-page"
      data-charter-page=""
      data-lux-page="charter"
    >
      {/* CH-01 Hero */}
      <section className="ch-lux-hero" data-lux-hero="" aria-labelledby="ch-hero-title">
        <div className="ch-lux-hero__media">
          <div className="ch-lux-hero__img" data-lux-hero-img="">
            <ManagedImage
              name="charter-hero"
              alt="Private Hathor Dahabiya charter on the Nile"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="ch-lux-hero__shade" aria-hidden="true" />
        </div>
        <div className="ch-lux-hero__inner">
          <p className="lux-kicker ch-lux-hero__kicker">PRIVATE CHARTER / HATHOR</p>
          <h1 id="ch-hero-title" className="lux-display ch-lux-hero__title">
            <span className="lux-lineMask">
              <span data-lux-line="">The Nile,</span>
            </span>
            <span className="lux-lineMask">
              <span data-lux-line="">Entirely Yours</span>
            </span>
            <span className="lux-script ch-lux-hero__script">{CHARTER_PAGE.hero.secondTitle}</span>
          </h1>
          <p className="ch-lux-hero__support">
            A private world of space, ceremony and uncompromised attention.
          </p>
          <div className="ch-lux-hero__cta">
            <a className="lux-btn lux-btn--ghost-light" href="#charter-request">
              Request a private charter
            </a>
            <p className="ch-lux-hero__cue">Discover the experience ↓</p>
          </div>
        </div>
      </section>

      {/* CH-02 Manifesto */}
      <section className="lux-section" aria-labelledby="ch-manifesto-heading">
        <div className="lux-shell lux-grid ch-lux-manifesto__grid">
          <div className="ch-lux-manifesto__meta">
            <p className="lux-kicker">02 / MANIFESTO</p>
            <div className="lux-rule lux-rule--gold" data-lux-rule="" style={{ marginTop: "1.25rem" }} />
            <h2 id="ch-manifesto-heading" className="lux-kicker" style={{ marginTop: "1.5rem" }}>
              {CHARTER_PAGE.overview.title}
            </h2>
          </div>
          <p className="lux-display ch-lux-manifesto__statement">
            <span className="lux-lineMask">
              <span data-lux-line="">You are not</span>
            </span>
            <span className="lux-lineMask">
              <span data-lux-line="">booking a cabin.</span>
            </span>
            <span className="lux-lineMask">
              <span data-lux-line="">You take command</span>
            </span>
            <span className="lux-lineMask">
              <span data-lux-line="">of a private world.</span>
            </span>
          </p>
          <p className="lux-lead ch-lux-manifesto__support">
            {CHARTER_PAGE.overview.intro} {CHARTER_PAGE.overview.benefitsIntro}
          </p>
          <LuxMedia
            name="charter-privacy"
            alt={CHARTER_CHAPTER_MEDIA[0].alt}
            sizes="(max-width: 1024px) 90vw, 28vw"
            direction="bottom"
            parallax={4}
            className="ch-lux-manifesto__media"
            objectPosition={CHARTER_CHAPTER_MEDIA[0].objectPosition}
          />
        </div>
      </section>

      {/* CH-03 Direction */}
      <CharterDirectionChapters chapters={directionChapters} />

      {/* CH-04 Day narrative */}
      <section className="lux-section ch-lux-day" data-lux-day="" aria-labelledby="ch-day-heading">
        <div className="lux-shell" style={{ marginBottom: "2rem" }}>
          <p className="lux-kicker">04 / ONE DAY</p>
          <h2 id="ch-day-heading" className="lux-editorialTitle">
            <span className="lux-lineMask">
              <span data-lux-line="">One day,</span>
            </span>
            <span className="lux-lineMask">
              <span data-lux-line="">entirely yours</span>
            </span>
          </h2>
        </div>

        <div className="ch-lux-day__pin lux-shell">
          <div className="ch-lux-day__stage">
            <div className="ch-lux-day__media lux-mediaFrame">
              {DAY_MOMENTS.map((moment, index) => (
                <div
                  key={moment.time}
                  className="ch-lux-day__slide"
                  data-lux-day-slide=""
                  data-active={index === 0 ? "true" : undefined}
                >
                  <ManagedImage
                    name={moment.slot}
                    alt={moment.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover"
                    previewAnchor={index === 0}
                  />
                </div>
              ))}
            </div>
            <div className="ch-lux-day__rail">
              {DAY_MOMENTS.map((moment, index) => (
                <article
                  key={moment.time}
                  className="ch-lux-day__moment"
                  data-lux-day-moment=""
                  data-active={index === 0 ? "true" : undefined}
                >
                  <p className="ch-lux-day__time">{moment.time}</p>
                  <h3 className="ch-lux-day__title">{moment.title}</h3>
                  <p className="lux-body">{moment.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="ch-lux-day__stack lux-shell">
          {DAY_MOMENTS.map((moment) => (
            <article key={moment.time}>
              <p className="ch-lux-day__time">{moment.time}</p>
              <h3 className="ch-lux-day__title">{moment.title}</h3>
              <p className="lux-body" style={{ marginBottom: "1.25rem" }}>
                {moment.body}
              </p>
              <LuxMedia
                name={moment.slot}
                alt={moment.alt}
                sizes="100vw"
                className="ch-lux-day__stackMedia"
                previewAnchor={false}
              />
            </article>
          ))}
        </div>
      </section>

      {/* CH-05 Spaces slider */}
      <section className="lux-section--dark" aria-label="Private spaces and rituals">
        <LuxuryEditorialSlider slides={[...SPACE_SLIDES]} eyebrow="PRIVATE SPACES" />
      </section>

      {/* CH-06 Routes */}
      <section className="lux-section" aria-labelledby="ch-routes-heading">
        <div className="lux-shell">
          <p className="lux-kicker">06 / COMPOSITION</p>
          <h2 id="ch-routes-heading" className="lux-editorialTitle" style={{ maxWidth: "14ch" }}>
            <span className="lux-lineMask">
              <span data-lux-line="">Compose the</span>
            </span>
            <span className="lux-lineMask">
              <span data-lux-line="">Nile around you</span>
            </span>
          </h2>
          <p className="lux-lead" style={{ marginTop: "1.5rem" }}>
            Timing, stops, dining and private access can be composed around your party —
            from a single corridor between Luxor and Aswan to a longer passage of the river.
          </p>

          <div className="lux-grid" style={{ marginTop: "3rem", alignItems: "start" }}>
            <div style={{ gridColumn: "1 / span 7" }}>
              <CharterRouteSelector
                routes={routes}
                value={preferredRoute}
                onChange={setPreferredRoute}
              />
            </div>
            <div style={{ gridColumn: "8 / -1", display: "grid", gap: "1rem" }}>
              <LuxMedia
                name="charter-itinerary"
                alt={CHARTER_CHAPTER_MEDIA[3].alt}
                sizes="(max-width: 1024px) 100vw, 35vw"
                direction="right"
                objectPosition={CHARTER_CHAPTER_MEDIA[3].objectPosition}
              />
              <div className="lux-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <LuxMedia
                  name="home-voyage-3n-aswan-luxor"
                  alt="Luxor to Aswan corridor"
                  sizes="20vw"
                  direction="bottom"
                  previewAnchor={false}
                />
                <LuxMedia
                  name="home-voyage-4n-luxor-aswan"
                  alt="Aswan to Luxor corridor"
                  sizes="20vw"
                  direction="bottom"
                  previewAnchor={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CH-07 Includes */}
      <section className="lux-section" aria-labelledby="ch-includes-heading">
        <div className="lux-shell">
          <p className="lux-kicker">07 / INCLUDED</p>
          <h2 id="ch-includes-heading" className="lux-editorialTitle">
            <span className="lux-lineMask">
              <span data-lux-line="">What the</span>
            </span>
            <span className="lux-lineMask">
              <span data-lux-line="">charter includes</span>
            </span>
          </h2>
          <ul className="ch-lux-includes__list">
            {INCLUDES.map((item, index) => (
              <li key={item.title} className="ch-lux-includes__row">
                <span className="ch-lux-includes__idx">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="ch-lux-includes__name">{item.title}</h3>
                  <p className="lux-body">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CH-08 Gallery threshold */}
      <section className="ch-lux-threshold" aria-label="Private gallery">
        <div
          className="ch-lux-threshold__media lux-mediaFrame"
          data-lux-media="slit"
        >
          <ManagedImage
            name="charter-service"
            alt="Private world aboard Hathor"
            fill
            sizes="70vw"
            className="object-cover"
            previewAnchor={false}
          />
        </div>
        <p className="ch-lux-threshold__label">Enter the private world</p>
        <p className="ch-lux-threshold__count">Gallery · Hathor charter</p>
      </section>

      {/* CH-09 Final enquiry */}
      <section className="ch-lux-enquiry" aria-labelledby="ch-enquiry-heading">
        <div className="ch-lux-enquiry__media">
          <ManagedImage
            name="home-call-to-action"
            alt="Dusk on the Nile — private charter enquiry"
            fill
            sizes="100vw"
            className="object-cover"
            previewAnchor={false}
          />
          <div className="ch-lux-enquiry__shade" aria-hidden="true" />
        </div>
        <div className="lux-shell ch-lux-enquiry__inner">
          <p className="lux-kicker">PRIVATE ENQUIRY</p>
          <h2 id="ch-enquiry-heading" className="lux-display" style={{ fontSize: "clamp(3rem, 7vw, 7rem)" }}>
            <span className="lux-lineMask">
              <span data-lux-line="">Request a</span>
            </span>
            <span className="lux-lineMask">
              <span data-lux-line="">private charter</span>
            </span>
          </h2>
          <p className="lux-lead" style={{ color: "rgb(248 244 237 / 78%)", marginTop: "1.25rem" }}>
            {CHARTER_PAGE.overview.cta}
          </p>
          <p className="lux-kicker" style={{ marginTop: "1rem" }}>
            <a href={`mailto:${PUBLIC_CONTACT.email}`} style={{ color: "inherit" }}>
              {PUBLIC_CONTACT.email}
            </a>
            {" · "}
            <a href={`tel:${PUBLIC_CONTACT.phone}`} style={{ color: "inherit" }}>
              {PUBLIC_CONTACT.phoneDisplay}
            </a>
          </p>
          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a className="lux-btn lux-btn--ghost-light" href="#charter-request">
              Begin private enquiry
            </a>
            <BookNowTrigger className="lux-btn lux-btn--ghost-light">
              Explore scheduled voyages
            </BookNowTrigger>
          </div>
        </div>
      </section>

      <div className="lux-section lux-shell ch-lux-form">
        <CharterRequestForm
          preferredRoute={preferredRoute}
          routes={routes}
          onPreferredRouteChange={setPreferredRoute}
        />
      </div>
    </main>
  );
}
