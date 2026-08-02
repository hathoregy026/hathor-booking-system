"use client";

import { useRef, useState } from "react";
import "@/app/luxury-editorial-pages.css";
import { CharterJourneyComposer } from "@/components/public/luxury-editorial/CharterJourneyComposer";
import { CharterOccasions } from "@/components/public/luxury-editorial/CharterOccasions";
import { LuxuryMedia } from "@/components/public/luxury-editorial/LuxuryMedia";
import { LuxuryTextLink } from "@/components/public/luxury-editorial/LuxuryTextLink";
import { CharterRequestForm } from "@/components/pages/charter/CharterRequestForm";
import { CharterRouteSelector } from "@/components/pages/charter/CharterRouteSelector";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { CHARTER_CHAPTER_MEDIA } from "@/lib/charter-chapters";
import { CHARTER_PAGE } from "@/lib/page-content";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { useLuxuryEditorialMotion } from "@/hooks/useLuxuryEditorialMotion";

const DAY_MOMENTS = [
  {
    time: "06:30",
    title: "First light",
    body: "Coffee on the private deck as mist lifts from the Nile — the vessel wholly yours.",
    slot: "charter-privacy",
    alt: "First light on a private Hathor charter",
  },
  {
    time: "09:00",
    title: "Breakfast where the river opens",
    body: "Morning service wherever the light is softest — no shared timetable.",
    slot: "gastronomy-restaurant",
    alt: "Private breakfast aboard Hathor",
  },
  {
    time: "13:30",
    title: "A private shore",
    body: "Shore access composed around your party — temples and quiet banks at your pace.",
    slot: "charter-itinerary",
    alt: "Private shore excursion from Hathor",
  },
  {
    time: "18:10",
    title: "Golden hour on deck",
    body: "The deck becomes a private theatre of sky and current.",
    slot: "charter-rhythm",
    alt: "Golden hour on the Hathor deck",
  },
  {
    time: "22:00",
    title: "Dinner beneath the stars",
    body: "Candlelight dining, soft ceremony, absolute privacy from bow to stern.",
    slot: "home-cinematic-still",
    alt: "Evening dining aboard a private charter",
  },
] as const;

