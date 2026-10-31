"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Fragment,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useBookNowModal } from "@/components/booking/BookingModalProvider";
import { AnimaSplitLine } from "@/components/public/AnimaSplitLine";
import { CharterRequestForm } from "@/components/pages/charter/CharterRequestForm";
import { CharterShipProfile } from "@/components/pages/charter/CharterShipProfile";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useTypographySettings } from "@/components/public/TypographySettingsProvider";
import { useCharterEditorialScroll } from "@/hooks/useCharterEditorialScroll";
import { CHARTER_PRIVATE } from "@/lib/charter-private-content";
import { CHARTER_PAGE } from "@/lib/page-content";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";
import { stackedHeroLines } from "@/lib/website-text-shared";
import { useLocalizedHref, usePublicLocale } from "@/hooks/usePublicLocale";
import { CHARTER_COPY } from "@/lib/i18n/charter-copy";

/*
 * One photographic frame for the whole story: portrait 4:5 at one height
 * (--chr-img), every frame hanging from the same top line. `.chr-photo`
 * also marks it for the slide-in (see useCharterEditorialScroll).
 */
const PORTRAIT = "4 / 5";
const PHOTO_SIZES = "(max-width: 620px) 92vw, (max-width: 950px) 46vw, 28vw";

function CharterMedia({
  slot,
  alt,
  sizes = PHOTO_SIZES,
  priority = false,
  className = "",
  ratio = PORTRAIT,
}: {
  slot: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  ratio?: string;
}) {
  const image = useSiteImage(slot);
  return (
    <figure
      className={`chr-media ${className}`}
      data-site-image={image.slot ?? slot}
      style={{ ["--chr-ratio" as string]: ratio } as CSSProperties}
    >
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes={sizes}
        quality={SITE_IMAGE_QUALITY}
        className="chr-media__image"
      />
    </figure>
  );
}

function FlipImage({
  front,
  back,
  frontAlt,
  backAlt = "",
  className = "",
  axis = "left",
}: {
  front: string;
  back: string;
  frontAlt: string;
  backAlt?: string;
  className?: string;
  axis?: "up" | "left" | "right";
}) {
  return (
    <div
      className={`chr-flip chr-flip--${axis} ${className}`}
      data-chr-flip
      style={{ ["--chr-ratio" as string]: PORTRAIT } as CSSProperties}
    >
      <CharterMedia slot={front} alt={frontAlt} className="chr-flip__base" />
      <CharterMedia slot={back} alt={backAlt} className="chr-flip__overlay" />
    </div>
  );
}

