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
import { useWellnessEditorialScroll } from "@/hooks/useWellnessEditorialScroll";
import { WELLNESS_PAGE } from "@/lib/page-content";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";
import { stackedHeroLines } from "@/lib/website-text-shared";

function WellnessMedia({
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
      className={`we-media ${className}`}
      style={
        ratio ? ({ ["--we-ratio" as string]: ratio } as CSSProperties) : undefined
      }
    >
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes="(max-width: 950px) 100vw, 70vw"
        quality={SITE_IMAGE_QUALITY}
        className="we-media__image"
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
    <div className={`we-flip we-flip--${axis} ${className}`} data-we-flip>
      <WellnessMedia slot={front} alt={frontAlt} className="we-flip__base" ratio={ratio} />
      <WellnessMedia slot={back} alt={backAlt} className="we-flip__overlay" ratio={ratio} />
    </div>
  );
}

function Scene({
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section className={`we-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="we-eyebrow">({children})</p>;
}

const PRINCIPLES = [
  {
    number: "01",
    count: "Spa",
    title: "Restore",
    text: "A quiet spa ritual shaped around Egyptian botanicals, warm touch, and the unhurried cadence of the Nile.",
    slot: "wellness-hero",
  },
  {
    number: "02",
    count: "Gym",
    title: "Move",
    text: "Panoramic training in Historia Fitness, with considered equipment and a river horizon that makes every breath feel lighter.",
    slot: "wellness-fitness",
  },
  {
    number: "03",
    count: "Rest",
    title: "Repose",
    text: "Private suites become part of the ritual: deep sleep, soft morning light, generous bathrooms, and space to return to yourself.",
    slot: "room-royal",
  },
] as const;

const RITUALS = [
  {
    number: "01",
    meta: "Daily",
    place: "Seneb Spa",
    title: "Spa",
    slot: "wellness-hero",
    href: "#reserve",
    tone: "cream",
  },
  {
    number: "02",
    meta: "Daily",
    place: "Historia",
    title: "Fitness",
    slot: "wellness-fitness",
    href: "#fitness",
    tone: "ink",
  },
  {
    number: "03",
    meta: "Private",
    place: "Suites",
    title: "Rest",
    slot: "room-royal",
    href: "/suites",
    tone: "gold",
  },
] as const;

export function WellnessEditorialPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { pages } = useWebsiteText();
  const wellness = pages.wellness;
  const typography = useTypographySettings();
  const wellnessHero = resolveHeroPageCopy(typography, "wellness");
  const wellnessHeroLines = stackedHeroLines(wellnessHero.main, wellnessHero.second);
  const wellnessLineClass = ["we-line--a", "we-line--b", "we-line--c"] as const;
  useWellnessEditorialScroll({ rootRef, runRef, trackRef });

  const introBody =
    wellness.heroSupport.trim() || WELLNESS_PAGE.hero.subtitle;
  const spaLead =
    wellness.spaParagraphs[0]?.trim() || WELLNESS_PAGE.spa.paragraphs[0];
  const spaSecond =
    wellness.spaParagraphs[1]?.trim() || WELLNESS_PAGE.spa.paragraphs[1];
  const spaBody =
    wellness.spaParagraphs.slice(1).join(" ").trim() ||
    WELLNESS_PAGE.spa.paragraphs.slice(1).join(" ");
  const fitnessTitle =
    wellness.fitnessTitle.trim() || WELLNESS_PAGE.fitness.title;
  const fitnessBody =
    wellness.fitnessBody.trim() || WELLNESS_PAGE.fitness.body;
  const spaTitle = wellness.spaTitle.trim() || WELLNESS_PAGE.spa.title;

  return (
    <div ref={rootRef} className="wellness-editorial">
      <div className="we-progress" aria-hidden="true">
        <i data-we-progress />
      </div>

      <main>
        <section
          ref={runRef}
          className="we-run"
          aria-label="Hathor wellness journey"
        >
          <div className="we-stage">
            <div ref={trackRef} className="we-track">
              {/* 01 — Editorial introduction */}
              <Scene className="we-intro">
                <nav className="we-intro__nav" aria-label="Wellness page sections">
                  <a href="#wellness">Wellness</a>
                  <a href="#ritual">Ritual</a>
                  <a href="#fitness">Fitness</a>
                  <a href="#reserve">Reserve</a>
                </nav>

                <div className="we-intro__inner">
                  <Eyebrow>Wellness</Eyebrow>

                  <div className="we-intro__title" id="wellness" data-anima-title>
                    <h1 className="we-display we-display--xl wt-page-hero">
                      {wellnessHeroLines.map((line, index) => (
                        <span
                          key={`${line}-${index}`}
                          className={`we-line ${wellnessLineClass[index] ?? ""}`}
                        >
                          <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
                        </span>
                      ))}
                    </h1>
                  </div>

                  <p className="we-intro__body wt-page-body">{introBody}</p>
                </div>

                <p className="we-intro__mark">
                  Hathor Cruise <span className="we-reg">®</span> 2026
                </p>
                <p className="we-intro__scroll">
                  <i />
                  Scroll
                </p>
              </Scene>

              {/* 02 — Image lead */}
              <Scene className="we-lead">
                <WellnessMedia
                  slot="wellness-hero"
                  alt="Seneb Spa aboard Hathor"
                  priority
                  className="we-lead__main"
                />
                <FlipImage
                  className="we-lead__inset"
                  axis="left"
                  ratio="835 / 557"
                  front="room-suite"
                  back="wellness-fitness"
                  frontAlt="Suite prepared for rest aboard Hathor"
                  backAlt="Historia Fitness overlooking the Nile"
                />
                <p className="we-lead__caption">
                  <span>(Seneb)</span> Spa · Fitness · Rest
                </p>
              </Scene>

              {/* 03 — Manifesto */}
              <Scene className="we-manifesto">
                <div className="we-manifesto__aside">
                  <Eyebrow>The ritual</Eyebrow>
                  <p className="we-meta-copy">{spaLead}</p>
                </div>
                <div className="we-manifesto__headline" data-anima-title>
                  <h2 className="we-edit we-edit--xl">
                    <span className="we-line">
                      <AnimaSplitLine line={0}>Spaces that invite</AnimaSplitLine>
                    </span>
                    <span className="we-line">
                      <AnimaSplitLine line={1}>the body to</AnimaSplitLine>
                    </span>
                    <span className="we-line we-line--indent">
                      <AnimaSplitLine line={2}>release and recover</AnimaSplitLine>
                    </span>
                  </h2>
                </div>
              </Scene>

              {/* 04 — Asymmetric collage */}
              <Scene className="we-collage">
                <FlipImage
                  className="we-collage__tile we-collage__tile--one"
                  axis="up"
                  ratio="668 / 554"
                  front="room-royal"
                  back="room-suite"
                  frontAlt="Royal suite calm aboard Hathor"
                  backAlt="Suite details aboard Hathor"
                />
                <FlipImage
                  className="we-collage__tile we-collage__tile--two"
                  axis="right"
                  ratio="1090 / 960"
                  front="wellness-fitness"
                  back="wellness-hero"
                  frontAlt="Fitness with Nile views"
                  backAlt="Private wellness ritual"
                />
                <p className="we-collage__copy we-meta-copy">{spaSecond}</p>
              </Scene>

              {/* 05 — Numbered principles */}
              <Scene className="we-principles" id="ritual">
                <div className="we-principles__head">
                  <Eyebrow>Three pillars</Eyebrow>
                  <p className="we-meta-copy">
                    Every moment aboard Hathor is designed as part of your
                    well-being — restore, move, and return to quiet.
                  </p>
                </div>

                <ol className="we-principles__list">
                  {PRINCIPLES.map((item) => (
                    <li className="we-principle" key={item.number}>
                      <span className="we-principle__num">{item.number}</span>
                      <h3 className="we-principle__word we-display">
                        {item.title}
                      </h3>
                      <p className="we-principle__count we-edit">{item.count}</p>
                      <p className="we-principle__copy">{item.text}</p>
                      <WellnessMedia
                        slot={item.slot}
                        alt={`${item.title} aboard Hathor`}
                        className="we-principle__peek"
                        ratio="4 / 5"
                      />
                    </li>
                  ))}
                </ol>
              </Scene>

              {/* 06 — Museum wall cards */}
              {RITUALS.map((ritual) => (
                <Scene
                  className={`we-card we-card--${ritual.tone}`}
                  key={ritual.number}
                >
                  <div className="we-card__frame">
                    <WellnessMedia
                      slot={ritual.slot}
                      alt={`${ritual.title} aboard Hathor`}
                      className="we-card__media"
                      ratio="1279 / 820"
                    />

                    <div className="we-card__plate">
                      <span className="we-card__corner we-card__corner--tl we-edit">
                        {ritual.meta}
                      </span>
                      <span className="we-card__corner we-card__corner--tr">
                        {ritual.place}
                      </span>

                      <h2 className="we-card__title we-display" data-anima-title>
                        {ritual.title}
                      </h2>

                      <span className="we-card__corner we-card__corner--bl">
                        {ritual.number}
                      </span>
                      <Link
                        className="we-btn we-card__corner we-card__corner--br"
                        href={ritual.href}
                      >
                        <span>The experience</span>
                      </Link>
                    </div>
                  </div>
                </Scene>
              ))}

              {/* 07 — Editorial split: spa + fitness */}
              <Scene className="we-dining" id="fitness">
                <div className="we-dining__media">
                  <WellnessMedia
                    slot="wellness-hero"
                    alt="Seneb Spa aboard Hathor"
                    className="we-dining__main"
                    ratio="1090 / 960"
                  />
                  <FlipImage
                    className="we-dining__stack"
                    axis="left"
                    ratio="668 / 554"
                    front="wellness-fitness"
                    back="room-luxury"
                    frontAlt="Historia Fitness aboard Hathor"
                    backAlt="Luxury suite repose"
                  />
                </div>

                <div className="we-dining__copy">
                  <Eyebrow>{fitnessTitle}</Eyebrow>
                  <div data-anima-title>
                    <h2 className="we-edit we-edit--l">
                      <span className="we-line">
                        <AnimaSplitLine line={0}>Train with a view</AnimaSplitLine>
                      </span>
                      <span className="we-line">
                        <AnimaSplitLine line={1}>on Egypt&rsquo;s finest</AnimaSplitLine>
                      </span>
                      <span className="we-line we-line--indent">
                        <AnimaSplitLine line={2}>dahabiya</AnimaSplitLine>
                      </span>
                    </h2>
                  </div>
                  <p className="we-meta-copy wt-page-body">{fitnessBody}</p>
                  <p className="we-meta-copy">{spaBody}</p>
                  <BookNowTrigger className="we-btn">
                    <span>Request availability</span>
                  </BookNowTrigger>
                </div>
              </Scene>

              {/* 08 — Closing frame */}
              <Scene className="we-closing">
                <FlipImage
                  className="we-closing__media"
                  axis="up"
                  ratio="1483 / 960"
                  front="home-voyage-nile-majesty"
                  back="home-call-to-action"
                  frontAlt="Hathor journeying through Egypt"
                  backAlt="Golden hour aboard Hathor"
                />
                <div className="we-closing__copy">
                  <Eyebrow>Next</Eyebrow>
                  <p className="we-display we-display--l wt-page-title">
                    Begin your Nile return
                  </p>
                </div>
              </Scene>
            </div>
          </div>
        </section>

        {/* Epilogue — always vertical */}
        <section className="we-epilogue" id="reserve">
          <header className="we-epilogue__head">
            <Eyebrow>Reserve</Eyebrow>
            <h2 className="we-display we-display--xl" data-anima-title>
              <span className="we-line">
                <AnimaSplitLine line={0}>Wellness at</AnimaSplitLine>
              </span>
              <span className="we-line we-line--indent">
                <AnimaSplitLine line={1}>its most personal</AnimaSplitLine>
              </span>
            </h2>
          </header>

          <div className="we-epilogue__pair">
            <WellnessMedia
              slot="wellness-fitness"
              alt="Historia Fitness experience"
              ratio="668 / 554"
            />
            <WellnessMedia
              slot="wellness-hero"
              alt="Seneb Spa experience"
              ratio="668 / 720"
            />
          </div>

          <div className="we-epilogue__board">
            <div className="we-epilogue__statement">
              <p className="we-edit we-edit--l">{spaTitle}</p>
              <div className="we-epilogue__pills">
                <BookNowTrigger className="we-btn we-btn--solid">
                  Book Now
                </BookNowTrigger>
                <Link href="/suites" className="we-btn">
                  <span>Explore suites</span>
                </Link>
              </div>
              <p className="we-meta-copy">
                Tell us how you want to feel on the Nile. Our team will help
                shape a private voyage with time for Seneb Spa, Historia Fitness,
                and restorative suite rituals.
              </p>
            </div>

            <aside className="we-epilogue__card">
              <span className="we-card__tag">(Nile)</span>
              <WellnessMedia
                slot="room-royal"
                alt="Hathor Royal Suite"
                className="we-epilogue__card-media"
                ratio="356 / 460"
              />
              <h3 className="we-display">Royal</h3>
              <p className="we-epilogue__card-body">
                Privacy and renewal
                <br />
                beside a changing Nile
              </p>
              <div className="we-epilogue__card-links">
                <a
                  className="we-link"
                  href="https://www.instagram.com/hathorcruise/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
                <a
                  className="we-link"
                  href="mailto:reservations@hathorcruise.com"
                >
                  reservations@hathorcruise.com
                </a>
              </div>
            </aside>
          </div>

          <div className="we-epilogue__legal">
            <span>
              Hathor Cruise <span className="we-reg">®</span> 2026
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
