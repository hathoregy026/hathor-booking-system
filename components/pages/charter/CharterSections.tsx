"use client";

import { AwImage } from "@/components/pages/awards/AwImage";
import { AW_IMG } from "@/lib/awards-cinema-media";

export function CharterHero() {
  return (
    <section className="aw-hero" data-aw-hero="" aria-label="Charter hero">
      <div className="aw-hero__media">
        <div className="aw-hero__img" data-aw-hero-img="">
          <AwImage
            src={AW_IMG.deck}
            alt="Luxury vessel on the Nile"
            priority
          />
        </div>
        <div className="aw-hero__shade--nile" aria-hidden="true" />
      </div>
      <div className="aw-hero__content">
        <p className="aw-label" data-aw-hero-line="">
          The Hathor Experience
        </p>
        <h1 className="aw-hero__title aw-display" data-aw-hero-line="">
          Your Floating Palace
        </h1>
        <p className="aw-hero__sub aw-italic" data-aw-hero-line="">
          Egyptian elegance navigating the world&apos;s greatest river —
          chartered entirely for your party
        </p>
      </div>
    </section>
  );
}

const SPECS = [
  { value: "240 FT", label: "Length", pos: "ch-spec--tl" },
  { value: "24", label: "Royal Suites", pos: "ch-spec--tr" },
  { value: "45", label: "Crew Members", pos: "ch-spec--bl" },
  { value: "5★", label: "Star Service", pos: "ch-spec--br" },
] as const;