function Scene({ className = "", children, ...props }: ComponentPropsWithoutRef<"section">) {
  return (
    <section className={`chr-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="chr-eyebrow">{children}</p>;
}

/**
 * The booking calendar as a normal outline pill. BookNowTrigger always paints
 * itself as the filled Book Now; on this page the charter request is the one
 * filled action, so availability uses the same modal from a matching pill.
 */
function AvailabilityButton() {
  const { openBooking } = useBookNowModal();
  const label = CHARTER_COPY[usePublicLocale()].secondaryCta;
  return (
    <button type="button" className="chr-btn" onClick={() => openBooking()}>
      <span>{label}</span>
    </button>
  );
}

/** Break a phrase into short whole-word lines (never mid-word). */
function phraseLines(text: string, wordsPerLine = 2): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= wordsPerLine) return text.trim() ? [text.trim()] : [];
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(" "));
  }
  return lines;
}

/**
 * Whole-phrase title lines behind a clip mask — never wrap mid-word.
 * `--chr-fit` (the longest line, in characters) lets a scene title size itself
 * to its column so it can never run into the photograph beside it.
 */
function TitleLines({
  lines,
  as: Tag = "h2",
  id,
  className = "chr-display chr-display--l",
}: {
  lines: readonly string[];
  as?: "h1" | "h2";
  id?: string;
  className?: string;
}) {
  const fit = Math.max(...lines.map((line) => line.length), 1);
  return (
    <Tag
      id={id}
      className={className}
      data-anima-title
      style={{ ["--chr-fit" as string]: fit } as CSSProperties}
    >
      {lines.map((line, index) => (
        <Fragment key={`${line}-${index}`}>
          {index > 0 ? " " : null}
          <span className="chr-line">
            <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}

const pad = (value: number) => String(value).padStart(2, "0");

/* Chapter anchors; their labels come from the copy, in this order. */
const CHAPTERS = ["#charter-request", "#vessel", "#residence", "#passages"] as const;

/*
 * What "the whole ship" means, counted. Capacity: 8 cabins × 2, 4 suites × 4.
 * Labels (copy.deed) follow this order; so do the freedom words and the deck
 * each residence category lives on (see the ship plan).
 */
const DEED_FIGURES = ["1", "3", "12", "32", "0"] as const;

const PASSAGE_IMAGES = [
  "home-voyage-nile-majesty",
  "home-voyage-4n-luxor-aswan",
  "home-voyage-3n-aswan-luxor",
  "home-voyage-7n-roundtrip",
  "charter-itinerary",
  "about-hero",
  "home-cinematic-still",
] as const;

export function CharterPageContent() {
  const t = CHARTER_COPY[usePublicLocale()];
  const localHref = useLocalizedHref();
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { pages } = useWebsiteText();
  const charter = pages.charter;
  const typography = useTypographySettings();
  const charterHero = resolveHeroPageCopy(typography, "charter");
  const charterHeroLines = stackedHeroLines(charterHero.main, charterHero.second).flatMap((line) =>
    phraseLines(line, 2),
  );
  const routes = CHARTER_PAGE.overview.routes;
  const [preferredRoute, setPreferredRoute] = useState<string>(routes[0] ?? "");
  /* The passage frame follows the pointer / keyboard, then settles back on the chosen route. */
  const [previewRoute, setPreviewRoute] = useState<string | null>(null);
  const shownRoute = previewRoute ?? preferredRoute;
  const copy = CHARTER_PRIVATE;
  const facts = charter.benefits.length ? charter.benefits : copy.trust.facts;

  const scrollToTarget = useCharterEditorialScroll({ rootRef, runRef, trackRef });

  /*
   * In-page links go through the story's own scroll mapping: a plain #hash jump
   * cannot reach a scene inside the sideways track (it would scroll the clipped
   * stage and desync the story), and it would skip the site's smooth scroll.
   */
  const goToHash = (event: MouseEvent<HTMLAnchorElement>) => {
    const hash = event.currentTarget.hash;
    const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
    if (!target) return;
    event.preventDefault();
    window.history.replaceState(null, "", hash);
    scrollToTarget(target);
  };

  const selectRoute = (route: string) => {
    setPreferredRoute(route);
    scrollToTarget(document.getElementById("charter-request"));
  };

  const requestButton = (
    <a className="chr-btn chr-btn--solid" href="#charter-request" onClick={goToHash}>
      <span>{t.primaryCta}</span>
    </a>
  );

  return (
    <div ref={rootRef} className="charter-editorial">
      <div className="chr-progress" aria-hidden="true">
        <i data-chr-progress />
      </div>

      {/* The site layout already provides <main>; this is the page's own wrapper. */}
      <div className="chr-main">
        <section ref={runRef} className="chr-run" aria-label={t.runLabel}>
          <div className="chr-stage">
            <div ref={trackRef} className="chr-track">
              {/* 01 — The offer: the whole ship, drawn and counted */}
              <Scene className="chr-deed" aria-labelledby="charter">
                <div className="chr-deed__top">
                  <Eyebrow>{t.kicker}</Eyebrow>
                  <nav className="chr-deed__chapters" aria-label={t.chaptersLabel}>
                    <ol>
                      {CHAPTERS.map((href, index) => (
                        <li key={href}>
                          <a href={href} onClick={goToHash}>
                            <span>{pad(index + 1)}</span>
                            {t.chapters[index]}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </div>

                <div className="chr-deed__title">
                  <TitleLines
                    as="h1"
                    id="charter"
                    className="chr-display chr-display--xl wt-page-hero"
                    lines={charterHeroLines}
                  />
                  <p className="chr-deed__intro chr-support">{t.deedIntro}</p>
                </div>

                <div className="chr-deed__pitch">
                  <p className="chr-deed__lead chr-edit wt-page-body">{t.lead}</p>
                  <div className="chr-actions">
                    {requestButton}
                    <AvailabilityButton />
                  </div>
                  <p className="chr-deed__cue">
                    <i />
                    {t.scrollCue}
                  </p>
                </div>

                <div className="chr-deed__plan">
                  <figure className="chr-deed__ship">
                    <CharterShipProfile label={t.shipLabel} />
                    <figcaption className="chr-deed__legend chr-meta">
                      <i aria-hidden="true" />
                      <span>
                        {t.shipLegend[0]}
                        <br />
                        {t.shipLegend[1]}
                      </span>
                    </figcaption>
                  </figure>
                  <dl className="chr-deed__ledger">
                    {DEED_FIGURES.map((figure, index) => (
                      <div key={t.deed[index]}>
                        <dt className="chr-meta">{t.deed[index]}</dt>
                        <dd className="chr-edit">{figure}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Scene>

              {/* 02 — The request, straight after the ship */}
              <Scene className="chr-request" aria-labelledby="charter-request-heading">
                <div className="chr-request__sheet" data-chr-reveal>
                  <CharterRequestForm
                    preferredRoute={preferredRoute}
                    routes={routes}
                    onPreferredRouteChange={setPreferredRoute}
                    onReveal={scrollToTarget}
                  />
                  <p className="chr-request__desk">
                    <span className="chr-meta">{t.preferToTalk}</span>
                    <a className="chr-link" href={copy.finale.phoneHref}>
                      {copy.finale.phone}
                    </a>
                    <a className="chr-link" href={copy.finale.whatsapp} target="_blank" rel="noopener noreferrer">
                      WhatsApp
                    </a>
                    <span className="chr-meta">{t.hours}</span>
                  </p>
                </div>
                {/* Shown only where the screen has room beside the form (see CSS). */}
                <CharterMedia
                  slot="home-voyage-nile-majesty"
                  alt={t.requestPhotoAlt}
                  className="chr-request__photo chr-photo"
                />
              </Scene>

              {/* 03 — The vessel: proof on a dark wash */}
              <Scene className="chr-vow" id="vessel" aria-labelledby="chr-vow-title">
                <FlipImage
                  className="chr-photo"
                  axis="up"
                  front="charter-privacy"
                  back="home-split-courtyard"
                  frontAlt={t.vow.frontAlt}
                  backAlt={t.vow.backAlt}
                />
                <div className="chr-vow__copy chr-column" data-chr-reveal>
                  <Eyebrow>{t.vow.eyebrow}</Eyebrow>
                  <TitleLines id="chr-vow-title" lines={t.vow.title} />
                  <p className="chr-vow__statement chr-edit">{t.vow.statement}</p>
                  <p className="chr-meta">{t.vow.places}</p>
                </div>
                <CharterMedia
                  slot="charter-hero"
                  alt={t.vow.photoAlt}
                  className="chr-photo"
                />
              </Scene>

              {/* 04 — Every residence: one frame and its specification, three times */}
              <Scene className="chr-keys" id="residence" aria-labelledby="chr-keys-title">
                <header className="chr-keys__head chr-column" data-chr-reveal>
                  <Eyebrow>{t.fleet.kicker}</Eyebrow>
                  <TitleLines id="chr-keys-title" lines={t.fleet.title} />
                  <p className="chr-support">{t.fleet.intro}</p>
                  <ul className="chr-keys__stats">
                    {t.fleet.stats.map((stat) => (
                      <li key={stat} className="chr-meta">
                        {stat}
                      </li>
                    ))}
                  </ul>
                  <p className="chr-support">{t.fleet.outro}</p>
                </header>
                <div className="chr-keys__sheet">
                  {copy.fleet.cards.map((card, index) => {
                    const words = t.fleet.cards[index] ?? card;
                    const count = card.capacity.match(/\d+/)?.[0] ?? "";
                    return (
                      <article key={card.title} className="chr-key">
                        <CharterMedia slot={card.image} alt={words.title} className="chr-key__media chr-photo" />
                        <div className="chr-key__text" data-chr-reveal>
                          <p className="chr-key__deck chr-meta">{t.residenceDecks[index]}</p>
                          <div className="chr-key__name">
                            <span className="chr-key__count" aria-hidden="true">
                              {count}
                            </span>
                            <h3 className="chr-display">{words.title}</h3>
                          </div>
                          <p className="chr-key__facts chr-meta">
                            {words.capacity} · {words.detail}
                          </p>
                          <p className="chr-support">{words.body}</p>
                          <ul className="chr-key__amenities">
                            {words.amenities.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                          <Link className="chr-link" href={localHref(card.href)}>
                            {words.hrefLabel}
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </Scene>

              {/* 05 — Three freedoms: one frame, one word, one promise each */}
              <Scene className="chr-freedoms" id="promise" aria-labelledby="chr-freedoms-title">
                <header className="chr-freedoms__head chr-column" data-chr-reveal>
                  <Eyebrow>{t.value.kicker}</Eyebrow>
                  <h2 id="chr-freedoms-title" className="lx-sr">
                    {t.value.title}
                  </h2>
                  <p className="chr-support">{charter.benefitsIntro || t.value.intro}</p>
                </header>
                <ol className="chr-freedoms__row">
                  {copy.value.pillars.map((pillar, index) => {
                    const words = t.value.pillars[index] ?? pillar;
                    return (
                      <li key={pillar.title} className="chr-freedom">
                        <CharterMedia slot={pillar.image} alt={words.title} className="chr-freedom__media chr-photo" />
                        <div className="chr-freedom__caption" data-chr-reveal>
                          <span className="chr-freedom__word chr-line" aria-hidden="true">
                            <span className="chr-display">{t.freedomWords[index]}</span>
                          </span>
                          <div className="chr-freedom__copy">
                            <span className="chr-freedom__n chr-edit">{pad(index + 1)}</span>
                            <h3 className="chr-edit">{words.title}</h3>
                            <p className="chr-support">{words.body}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </Scene>

              {/* 06 — Days aboard: four equal frames on one line */}
              <Scene className="chr-days" aria-labelledby="chr-days-title">
                <header className="chr-days__head chr-column" data-chr-reveal>
                  <Eyebrow>{t.experiences.kicker}</Eyebrow>
                  <TitleLines id="chr-days-title" lines={t.experiences.title} />
                </header>
                <ol className="chr-days__sheet">
                  {copy.experiences.items.map((item, index) => {
                    const words = t.experiences.items[index] ?? item;
                    return (
                      <li key={item.title} className="chr-day">
                        <CharterMedia slot={item.image} alt={words.title} className="chr-day__media chr-photo" />
                        <div className="chr-day__copy" data-chr-reveal>
                          <span className="chr-meta">{pad(index + 1)}</span>
                          <h3 className="chr-display">{words.title}</h3>
                          <p className="chr-support">{words.body}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </Scene>

              {/* 07 — Choose a passage: the board fills in the request */}
              <Scene className="chr-passages" id="passages" aria-labelledby="chr-passages-title">
                <header className="chr-passages__head chr-column" data-chr-reveal>
                  <Eyebrow>{t.passages.kicker}</Eyebrow>
                  <TitleLines id="chr-passages-title" lines={t.passages.title} />
                  <p className="chr-support">{t.passages.lead}</p>
                  <p className="chr-passages__pref chr-edit" aria-live="polite">
                    {t.preferred(t.place(preferredRoute))}
                  </p>
                </header>
                <div className="chr-passages__frame chr-photo" aria-hidden="true">
                  {copy.passages.routes.map((route, index) => (
                    <CharterMedia
                      key={route}
                      slot={PASSAGE_IMAGES[index % PASSAGE_IMAGES.length]}
                      alt={t.passages.imageAlt(t.place(route))}
                      className={`chr-passages__image${route === shownRoute ? " is-shown" : ""}`}
                    />
                  ))}
                </div>
                <div
                  className="chr-passages__board"
                  role="group"
                  aria-label={t.passages.label}
                  data-chr-reveal
                  onMouseLeave={() => setPreviewRoute(null)}
                >
                  {copy.passages.routes.map((route, index) => {
                    const active = preferredRoute === route;
                    return (
                      <button
                        key={route}
                        type="button"
                        aria-pressed={active}
                        className={`chr-passage${active ? " is-active" : ""}`}
                        onClick={() => selectRoute(route)}
                        onMouseEnter={() => setPreviewRoute(route)}
                        onFocus={() => setPreviewRoute(route)}
                        onBlur={() => setPreviewRoute(null)}
                      >
                        <span className="chr-passage__n chr-edit">{pad(index + 1)}</span>
                        <span className="chr-passage__route chr-display">{t.place(route)}</span>
                        <span className="chr-passage__cta">
                          {active ? t.passages.selected : t.passages.choose}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Scene>

              {/* 08 — How it works: three steps, then the ship at work */}
              <Scene className="chr-steps" aria-labelledby="chr-steps-title">
                <header className="chr-steps__head chr-column" data-chr-reveal>
                  <Eyebrow>{t.process.kicker}</Eyebrow>
                  <TitleLines id="chr-steps-title" lines={t.process.title} />
                  <div className="chr-actions">
                    <a className="chr-btn chr-btn--solid" href="#charter-request" onClick={goToHash}>
                      <span>{t.process.begin}</span>
                    </a>
                  </div>
                </header>
                <ol className="chr-steps__line" data-chr-reveal>
                  {copy.process.steps.map((step, index) => {
                    const words = t.process.steps[index] ?? step;
                    return (
                      <li key={step.n} className="chr-step">
                        <span className="chr-step__n chr-edit">{step.n}</span>
                        <h3 className="chr-display">{words.title}</h3>
                        <p className="chr-support">{words.body}</p>
                      </li>
                    );
                  })}
                </ol>
                <FlipImage
                  className="chr-photo"
                  axis="right"
                  front="charter-rhythm"
                  back="charter-service"
                  frontAlt={t.process.frontAlt}
                  backAlt={t.process.backAlt}
                />
                <CharterMedia
                  slot="gastronomy-celebration"
                  alt={t.process.celebrationAlt}
                  className="chr-photo"
                />
              </Scene>

              {/* 09 — Quiet proof, then the ask: the last frame, exactly one screen */}
              <Scene className="chr-proof" aria-labelledby="chr-proof-title">
                <CharterMedia
                  slot="home-story-way-of-life"
                  alt={t.trust.photoAlt}
                  className="chr-proof__portrait chr-photo"
                />
                <div className="chr-proof__voices chr-column" data-chr-reveal>
                  <Eyebrow>{t.trust.kicker}</Eyebrow>
                  <TitleLines id="chr-proof-title" lines={t.trust.title} />
                  {t.trust.quotes.map((item) => (
                    <figure key={item.attribution} className="chr-quote">
                      <blockquote className="chr-edit">{item.quote}</blockquote>
                      <figcaption className="chr-meta">{item.attribution}</figcaption>
                    </figure>
                  ))}
                </div>
                <div className="chr-proof__close chr-column" data-chr-reveal>
                  <ul className="chr-proof__facts">
                    {facts.map((fact) => (
                      <li key={fact}>{fact}</li>
                    ))}
                  </ul>
                  <div className="chr-actions">
                    {requestButton}
                    <a className="chr-btn" href={copy.finale.whatsapp} target="_blank" rel="noopener noreferrer">
                      <span>{t.trust.askWhatsapp}</span>
                    </a>
                  </div>
                </div>
              </Scene>
            </div>
          </div>
        </section>

        {/* Epilogue — a short closing: the request is already one step back */}
        <section className="chr-epilogue" aria-labelledby="chr-epilogue-title">
          <div className="chr-epilogue__copy" data-chr-reveal>
            <Eyebrow>{t.epilogue.eyebrow}</Eyebrow>
            <h2 id="chr-epilogue-title" className="chr-display chr-display--l">
              <span className="chr-line">
                <AnimaSplitLine line={0}>{t.epilogue.lines[0]}</AnimaSplitLine>
              </span>{" "}
              <span className="chr-line">
                <AnimaSplitLine line={1}>{t.epilogue.lines[1]}</AnimaSplitLine>
              </span>
            </h2>
            <p className="chr-support">{charter.overviewIntro || t.epilogue.body}</p>
            <p className="chr-support">
              {t.epilogue.scheduled.before}{" "}
              <Link className="chr-epilogue__voyages" href={localHref("/voyages")}>
                {t.epilogue.scheduled.link}
              </Link>{" "}
              {t.epilogue.scheduled.after}
            </p>
            <div className="chr-actions chr-actions--grid">
              {requestButton}
              <AvailabilityButton />
              <a className="chr-btn" href={copy.finale.whatsapp} target="_blank" rel="noopener noreferrer">
                <span>WhatsApp</span>
              </a>
              <a className="chr-btn" href={`mailto:${copy.finale.email}`}>
                <span>{t.epilogue.email}</span>
              </a>
            </div>
            <p className="chr-epilogue__desk">
              <a className="chr-link" href={copy.finale.phoneHref}>
                {copy.finale.phone}
              </a>
              <a className="chr-link" href={`mailto:${copy.finale.email}`}>
                {copy.finale.email}
              </a>
              <span className="chr-meta">{t.hours}</span>
            </p>
          </div>
          <div className="chr-epilogue__photos">
            <CharterMedia slot="home-story-dining" alt={t.epilogue.photoAlts[0]} className="chr-photo" />
            <CharterMedia
              slot="charter-rhythm"
              alt={t.epilogue.photoAlts[1]}
              className="chr-photo"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
