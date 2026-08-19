"use client";

import Link from "next/link";
import { useRef } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { GoldDustParticles } from "@/components/ui/GoldDustParticles";
import { useAboutEditorialFlow } from "@/hooks/useAboutEditorialFlow";
import { useAboutDiningTheatre } from "@/hooks/useAboutDiningTheatre";
import { ABOUT_PAGE } from "@/lib/page-content";

const VESSEL_DOORS = [
  {
    key: "cabin",
    count: "08",
    label: "Lower & main decks",
    title: ABOUT_PAGE.cabin.title,
    hint: ABOUT_PAGE.cabin.size,
    href: "/rooms",
    imageName: "room-luxury",
    cta: "View cabins",
  },
  {
    key: "suite",
    count: "02",
    label: "Lower deck",
    title: ABOUT_PAGE.suite.title,
    hint: ABOUT_PAGE.suite.size,
    href: "/luxury-cabins-Nile-Cruise",
    imageName: "room-suite",
    cta: "View suites",
  },
  {
    key: "royal",
    count: "02",
    label: "Main deck",
    title: ABOUT_PAGE.royalSuite.title,
    hint: ABOUT_PAGE.royalSuite.size,
    href: "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
    imageName: "room-royal",
    cta: "View royal suites",
  },
] as const;

const DINING_VENUES = [
  {
    id: "indoor-restaurant",
    label: "Indoor Restaurant",
    body: "A refined setting for elegant dining — restaurant-level expertise with the freshest locally sourced ingredients.",
    imageName: "gastronomy-restaurant",
  },
  {
    id: "outdoor-restaurant",
    label: "Outdoor Restaurant",
    body: "Savor every bite with Nile-front views, where Egyptian and international flavors meet open river light.",
    imageName: "gastronomy-table",
  },
  {
    id: "indoor-bar",
    label: "Indoor Bar",
    body: "Intimate and chic — the place to unwind while house music sets a sophisticated ambiance.",
    imageName: "gastronomy-wine",
  },
  {
    id: "outdoor-bar",
    label: "Outdoor Bar",
    body: "Breezy and relaxed under the open sky, a Nile-front pause between temple days and candlelit evenings.",
    imageName: "about-dining",
  },
] as const;

