"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimaSplitLine } from "@/components/public/AnimaSplitLine";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useTypographySettings } from "@/components/public/TypographySettingsProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useVoyagesEditorialFlow } from "@/hooks/useVoyagesEditorialFlow";
import type { HomepageAccordionCruise } from "@/lib/homepage-accordion-cruises";
import { resolveVoyagePanelContent } from "@/lib/voyage-accordion-panels";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";
import { VOYAGES_PAGE } from "@/lib/voyages-page-content";
import {
  resolveCmsText,
  stackedHeroLines,
} from "@/lib/website-text-shared";

function splitTitleLines(value: string, fallback: string[]): string[] {
  const lines = value
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : fallback;
}

function VoyageMedia({
  slot,
  alt,
  priority = false,
  className = "",
  fit = "cover",
}: {
  slot: string;
  alt: string;
  priority?: boolean;
  className?: string;
  fit?: "cover" | "contain";
}) {
  const image = useSiteImage(slot);

  return (
    <figure
      className={`vb-media ${className}`}
      style={{ "--vb-fit": fit } as CSSProperties}
    >
      <Image
        src={image.src}
        alt={alt || image.alt}
        fill
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        sizes="(max-width: 950px) 100vw, 78vw"
        className="vb-media__image"
      />
    </figure>
  );
}

function Flip({
  front,
  back,
  frontAlt,
  backAlt,
  className = "",
  axis = "left",
  fit = "cover",
}: {
  front: string;
  back: string;
  frontAlt: string;
  backAlt: string;
  className?: string;
  axis?: "left" | "right" | "up";
  fit?: "cover" | "contain";
}) {
  return (
    <div className={`vb-flip vb-flip--${axis} ${className}`} data-vb-flip>
      <VoyageMedia slot={front} alt={frontAlt} className="vb-flip__base" fit={fit} />
      <VoyageMedia slot={back} alt={backAlt} className="vb-flip__over" fit={fit} />
    </div>
  );
}

function Scene({
  className = "",
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className={`vb-scene ${className}`} id={id}>
      {children}
    </section>
  );
}

function SplitTitle({
  lines,
  className = "",
}: {
  lines: string[];
  className?: string;
}) {
  return (
    <span className={className} data-vb-split>
      {lines.map((line, index) => (
        <span className="vb-split-line" data-line={line} key={`${line}-${index}`}>
          <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
        </span>
      ))}
    </span>
  );
}

function useFollowImage() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;

    const draw = () => {
      frame = 0;
      x += (targetX - x) * 0.14;
      y += (targetY - y) * 0.14;
      wrap.style.setProperty("--follow-x", `${x.toFixed(1)}px`);
      wrap.style.setProperty("--follow-y", `${y.toFixed(1)}px`);
      if (Math.abs(targetX - x) > 0.35 || Math.abs(targetY - y) > 0.35) {
        frame = requestAnimationFrame(draw);
      }
    };

    const move = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(draw);
    };

    wrap.addEventListener("pointermove", move, { passive: true });
    return () => {
      wrap.removeEventListener("pointermove", move);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return { wrapRef, active, setActive };
}

const VALUE_IMAGES = [
  "home-voyage-3n-aswan-luxor",
  "home-voyage-4n-luxor-aswan",
  "home-voyage-7n-roundtrip",
] as const;

export type VoyagesPageContentProps = {
  voyages: HomepageAccordionCruise[];
};

