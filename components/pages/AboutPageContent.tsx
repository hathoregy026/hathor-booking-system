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
import { useAboutEditorialFlow } from "@/hooks/useAboutEditorialFlow";
import { ABOUT_PAGE } from "@/lib/page-content";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";

function AboutMedia({
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
      className={`ab-media ${className}`}
      style={
        ratio ? ({ ["--ab-ratio" as string]: ratio } as CSSProperties) : undefined
      }
    >
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes="(max-width: 950px) 100vw, 70vw"
        quality={SITE_IMAGE_QUALITY}
        className="ab-media__image"
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
    <div className={`ab-flip ab-flip--${axis} ${className}`} data-ab-flip>
      <AboutMedia slot={front} alt={frontAlt} className="ab-flip__base" ratio={ratio} />
      <AboutMedia slot={back} alt={backAlt} className="ab-flip__overlay" ratio={ratio} />
    </div>
  );
}

function Scene({
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section className={`ab-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

/** Parenthesised eyebrow — the reference's signature label form. */
function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="ab-eyebrow">({children})</p>;
}

/** The numbered manifesto rows: a giant word, a number, a narrow column of copy. */
const PRINCIPLES = [
  {
    number: "01",
    count: "08",
    title: "Cabins",
    text: "Eight luxury cabins of refined comfort — 22 sqm of contemporary Nile living with ensuite bathrooms and smart systems.",
    slot: "room-luxury",
  },
  {
    number: "02",
    count: "02",
    title: "Suites",
    text: "Two elegant suites on the Lower Deck — 46 sqm of distinctive luxury with panoramic Nile views and private jacuzzi.",
    slot: "room-suite",
  },
  {
    number: "03",
    count: "02",
    title: "Royal",
    text: "Two magnificent Royal Suites on the Main Deck — 56 sqm, the crown jewel, designed for those who seek the extraordinary.",
    slot: "room-royal",
  },
] as const;

/** Full-panel wall cards: four data points pinned to the corners of the frame. */
const STAYS = [
  {
    number: "01",
    meta: "22 sqm",
    place: "Upper Deck",
    title: "Cabin",
    slot: "room-luxury",
    href: "/rooms",
    tone: "cream",
  },
  {
    number: "02",
    meta: "46 sqm",
    place: "Lower Deck",
    title: "Suite",
    slot: "room-suite",
    href: "/luxury-cabins-Nile-Cruise",
    tone: "ink",
  },
  {
    number: "03",
    meta: "56 sqm",
    place: "Main Deck",
    title: "Royal",
    slot: "room-royal",
    href: "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
    tone: "gold",
  },
] as const;

export function AboutPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { pages } = useWebsiteText();
  const about = pages.about;
  useAboutEditorialFlow({ rootRef, runRef, trackRef });

  const lead = about.intro[0] ?? ABOUT_PAGE.intro[0];
  const second = about.intro[1] ?? ABOUT_PAGE.intro[1];

  return (
    <div ref={rootRef} className="about-boring">
      <div className="ab-progress" aria-hidden="true">
        <i data-ab-progress />
      </div>

      <main>
        <section ref={runRef} className="ab-run" aria-label="About Hathor Dahabiya">
          <div className="ab-stage">
            <div ref={trackRef} className="ab-track">
              {/* 01 — Intro: a ragged three-part display setting */}
              <Scene className="ab-intro">
                <nav className="ab-intro__nav" aria-label="About page sections">
                  <a href="#about">About</a>
                  <a href="#stay">Stay</a>
                  <Link href="/gastronomy">Dining</Link>
                  <a href="#reserve">Reserve</a>
                </nav>

                <div className="ab-intro__inner">
                  <Eyebrow>About</Eyebrow>

                  <div className="ab-intro__title" id="about" data-anima-title>
                    <h1 className="ab-display ab-display--xl">
                      <span className="ab-line ab-line--a">
                        <AnimaSplitLine line={0}>Welcome aboard</AnimaSplitLine>
                      </span>
                      <span className="ab-line ab-line--b">
                        <AnimaSplitLine line={1}>Hathor</AnimaSplitLine>
                      </span>
                      <span className="ab-line ab-line--c">
                        <AnimaSplitLine line={2}>Dahabiya</AnimaSplitLine>
                      </span>
                    </h1>
                  </div>

                  <p className="ab-intro__body">{ABOUT_PAGE.hero.subtitle}</p>
                </div>

                <p className="ab-intro__mark">
                  Hathor Cruise <span className="ab-reg">®</span> 2026
                </p>
                <p className="ab-intro__scroll">
                  <i />
                  Scroll
                </p>
              </Scene>

              {/* 02 — Image lead with an overlapping second frame */}
              <Scene className="ab-lead">
                <AboutMedia
                  slot="about-hero"
                  alt="Hathor Dahabiya on the Nile"
                  priority
                  className="ab-lead__main"
                />
                <FlipImage
                  className="ab-lead__inset"
                  axis="left"
                  ratio="835 / 557"
                  front="room-suite"
                  back="about-dining"
                  frontAlt="Suite aboard Hathor"
                  backAlt="Dining aboard Hathor"
                />
                <p className="ab-lead__caption">
                  <span>(Aboard)</span> Three decks · Twelve guests
                </p>
              </Scene>

              {/* 03 — Manifesto */}
              <Scene className="ab-manifesto">
                <div className="ab-manifesto__aside">
                  <Eyebrow>The dahabiya</Eyebrow>
                  <p className="ab-meta-copy">{lead}</p>
                </div>
                <div className="ab-manifesto__headline" data-anima-title>
                  <h2 className="ab-edit ab-edit--xl">
                    <span className="ab-line">
                      <AnimaSplitLine line={0}>Experience Egypt</AnimaSplitLine>
                    </span>
                    <span className="ab-line">
                      <AnimaSplitLine line={1}>in a whole</AnimaSplitLine>
                    </span>
                    <span className="ab-line ab-line--indent">
                      <AnimaSplitLine line={2}>new light</AnimaSplitLine>
                    </span>
                  </h2>
                </div>
              </Scene>

              {/* 04 — Collage: two unequal tiles, deliberately off-grid */}
              <Scene className="ab-collage">
                <FlipImage
                  className="ab-collage__tile ab-collage__tile--one"
                  axis="up"
                  ratio="668 / 554"
                  front="home-story-way-of-life"
                  back="home-cinematic-still"
                  frontAlt="Life aboard Hathor"
                  backAlt="Hathor on the river"
                />
                <FlipImage
                  className="ab-collage__tile ab-collage__tile--two"
                  axis="right"
                  ratio="1090 / 960"
                  front="home-story-craft-large"
                  back="room-luxury"
                  frontAlt="Craft aboard Hathor"
                  backAlt="Cabin aboard Hathor"
                />
                <p className="ab-collage__copy ab-meta-copy">{second}</p>
              </Scene>

              {/* 05 — Numbered manifesto: giant word, number, narrow copy */}
              <Scene className="ab-principles" id="stay">
                <div className="ab-principles__head">
                  <Eyebrow>Accommodation</Eyebrow>
                  <p className="ab-meta-copy">{about.accommodationsIntro}</p>
                </div>

                <ol className="ab-principles__list">
                  {PRINCIPLES.map((item) => (
                    <li className="ab-principle" key={item.number}>
                      <span className="ab-principle__num">{item.number}</span>
                      <h3 className="ab-principle__word ab-display">
                        {item.title}
                      </h3>
                      <p className="ab-principle__count ab-edit">{item.count}</p>
                      <p className="ab-principle__copy">{item.text}</p>
                      <AboutMedia
                        slot={item.slot}
                        alt={`${item.title} aboard Hathor`}
                        className="ab-principle__peek"
                        ratio="4 / 5"
                      />
                    </li>
                  ))}
                </ol>
              </Scene>

              {/* 06 — Wall cards: one full-panel wash each, data at the corners */}
              {STAYS.map((stay) => (
                <Scene
                  className={`ab-card ab-card--${stay.tone}`}
                  key={stay.number}
                >
                  <div className="ab-card__frame">
                    <AboutMedia
                      slot={stay.slot}
                      alt={`${stay.title} aboard Hathor`}
                      className="ab-card__media"
                      ratio="1279 / 820"
                    />

                    <div className="ab-card__plate">
                      <span className="ab-card__corner ab-card__corner--tl ab-edit">
                        {stay.meta}
                      </span>
                      <span className="ab-card__corner ab-card__corner--tr">
                        {stay.place}
                      </span>

                      <h2 className="ab-card__title ab-display" data-anima-title>
                        {stay.title}
                      </h2>

                      <span className="ab-card__corner ab-card__corner--bl">
                        {stay.number}
                      </span>
                      <Link
                        className="ab-btn ab-card__corner ab-card__corner--br"
                        href={stay.href}
                      >
                        <span>The experience</span>
                      </Link>
                    </div>
                  </div>
                </Scene>
              ))}

              {/* 07 — Dining: stacked media against a display statement */}
              <Scene className="ab-dining">
                <div className="ab-dining__media">
                  <AboutMedia
                    slot="gastronomy-restaurant"
                    alt="Indoor restaurant aboard Hathor"
                    className="ab-dining__main"
                    ratio="1090 / 960"
                  />
                  <FlipImage
                    className="ab-dining__stack"
                    axis="left"
                    ratio="668 / 554"
                    front="gastronomy-wine"
                    back="about-dining"
                    frontAlt="Bar aboard Hathor"
                    backAlt="Fine dining aboard Hathor"
                  />
                </div>

                <div className="ab-dining__copy">
                  <Eyebrow>{about.diningTitle}</Eyebrow>
                  <div data-anima-title>
                    <h2 className="ab-edit ab-edit--l">
                      <span className="ab-line">
                        <AnimaSplitLine line={0}>Luxury dining</AnimaSplitLine>
                      </span>
                      <span className="ab-line">
                        <AnimaSplitLine line={1}>on Egypt&rsquo;s finest</AnimaSplitLine>
                      </span>
                      <span className="ab-line ab-line--indent">
                        <AnimaSplitLine line={2}>dahabiya</AnimaSplitLine>
                      </span>
                    </h2>
                  </div>
                  <p className="ab-meta-copy">{ABOUT_PAGE.diningPromo.body}</p>
                  <Link href="/gastronomy" className="ab-btn">
                    <span>Explore dining</span>
                  </Link>
                </div>
              </Scene>

              {/* 08 — Closing frame */}
              <Scene className="ab-closing">
                <FlipImage
                  className="ab-closing__media"
                  axis="up"
                  ratio="1483 / 960"
                  front="home-story-legacy-large"
                  back="home-split-courtyard"
                  frontAlt="Hathor legacy on the Nile"
                  backAlt="Hathor deck living"
                />
                <div className="ab-closing__copy">
                  <Eyebrow>Next</Eyebrow>
                  <p className="ab-display ab-display--l">Welcome aboard</p>
                </div>
              </Scene>
            </div>
          </div>
        </section>

        {/* Epilogue — always vertical, on the deepest wash */}
        <section className="ab-epilogue" id="reserve">
          <header className="ab-epilogue__head">
            <Eyebrow>Reserve</Eyebrow>
            <h2 className="ab-display ab-display--xl" data-anima-title>
              <span className="ab-line">
                <AnimaSplitLine line={0}>Timeless luxury</AnimaSplitLine>
              </span>
              <span className="ab-line ab-line--indent">
                <AnimaSplitLine line={1}>on the Nile</AnimaSplitLine>
              </span>
            </h2>
          </header>

          <div className="ab-epilogue__pair">
            <AboutMedia
              slot="room-royal"
              alt="Royal Suite experience"
              ratio="668 / 554"
            />
            <AboutMedia
              slot="about-dining"
              alt="Dining experience"
              ratio="668 / 720"
            />
          </div>

          <div className="ab-epilogue__board">
            <div className="ab-epilogue__statement">
              <p className="ab-edit ab-edit--l">{about.welcomeBody}</p>
              <div className="ab-epilogue__pills">
                <BookNowTrigger className="ab-btn ab-btn--solid">
                  Book Now
                </BookNowTrigger>
                <Link href="/cruises" className="ab-btn">
                  <span>Explore cruises</span>
                </Link>
              </div>
              <p className="ab-meta-copy">{about.diningOutro}</p>
            </div>

            <aside className="ab-epilogue__card">
              <span className="ab-card__tag">(Vessel)</span>
              <AboutMedia
                slot="about-hero"
                alt="Hathor Dahabiya"
                className="ab-epilogue__card-media"
                ratio="356 / 460"
              />
              <h3 className="ab-display">Dahabiya</h3>
              <p className="ab-epilogue__card-body">
                Three decks of stillness
                <br />
                on a private Nile cruise
              </p>
              <div className="ab-epilogue__card-links">
                <a
                  className="ab-link"
                  href="https://www.instagram.com/hathorcruise/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
                <a
                  className="ab-link"
                  href="mailto:reservations@hathorcruise.com"
                >
                  reservations@hathorcruise.com
                </a>
              </div>
            </aside>
          </div>

          <div className="ab-epilogue__legal">
            <span>
              Hathor Cruise <span className="ab-reg">®</span> 2026
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
