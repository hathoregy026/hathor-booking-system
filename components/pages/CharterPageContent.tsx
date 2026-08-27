"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { AnimaSplitLine } from "@/components/public/AnimaSplitLine";
import { CharterRequestForm } from "@/components/pages/charter/CharterRequestForm";
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

function CharterMedia({
  slot,
  alt,
  priority = false,
  className = "",
  ratio,
}: {
  slot: string;
  alt: string;
  priority?: boolean;
  className?: string;
  ratio?: string;
}) {
  const image = useSiteImage(slot);
  return (
    <figure
      className={`chr-media ${className}`}
      style={
        ratio ? ({ ["--chr-ratio" as string]: ratio } as CSSProperties) : undefined
      }
    >
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes="(max-width: 950px) 100vw, 70vw"
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
  ratio,
}: {
  front: string;
  back: string;
  frontAlt: string;
  backAlt?: string;
  className?: string;
  axis?: "up" | "left" | "right";
  ratio?: string;
}) {
  return (
    <div className={`chr-flip chr-flip--${axis} ${className}`} data-chr-flip>
      <CharterMedia slot={front} alt={frontAlt} className="chr-flip__base" ratio={ratio} />
      <CharterMedia slot={back} alt={backAlt} className="chr-flip__overlay" ratio={ratio} />
    </div>
  );
}