export function VoyagesPageContent({ voyages }: VoyagesPageContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { wrapRef, active, setActive } = useFollowImage();
  const itineraries = voyages.slice(0, 4);
  const { pages } = useWebsiteText();
  const copy = pages.voyages;
  const typography = useTypographySettings();
  const hero = resolveHeroPageCopy(typography, "voyages");
  const heroTitleLines = stackedHeroLines(hero.main, hero.second);
  const statementTitleLines = splitTitleLines(copy.statementTitle, [
    "Sail slowly",
    "Discover deeply",
    "Remember always",
  ]);
  const itinerariesTitleLines = splitTitleLines(copy.itinerariesTitle, [
    "The Nile",
    "Your rhythm",
  ]);
  const charterTitleLines = splitTitleLines(copy.charterTitle, [
    "Your river",
    "Your rhythm",
  ]);

  useVoyagesEditorialFlow({ rootRef, runRef, trackRef });

  return (
    <div ref={rootRef} className="voyages-boring">
      <div className="vb-progress" aria-hidden="true"><i data-vb-progress /></div>

      <main>
        <section ref={runRef} className="vb-run" aria-label="Hathor voyages">
          <div className="vb-stage">
            <div ref={trackRef} className="vb-track">
              <Scene className="vb-intro" id="voyages">
                <p className="vb-section-label">
                  {resolveCmsText(copy.heroLabel, VOYAGES_PAGE.opening.eyebrow)}
                </p>
                <h1 className="vb-intro__title vb-display wt-page-hero">
                  <SplitTitle
                    lines={
                      heroTitleLines.length > 0
                        ? heroTitleLines
                        : ["Our Voyages", "Shaped by", "The Nile"]
                    }
                  />
                </h1>
                <p className="vb-intro__lead">
                  {resolveCmsText(
                    copy.heroSupport,
                    VOYAGES_PAGE.hero.subtitle,
                  )}
                </p>
                <span className="vb-intro__scroll" aria-hidden="true">Scroll to sail <i>→</i></span>
              </Scene>

              <Scene className="vb-principal">
                <Flip
                  className="vb-principal__large"
                  axis="left"
                  front="cruises-hero"
                  back="about-hero"
                  frontAlt="Hathor at golden hour"
                  backAlt="Hathor sailing the Nile"
                />
                <Flip
                  className="vb-principal__small"
                  axis="up"
                  front="highlights-lifestyle"
                  back="home-story-way-of-life"
                  frontAlt="Life on deck"
                  backAlt="Quiet life aboard Hathor"
                />
              </Scene>

              <Scene className="vb-statement">
                <p className="vb-section-label">
                  {resolveCmsText(copy.statementLabel, "The Hathor way")}
                </p>
                <h2 className="vb-statement__title vb-display">
                  <SplitTitle lines={statementTitleLines} />
                </h2>
                <p className="vb-statement__body">
                  {resolveCmsText(
                    copy.statementBody,
                    VOYAGES_PAGE.opening.body[0] ?? "",
                  )}
                </p>
              </Scene>

              <Scene className="vb-image-story">
                <Flip
                  className="vb-image-story__wide"
                  axis="right"
                  front="gastronomy-table"
                  back="gastronomy-restaurant"
                  frontAlt="A table prepared aboard Hathor"
                  backAlt="Hathor restaurant"
                />
                <Flip
                  className="vb-image-story__portrait"
                  axis="up"
                  front="room-suite"
                  back="room-royal"
                  frontAlt="A Hathor suite"
                  backAlt="The Royal Suite"
                />
                <p className="vb-image-story__script">
                  {resolveCmsText(
                    copy.openingScript,
                    VOYAGES_PAGE.opening.script,
                  )}
                </p>
              </Scene>

              <Scene className="vb-ribbon">
                <div className="vb-ribbon__track">
                  <span>Intimate scale</span><i>✦</i><span>All-inclusive grace</span><i>✦</i>
                  <span>Private rhythm</span><i>✦</i><span>Intimate scale</span><i>✦</i>
                </div>
              </Scene>

              <Scene className="vb-secondary">
                <Flip
                  className="vb-secondary__portrait"
                  axis="left"
                  front="home-story-craft-large"
                  back="home-story-legacy-large"
                  frontAlt="The craft of Hathor"
                  backAlt="The Nile landscape"
                />
                <Flip
                  className="vb-secondary__landscape"
                  axis="up"
                  front="home-split-courtyard"
                  back="home-cinematic-still"
                  frontAlt="The river from Hathor"
                  backAlt="A suite aboard Hathor"
                />
              </Scene>

              <Scene className="vb-values">
                <div className="vb-values__wrap" ref={wrapRef}>
                  <p className="vb-section-label">The promise</p>
                  <ol className="vb-values__list">
                    {(copy.manifesto.length > 0
                      ? copy.manifesto
                      : VOYAGES_PAGE.manifesto
                    ).map((item, index) => (
                      <li
                        className="vb-values__item"
                        key={`${item.title}-${index}`}
                        onPointerEnter={() => setActive(index)}
                        onPointerLeave={() => setActive(-1)}
                      >
                        <span className="vb-values__number">0{index + 1}</span>
                        <h2 className="vb-values__title vb-display">{item.title}</h2>
                        <p className="vb-values__body">{item.body}</p>
                      </li>
                    ))}
                  </ol>
                  <div className={`vb-follow${active >= 0 ? " is-visible" : ""}`} aria-hidden="true">
                    {VALUE_IMAGES.map((slot, index) => (
                      <VoyageMedia
                        key={slot}
                        slot={slot}
                        alt=""
                        className={`vb-follow__image${active === index ? " is-active" : ""}`}
                      />
                    ))}
                  </div>
                </div>
              </Scene>

              <Scene className="vb-projects-intro" id="itineraries">
                <p className="vb-section-label">
                  {resolveCmsText(copy.itinerariesLabel, "Choose your passage")}
                </p>
                <h2 className="vb-projects-intro__title vb-display">
                  <SplitTitle lines={itinerariesTitleLines} />
                </h2>
                <p className="vb-projects-intro__body">
                  {resolveCmsText(
                    copy.itinerariesBody,
                    VOYAGES_PAGE.opening.body[1] ?? "",
                  )}
                </p>
              </Scene>

              {itineraries.map((voyage, index) => {
                const isCharter = voyage.slug === "nile-majesty";
                const panel = resolveVoyagePanelContent({
                  slug: voyage.slug,
                  name: voyage.name,
                  description: voyage.description,
                  href: voyage.href,
                });

                return (
                  <Scene className={`vb-project vb-project--${index + 1}`} key={voyage.id}>
                    <div className="vb-project__media-wrap">
                      <VoyageMedia
                        slot={voyage.imageName}
                        alt={voyage.name}
                        className="vb-project__media"
                        fit="contain"
                      />
                    </div>
                    <div className="vb-project__content">
                      <span className="vb-project__number">0{index + 1}</span>
                      <h2 className="vb-project__title vb-display">{panel.routeTitle}</h2>
                      <p className="vb-project__meta">
                        {isCharter ? "Private charter" : panel.durationLabel}
                        <i>—</i>
                        {isCharter ? "Custom itinerary" : voyage.ports}
                      </p>
                      <Link className="vb-project__link" href={panel.detailsHref}>
                        {isCharter ? "Explore private charter" : panel.detailsLabel}<span>↗</span>
                      </Link>
                    </div>
                  </Scene>
                );
              })}

              <Scene className="vb-charter">
                <div className="vb-charter__copy">
                  <p className="vb-section-label">
                    {resolveCmsText(
                      copy.charterLabel,
                      VOYAGES_PAGE.charter.eyebrow,
                    )}
                  </p>
                  <h2 className="vb-charter__title vb-display">
                    <SplitTitle lines={charterTitleLines} />
                  </h2>
                  <p className="vb-charter__script">
                    {resolveCmsText(
                      copy.charterScript,
                      VOYAGES_PAGE.charter.script,
                    )}
                  </p>
                  <Link className="vb-charter__link" href={VOYAGES_PAGE.charter.cta.href}>
                    {resolveCmsText(
                      copy.charterCta,
                      VOYAGES_PAGE.charter.cta.label,
                    )}
                    <span>→</span>
                  </Link>
                </div>
                <Flip
                  className="vb-charter__media"
                  axis="right"
                  front="home-voyage-nile-majesty"
                  back="home-call-to-action"
                  frontAlt="Hathor private charter"
                  backAlt="The Nile at golden hour"
                  fit="contain"
                />
              </Scene>
            </div>
          </div>
        </section>

        <section className="vb-reserve" id="reserve">
          <p className="vb-section-label">
            {resolveCmsText(copy.reserveLabel, "Begin your journey")}
          </p>
          <h2 className="vb-reserve__title vb-display">
            {resolveCmsText(copy.ctaTitle, VOYAGES_PAGE.cta.title)}
          </h2>
          <p className="vb-reserve__body">
            {resolveCmsText(copy.ctaBody, VOYAGES_PAGE.cta.body)}
          </p>
          <BookNowTrigger className="vb-reserve__button">
            {resolveCmsText(copy.ctaPrimary, VOYAGES_PAGE.cta.primary)}
          </BookNowTrigger>
        </section>
      </main>
    </div>
  );
}
