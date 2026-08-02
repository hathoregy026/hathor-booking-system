"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import "@/app/immersive-voyage.css";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { CharterRequestForm } from "@/components/pages/charter/CharterRequestForm";
import { CharterRouteSelector } from "@/components/pages/charter/CharterRouteSelector";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useHathorLuxBodyMotion } from "@/hooks/useHathorLuxBodyMotion";
import { useImmersiveVoyageMotion } from "@/hooks/useImmersiveVoyageMotion";
import { CHARTER_CHAPTER_MEDIA } from "@/lib/charter-chapters";
import { CHARTER_PAGE } from "@/lib/page-content";
import { PUBLIC_CONTACT } from "@/lib/public-contact";

const SERVICE_RITUAL = [
  {
    kicker: "01 · Privacy",
    title: "No other guests. Ever.",
    body: "The entire Dahabiya is yours — decks, dining, and silence shaped around your party alone.",
    slot: "charter-privacy" as const,
    alt: CHARTER_CHAPTER_MEDIA[0].alt,
    objectPosition: CHARTER_CHAPTER_MEDIA[0].objectPosition,
  },
  {
    kicker: "02 · Route",
    title: "The Nile, rewritten for you.",
    body: "Temples at dawn, quiet banks at dusk, or a shore chosen only because the light asked for it.",
    slot: "charter-itinerary" as const,
    alt: CHARTER_CHAPTER_MEDIA[3].alt,
    objectPosition: CHARTER_CHAPTER_MEDIA[3].objectPosition,
  },
  {
    kicker: "03 · Service",
    title: "A crew that anticipates.",
    body: "Dedicated hospitality and a private chef — present when wanted, invisible when not.",
    slot: "charter-service" as const,
    alt: CHARTER_CHAPTER_MEDIA[1].alt,
    objectPosition: CHARTER_CHAPTER_MEDIA[1].objectPosition,
  },
  {
    kicker: "04 · Celebration",
    title: "An evening composed for one table.",
    body: "Anniversary light, family gathering, or a retreat with no strangers aboard — the ship changes mood with you.",
    slot: "charter-rhythm" as const,
    alt: CHARTER_CHAPTER_MEDIA[2].alt,
    objectPosition: CHARTER_CHAPTER_MEDIA[2].objectPosition,
  },
] as const;

const DAY_ON_NILE = [
  {
    time: "06:40",
    title: "First coffee on the deck",
    body: "The river is still silver. Coffee arrives where the light is softest — no schedule but yours.",
    slot: "charter-privacy" as const,
  },
  {
    time: "09:15",
    title: "A temple before the gates fill",
    body: "Stone cool underfoot. Your guide waits until you are ready to enter.",
    slot: "landmark-hatshepsut" as const,
  },
  {
    time: "13:30",
    title: "Lunch where the breeze settles",
    body: "Menus composed around season and appetite — ceremonial or effortless, as you prefer.",
    slot: "gastronomy-restaurant" as const,
  },
  {
    time: "17:50",
    title: "A bank chosen for sunset",
    body: "Away from the known landings — palms, soft current, an hour that belongs to no timetable.",
    slot: "charter-rhythm" as const,
  },
  {
    time: "21:00",
    title: "Dinner beneath an open sky",
    body: "Candlelight, warm air, and conversation that stretches as far as the horizon.",
    slot: "gastronomy-hero" as const,
  },
] as const;

