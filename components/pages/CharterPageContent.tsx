"use client";

import { useRef, useState } from "react";
import "@/app/luxury-editorial-shared.css";
import "@/app/charter-luxury.css";
import {
  LuxuryImageReveal,
  LuxuryMagneticLink,
} from "@/components/public/luxury-editorial/LuxuryPrimitives";
import { CharterRequestForm } from "@/components/pages/charter/CharterRequestForm";
import { CharterRouteSelector } from "@/components/pages/charter/CharterRouteSelector";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { CHARTER_CHAPTER_MEDIA } from "@/lib/charter-chapters";
import { CHARTER_PAGE } from "@/lib/page-content";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { useLuxuryEditorialMotion } from "@/hooks/useLuxuryEditorialMotion";

const SERVICE = [
  {
    label: "Morning",
    title: "The day begins at your preferred hour.",
    body: "Coffee appears where the light is best, with the river moving quietly beyond the table.",
    slot: "charter-privacy",
    alt: "Morning coffee on a private Hathor charter",
  },
  {
    label: "The Table",
    title: "Menus composed around memory, season, and appetite.",
    body: "A dinner may feel ceremonial, or as effortless as sharing one perfect dish beneath the stars.",
    slot: "gastronomy-restaurant",
    alt: "Private dining aboard Hathor",
  },
  {
    label: "The Shore",
    title: "The route changes when curiosity asks it to.",
    body: "A temple at first light, a village with no crowd, or a silent bank chosen only for sunset.",
    slot: "charter-itinerary",
    alt: "Private shore along the Nile",
  },
  {
    label: "Evening",
    title: "The ship changes mood with you.",
    body: "Music, candlelight, conversation, and the soft disappearance of the shore.",
    slot: "home-cinematic-still",
    alt: "Evening aboard a private Hathor charter",
  },
] as const;

const ROUTE = [
  {
    title: "First Light at Karnak",
    body: "Before the gates fill, the stone is still cool and the columns hold the first amber light. Your guide waits in silence until you are ready to enter.",
    slot: "landmark-hatshepsut",
    alt: "Temple stone at first light",
  },
  {
    title: "A Quiet Bank Beyond the Map",
    body: "Away from the known landings, the river offers a bank chosen only for its stillness—palms, soft current, and an hour that belongs to no timetable.",
    slot: "charter-rhythm",
    alt: "Quiet Nile bank beyond the usual map",
  },
  {
    title: "Dinner Beneath an Open Sky",
    body: "The table is set where the evening air is softest. Local ingredients, warm light, and conversation that stretches as far as the horizon.",
    slot: "gastronomy-hero",
    alt: "Dinner beneath an open sky aboard Hathor",
  },
  {
    title: "The River After Midnight",
    body: "When the shore dissolves, the Dahabiya becomes a sealed world—lanterns, quiet decks, and the Nile moving like dark silk.",
    slot: "home-call-to-action",
    alt: "The Nile after midnight",
  },
] as const;

const OCCASIONS = [
  {
    id: "celebration",
    label: "Celebration",
    story: "An anniversary or wedding composed without spectacle—only the people who matter, and a river that holds the night.",
  },
  {
    id: "gathering",
    label: "Gathering",
    story: "A family or circle of friends sharing one private vessel—space enough for every rhythm of the day.",
  },
  {
    id: "retreat",
    label: "Retreat",
    story: "A few rare days for restoration: silence when wanted, service before it is asked, and no strangers aboard.",
  },
] as const;