export function CharterPageContent() {
  const rootRef = useRef<HTMLElement>(null);
  useLuxuryEditorialMotion(rootRef);

  const routes = CHARTER_PAGE.overview.routes;
  const [preferredRoute, setPreferredRoute] = useState<string>(routes[0] ?? "");

  const stories = [
    {
      id: "privacy",
      title: "Absolute privacy",
      body:
        CHARTER_PAGE.overview.benefits[0] ??
        "No other guests onboard — the Dahabiya sealed for your party alone.",
      imageSlot: CHARTER_CHAPTER_MEDIA[0].slot,
      imageAlt: CHARTER_CHAPTER_MEDIA[0].alt,
      objectPosition: CHARTER_CHAPTER_MEDIA[0].objectPosition,
    },
    {
      id: "route",
      title: "A route written around you",
      body: "Timing, stops and private access arranged around your party — not a shared schedule.",
      imageSlot: CHARTER_CHAPTER_MEDIA[3].slot,
      imageAlt: CHARTER_CHAPTER_MEDIA[3].alt,
      objectPosition: CHARTER_CHAPTER_MEDIA[3].objectPosition,
    },
    {
      id: "service",
      title: "Service without a timetable",
      body:
        CHARTER_PAGE.overview.benefits[1] ??
        "A devoted crew and chef who anticipate rather than announce.",
      imageSlot: CHARTER_CHAPTER_MEDIA[1].slot,
      imageAlt: CHARTER_CHAPTER_MEDIA[1].alt,
      objectPosition: CHARTER_CHAPTER_MEDIA[1].objectPosition,
    },
    {
      id: "celebration",
      title: "Celebrations with no audience but yours",
      body: "Milestones staged with restraint — the river as your private theatre.",
      imageSlot: CHARTER_CHAPTER_MEDIA[2].slot,
      imageAlt: CHARTER_CHAPTER_MEDIA[2].alt,
      objectPosition: CHARTER_CHAPTER_MEDIA[2].objectPosition,
    },
  ];

  const occasions = [
    {
      id: "anniversary",
      title: "Anniversaries",
      body: "Quiet toasts, candlelight, and a river reserved for two.",
      imageSlot: "home-call-to-action",
      imageAlt: "Anniversary evening aboard Hathor",
    },
    {
      id: "family",
      title: "Family gatherings",
      body: "Generations sharing one private vessel — space enough for every rhythm.",
      imageSlot: "home-collage-living",
      imageAlt: "Family gathering aboard Hathor",
    },
    {
      id: "executive",
      title: "Executive retreats",
      body: "Discretion, focus, and a setting that never feels corporate.",
      imageSlot: "charter-service",
      imageAlt: "Private executive hospitality aboard Hathor",
    },
    {
      id: "milestone",
      title: "Milestone voyages",
      body: "Birthdays, proposals, farewells — composed without spectacle for its own sake.",
      imageSlot: "gastronomy-hero",
      imageAlt: "Milestone celebration dining aboard Hathor",
    },
  ];

  return (
    <main
      ref={rootRef}
      className="luxPage"
      data-charter-page=""
      data-lux-page="charter"
    >
      {/* CH-01 */}
      <section className="charterHero" data-lux-hero="" aria-labelledby="ch-hero-title">
        <div className="charterHero__media">
          <div className="charterHero__img" data-lux-hero-img="">
            <ManagedImage
              name="charter-hero"
              alt="Private Hathor Dahabiya charter on the Nile"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="charterHero__veil" aria-hidden="true" />
        </div>
        <div className="luxShell charterHero__content">
          <div className="luxGrid" style={{ width: "100%" }}>
            <p className="luxMeta charterHero__eyebrow">PRIVATE CHARTER / HATHOR</p>
            <h1 id="ch-hero-title" className="luxDisplay luxDisplay--xl charterHero__title">
              <span className="luxLineMask">
                <span data-lux-line="">The Nile,</span>
              </span>
              <span className="luxLineMask">
                <span data-lux-line="">Entirely Yours</span>
              </span>
            </h1>
            <p className="luxLead charterHero__lead">
              A private vessel, a devoted crew, and a journey composed around your rhythm.
            </p>
            <div className="charterHero__rail">
              <p className="charterHero__cue">Discover ↓</p>
              <LuxuryTextLink href="#charter-request" inverse>
                Request a private charter
              </LuxuryTextLink>
            </div>
          </div>
        </div>
      </section>

      {/* CH-02 */}
      <section className="luxSection" aria-labelledby="ch-manifesto-heading">
        <div className="luxShell luxGrid">
          <div className="charterManifesto__meta">
            <p className="luxMeta">02 / MANIFESTO</p>
            <div className="luxRule" data-lux-rule="" style={{ marginTop: "1.25rem" }} />
            <p className="luxMeta" style={{ marginTop: "1.5rem" }} id="ch-manifesto-heading">
              {CHARTER_PAGE.overview.title}
            </p>
          </div>
          <p className="luxDisplay luxDisplay--md charterManifesto__statement">
            <span className="luxLineMask">
              <span data-lux-line="">Not a cabin reserved.</span>
            </span>
            <span className="luxLineMask">
              <span data-lux-line="">An entire world</span>
            </span>
            <span className="luxLineMask">
              <span data-lux-line="">placed at your command.</span>
            </span>
          </p>
          <p className="luxBody charterManifesto__support" data-lux-reveal="">
            {CHARTER_PAGE.overview.intro} {CHARTER_PAGE.overview.benefitsIntro}
          </p>
          <LuxuryMedia
            name="charter-privacy"
            alt={CHARTER_CHAPTER_MEDIA[0].alt}
            sizes="(max-width: 1024px) 100vw, 48vw"
            className="luxMedia--3x4 charterManifesto__media"
            objectPosition={CHARTER_CHAPTER_MEDIA[0].objectPosition}
            clipUp
            parallax
            hover
          />
          <p className="luxCaption charterManifesto__caption">
            Private deck · exclusive to your party
          </p>
        </div>
      </section>

      {/* CH-03 */}
      <CharterJourneyComposer stories={stories} />

      {/* CH-04 */}
      <section
        className="luxSection charterDay"
        data-lux-day=""
        aria-labelledby="ch-day-heading"
      >
        <div className="luxShell" style={{ marginBottom: "2rem" }}>
          <p className="luxMeta">04 / ONE DAY</p>
          <h2 id="ch-day-heading" className="luxDisplay luxDisplay--md" style={{ maxWidth: "12ch" }}>
            <span className="luxLineMask">
              <span data-lux-line="">A day entirely</span>
            </span>
            <span className="luxLineMask">
              <span data-lux-line="">yours</span>
            </span>
          </h2>
        </div>

        <div className="charterDay__pin luxShell">
          <div className="charterDay__stage">
            <div className="charterDay__media luxMedia">
              {DAY_MOMENTS.map((moment, index) => (
                <div
                  key={moment.time}
                  className="charterDay__slide"
                  data-lux-day-slide=""
                  data-active={index === 0 ? "true" : undefined}
                >
                  <ManagedImage
                    name={moment.slot}
                    alt={moment.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                    previewAnchor={index === 0}
                  />
                </div>
              ))}
            </div>
            <div className="charterDay__rail">
              {DAY_MOMENTS.map((moment, index) => (
                <article
                  key={moment.time}
                  className="charterDay__moment"
                  data-lux-day-moment=""
                  data-active={index === 0 ? "true" : undefined}
                >
                  <p className="charterDay__time">{moment.time}</p>
                  <h3 className="charterDay__heading">{moment.title}</h3>
                  <p className="charterDay__copy">{moment.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="charterDay__stack luxShell">
          {DAY_MOMENTS.map((moment) => (
            <article key={moment.time}>
              <p className="charterDay__time">{moment.time}</p>
              <h3 className="charterDay__heading">{moment.title}</h3>
              <p className="luxBody" style={{ marginBottom: "1.15rem" }}>
                {moment.body}
              </p>
              <LuxuryMedia
                name={moment.slot}
                alt={moment.alt}
                sizes="100vw"
                className="luxMedia--4x5"
                previewAnchor={false}
              />
            </article>
          ))}
        </div>
      </section>

      {/* CH-05 */}
      <section className="luxSection" aria-labelledby="ch-residence-heading">
        <div className="luxShell luxGrid">
          <h2
            id="ch-residence-heading"
            className="luxDisplay luxDisplay--md charterResidence__heading"
          >
            <span className="luxLineMask">
              <span data-lux-line="">The vessel as a</span>
            </span>
            <span className="luxLineMask">
              <span data-lux-line="">private residence</span>
            </span>
          </h2>
          <LuxuryMedia
            name="room-royal"
            alt="Royal suite aboard Hathor"
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="luxMedia--16x10 charterResidence__main"
            hover
          />
          <LuxuryMedia
            name="home-collage-living"
            alt="Residence interiors aboard Hathor"
            sizes="(max-width: 1024px) 100vw, 30vw"
            className="luxMedia--3x4 charterResidence__tall"
            hover
            previewAnchor={false}
          />
          <LuxuryMedia
            name="charter-rhythm"
            alt="Deck detail aboard Hathor"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="luxMedia--4x3 charterResidence__detail"
            hover
            previewAnchor={false}
          />
          <p className="luxBody charterResidence__copy" data-lux-reveal="">
            Suites, salon and deck composed as one private house on the water —
            interiors that hold silence as carefully as light.
          </p>
        </div>
      </section>

      {/* CH-06 */}
      <CharterOccasions items={occasions} />

      {/* CH-07 */}
      <section className="charterFinale" aria-labelledby="ch-finale-heading">
        <div className="charterFinale__media">
          <ManagedImage
            name="home-call-to-action"
            alt="Dusk on the Nile — private charter enquiry"
            fill
            sizes="100vw"
            className="object-cover"
            previewAnchor={false}
          />
          <div className="charterFinale__veil" aria-hidden="true" />
        </div>
        <div className="luxShell charterFinale__inner">
          <p className="luxMeta">PRIVATE ENQUIRY</p>
          <h2 id="ch-finale-heading" className="luxDisplay luxDisplay--lg" style={{ marginTop: "1rem" }}>
            <span className="luxLineMask">
              <span data-lux-line="">Your private Nile story</span>
            </span>
            <span className="luxLineMask">
              <span data-lux-line="">begins with a conversation.</span>
            </span>
          </h2>
          <div className="charterFinale__actions">
            <LuxuryTextLink href="#charter-request" inverse>
              Begin private enquiry
            </LuxuryTextLink>
            <LuxuryTextLink href={`mailto:${PUBLIC_CONTACT.email}`} inverse>
              {PUBLIC_CONTACT.email}
            </LuxuryTextLink>
          </div>
        </div>
      </section>

      <section className="luxSection luxSection--paper">
        <div className="luxShell">
          <p className="luxMeta">COMPOSE YOUR ROUTE</p>
          <h2 className="luxDisplay luxDisplay--md" style={{ maxWidth: "14ch", marginTop: "1rem" }}>
            Timing, stops and access around you
          </h2>
          <p className="luxLead" style={{ marginTop: "1.25rem" }}>
            {CHARTER_PAGE.overview.cta}
          </p>
          <CharterRouteSelector
            routes={routes}
            value={preferredRoute}
            onChange={setPreferredRoute}
          />
        </div>
      </section>

      <div className="luxShell charterEnquiry">
        <CharterRequestForm
          preferredRoute={preferredRoute}
          routes={routes}
          onPreferredRouteChange={setPreferredRoute}
        />
      </div>
    </main>
  );
}