export function CharterPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useHathorLuxBodyMotion(rootRef);
  useImmersiveVoyageMotion(rootRef);

  const { pages } = useWebsiteText();
  const charter = pages.charter;
  const routes = CHARTER_PAGE.overview.routes;
  const [preferredRoute, setPreferredRoute] = useState<string>(routes[0] ?? "");

  return (
    <PageScrollTransition
      title={CHARTER_PAGE.hero.title}
      secondTitle={CHARTER_PAGE.hero.secondTitle}
      subtitle={CHARTER_PAGE.hero.subtitle}
      breadcrumb="Charter"
      imageName="charter-hero"
      heroPage="charter"
    >
      <div
        ref={rootRef}
        className="venetian-page lux-page"
        data-charter-page=""
      >
        {/* Manifesto */}
        <section className="iv-manifesto" aria-labelledby="ch-manifesto-title">
          <div className="iv-wrap iv-manifesto__grid">
            <div>
              <p className="iv-kicker" data-lux-reveal>
                Private charter
              </p>
              <h2
                id="ch-manifesto-title"
                className="iv-manifesto__statement"
                data-lux-title
              >
                {charter.overviewTitle}
              </h2>
              <p className="iv-script" data-lux-reveal>
                Entirely yours.
              </p>
              <p className="iv-lead" data-lux-reveal style={{ marginTop: "1.5rem" }}>
                {charter.overviewIntro}
              </p>
            </div>
            <div className="iv-manifesto__media lux-mask" data-iv-parallax="">
              <ManagedImage
                name="charter-privacy"
                alt={CHARTER_CHAPTER_MEDIA[0].alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                style={{ objectPosition: CHARTER_CHAPTER_MEDIA[0].objectPosition }}
              />
            </div>
          </div>
        </section>

        {/* Residence immersion */}
        <section className="iv-bleed" aria-labelledby="ch-residence-title">
          <div className="iv-bleed__media" data-iv-parallax="">
            <ManagedImage
              name="room-royal"
              alt="Royal suite aboard a private Hathor charter"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <div className="iv-bleed__shade" aria-hidden="true" />
          <div className="iv-bleed__panel">
            <p className="iv-kicker" data-lux-reveal>
              Residence
            </p>
            <h2
              id="ch-residence-title"
              className="lux-gold lux-gold-md"
              data-lux-title
              style={{ color: "var(--iv-ink)" }}
            >
              A floating house for your party alone
            </h2>
            <p className="iv-copy" data-lux-reveal>
              {charter.benefitsIntro}
            </p>
            <ul className="iv-lines" data-lux-reveal>
              {charter.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Service ritual scrub */}
        <section
          className="iv-scrub"
          data-iv-scrub="service"
          aria-labelledby="ch-service-title"
        >
          <div className="iv-wrap iv-scrub__head">
            <p className="iv-kicker" data-lux-reveal>
              The ritual
            </p>
            <h2
              id="ch-service-title"
              className="lux-gold lux-gold-lg"
              data-lux-title
            >
              Four moments that define a private voyage
            </h2>
          </div>

          <div className="iv-scrub__pin">
            <div className="iv-scrub__stage">
              <div className="iv-scrub__media">
                {SERVICE_RITUAL.map((item, i) => (
                  <div
                    key={item.slot}
                    className={`iv-scrub__slide${i === 0 ? " is-active" : ""}`}
                  >
                    <ManagedImage
                      name={item.slot}
                      alt={item.alt}
                      fill
                      className="object-cover"
                      sizes="60vw"
                      style={{ objectPosition: item.objectPosition }}
                      previewAnchor={false}
                    />
                  </div>
                ))}
                <div className="iv-scrub__rail" aria-hidden="true">
                  {SERVICE_RITUAL.map((item, i) => (
                    <span
                      key={item.kicker}
                      className={i === 0 ? "is-active" : undefined}
                    >
                      {item.kicker.split(" · ")[1]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="iv-scrub__copy">
                {SERVICE_RITUAL.map((item, i) => (
                  <div
                    key={item.title}
                    className={`iv-scrub__chapter${i === 0 ? " is-active" : ""}`}
                  >
                    <p className="iv-kicker">{item.kicker}</p>
                    <h3>{item.title}</h3>
                    <p className="iv-copy">{item.body}</p>
                  </div>
                ))}
              </div>
              <div className="iv-scrub__progress" aria-hidden="true">
                <i />
              </div>
            </div>
          </div>

          <div className="iv-wrap iv-scrub__stack">
            {SERVICE_RITUAL.map((item) => (
              <article key={item.title} className="iv-stack-card">
                <div className="iv-stack-card__media lux-mask">
                  <ManagedImage
                    name={item.slot}
                    alt={item.alt}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    style={{ objectPosition: item.objectPosition }}
                    previewAnchor={false}
                  />
                </div>
                <p className="iv-kicker">{item.kicker}</p>
                <h3>{item.title}</h3>
                <p className="iv-copy">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Day on the Nile */}
        <section
          className="iv-scrub iv-scrub--day"
          data-iv-scrub="day"
          aria-labelledby="ch-day-title"
        >
          <div className="iv-wrap iv-scrub__head">
            <p className="iv-kicker" data-lux-reveal>
              A day composed
            </p>
            <h2 id="ch-day-title" className="lux-gold lux-gold-lg" data-lux-title>
              Hours that belong to no timetable
            </h2>
            <p className="iv-script" data-lux-reveal>
              One private day on the Nile
            </p>
          </div>

          <div className="iv-scrub__pin">
            <div className="iv-scrub__stage">
              <div className="iv-scrub__media">
                {DAY_ON_NILE.map((item, i) => (
                  <div
                    key={item.time}
                    className={`iv-scrub__slide${i === 0 ? " is-active" : ""}`}
                  >
                    <ManagedImage
                      name={item.slot}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="60vw"
                      previewAnchor={false}
                    />
                  </div>
                ))}
                <div className="iv-scrub__rail" aria-hidden="true">
                  {DAY_ON_NILE.map((item, i) => (
                    <span
                      key={item.time}
                      className={i === 0 ? "is-active" : undefined}
                    >
                      {item.time}
                    </span>
                  ))}
                </div>
              </div>
              <div className="iv-scrub__copy">
                {DAY_ON_NILE.map((item, i) => (
                  <div
                    key={item.title}
                    className={`iv-scrub__chapter${i === 0 ? " is-active" : ""}`}
                  >
                    <p className="iv-kicker">{item.time}</p>
                    <h3>{item.title}</h3>
                    <p className="iv-copy">{item.body}</p>
                  </div>
                ))}
              </div>
              <div className="iv-scrub__progress" aria-hidden="true">
                <i />
              </div>
            </div>
          </div>

          <div className="iv-wrap iv-scrub__stack">
            {DAY_ON_NILE.map((item) => (
              <article key={item.time} className="iv-stack-card">
                <div className="iv-stack-card__media lux-mask">
                  <ManagedImage
                    name={item.slot}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    previewAnchor={false}
                  />
                </div>
                <p className="iv-kicker">{item.time}</p>
                <h3>{item.title}</h3>
                <p className="iv-copy">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Route composition */}
        <section className="iv-routes" aria-labelledby="ch-routes-title">
          <div className="iv-wrap iv-routes__layout">
            <div className="iv-routes__media lux-mask" data-iv-parallax="">
              <ManagedImage
                name="charter-itinerary"
                alt="Charter itinerary along the Nile"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
            <div>
              <p className="iv-kicker" data-lux-reveal>
                Compose the voyage
              </p>
              <h2
                id="ch-routes-title"
                className="lux-gold lux-gold-lg"
                data-lux-title
              >
                Choose your passage
              </h2>
              <p className="iv-lead" data-lux-reveal style={{ marginBottom: "1.75rem" }}>
                Select a preferred route. We refine every stop, landing, and hour around your party.
              </p>
              <CharterRouteSelector
                routes={routes}
                value={preferredRoute}
                onChange={setPreferredRoute}
              />
            </div>
          </div>
        </section>

        {/* Enquiry finale */}
        <section className="iv-enquiry" aria-labelledby="ch-enquiry-title">
          <div className="iv-enquiry__media">
            <ManagedImage
              name="charter-service"
              alt="Private charter hospitality at dusk"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <div className="iv-enquiry__shade" aria-hidden="true" />
          <div className="iv-wrap iv-enquiry__inner">
            <div className="iv-enquiry__aside">
              <p className="iv-kicker" data-lux-reveal>
                Private concierge
              </p>
              <h2
                id="ch-enquiry-title"
                className="lux-gold lux-gold-lg"
                data-lux-title
              >
                Begin your private journey
              </h2>
              <p className="iv-lead" data-lux-reveal>
                {charter.cta}
              </p>
              <p className="iv-copy" data-lux-reveal>
                Preferred · {preferredRoute}
              </p>
              <p className="iv-copy" data-lux-reveal>
                <a href={`mailto:${PUBLIC_CONTACT.email}`}>{PUBLIC_CONTACT.email}</a>
              </p>
              <div className="iv-enquiry__actions" data-lux-reveal>
                <BookNowTrigger className="btn btn-secondary">Book Now</BookNowTrigger>
                <Link className="btn btn-primary" href="/cruises">
                  View cruises
                </Link>
              </div>
            </div>
            <CharterRequestForm
              preferredRoute={preferredRoute}
              routes={routes}
              onPreferredRouteChange={setPreferredRoute}
            />
          </div>
        </section>
      </div>
    </PageScrollTransition>
  );
}