export function CharterPageContent() {
  const rootRef = useRef<HTMLElement>(null);
  useLuxuryEditorialMotion(rootRef, "charter");

  const routes = CHARTER_PAGE.overview.routes;
  const [preferredRoute, setPreferredRoute] = useState<string>(routes[0] ?? "");
  const [occasion, setOccasion] = useState(0);

  return (
    <main ref={rootRef} className="lux-page" data-charter-page="" data-lux-page="charter">
      {/* 1 Hero */}
      <section className="ch-hero" data-lux-hero="" aria-labelledby="ch-hero-title">
        <div className="ch-hero__media">
          <div className="ch-hero__img" data-lux-hero-img="">
            <ManagedImage
              name="charter-hero"
              alt="Private Hathor Dahabiya charter on the Nile"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="ch-hero__veil" aria-hidden="true" />
        </div>
        <p className="ch-hero__chapter" aria-hidden="true">
          Private Charter · 01
        </p>
        <div className="ch-hero__progress" aria-hidden="true">
          <span />
        </div>
        <div className="lux-shell ch-hero__content">
          <div className="lux-grid" style={{ width: "100%" }} data-lux-reveal-group="">
            <p className="lux-kicker ch-hero__kicker">
              PRIVATE CHARTER · THE NILE, ENTIRELY YOURS
            </p>
            <h1 id="ch-hero-title" className="lux-display ch-hero__title">
              <span className="lux-line-mask">
                <span data-lux-line="">A voyage designed</span>
              </span>
              <span className="lux-line-mask">
                <span data-lux-line="">around one name.</span>
              </span>
              <span className="lux-line-mask">
                <span data-lux-line="" className="lux-gold-text">
                  Yours.
                </span>
              </span>
            </h1>
            <p className="lux-body ch-hero__body" data-lux-body="">
              From the hour you wake to the shore where you pause, every detail is shaped
              around your rhythm, your guests, and your idea of escape.
            </p>
            <div className="ch-hero__actions" data-lux-body="">
              <LuxuryMagneticLink href="#charter-request" inverse>
                Begin Your Private Journey
              </LuxuryMagneticLink>
              <a
                href="#ch-intro"
                className="lux-kicker"
                style={{ color: "rgba(251,247,239,0.7)", textDecoration: "none" }}
              >
                Discover the experience ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2 Intro */}
      <section id="ch-intro" className="lux-section lux-section--cream" aria-labelledby="ch-intro-title">
        <div className="lux-shell lux-grid" data-lux-reveal-group="">
          <p className="lux-kicker ch-intro__kicker">02 · THE VOYAGE BEGINS WITH YOU</p>
          <h2 id="ch-intro-title" className="lux-display lux-display--medium ch-intro__title">
            <span className="lux-line-mask">
              <span data-lux-line="">No fixed script.</span>
            </span>
            <span className="lux-line-mask">
              <span data-lux-line="">No borrowed rhythm.</span>
            </span>
          </h2>
          <p className="lux-body ch-intro__body" data-lux-body="">
            A private charter begins before arrival. We learn how you travel, who you are
            bringing, what you want to celebrate, and where you want time to slow down. The
            route, table, music, rituals, and hours are then composed around you.
          </p>
          <p className="ch-intro__note" data-lux-body="">
            The rarest luxury is not choice. It is being understood.
          </p>
          <LuxuryImageReveal
            name="charter-privacy"
            alt={CHARTER_CHAPTER_MEDIA[0].alt}
            sizes="(max-width: 1024px) 100vw, 32vw"
            className="ch-intro__media lux-image-link"
            mediaClassName="lux-media--3x4"
            objectPosition={CHARTER_CHAPTER_MEDIA[0].objectPosition}
            caption="Private deck · yours alone"
          />
          <span className="lux-rule ch-intro__rule" data-lux-rule="" />
        </div>
      </section>

      {/* 3 Residence */}
      <section className="ch-residence lux-section--cream-50" aria-labelledby="ch-residence-title">
        <div className="ch-residence__media lux-media" data-lux-media="" data-lux-parallax="">
          <ManagedImage
            name="room-royal"
            alt="Private residence suites aboard Hathor"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <p className="ch-residence__caption">The residence · upper deck light</p>
        </div>
        <div className="lux-shell lux-grid">
          <div className="ch-residence__panel" data-lux-reveal-group="">
            <p className="lux-kicker">THE RESIDENCE</p>
            <h2 id="ch-residence-title" className="lux-display lux-display--small" style={{ marginTop: "1rem" }}>
              <span className="lux-line-mask">
                <span data-lux-line="">For a few days, the ship</span>
              </span>
              <span className="lux-line-mask">
                <span data-lux-line="">belongs only to your world.</span>
              </span>
            </h2>
            <p className="lux-body" data-lux-body="" style={{ marginTop: "1.25rem" }}>
              Suites become private quarters. The decks become open-air salons. Breakfast waits
              for no schedule. Music follows the evening. There are no strangers, no shared
              rituals, and no reason to look at the time.
            </p>
            <ul className="ch-residence__facts" data-lux-body="">
              <li>Private decks for your guests alone</li>
              <li>Spaces adapted to celebration or retreat</li>
              <li>A crew briefed around personal preferences</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4 Service */}
      <section className="lux-section lux-section--espresso" aria-labelledby="ch-service-title">
        <div className="lux-shell" data-lux-reveal-group="">
          <p className="lux-kicker">04 · SERVICE BEFORE THE REQUEST</p>
          <h2 id="ch-service-title" className="lux-display lux-display--medium" style={{ maxWidth: "14ch", marginTop: "1rem" }}>
            <span className="lux-line-mask">
              <span data-lux-line="">Anticipation,</span>
            </span>
            <span className="lux-line-mask">
              <span data-lux-line="">not interruption.</span>
            </span>
          </h2>
          <div className="ch-service__list" style={{ marginTop: "3rem" }}>
            {SERVICE.map((item, index) => (
              <article key={item.label} className="ch-service__row" tabIndex={0}>
                <span className="ch-service__num">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className="ch-service__label">{item.label}</p>
                  <h3 className="ch-service__title">{item.title}</h3>
                  <p className="ch-service__copy">{item.body}</p>
                </div>
                <div className="ch-service__media ch-service__media--static">
                  <div className="lux-media">
                    <ManagedImage
                      name={item.slot}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                      previewAnchor={index === 0}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Route */}
      <section className="lux-section lux-section--cream ch-route" data-ch-route="" aria-labelledby="ch-route-title">
        <div className="lux-shell" style={{ marginBottom: "2rem" }} data-lux-reveal-group="">
          <p className="lux-kicker">05 · A ROUTE WRITTEN IN MOMENTS</p>
          <h2 id="ch-route-title" className="lux-display lux-display--medium" style={{ maxWidth: "12ch" }}>
            <span className="lux-line-mask">
              <span data-lux-line="">The Nile unfolds</span>
            </span>
            <span className="lux-line-mask">
              <span data-lux-line="">privately.</span>
            </span>
          </h2>
        </div>

        <div className="ch-route__pin lux-shell">
          <div className="ch-route__media lux-media">
            {ROUTE.map((moment, index) => (
              <div
                key={moment.title}
                className="ch-route__slide"
                data-ch-route-slide=""
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
          <div className="ch-route__rail" style={{ position: "relative" }}>
            <div className="ch-route__progress" aria-hidden="true">
              <span data-ch-route-bar="" style={{ height: "100%", transform: "scaleY(0.12)" }} />
            </div>
            {ROUTE.map((moment, index) => (
              <article
                key={moment.title}
                className="ch-route__chapter"
                data-ch-route-chapter=""
                data-active={index === 0 ? "true" : undefined}
              >
                <p className="lux-kicker">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="lux-display lux-display--small" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2.2rem)", marginTop: "0.5rem" }}>
                  {moment.title}
                </h3>
                <p className="lux-body" style={{ marginTop: "0.75rem" }}>
                  {moment.body}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="ch-route__stack lux-shell">
          {ROUTE.map((moment, index) => (
            <article key={moment.title}>
              <p className="lux-kicker">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="lux-display lux-display--small" style={{ marginTop: "0.75rem" }}>
                {moment.title}
              </h3>
              <p className="lux-body" style={{ marginBlock: "1rem 1.25rem" }}>
                {moment.body}
              </p>
              <LuxuryImageReveal
                name={moment.slot}
                alt={moment.alt}
                sizes="100vw"
                mediaClassName="lux-media--3x4"
                previewAnchor={false}
              />
            </article>
          ))}
        </div>
      </section>

      {/* 6 Occasions */}
      <section className="lux-section lux-section--cream-50" aria-labelledby="ch-occasions-title">
        <div className="lux-shell lux-grid" data-lux-reveal-group="">
          <h2 id="ch-occasions-title" className="lux-display lux-display--medium ch-occasions__title">
            <span className="lux-line-mask">
              <span data-lux-line="">Some journeys mark</span>
            </span>
            <span className="lux-line-mask">
              <span data-lux-line="">a moment. Others</span>
            </span>
            <span className="lux-line-mask">
              <span data-lux-line="">become the moment.</span>
            </span>
          </h2>
          <p className="lux-body ch-occasions__body" data-lux-body="">
            A family gathering, a private wedding, an anniversary, or a few rare days with the
            people who matter most. The setting is never packaged. It is composed around the
            meaning of the occasion.
          </p>
          <div className="ch-occasions__tabs" role="tablist" aria-label="Occasion type">
            {OCCASIONS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                className="ch-occasions__tab"
                aria-selected={index === occasion}
                onClick={() => setOccasion(index)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="ch-occasions__story" data-lux-body="">
            {OCCASIONS[occasion].story}
          </p>
          <LuxuryImageReveal
            name="charter-service"
            alt="Celebration aboard Hathor"
            sizes="(max-width: 1024px) 100vw, 32vw"
            className={`ch-occasions__tall lux-image-link ch-occasions__media${occasion === 0 ? " is-highlight" : ""}`}
            mediaClassName="lux-media--3x4"
            previewAnchor={false}
          />
          <LuxuryImageReveal
            name="home-collage-living"
            alt="Gathering aboard Hathor"
            sizes="(max-width: 1024px) 100vw, 60vw"
            className={`ch-occasions__wide lux-image-link ch-occasions__media${occasion === 1 ? " is-highlight" : ""}`}
            mediaClassName="lux-media--16x9"
            previewAnchor={false}
          />
          <LuxuryImageReveal
            name="home-story-dining"
            alt="Intimate retreat detail"
            sizes="(max-width: 1024px) 100vw, 35vw"
            className={`ch-occasions__detail lux-image-link ch-occasions__media${occasion === 2 ? " is-highlight" : ""}`}
            mediaClassName="lux-media--4x3"
            previewAnchor={false}
          />
        </div>
      </section>

      {/* 7 Finale */}
      <section className="ch-finale" aria-labelledby="ch-finale-title">
        <div className="ch-finale__media">
          <ManagedImage
            name="home-call-to-action"
            alt="Dusk on the Nile — private charter enquiry"
            fill
            sizes="100vw"
            className="object-cover"
            previewAnchor={false}
          />
          <div className="ch-finale__veil" aria-hidden="true" />
        </div>
        <div className="ch-finale__panel" data-lux-reveal-group="">
          <span className="lux-rule" data-lux-rule="" style={{ maxWidth: 48, marginBottom: "1.25rem" }} />
          <p className="lux-kicker">PRIVATE ENQUIRY</p>
          <h2 id="ch-finale-title" className="lux-display lux-display--small" style={{ marginTop: "1rem" }}>
            <span className="lux-line-mask">
              <span data-lux-line="">Tell us how you want</span>
            </span>
            <span className="lux-line-mask">
              <span data-lux-line="">the river to feel.</span>
            </span>
          </h2>
          <p className="lux-body" data-lux-body="" style={{ marginTop: "1.15rem" }}>
            Share the occasion, the people, and the pace you imagine. We will shape the rest
            privately.
          </p>
          <div className="ch-finale__actions" data-lux-body="">
            <LuxuryMagneticLink href="#charter-request">Request a Private Charter</LuxuryMagneticLink>
            <LuxuryMagneticLink href={`mailto:${PUBLIC_CONTACT.email}`}>
              Speak with our charter team
            </LuxuryMagneticLink>
          </div>
          <p className="ch-finale__note">Every enquiry is handled personally and in confidence.</p>
        </div>
      </section>

      <section className="lux-section lux-section--cream">
        <div className="lux-shell">
          <p className="lux-kicker">COMPOSE YOUR ROUTE</p>
          <h2 className="lux-display lux-display--small" style={{ maxWidth: "14ch", marginTop: "1rem" }}>
            {CHARTER_PAGE.overview.cta}
          </h2>
          <CharterRouteSelector
            routes={routes}
            value={preferredRoute}
            onChange={setPreferredRoute}
          />
        </div>
      </section>

      <div className="lux-shell ch-enquiry">
        <CharterRequestForm
          preferredRoute={preferredRoute}
          routes={routes}
          onPreferredRouteChange={setPreferredRoute}
        />
      </div>
    </main>
  );
}
