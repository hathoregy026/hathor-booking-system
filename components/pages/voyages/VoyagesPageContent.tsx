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
import { FavoriteButton } from "@/components/selection/FavoriteButton";
import { AddToVoyageButton } from "@/components/selection/AddToVoyageButton";
import { useVoyagesEditorialFlow } from "@/hooks/useVoyagesEditorialFlow";
import type { HomepageAccordionCruise } from "@/lib/homepage-accordion-cruises";
import { resolveVoyagePanelContent } from "@/lib/voyage-accordion-panels";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";
import {
  resolveVoyagesItineraryCms,
  VOYAGES_PAGE,
} from "@/lib/voyages-page-content";
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
  const manifestoItems =
    copy.manifesto.length > 0 ? copy.manifesto : VOYAGES_PAGE.manifesto;
  const ribbonFromManifesto = manifestoItems
    .map((item) => item.title.trim())
    .filter(Boolean);
  const ribbonPhrases =
    ribbonFromManifesto.length > 0
      ? ribbonFromManifesto
      : VOYAGES_PAGE.manifesto.map((item) => item.title);

  useVoyagesEditorialFlow({ rootRef, runRef, trackRef });

  return (
    <div ref={rootRef} className="voyages-boring">
      <div className="vb-progress" aria-hidden="true"><i data-vb-progress /></div>

      <main>
        <section ref={runRef} className="vb-run" aria-label="Hathor voyages">
          <div className="vb-stage">
            <div ref={trackRef} className="vb-track">
              <Scene className="vb-intro" id="voyages">
                <p className="vb-section-label wt-page-kicker">
                  {resolveCmsText(copy.heroLabel, VOYAGES_PAGE.opening.eyebrow)}
                </p>
                <h1 className="vb-intro__title vb-display vb-display--xl wt-page-hero">
                  <SplitTitle
                    lines={
                      heroTitleLines.length > 0
                        ? heroTitleLines
                        : ["Our Voyages", "Shaped by", "The Nile"]
                    }
                  />
                </h1>
                <p className="vb-intro__lead wt-page-body">
                  {resolveCmsText(
                    copy.heroSupport,
                    VOYAGES_PAGE.hero.subtitle,
                  )}
                </p>
                <span className="vb-intro__scroll" aria-hidden="true">
                  {resolveCmsText(copy.scrollHint, "Scroll to sail")} <i>→</i>
                </span>
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
                <p className="vb-section-label wt-page-kicker">
                  {resolveCmsText(copy.statementLabel, "The Hathor way")}
                </p>
                <h2 className="vb-statement__title vb-display vb-display--l wt-page-title">
                  <SplitTitle lines={statementTitleLines} />
                </h2>
                <p className="vb-statement__body wt-page-body">
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
                <div className="vb-image-story__script">
                  {resolveCmsText(
                    copy.openingScript,
                    VOYAGES_PAGE.opening.script,
                  )}
                </div>
              </Scene>

              <Scene className="vb-ribbon">
                <div className="vb-ribbon__track">
                  {[...ribbonPhrases, ...ribbonPhrases].flatMap((phrase, index) => [
                    <span key={`phrase-${index}`}>{phrase}</span>,
                    <i key={`mark-${index}`}>✦</i>,
                  ])}
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
                  <p className="vb-section-label wt-page-kicker">
                    {resolveCmsText(copy.promiseLabel, "The promise")}
                  </p>
                  <ol className="vb-values__list">
                    {manifestoItems.map((item, index) => (
                      <li
                        className="vb-values__item"
                        key={`${item.title}-${index}`}
                        onPointerEnter={() => setActive(index)}
                        onPointerLeave={() => setActive(-1)}
                      >
                        <span className="vb-values__number">0{index + 1}</span>
                        <h2 className="vb-values__title vb-display vb-display--m wt-page-title">{item.title}</h2>
                        <p className="vb-values__body wt-page-body">{item.body}</p>
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
                <p className="vb-section-label wt-page-kicker">
                  {resolveCmsText(copy.itinerariesLabel, "Choose your passage")}
                </p>
                <h2 className="vb-projects-intro__title vb-display vb-display--xl wt-page-title">
                  <SplitTitle lines={itinerariesTitleLines} />
                </h2>
                <p className="vb-projects-intro__body wt-page-body">
                  {resolveCmsText(
                    copy.itinerariesBody,
                    VOYAGES_PAGE.opening.body[1] ?? "",
                  )}
                </p>
              </Scene>

              {itineraries.map((voyage, index) => {
                const panel = resolveVoyagePanelContent({
                  slug: voyage.slug,
                  name: voyage.name,
                  description: voyage.description,
                  href: voyage.href,
                });
                const cms = resolveVoyagesItineraryCms(
                  copy.itineraries,
                  voyage.slug,
                  index,
                );
                const title = resolveCmsText(cms.title, panel.routeTitle);
                const durationLabel = resolveCmsText(
                  cms.durationLabel,
                  panel.durationLabel,
                );
                const meta = resolveCmsText(cms.meta, voyage.ports);
                const detailsLabel = resolveCmsText(cms.cta, panel.detailsLabel);
                const body = resolveCmsText(cms.body, panel.summary);

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
                      <h2 className="vb-project__title vb-display vb-display--l wt-page-title">{title}</h2>
                      <p className="vb-project__meta">
                        {durationLabel}
                        {meta ? (
                          <>
                            <i>—</i>
                            {meta}
                          </>
                        ) : null}
                      </p>
                      {body ? <p className="vb-project__body wt-page-body">{body}</p> : null}
                      <Link className="vb-project__link" href={panel.detailsHref}>
                        {detailsLabel}<span>↗</span>
                      </Link>
                      {/*
                        Absolutely positioned inside the existing
                        position: relative .vb-project__content — adds no grid
                        row, no height, and no ScrollTrigger measurement change.
                      */}
                      <div className="hathor-select-stack vb-project__select">
                        <FavoriteButton
                          type="voyage"
                          slug={voyage.slug}
                          name={title}
                          variant="inline"
                          showLabel={false}
                        />
                        <AddToVoyageButton
                          kind="voyage"
                          slug={voyage.slug}
                          name={title}
                          variant="card"
                        />
                      </div>
                    </div>
                  </Scene>
                );
              })}

              <Scene className="vb-charter">
                <div className="vb-charter__copy">
                  <p className="vb-section-label wt-page-kicker">
                    {resolveCmsText(
                      copy.charterLabel,
                      VOYAGES_PAGE.charter.eyebrow,
                    )}
                  </p>
                  <h2 className="vb-charter__title vb-display vb-display--xl wt-page-title">
                    <SplitTitle lines={charterTitleLines} />
                  </h2>
                  <div className="vb-charter__script">
                    {resolveCmsText(
                      copy.charterScript,
                      VOYAGES_PAGE.charter.script,
                    )}
                  </div>
                  <p className="vb-charter__body wt-page-body">
                    {resolveCmsText(
                      copy.charterBody,
                      VOYAGES_PAGE.charter.body,
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
          <p className="vb-section-label wt-page-kicker">
            {resolveCmsText(copy.reserveLabel, "Begin your journey")}
          </p>
          <h2 className="vb-reserve__title vb-display vb-display--xl wt-page-title">
            {resolveCmsText(copy.ctaTitle, VOYAGES_PAGE.cta.title)}
          </h2>
          <p className="vb-reserve__body wt-page-body">
            {resolveCmsText(copy.ctaBody, VOYAGES_PAGE.cta.body)}
          </p>
          <div className="vb-reserve__actions">
            <BookNowTrigger className="vb-reserve__button">
              {resolveCmsText(copy.ctaPrimary, VOYAGES_PAGE.cta.primary)}
            </BookNowTrigger>
            <Link className="vb-reserve__secondary" href={VOYAGES_PAGE.cta.secondary.href}>
              {resolveCmsText(
                copy.ctaSecondary,
                VOYAGES_PAGE.cta.secondary.label,
              )}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
