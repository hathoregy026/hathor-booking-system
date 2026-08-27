"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { AnimaSplitLine } from "@/components/public/AnimaSplitLine";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useTypographySettings } from "@/components/public/TypographySettingsProvider";
import { usePartnersEditorialScroll } from "@/hooks/usePartnersEditorialScroll";
import { HOMEPAGE_PARTNERS } from "@/lib/homepage-content";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";
import {
  normalizeOptionalText,
  stackedHeroLines,
} from "@/lib/website-text-shared";

function PartnersMedia({
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
      className={`pn-media ${className}`}
      style={
        ratio ? ({ ["--pn-ratio" as string]: ratio } as CSSProperties) : undefined
      }
    >
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes="(max-width: 950px) 100vw, 70vw"
        quality={SITE_IMAGE_QUALITY}
        className="pn-media__image"
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
    <div className={`pn-flip pn-flip--${axis} ${className}`} data-pn-flip>
      <PartnersMedia
        slot={front}
        alt={frontAlt}
        className="pn-flip__base"
        ratio={ratio}
      />
      <PartnersMedia
        slot={back}
        alt={backAlt}
        className="pn-flip__overlay"
        ratio={ratio}
      />
    </div>
  );
}

function Scene({
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section className={`pn-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="pn-eyebrow">({children})</p>;
}

/** Partner circle — roles describe how each name meets Hathor guests. */
const CIRCLE = [
  {
    number: "01",
    name: "Easy Trav Tourism",
    short: "Easy Trav",
    role: "Trade",
    region: "Egypt",
    note: "Destination craft and Nile itineraries shaped with local precision.",
    slot: "home-story-way-of-life",
  },
  {
    number: "02",
    name: "Booking",
    short: "Booking",
    role: "Global",
    region: "Reservations",
    note: "Worldwide discovery that brings travellers to an intimate dahabiya.",
    slot: "room-suite",
  },
  {
    number: "03",
    name: "Expedia",
    short: "Expedia",
    role: "Worldwide",
    region: "Discovery",
    note: "A considered path from first search to a voyage on the river.",
    slot: "home-voyage-nile-majesty",
  },
  {
    number: "04",
    name: "X Luxury Hospitality",
    short: "X Luxury",
    role: "Luxury",
    region: "Concierge",
    note: "Hospitality standards aligned with Hathor's quiet, personal care.",
    slot: "room-royal",
  },
] as const;

export function PartnersPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { pages } = useWebsiteText();
  const partners = pages.partners;
  const typography = useTypographySettings();
  const partnersHero = resolveHeroPageCopy(typography, "partners");
  const heroLines = stackedHeroLines(partnersHero.main, partnersHero.second);
  const lineClass = ["pn-line--a", "pn-line--b", "pn-line--c"] as const;
  usePartnersEditorialScroll({ rootRef, runRef, trackRef });

  const lead =
    normalizeOptionalText(partners.lead) ??
    "We sail with trusted names in travel and hospitality, partners who share our care for the Nile and our guests.";

  const circleNames =
    HOMEPAGE_PARTNERS.partners.length > 0
      ? CIRCLE.map((item, index) => ({
          ...item,
          name: HOMEPAGE_PARTNERS.partners[index] ?? item.name,
        }))
      : [...CIRCLE];

  return (
    <div ref={rootRef} className="partners-editorial">
      <div className="pn-progress" aria-hidden="true">
        <i data-pn-progress />
      </div>

      <main>
        <section
          ref={runRef}
          className="pn-run"
          aria-label="Hathor travel and hospitality partners"
        >
          <div className="pn-stage">
            <div ref={trackRef} className="pn-track">
              {/* 01 — Opening: title + edge portrait, footer strip in flow */}
              <Scene className="pn-open">
                <div className="pn-open__grid">
                  <ol className="pn-open__spine" aria-label="Partner index">
                    {circleNames.map((item) => (
                      <li key={item.number}>
                        <span>{item.number}</span>
                        <em>{item.short}</em>
                      </li>
                    ))}
                  </ol>

                  <div className="pn-open__inner">
                    <Eyebrow>The circle</Eyebrow>

                    <div className="pn-open__title" id="partners" data-anima-title>
                      <h1 className="pn-display pn-display--xl wt-page-hero">
                        {heroLines.map((line, index) => (
                          <span
                            key={`${line}-${index}`}
                            className={`pn-line ${lineClass[index] ?? ""}`}
                          >
                            <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
                          </span>
                        ))}
                      </h1>
                    </div>

                    <p className="pn-open__count pn-edit">
                      <span>0{circleNames.length}</span>
                      <i aria-hidden="true" />
                      <span>names</span>
                    </p>
                  </div>

                  <PartnersMedia
                    slot="about-hero"
                    alt="Hathor Dahabiya on the Nile"
                    priority
                    className="pn-open__portrait"
                    ratio="4 / 5"
                  />
                </div>

                <footer className="pn-open__bar">
                  <p className="pn-open__mark">
                    Hathor Cruise <span className="pn-reg">®</span> 2026
                  </p>
                  <p className="pn-open__scroll">
                    Scroll
                    <i />
                  </p>
                  <nav className="pn-open__nav" aria-label="Partners page sections">
                    <a href="#circle">Circle</a>
                    <a href="#craft">Craft</a>
                    <a href="#converse">Converse</a>
                    <Link href="/contact">Contact</Link>
                  </nav>
                </footer>
              </Scene>

              {/* 02 — Image field: layered Nile imagery */}
              <Scene className="pn-gallery">
                <FlipImage
                  className="pn-gallery__main"
                  axis="left"
                  ratio="1279 / 860"
                  front="home-cinematic-still"
                  back="home-story-legacy-large"
                  frontAlt="Hathor on the river"
                  backAlt="Legacy on the Nile"
                />
                <FlipImage
                  className="pn-gallery__inset"
                  axis="up"
                  ratio="668 / 554"
                  front="room-luxury"
                  back="about-dining"
                  frontAlt="Cabin aboard Hathor"
                  backAlt="Dining aboard Hathor"
                />
                <p className="pn-gallery__caption">
                  <span>Aboard</span> Luxor — Aswan
                </p>
              </Scene>

              {/* 03 — Covenant with supporting photograph */}
              <Scene className="pn-covenant">
                <div className="pn-covenant__copy">
                  <Eyebrow>Shared standards</Eyebrow>
                  <div className="pn-covenant__statement" data-anima-title>
                    <h2 className="pn-edit pn-edit--xl">
                      <span className="pn-line">
                        <AnimaSplitLine line={0}>A private circle</AnimaSplitLine>
                      </span>
                      <span className="pn-line">
                        <AnimaSplitLine line={1}>of trusted names</AnimaSplitLine>
                      </span>
                      <span className="pn-line">
                        <AnimaSplitLine line={2}>on the Nile</AnimaSplitLine>
                      </span>
                    </h2>
                  </div>
                  <p className="pn-covenant__lead wt-page-body">{lead}</p>
                </div>
                <FlipImage
                  className="pn-covenant__media"
                  axis="right"
                  ratio="835 / 1100"
                  front="home-split-courtyard"
                  back="home-collage-living"
                  frontAlt="Life on deck aboard Hathor"
                  backAlt="Living spaces aboard Hathor"
                />
              </Scene>

              {/* 04 — Partner constellation with portrait peeks */}
              <Scene className="pn-orbit" id="circle">
                <header className="pn-orbit__head">
                  <Eyebrow>Trusted worldwide</Eyebrow>
                  <p className="pn-meta-copy">
                    Four partners. One standard of care for every Hathor guest.
                  </p>
                </header>

                <ol className="pn-orbit__list">
                  {circleNames.map((item) => (
                    <li key={item.number} className="pn-star">
                      <span className="pn-star__num">{item.number}</span>
                      <div className="pn-star__body">
                        <h3 className="pn-star__name pn-display">{item.name}</h3>
                        <p className="pn-star__meta">
                          {item.role} · {item.region}
                        </p>
                        <p className="pn-star__note">{item.note}</p>
                      </div>
                      <PartnersMedia
                        slot={item.slot}
                        alt={`${item.name} — Hathor partnership`}
                        className="pn-star__peek"
                        ratio="4 / 5"
                      />
                    </li>
                  ))}
                </ol>
              </Scene>

              {/* 05 — Craft essay: three images + copy, no absolute overlap */}
              <Scene className="pn-craft" id="craft">
                <div className="pn-craft__visual">
                  <FlipImage
                    className="pn-craft__tall"
                    axis="up"
                    ratio="668 / 920"
                    front="about-dining"
                    back="gastronomy-restaurant"
                    frontAlt="Fine dining aboard Hathor"
                    backAlt="Restaurant aboard Hathor Dahabiya"
                  />
                  <FlipImage
                    className="pn-craft__wide"
                    axis="left"
                    ratio="1090 / 720"
                    front="home-story-dining"
                    back="gastronomy-wine"
                    frontAlt="Dining atmosphere aboard Hathor"
                    backAlt="Wine service aboard Hathor"
                  />
                  <PartnersMedia
                    slot="home-amenities-1"
                    alt="Amenity detail aboard Hathor"
                    className="pn-craft__accent"
                    ratio="1 / 1"
                  />
                </div>
                <div className="pn-craft__copy">
                  <Eyebrow>Hospitality craft</Eyebrow>
                  <p className="pn-edit pn-edit--l" data-anima-title>
                    <span className="pn-line">
                      <AnimaSplitLine line={0}>Care that travels</AnimaSplitLine>
                    </span>
                    <span className="pn-line">
                      <AnimaSplitLine line={1}>with every booking</AnimaSplitLine>
                    </span>
                  </p>
                  <p className="pn-meta-copy">
                    From first enquiry to the last morning on deck, our partners
                    uphold the same quiet precision guests meet aboard Hathor.
                  </p>
                </div>
              </Scene>

              {/* 06 — Datum with photographic wash */}
              <Scene className="pn-datum">
                <PartnersMedia
                  slot="home-call-to-action"
                  alt=""
                  className="pn-datum__wash"
                  ratio="16 / 10"
                />
                <div className="pn-datum__frame">
                  <span className="pn-datum__corner pn-datum__corner--tl">
                    Partners
                  </span>
                  <span className="pn-datum__corner pn-datum__corner--tr">
                    Egypt &amp; beyond
                  </span>

                  <p className="pn-datum__figure pn-edit">
                    <span>0{circleNames.length}</span>
                    <i aria-hidden="true" />
                    <span>One</span>
                  </p>

                  <span className="pn-datum__corner pn-datum__corner--bl">
                    Hathor circle
                  </span>
                  <span className="pn-datum__corner pn-datum__corner--br">
                    Shared standard
                  </span>
                </div>
              </Scene>

              {/* 07 — Bridge: dual imagery + phrase */}
              <Scene className="pn-bridge">
                <div className="pn-bridge__pair">
                  <PartnersMedia
                    slot="home-story-craft-large"
                    alt="Craft and care aboard Hathor"
                    className="pn-bridge__media"
                    ratio="16 / 10"
                  />
                  <FlipImage
                    className="pn-bridge__side"
                    axis="up"
                    ratio="4 / 5"
                    front="home-alt-highlights"
                    back="home-wheel-image"
                    frontAlt="Nile highlights from Hathor"
                    backAlt="Wheel and river aboard Hathor"
                  />
                </div>
                <p className="pn-bridge__phrase pn-display pn-display--l">
                  Travel, thoughtfully
                  <br />
                  connected.
                </p>
              </Scene>
            </div>
          </div>
        </section>

        <section className="pn-epilogue" id="converse">
          <header className="pn-epilogue__head">
            <Eyebrow>Begin a conversation</Eyebrow>
            <h2 className="pn-display pn-display--l" data-anima-title>
              <span className="pn-line">
                <AnimaSplitLine line={0}>Collaborate with</AnimaSplitLine>
              </span>
              <span className="pn-line">
                <AnimaSplitLine line={1}>Hathor</AnimaSplitLine>
              </span>
            </h2>
          </header>

          <div className="pn-epilogue__pair">
            <PartnersMedia
              slot="room-royal"
              alt="Royal Suite aboard Hathor"
              ratio="668 / 554"
            />
            <PartnersMedia
              slot="about-dining"
              alt="Dining aboard Hathor"
              ratio="668 / 720"
            />
          </div>

          <div className="pn-epilogue__board">
            <div className="pn-epilogue__statement">
              <p className="pn-edit pn-edit--l">
                For collaborations, representation, and considered travel
                partnerships, speak with the Hathor team in Cairo.
              </p>
              <div className="pn-epilogue__pills">
                <Link href="/contact" className="pn-btn pn-btn--solid">
                  <span>Contact Hathor</span>
                </Link>
                <BookNowTrigger className="pn-btn">
                  <span>Book a voyage</span>
                </BookNowTrigger>
              </div>
              <p className="pn-meta-copy">
                Representation and trade enquiries · Cairo office
              </p>
            </div>

            <aside className="pn-epilogue__card">
              <span className="pn-card__tag">(Circle)</span>
              <PartnersMedia
                slot="contact-hero"
                alt="Hathor Dahabiya on the Nile"
                className="pn-epilogue__card-media"
                ratio="356 / 460"
              />
              <h3 className="pn-display">Partners</h3>
              <p className="pn-epilogue__card-body">
                Trusted names who share
                <br />
                our care for every guest
              </p>
              <div className="pn-epilogue__card-links">
                <Link className="pn-link" href="/about">
                  About Hathor
                </Link>
                <Link className="pn-link" href="/contact">
                  Write to us
                </Link>
              </div>
            </aside>
          </div>

          <div className="pn-epilogue__legal">
            <span>
              Hathor Cruise <span className="pn-reg">®</span> 2026
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