export function CharterVessel() {
  return (
    <section className="ch-vessel" data-ch-vessel="" aria-label="The Vessel">
      <div className="ch-vessel__sticky">
        <div className="ch-vessel__img" data-ch-vessel-img="">
          <AwImage src={AW_IMG.deck} alt="Hathor deck and pool from above" />
        </div>
        <div className="ch-vessel__shade" aria-hidden="true" />
        <div className="ch-vessel__specs">
          {SPECS.map((spec) => (
            <div
              key={spec.label}
              className={`ch-spec ${spec.pos}`}
              data-ch-spec=""
            >
              <p className="ch-spec__value">{spec.value}</p>
              <p className="ch-spec__label">{spec.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const SUITES = [
  {
    src: AW_IMG.suite,
    name: "Royal Suite",
    size: "45 m² · River View",
    body: "A sanctuary of calm with panoramic Nile light, private seating and the quiet of a vessel held entirely for you.",
    price: "From $1,850 / night",
    flip: false,
  },
  {
    src: AW_IMG.suite2,
    name: "Grand Terrace Suite",
    size: "55 m² · Upper Deck",
    body: "Expansive terrace living above the water — mornings in soft gold, evenings under desert stars.",
    price: "From $2,250 / night",
    flip: true,
  },
  {
    src: AW_IMG.suite3,
    name: "Owner’s Cabin",
    size: "70 m² · Full Privacy",
    body: "The most intimate quarters aboard — composed for couples and hosts who want absolute stillness.",
    price: "From $2,900 / night",
    flip: false,
  },
] as const;

export function CharterSuites() {
  return (
    <div aria-label="Suites">
      {SUITES.map((suite) => (
        <section
          key={suite.name}
          className={`ch-suite${suite.flip ? " ch-suite--flip" : ""}`}
          data-ch-suite=""
        >
          <div className="ch-suite__grid">
            <div className="ch-suite__media">
              <AwImage
                src={suite.src}
                alt={suite.name}
                sizes="(max-width: 1023px) 100vw, 50vw"
              />
            </div>
            <div className="ch-suite__copy" data-aw-reveal="">
              <h2 className="ch-suite__name aw-display">{suite.name}</h2>
              <p className="ch-suite__size">{suite.size}</p>
              <p className="ch-suite__body">{suite.body}</p>
              <p className="ch-suite__price aw-display">{suite.price}</p>
              <a href="#charter-request" className="aw-btn aw-btn--ghost">
                View Suite
              </a>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

const DINING = [
  {
    src: AW_IMG.dining,
    title: "Fine Dining",
    sub: "Chefs craft extraordinary menus shaped around your voyage",
  },
  {
    src: AW_IMG.deckDining,
    title: "Sunset Deck Dining",
    sub: "Dine under the stars as ancient landscapes glide past",
  },
  {
    src: AW_IMG.privateChef,
    title: "Private Chef Experience",
    sub: "Bespoke culinary journeys tailored to your desires",
  },
] as const;

export function CharterDining() {
  return (
    <section className="ch-dining" data-ch-dining="" aria-label="Dining">
      <div className="ch-dining__desktop">
        <div className="ch-dining__runway">
          <div className="ch-dining__pin" data-ch-dining-pin="">
            {DINING.map((item, index) => (
              <div
                key={item.title}
                className="ch-dining__slide"
                data-ch-dining-slide=""
                data-index={index}
              >
                <AwImage src={item.src} alt={item.title} />
                <div className="ch-dining__shade" aria-hidden="true" />
                <div className="ch-dining__copy" data-ch-dining-copy="">
                  <h2 className="ch-dining__title aw-display">{item.title}</h2>
                  <p className="ch-dining__sub aw-italic">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ch-dining__stack">
        {DINING.map((item) => (
          <div key={item.title} className="ch-dining__stack-item" data-aw-reveal="">
            <div className="ch-dining__slide">
              <AwImage src={item.src} alt={item.title} />
              <div className="ch-dining__shade" aria-hidden="true" />
              <div className="ch-dining__copy">
                <h2 className="ch-dining__title aw-display">{item.title}</h2>
                <p className="ch-dining__sub aw-italic">{item.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const EXCURSIONS = [
  {
    src: AW_IMG.luxorTemple,
    title: "Luxor Temple",
    body: "Walk colonnades lit by evening lamps — a living corridor of kings.",
    duration: "Half day",
  },
  {
    src: AW_IMG.excursion,
    title: "Valley of Kings",
    body: "Descend into the royal necropolis with a private Egyptologist.",
    duration: "Full day",
  },
  {
    src: AW_IMG.nileGolden,
    title: "Abu Simbel",
    body: "Stand before Ramses’ colossi, carved into living rock.",
    duration: "Full day",
  },
  {
    src: AW_IMG.deck,
    title: "Hot Air Balloon",
    body: "Rise over Luxor at dawn as the west bank wakes in gold.",
    duration: "Sunrise",
  },
] as const;

export function CharterExcursions() {
  return (
    <section
      className="ch-ex"
      data-ch-ex=""
      aria-label="Excursions"
    >
      <div className="ch-ex__runway">
        <div className="ch-ex__pin" data-ch-ex-pin="">
          <div className="ch-ex__track" data-ch-ex-track="">
            {EXCURSIONS.map((card) => (
              <article key={card.title} className="ch-ex__card">
                <div data-ch-ex-img="">
                  <AwImage
                    src={card.src}
                    alt={card.title}
                    sizes="(max-width: 1023px) 100vw, 50vw"
                  />
                </div>
                <div className="ch-ex__shade" aria-hidden="true" />
                <div className="ch-ex__copy">
                  <h3 className="ch-ex__title aw-display">{card.title}</h3>
                  <p className="ch-ex__body">{card.body}</p>
                  <p className="ch-ex__dur">{card.duration}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CharterCta() {
  return (
    <section className="aw-cta" aria-label="Charter invitation">
      <div className="aw-hero__media">
        <AwImage src={AW_IMG.nileGolden} alt="Nile sunset" />
        <div className="aw-hero__shade--dark" aria-hidden="true" />
      </div>
      <div className="aw-cta__content" data-aw-reveal="">
        <h2 className="aw-cta__title aw-display">Your Journey Awaits</h2>
        <p className="aw-cta__sub aw-italic">
          Secure your private passage through ancient Egypt
        </p>
        <a href="#charter-request" className="aw-btn">
          Charter the Hathor
        </a>
      </div>
    </section>
  );
}
