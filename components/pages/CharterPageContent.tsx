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

const CHAPTER_INDEX = [
  { href: "#promise", label: "Promise" },
  { href: "#residence", label: "Residence" },
  { href: "#passages", label: "Passages" },
  { href: "#charter-request", label: "Request" },
] as const;

export function CharterPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { pages } = useWebsiteText();
  const charter = pages.charter;
  const typography = useTypographySettings();
  const charterHero = resolveHeroPageCopy(typography, "charter");
  const charterHeroLines = stackedHeroLines(charterHero.main, charterHero.second);
  const titleLineClass = ["chr-line--a", "chr-line--b", "chr-line--c"] as const;
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
              {/* 01 — Index prologue: vertical chapter rail + asymmetric title */}
              <Scene className="chr-index">
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

                <div className="chr-index__core">
                  <Eyebrow>{copy.hero.kicker}</Eyebrow>
                  <div className="chr-index__title" id="charter" data-anima-title>
                    <h1 className="chr-display chr-display--xl wt-page-hero">
                      {charterHeroLines.map((line, index) => (
                        <span
                          key={`${line}-${index}`}
                          className={`chr-line ${titleLineClass[index] ?? ""}`}
                        >
                          <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
                        </span>
                      ))}
                    </h1>
                  </div>
                  <p className="chr-index__lead wt-page-body">
                    {CHARTER_PAGE.hero.subtitle}
                  </p>
                </div>

                <div className="chr-index__meta">
                  <p className="chr-meta">Exclusive vessel</p>
                  <p className="chr-meta">Twelve guests · Three decks</p>
                </div>

                <p className="chr-index__scroll">
                  <i />
                  Scroll rightward
                </p>
              </Scene>

              {/* 02 — Vessel claim: immersive plane + sand wash */}
              <Scene className="chr-claim" id="promise">
                <CharterMedia
                  slot="charter-hero"
                  alt="Private Hathor Dahabiya charter on the Nile"
                  priority
                  className="chr-claim__media"
                  ratio="16 / 10"
                />
                <div className="chr-claim__wash">
                  <Eyebrow>The vessel is yours</Eyebrow>
                  <p className="chr-edit chr-edit--m">
                    {copy.hero.subhead}
                  </p>
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

              {/* 03 — Promise spine: staggered vertical pillars */}
              <Scene className="chr-spine">
                <header className="chr-spine__head">
                  <Eyebrow>{copy.value.kicker}</Eyebrow>
                  <h2 className="chr-display chr-display--m" data-anima-title>
                    <span className="chr-line">
                      <AnimaSplitLine line={0}>{copy.value.title}</AnimaSplitLine>
                    </span>
                  </h2>
                  <p className="chr-support">
                    {charter.benefitsIntro || copy.value.intro}
                  </p>
                </header>
                <div className="chr-spine__columns">
                  {copy.value.pillars.map((pillar, index) => (
                    <article
                      key={pillar.title}
                      className={`chr-spine__col chr-spine__col--${index + 1}`}
                    >
                      <span className="chr-spine__n chr-edit">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <CharterMedia
                        slot={pillar.image}
                        alt={pillar.title}
                        className="chr-spine__media"
                        ratio={index === 1 ? "3 / 4" : "4 / 5"}
                      />
                      <h3 className="chr-display">{pillar.title}</h3>
                      <p className="chr-support">{pillar.body}</p>
                    </article>
                  ))}
                </div>
              </Scene>

              {/* 04 — Residence specification wall */}
              <Scene className="chr-residence" id="residence">
                <header className="chr-residence__head">
                  <Eyebrow>{copy.fleet.kicker}</Eyebrow>
                  <h2 className="chr-display chr-display--l" data-anima-title>
                    <span className="chr-line">
                      <AnimaSplitLine line={0}>{copy.fleet.title}</AnimaSplitLine>
                    </span>
                  </h2>
                  <p className="chr-support">{copy.fleet.intro}</p>
                  <ul className="chr-residence__stats">
                    {copy.fleet.stats.map((stat) => (
                      <li key={stat}>{stat}</li>
                    ))}
                  </ul>
                </header>
                <div className="chr-residence__wall">
                  {copy.fleet.cards.map((card, index) => {
                    const count = card.capacity.match(/\d+/)?.[0] ?? String(index + 1);
                    return (
                      <article key={card.title} className="chr-datum">
                        <div className="chr-datum__frame">
                          <span className="chr-datum__corner chr-datum__corner--tl">
                            {card.detail}
                          </span>
                          <span className="chr-datum__corner chr-datum__corner--tr">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <p className="chr-datum__count chr-edit">{count}</p>
                          <h3 className="chr-display">{card.title}</h3>
                          <p className="chr-support">{card.body}</p>
                          <ul className="chr-datum__amenities">
                            {card.amenities.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                          <Link className="chr-link" href={card.href}>
                            {card.hrefLabel}
                          </Link>
                          <CharterMedia
                            slot={card.image}
                            alt={card.title}
                            className="chr-datum__peek"
                            ratio="5 / 4"
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
                <p className="chr-residence__outro chr-support">{copy.fleet.outro}</p>
              </Scene>

              {/* 05 — Craft strip: bespoke experiences as layered essay */}
              <Scene className="chr-craft">
                <header className="chr-craft__head">
                  <Eyebrow>{copy.experiences.kicker}</Eyebrow>
                  <h2 className="chr-display chr-display--m" data-anima-title>
                    <span className="chr-line">
                      <AnimaSplitLine line={0}>
                        {copy.experiences.title}
                      </AnimaSplitLine>
                    </span>
                  </h2>
                </header>
                <div className="chr-craft__strip">
                  {copy.experiences.items.map((item, index) => (
                    <article
                      key={item.title}
                      className={`chr-craft__tile chr-craft__tile--${index + 1}`}
                    >
                      <CharterMedia
                        slot={item.image}
                        alt={item.title}
                        className="chr-craft__media"
                        ratio={index % 2 === 0 ? "3 / 4" : "4 / 5"}
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

              {/* 06 — Passage river: interactive route ribbon */}
              <Scene className="chr-river" id="passages">
                <header className="chr-river__head">
                  <Eyebrow>{copy.passages.kicker}</Eyebrow>
                  <h2 className="chr-display chr-display--l" data-anima-title>
                    <span className="chr-line">
                      <AnimaSplitLine line={0}>{copy.passages.title}</AnimaSplitLine>
                    </span>
                  </h2>
                  <p className="chr-support">{copy.passages.lead}</p>
                  <p className="chr-river__pref chr-edit">
                    Preferred · {preferredRoute}
                  </p>
                </header>
                <div className="chr-river__line" aria-hidden="true" />
                <div className="chr-river__routes" role="list">
                  {copy.passages.routes.map((route, index) => {
                    const active = preferredRoute === route;
                    return (
                      <button
                        key={route}
                        type="button"
                        role="listitem"
                        className={`chr-passage${active ? " is-active" : ""}`}
                        onClick={() => selectRoute(route)}
                      >
                        <span className="chr-passage__n">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="chr-passage__route chr-display">
                          {route}
                        </span>
                        <span className="chr-passage__cta">
                          {active ? "Selected · Request quote" : "Secure this passage"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Scene>

              {/* 07 — Chronology: three measured steps */}
              <Scene className="chr-chrono">
                <header className="chr-chrono__head">
                  <Eyebrow>{copy.process.kicker}</Eyebrow>
                  <h2 className="chr-display chr-display--m" data-anima-title>
                    <span className="chr-line">
                      <AnimaSplitLine line={0}>{copy.process.title}</AnimaSplitLine>
                    </span>
                  </h2>
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
                <FlipImage
                  className="chr-chrono__media"
                  axis="up"
                  ratio="5 / 4"
                  front="charter-rhythm"
                  back="charter-service"
                  frontAlt="Unhurried sailing rhythm along the Nile"
                  backAlt="Dedicated hospitality aboard Hathor"
                />
              </Scene>

              {/* 08 — Confidence archive */}
              <Scene className="chr-archive">
                <header className="chr-archive__head">
                  <Eyebrow>{copy.trust.kicker}</Eyebrow>
                  <h2 className="chr-display chr-display--l" data-anima-title>
                    <span className="chr-line">
                      <AnimaSplitLine line={0}>{copy.trust.title}</AnimaSplitLine>
                    </span>
                  </h2>
                </header>
                <ul className="chr-archive__facts">
                  {(charter.benefits.length ? charter.benefits : copy.trust.facts).map(
                    (fact) => (
                      <li key={fact}>{fact}</li>
                    ),
                  )}
                </ul>
                <div className="chr-archive__quotes">
                  {copy.trust.quotes.map((item) => (
                    <figure key={item.attribution} className="chr-quote">
                      <blockquote className="chr-edit">{item.quote}</blockquote>
                      <cite>{item.attribution}</cite>
                    </figure>
                  ))}
                </div>
              </Scene>
            </div>
          </div>
        </section>

        {/* Epilogue — always vertical: request + concierge */}
        <section className="chr-epilogue" aria-labelledby="chr-epilogue-title">
          <header className="chr-epilogue__head">
            <Eyebrow>Private concierge</Eyebrow>
            <h2
              id="chr-epilogue-title"
              className="chr-display chr-display--l"
              data-anima-title
            >
              {copy.finale.title}
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