function Scene({
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section className={`chr-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="chr-eyebrow">{children}</p>;
}

/** Break a phrase into short whole-word lines (never mid-word). */
function phraseLines(text: string, wordsPerLine = 2): string[] {
  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length <= wordsPerLine) return text.trim() ? [text.trim()] : [];
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(" "));
  }
  return lines;
}

/** Whole-phrase title lines — never wrap mid-word. */
function TitleLines({
  lines,
  as: Tag = "h2",
  className = "chr-display chr-display--m",
}: {
  lines: string[];
  as?: "h1" | "h2";
  className?: string;
}) {
  const lineClass = ["chr-line--a", "chr-line--b", "chr-line--c", "chr-line--a"] as const;
  return (
    <Tag className={className} data-anima-title>
      {lines.map((line, index) => (
        <span
          key={`${line}-${index}`}
          className={`chr-line ${lineClass[index] ?? "chr-line--a"}`}
        >
          <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
        </span>
      ))}
    </Tag>
  );
}

const CHAPTER_INDEX = [
  { href: "#promise", label: "Promise" },
  { href: "#residence", label: "Residence" },
  { href: "#passages", label: "Passages" },
  { href: "#charter-request", label: "Request" },
] as const;

const VALUE_TITLE_LINES = ["Privacy.", "Flexibility.", "Care."] as const;

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
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { pages } = useWebsiteText();
  const charter = pages.charter;
  const typography = useTypographySettings();
  const charterHero = resolveHeroPageCopy(typography, "charter");
  const charterHeroLines = stackedHeroLines(charterHero.main, charterHero.second).flatMap(
    (line) => phraseLines(line, 2),
  );
  const routes = CHARTER_PAGE.overview.routes;
  const [preferredRoute, setPreferredRoute] = useState<string>(routes[0] ?? "");
  const copy = CHARTER_PRIVATE;

  useCharterEditorialScroll({ rootRef, runRef, trackRef });

  const selectRoute = (route: string) => {
    setPreferredRoute(route);
    document
      .getElementById("charter-request")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={rootRef} className="charter-editorial">
      <div className="chr-progress" aria-hidden="true">
        <i data-chr-progress />
      </div>

      <main>
        <section
          ref={runRef}
          className="chr-run"
          aria-label="Private charter aboard Hathor"
        >
          <div className="chr-stage">
            <div ref={trackRef} className="chr-track">
              {/* 01 — Index: title + edge image */}
              <Scene className="chr-index">
                <div className="chr-index__copy">
                  <ol className="chr-index__chapters" aria-label="Charter chapters">
                    {CHAPTER_INDEX.map((item, i) => (
                      <li key={item.href}>
                        <a href={item.href}>
                          <span>{String(i + 1).padStart(2, "0")}</span>
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ol>

                  <Eyebrow>{copy.hero.kicker}</Eyebrow>
                  <div className="chr-index__title" id="charter">
                    <TitleLines
                      as="h1"
                      className="chr-display chr-display--xl wt-page-hero"
                      lines={charterHeroLines}
                    />
                  </div>
                  <p className="chr-index__lead wt-page-body">
                    {CHARTER_PAGE.hero.subtitle}
                  </p>
                  <div className="chr-index__meta">
                    <p className="chr-meta">Exclusive vessel</p>
                    <p className="chr-meta">Twelve guests · Three decks</p>
                  </div>
                  <p className="chr-index__scroll">
                    <i />
                    Scroll rightward
                  </p>
                </div>

                <FlipImage
                  className="chr-index__visual"
                  axis="left"
                  ratio="4 / 5"
                  front="charter-hero"
                  back="about-hero"
                  frontAlt="Private Hathor Dahabiya on the Nile"
                  backAlt="Hathor Dahabiya sailing the Nile"
                />
              </Scene>

              {/* 02 — Vessel claim */}
              <Scene className="chr-claim" id="promise">
                <div className="chr-claim__visual">
                  <CharterMedia
                    slot="charter-hero"
                    alt="Private Hathor Dahabiya charter on the Nile"
                    priority
                    className="chr-claim__main"
                    ratio="16 / 10"
                  />
                  <FlipImage
                    className="chr-claim__inset"
                    axis="up"
                    ratio="4 / 5"
                    front="charter-privacy"
                    back="home-split-courtyard"
                    frontAlt="Private sun deck reserved for your party"
                    backAlt="Life aboard Hathor"
                  />
                </div>
                <div className="chr-claim__wash">
                  <Eyebrow>The vessel is yours</Eyebrow>
                  <p className="chr-edit chr-edit--m">{copy.hero.subhead}</p>
                  <div className="chr-claim__actions">
                    <a className="chr-btn" href="#charter-request">
                      <span>{copy.hero.primaryCta}</span>
                    </a>
                    <BookNowTrigger className="chr-btn chr-btn--solid">
                      <span>{copy.hero.secondaryCta}</span>
                    </BookNowTrigger>
                  </div>
                </div>
              </Scene>

              {/* 03 — Promise spine */}
              <Scene className="chr-spine">
                <header className="chr-spine__head">
                  <Eyebrow>{copy.value.kicker}</Eyebrow>
                  <TitleLines lines={[...VALUE_TITLE_LINES]} />
                  <p className="chr-support">
                    {charter.benefitsIntro || copy.value.intro}
                  </p>
                </header>
                <div className="chr-spine__columns">
                  {copy.value.pillars.map((pillar, index) => (
                    <article key={pillar.title} className="chr-spine__col">
                      <CharterMedia
                        slot={pillar.image}
                        alt={pillar.title}
                        className="chr-spine__media"
                        ratio="4 / 5"
                      />
                      <span className="chr-spine__n chr-edit">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="chr-display">{pillar.title}</h3>
                      <p className="chr-support">{pillar.body}</p>
                    </article>
                  ))}
                </div>
              </Scene>

              {/* 04 — Residence wall */}
              <Scene className="chr-residence" id="residence">
                <header className="chr-residence__head">
                  <Eyebrow>{copy.fleet.kicker}</Eyebrow>
                  <TitleLines
                    className="chr-display chr-display--l"
                    lines={["Our", "Accommodations"]}
                  />
                  <p className="chr-support">{copy.fleet.intro}</p>
                  <ul className="chr-residence__stats">
                    {copy.fleet.stats.map((stat) => (
                      <li key={stat}>{stat}</li>
                    ))}
                  </ul>
                </header>
                <div className="chr-residence__wall">
                  {copy.fleet.cards.map((card, index) => {
                    const count =
                      card.capacity.match(/\d+/)?.[0] ?? String(index + 1);
                    return (
                      <article key={card.title} className="chr-datum">
                        <CharterMedia
                          slot={card.image}
                          alt={card.title}
                          className="chr-datum__media"
                          ratio="5 / 4"
                        />
                        <div className="chr-datum__body">
                          <div className="chr-datum__top">
                            <p className="chr-datum__count chr-edit">{count}</p>
                            <span className="chr-meta">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </div>
                          <h3 className="chr-display">{card.title}</h3>
                          <p className="chr-meta">{card.detail}</p>
                          <p className="chr-support">{card.body}</p>
                          <ul className="chr-datum__amenities">
                            {card.amenities.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                          <Link className="chr-link" href={card.href}>
                            {card.hrefLabel}
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <p className="chr-residence__outro chr-support">{copy.fleet.outro}</p>
              </Scene>

              {/* 05 — Craft strip */}
              <Scene className="chr-craft">
                <header className="chr-craft__head">
                  <Eyebrow>{copy.experiences.kicker}</Eyebrow>
                  <TitleLines
                    lines={["Crafted for", "your party alone"]}
                  />
                </header>
                <div className="chr-craft__strip">
                  {copy.experiences.items.map((item, index) => (
                    <article key={item.title} className="chr-craft__tile">
                      <CharterMedia
                        slot={item.image}
                        alt={item.title}
                        className="chr-craft__media"
                        ratio="3 / 4"
                      />
                      <div className="chr-craft__copy">
                        <span className="chr-meta">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="chr-display">{item.title}</h3>
                        <p className="chr-support">{item.body}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </Scene>

              {/* 06 — Passage river with route imagery */}
              <Scene className="chr-river" id="passages">
                <div className="chr-river__aside">
                  <FlipImage
                    className="chr-river__hero"
                    axis="right"
                    ratio="4 / 5"
                    front="home-voyage-nile-majesty"
                    back="charter-itinerary"
                    frontAlt="Nile passage aboard Hathor"
                    backAlt="A voyage composed around your itinerary"
                  />
                </div>
                <div className="chr-river__main">
                  <header className="chr-river__head">
                    <Eyebrow>{copy.passages.kicker}</Eyebrow>
                    <TitleLines
                      className="chr-display chr-display--l"
                      lines={["Compose", "your route"]}
                    />
                    <p className="chr-support">{copy.passages.lead}</p>
                    <p className="chr-river__pref chr-edit">
                      Preferred · {preferredRoute}
                    </p>
                  </header>
                  <div className="chr-river__routes" role="list">
                    {copy.passages.routes.map((route, index) => {
                      const active = preferredRoute === route;
                      const image =
                        PASSAGE_IMAGES[index % PASSAGE_IMAGES.length];
                      return (
                        <button
                          key={route}
                          type="button"
                          role="listitem"
                          className={`chr-passage${active ? " is-active" : ""}`}
                          onClick={() => selectRoute(route)}
                        >
                          <CharterMedia
                            slot={image}
                            alt={route}
                            className="chr-passage__media"
                            ratio="1 / 1"
                          />
                          <span className="chr-passage__n">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="chr-passage__route chr-display">
                            {route}
                          </span>
                          <span className="chr-passage__cta">
                            {active
                              ? "Selected · Request quote"
                              : "Secure this passage"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Scene>

              {/* 07 — Chronology */}
              <Scene className="chr-chrono">
                <div className="chr-chrono__copy">
                  <header className="chr-chrono__head">
                    <Eyebrow>{copy.process.kicker}</Eyebrow>
                    <TitleLines lines={["Three", "measured steps"]} />
                  </header>
                  <ol className="chr-chrono__steps">
                    {copy.process.steps.map((step) => (
                      <li key={step.n} className="chr-step">
                        <span className="chr-step__n chr-edit">{step.n}</span>
                        <h3 className="chr-display">{step.title}</h3>
                        <p className="chr-support">{step.body}</p>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="chr-chrono__visuals">
                  <FlipImage
                    className="chr-chrono__media"
                    axis="up"
                    ratio="5 / 4"
                    front="charter-rhythm"
                    back="charter-service"
                    frontAlt="Unhurried sailing rhythm along the Nile"
                    backAlt="Dedicated hospitality aboard Hathor"
                  />
                  <CharterMedia
                    slot="gastronomy-celebration"
                    alt="Private celebration aboard Hathor"
                    className="chr-chrono__secondary"
                    ratio="4 / 5"
                  />
                </div>
              </Scene>

              {/* 08 — Confidence archive */}
              <Scene className="chr-archive">
                <div className="chr-archive__visuals">
                  <CharterMedia
                    slot="home-story-way-of-life"
                    alt="Life aboard a private Hathor charter"
                    className="chr-archive__media chr-archive__media--a"
                    ratio="4 / 5"
                  />
                  <CharterMedia
                    slot="home-story-dining"
                    alt="Private dining aboard Hathor"
                    className="chr-archive__media chr-archive__media--b"
                    ratio="3 / 4"
                  />
                </div>
                <div className="chr-archive__copy">
                  <header className="chr-archive__head">
                    <Eyebrow>{copy.trust.kicker}</Eyebrow>
                    <TitleLines
                      className="chr-display chr-display--l"
                      lines={["Quiet", "proof"]}
                    />
                  </header>
                  <ul className="chr-archive__facts">
                    {(charter.benefits.length
                      ? charter.benefits
                      : copy.trust.facts
                    ).map((fact) => (
                      <li key={fact}>{fact}</li>
                    ))}
                  </ul>
                  <div className="chr-archive__quotes">
                    {copy.trust.quotes.map((item) => (
                      <figure key={item.attribution} className="chr-quote">
                        <blockquote className="chr-edit">{item.quote}</blockquote>
                        <cite>{item.attribution}</cite>
                      </figure>
                    ))}
                  </div>
                </div>
              </Scene>
            </div>
          </div>
        </section>

        {/* Epilogue */}
        <section className="chr-epilogue" aria-labelledby="chr-epilogue-title">
          <header className="chr-epilogue__head">
            <Eyebrow>Private concierge</Eyebrow>
            <h2
              id="chr-epilogue-title"
              className="chr-display chr-display--l"
            >
              <span className="chr-line chr-line--a">
                <AnimaSplitLine line={0}>Your Journey,</AnimaSplitLine>
              </span>
              <span className="chr-line chr-line--b">
                <AnimaSplitLine line={1}>Redefined.</AnimaSplitLine>
              </span>
            </h2>
            <p className="chr-support">
              {charter.overviewIntro || copy.finale.body}
            </p>
            <p className="chr-epilogue__pref chr-edit">
              Preferred · {preferredRoute}
            </p>
          </header>

          <div className="chr-epilogue__board">
            <div className="chr-epilogue__compose">
              <CharterRequestForm
                preferredRoute={preferredRoute}
                routes={routes}
                onPreferredRouteChange={setPreferredRoute}
              />
            </div>

            <aside className="chr-epilogue__card">
              <span className="chr-eyebrow">Reservations</span>
              <CharterMedia
                slot="charter-rhythm"
                alt="Private Hathor charter at dusk on the Nile"
                className="chr-epilogue__media"
                ratio="356 / 460"
              />
              <CharterMedia
                slot="charter-service"
                alt="Dedicated crew aboard Hathor"
                className="chr-epilogue__media-alt"
                ratio="5 / 3"
              />
              <h3 className="chr-display">Begin the conversation</h3>
              <p className="chr-support">
                <a className="chr-link" href={copy.finale.phoneHref}>
                  {copy.finale.phone}
                </a>
                <br />
                <a className="chr-link" href={`mailto:${copy.finale.email}`}>
                  {copy.finale.email}
                </a>
                <br />
                <span className="chr-meta">{copy.finale.hours}</span>
              </p>
              <div className="chr-epilogue__pills">
                <a
                  className="chr-btn"
                  href={copy.finale.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>WhatsApp</span>
                </a>
                <a className="chr-btn" href={`mailto:${copy.finale.email}`}>
                  <span>Email</span>
                </a>
                <BookNowTrigger className="chr-btn chr-btn--solid">
                  <span>Book Now</span>
                </BookNowTrigger>
              </div>
            </aside>
          </div>

          <div className="chr-epilogue__legal">
            <span>
              Hathor Cruise <span className="chr-reg">®</span> 2026
            </span>
            <nav aria-label="Legal">
              <Link href="/contact">Privacy</Link>
              <Link href="/contact">Cookies</Link>
              <Link href="/contact">Legal</Link>
            </nav>
          </div>
        </section>
      </main>
    </div>
  );
}