function AboutDiningTheatre() {
  const { pages } = useWebsiteText();
  const about = pages.about;
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLElement | null)[]>([]);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const { activeIndex, goToIndex } = useAboutDiningTheatre({
    trackRef,
    stageRef,
    layerRefs,
    bodyRef,
    amenityCount: DINING_VENUES.length,
  });
  const current = DINING_VENUES[activeIndex] ?? DINING_VENUES[0];

  return (
    <section
      ref={trackRef}
      className="ab-dining"
      id="about-dining"
      aria-label={about.diningTitle}
    >
      <div className="ab-dining__track">
        <div ref={stageRef} className="ab-dining__stage">
          <div className="ab-dining__panel">
            <p className="ab-eyebrow">Onboard living</p>
            <div className="ab-rule" aria-hidden="true" />
            <h2 className="ab-display">{about.diningTitle}</h2>
            <p className="ab-body">{about.diningIntro}</p>
            <div className="ab-dining__rail" role="tablist" aria-label="Dining venues">
              {DINING_VENUES.map((venue, index) => (
                <button
                  key={venue.id}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  className={`ab-dining__rail-btn${index === activeIndex ? " is-active" : ""}`}
                  onClick={() => goToIndex(index)}
                >
                  {venue.label}
                </button>
              ))}
            </div>
            <p className="ab-body ab-dining__body" ref={bodyRef} key={current.id}>
              {current.body}
            </p>
            <div className="ab-actions">
              <Link href="/gastronomy" className="btn btn-dark">
                Explore Dining
              </Link>
            </div>
          </div>

          <div className="ab-dining__visual" aria-hidden="true">
            {DINING_VENUES.map((venue, index) => (
              <div
                key={venue.id}
                className={`ab-dining__layer${index === activeIndex ? " is-active" : ""}`}
                ref={(node) => {
                  layerRefs.current[index] = node;
                }}
              >
                <ManagedImage
                  name={venue.imageName}
                  alt=""
                  fill
                  previewAnchor={index === 0}
                  sizes="(max-width: 1024px) 100vw, 62vw"
                  className="ab-cover"
                />
              </div>
            ))}
            <div className="ab-dining__fog" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutPageContent() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { pages } = useWebsiteText();
  const about = pages.about;
  useAboutEditorialFlow(pageRef);

  const manifestoLead = about.intro[0] ?? ABOUT_PAGE.intro[0];
  const manifestoRest = about.intro.slice(1);

  return (
    <div ref={pageRef} className="about-editorial">
      <section className="ab-hero" aria-label="Welcome aboard Hathor Dahabiya">
        <div className="ab-hero__sticky">
          <div className="ab-hero__stage">
            <div className="ab-hero__media">
              <ManagedImage
                name="about-hero"
                alt="Hathor Dahabiya on the Nile"
                fill
                priority
                sizes="100vw"
                className="ab-cover"
              />
            </div>
            <div className="ab-hero__wash" aria-hidden="true" />
            <GoldDustParticles />

            <div className="ab-hero__caption">
              <p className="ab-eyebrow ab-eyebrow--on-image">Private Nile vessel</p>
              <h1 className="ab-hero__title">
                Welcome
                <br />
                Aboard
              </h1>
              <p className="ab-hero__script">Hathor Dahabiya Cruise</p>
              <p className="ab-hero__support">{ABOUT_PAGE.hero.subtitle}</p>
              <div className="ab-hero__actions">
                <BookNowTrigger className="btn btn-light hero-cta">
                  Book Now
                </BookNowTrigger>
                <Link href="/cruises" className="btn btn-light hero-cta">
                  Explore Cruises
                </Link>
              </div>
            </div>

            <a
              className="ab-hero__next"
              href="#about-manifesto"
              aria-label="Continue the Hathor story"
            >
              <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
                <path
                  d="M7 1v12.5M2.5 9.5 7 14l4.5-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            <div className="ab-hero__arrive">
              <p className="ab-eyebrow">The dahabiya</p>
              <p className="ab-arrive__quote">{manifestoLead}</p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="ab-manifesto"
        id="about-manifesto"
        aria-label="The Hathor way"
      >
        <div className="ab-manifesto__copy">
          <p className="ab-eyebrow">A meditative Nile</p>
          <div className="ab-rule" aria-hidden="true" />
          <h2 className="ab-display">Experience Egypt in a whole new light</h2>
          {manifestoRest.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="ab-body">
              {paragraph}
            </p>
          ))}
          <div className="ab-actions">
            <a href="#about-vessel" className="btn btn-dark">
              Discover More
            </a>
          </div>
        </div>
        <div className="ab-manifesto__portrait">
          <ManagedImage
            name="home-story-way-of-life"
            alt="Life aboard Hathor Dahabiya"
            fill
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="ab-cover"
          />
        </div>
      </section>

      <section
        className="ab-vessel"
        id="about-vessel"
        aria-label={about.accommodationsTitle}
        data-ab-collection
      >
        <header className="ab-vessel__header">
          <p className="ab-eyebrow">Three decks of stillness</p>
          <div className="ab-rule" aria-hidden="true" />
          <h2 className="ab-display">{about.accommodationsTitle}</h2>
          <p className="ab-body">{about.accommodationsIntro}</p>
        </header>
        <ul className="ab-vessel__portals">
          {VESSEL_DOORS.map((door) => (
            <li key={door.key}>
              <Link href={door.href} className="ab-door">
                <div className="ab-door__media">
                  <ManagedImage
                    name={door.imageName}
                    alt={door.title}
                    fill
                    previewAnchor={false}
                    sizes="(max-width: 1024px) 80vw, 42vw"
                    className="ab-cover"
                  />
                </div>
                <div className="ab-door__wash" aria-hidden="true" />
                <div className="ab-door__copy">
                  <span className="ab-door__count">{door.count}</span>
                  <span className="ab-door__label">{door.label}</span>
                  <h3>{door.title}</h3>
                  <p>{door.hint}</p>
                  <span className="ab-door__cta">
                    {door.cta}
                    <span aria-hidden="true">↗</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="ab-chapter ab-chapter--cream"
        id="about-cabin"
        aria-label={ABOUT_PAGE.cabin.title}
        data-ab-slide="from-right"
        data-ab-frames="3"
      >
        <div className="ab-chapter__scene">
          <div className="ab-chapter__copy">
            <p className="ab-eyebrow">22 sqm · refined comfort</p>
            <div className="ab-rule" aria-hidden="true" />
            <h2 className="ab-display">{ABOUT_PAGE.cabin.title}</h2>
            <p className="ab-body">{about.accommodationsOutro}</p>
            <ul className="ab-features">
              {ABOUT_PAGE.cabin.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <div className="ab-actions">
              <Link href="/rooms" className="btn btn-dark">
                View cabins
              </Link>
            </div>
          </div>
          <div className="ab-chapter__stack">
            {(["room-luxury", "home-collage-living", "home-amenities-1"] as const).map(
              (slot) => (
                <div key={slot} className="ab-chapter__stack-item">
                  <ManagedImage
                    name={slot}
                    alt=""
                    fill
                    previewAnchor={false}
                    sizes="(max-width: 1024px) 100vw, 52vw"
                    className="ab-cover"
                  />
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        className="ab-chapter ab-chapter--soft"
        id="about-suite"
        aria-label={ABOUT_PAGE.suite.title}
        data-ab-slide="from-left"
        data-ab-frames="1"
      >
        <div className="ab-chapter__scene ab-chapter__scene--reverse">
          <div className="ab-chapter__media">
            <ManagedImage
              name="room-suite"
              alt="Suite aboard Hathor Dahabiya"
              fill
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="ab-cover"
            />
          </div>
          <div className="ab-chapter__copy">
            <p className="ab-eyebrow">46 sqm · distinctive luxury</p>
            <div className="ab-rule" aria-hidden="true" />
            <h2 className="ab-display">{ABOUT_PAGE.suite.title}</h2>
            <p className="ab-body">{ABOUT_PAGE.suite.intro}</p>
            <ul className="ab-features">
              {ABOUT_PAGE.suite.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <div className="ab-actions">
              <Link href="/luxury-cabins-Nile-Cruise" className="btn btn-dark">
                View suites
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="ab-chapter ab-chapter--cream"
        id="about-royal"
        aria-label={ABOUT_PAGE.royalSuite.title}
        data-ab-slide="from-bottom"
        data-ab-frames="3"
      >
        <div className="ab-chapter__scene">
          <div className="ab-chapter__copy">
            <p className="ab-eyebrow">56 sqm · the crown jewel</p>
            <div className="ab-rule" aria-hidden="true" />
            <h2 className="ab-display">{ABOUT_PAGE.royalSuite.title}</h2>
            <p className="ab-body">{ABOUT_PAGE.royalSuite.intro}</p>
            <ul className="ab-features">
              {ABOUT_PAGE.royalSuite.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <div className="ab-actions">
              <Link
                href="/Luxury-Royal-Suites-Nile-Dahabiya-Cruise"
                className="btn btn-dark"
              >
                Royal Suites
              </Link>
            </div>
          </div>
          <div className="ab-chapter__stack">
            {(
              ["room-royal", "home-carousel-royal-3n", "home-call-to-action"] as const
            ).map((slot) => (
              <div key={slot} className="ab-chapter__stack-item">
                <ManagedImage
                  name={slot}
                  alt=""
                  fill
                  previewAnchor={false}
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  className="ab-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <AboutDiningTheatre />

      <section className="ab-promo" id="about-flavors" aria-label={ABOUT_PAGE.diningPromo.title}>
        <div className="ab-promo__media">
          <ManagedImage
            name="about-dining"
            alt="Fine dining aboard Hathor Dahabiya"
            fill
            sizes="100vw"
            className="ab-cover"
          />
        </div>
        <div className="ab-promo__wash" aria-hidden="true" />
        <div className="ab-promo__copy">
          <p className="ab-eyebrow ab-eyebrow--on-image">Hathor flavors</p>
          <div className="ab-rule ab-rule--on-image" aria-hidden="true" />
          <h2 className="ab-display ab-display--on-image">
            {ABOUT_PAGE.diningPromo.title}
          </h2>
          <p className="ab-body ab-body--on-image">{ABOUT_PAGE.diningPromo.body}</p>
          <p className="ab-body ab-body--on-image">{about.diningOutro}</p>
          <div className="ab-actions">
            <Link href="/gastronomy" className="btn btn-light hero-cta">
              Explore Dining
            </Link>
          </div>
        </div>
      </section>

      <section className="ab-welcome" id="about-welcome" aria-label={about.welcomeTitle}>
        <div className="ab-welcome__inner">
          <p className="ab-eyebrow">Begin the voyage</p>
          <div className="ab-rule" style={{ marginInline: "auto" }} aria-hidden="true" />
          <h2 className="ab-display">{about.welcomeTitle}</h2>
          <p className="ab-body">{about.welcomeBody}</p>
          <div className="ab-welcome__actions">
            <BookNowTrigger className="btn btn-dark">Book Now</BookNowTrigger>
            <Link href="/cruises" className="btn btn-dark">
              Explore Cruises
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
