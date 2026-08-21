"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { AnimaSplitLine } from "@/components/public/AnimaSplitLine";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useVoyagesEditorialFlow } from "@/hooks/useVoyagesEditorialFlow";
import type { HomepageAccordionCruise } from "@/lib/homepage-accordion-cruises";
import { resolveVoyagePanelContent } from "@/lib/voyage-accordion-panels";
import { VOYAGES_PAGE } from "@/lib/voyages-page-content";

function VoyageMedia({
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
      className={`vb-media ${className}`}
      style={
        ratio ? ({ ["--vb-ratio" as string]: ratio } as CSSProperties) : undefined
      }
    >
      <Image
        src={image.src}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes="(max-width: 950px) 100vw, 80vw"
        className="vb-media__image"
      />
    </figure>
  );
}

/** Two stacked frames; the upper one wipes across as the panel travels. */
function Flip({
  front,
  back,
  frontAlt,
  backAlt = "",
  className = "",
  axis = "left",
  ratio,
  priority = false,
}: {
  front: string;
  back: string;
  frontAlt: string;
  backAlt?: string;
  className?: string;
  axis?: "up" | "left" | "right";
  ratio?: string;
  priority?: boolean;
}) {
  return (
    <div className={`vb-flip vb-flip--${axis} ${className}`} data-vb-flip>
      <VoyageMedia
        slot={front}
        alt={frontAlt}
        className="vb-flip__base"
        ratio={ratio}
        priority={priority}
      />
      <VoyageMedia slot={back} alt={backAlt} className="vb-flip__over" ratio={ratio} />
    </div>
  );
}

function Scene({
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section className={`vb-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="vb-eyebrow">({children})</p>;
}

/* -------------------------------------------------------------------------
   The follow-image: a photograph that tracks the pointer across the creed
   panel and changes with whichever line is hovered. This is the reference's
   signature interaction — the page's one moment of play.
   ------------------------------------------------------------------------- */
function useFollowImage() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let seeded = false;

    const tick = () => {
      frame = 0;
      /* ease toward the pointer rather than snapping — this is what makes it
         feel smooth instead of twitchy */
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      wrap.style.setProperty("--fx", `${x.toFixed(1)}px`);
      wrap.style.setProperty("--fy", `${y.toFixed(1)}px`);
      if (Math.abs(targetX - x) > 0.4 || Math.abs(targetY - y) > 0.4) {
        frame = requestAnimationFrame(tick);
      }
    };

    const onMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      if (!seeded) {
        x = targetX;
        y = targetY;
        seeded = true;
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };

    wrap.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return { wrapRef, active, setActive };
}

const CREED_IMAGES = [
  "home-voyage-3n-aswan-luxor",
  "home-voyage-4n-luxor-aswan",
  "home-voyage-7n-roundtrip",
] as const;

const TONES = ["sand", "ink", "olive", "stone"] as const;

export type VoyagesPageContentProps = {
  voyages: HomepageAccordionCruise[];
};

export function VoyagesPageContent({ voyages }: VoyagesPageContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useVoyagesEditorialFlow({ rootRef, runRef, trackRef });

  const { wrapRef, active, setActive } = useFollowImage();
  const itineraries = voyages.slice(0, 4);

  return (
    <div ref={rootRef} className="voyages-boring">
      <div className="vb-progress" aria-hidden="true">
        <i data-vb-progress />
      </div>

      <main>
        <section
          ref={runRef}
          className="vb-run"
          aria-label="Hathor voyages on the Nile"
        >
          <div className="vb-stage">
            <div className="vb-rail" aria-hidden="true">
              <span className="vb-rail__inner">
                {[0, 1, 2, 3].map((item) => (
                  <em key={item}>
                    Luxor ⇄ Aswan <b>✦</b> Three to seven nights <b>✦</b>
                  </em>
                ))}
              </span>
            </div>

            <div ref={trackRef} className="vb-track">
              {/* 01 — intro: content set to the lower right, nav rotated */}
              <Scene className="vb-intro" id="voyages">
                <nav className="vb-intro__nav" aria-label="Voyages sections">
                  <a href="#itineraries">Itineraries</a>
                  <Link href="/charter">Charter</Link>
                  <a href="#reserve">Reserve</a>
                </nav>

                <div className="vb-intro__content">
                  <Eyebrow>{VOYAGES_PAGE.opening.eyebrow}</Eyebrow>
                  <div data-anima-title>
                    <h1 className="vb-display vb-display--xl">
                      <span className="vb-line">
                        <AnimaSplitLine line={0}>
                          {VOYAGES_PAGE.hero.title}
                        </AnimaSplitLine>
                      </span>
                    </h1>
                  </div>
                  <p className="vb-tracked">Luxor — Aswan</p>
                </div>

                <p className="vb-intro__mark">
                  Hathor Cruise <span className="vb-reg">®</span> 2026
                </p>
                <p className="vb-intro__scroll">
                  <i />
                  Scroll
                </p>
              </Scene>

              {/* 02 — pure picture: one tall frame, one wiping over it */}
              <Scene className="vb-plate">
                <VoyageMedia
                  slot="highlights-hero"
                  alt="The Nile at golden hour"
                  priority
                  className="vb-plate__single"
                  ratio="1279 / 960"
                />
                <Flip
                  className="vb-plate__flip"
                  axis="up"
                  ratio="835 / 557"
                  front="about-hero"
                  back="home-cinematic-still"
                  frontAlt="Hathor under sail"
                  backAlt="The dahabiya at dusk"
                />
              </Scene>

              {/* 03 — the one text pane, set low */}
              <Scene className="vb-pane">
                <div className="vb-pane__inner">
                  <h2 className="vb-pane__title vb-display" data-anima-title>
                    <span className="vb-line">
                      <AnimaSplitLine line={0}>
                        {VOYAGES_PAGE.opening.title}
                      </AnimaSplitLine>
                    </span>
                  </h2>
                  <p className="vb-pane__body">{VOYAGES_PAGE.hero.subtitle}</p>
                </div>
              </Scene>

              {/* 04 — dark panel: two frames wiping in opposite directions */}
              <Scene className="vb-duet vb-duet--ink">
                <Flip
                  className="vb-duet__a"
                  axis="right"
                  ratio="668 / 900"
                  front="home-story-way-of-life"
                  back="room-suite"
                  frontAlt="Life aboard"
                  backAlt="A suite aboard"
                />
                <Flip
                  className="vb-duet__b"
                  axis="left"
                  ratio="1090 / 760"
                  front="gastronomy-table"
                  back="gastronomy-restaurant"
                  frontAlt="Dining on the river"
                  backAlt="The restaurant aboard"
                />
                <p className="vb-duet__line vb-script">
                  {VOYAGES_PAGE.opening.script}
                </p>
              </Scene>

              {/* 05 — pure picture again, no words at all */}
              <Scene className="vb-duet">
                <Flip
                  className="vb-duet__a"
                  axis="left"
                  ratio="760 / 940"
                  front="room-royal"
                  back="room-luxury"
                  frontAlt="The Royal Suite"
                  backAlt="A luxury cabin"
                />
                <Flip
                  className="vb-duet__b"
                  axis="up"
                  ratio="980 / 720"
                  front="home-split-courtyard"
                  back="home-story-legacy-large"
                  frontAlt="Deck living"
                  backAlt="The river at rest"
                />
              </Scene>

              {/* 06 — the creed, with a photograph following the pointer */}
              <Scene className="vb-creed">
                <div className="vb-creed__wrap" ref={wrapRef}>
                  <ol className="vb-creed__list">
                    {VOYAGES_PAGE.manifesto.map((item, index) => (
                      <li
                        className="vb-creed__row"
                        key={item.numeral}
                        onPointerEnter={() => setActive(index)}
                        onPointerLeave={() => setActive(-1)}
                      >
                        <span className="vb-creed__numeral vb-edit">
                          {item.numeral}
                        </span>
                        <h2 className="vb-creed__title vb-display">
                          {item.title}
                        </h2>
                      </li>
                    ))}
                  </ol>

                  <div
                    className={`vb-follow${active >= 0 ? " is-on" : ""}`}
                    aria-hidden="true"
                  >
                    {CREED_IMAGES.map((slot, index) => (
                      <VoyageMedia
                        key={slot}
                        slot={slot}
                        alt=""
                        className={`vb-follow__img${
                          active === index ? " is-active" : ""
                        }`}
                        ratio="1 / 1"
                      />
                    ))}
                  </div>
                </div>
              </Scene>

              {/* 07 — the itineraries: picture on top, wall label beneath */}
              {itineraries.map((voyage, index) => {
                const panel = resolveVoyagePanelContent({
                  slug: voyage.slug,
                  name: voyage.name,
                  description: voyage.description,
                  href: voyage.href,
                });

                return (
                  <Scene
                    className={`vb-item vb-item--${TONES[index % TONES.length]}`}
                    key={voyage.id}
                    id={index === 0 ? "itineraries" : undefined}
                  >
                    <VoyageMedia
                      slot={voyage.imageName}
                      alt={voyage.name}
                      className="vb-item__media"
                    />
                    <div className="vb-item__plate">
                      <span className="vb-item__corner vb-item__corner--tl vb-edit">
                        {panel.durationLabel}
                      </span>
                      <span className="vb-item__corner vb-item__corner--tr">
                        {voyage.romanNumeral}
                      </span>
                      <h2 className="vb-item__route vb-display" data-anima-title>
                        {panel.routeTitle}
                      </h2>
                      <span className="vb-item__corner vb-item__corner--bl">
                        {voyage.ports}
                      </span>
                      <Link
                        className="vb-item__corner vb-item__corner--br vb-link"
                        href={panel.detailsHref}
                      >
                        {panel.detailsLabel} ↗
                      </Link>
                    </div>
                  </Scene>
                );
              })}

              {/* 08 — the close: a long, calm colour panel */}
              <Scene className="vb-close">
                <p className="vb-close__line vb-display">
                  {VOYAGES_PAGE.charter.script}
                </p>
              </Scene>
            </div>
          </div>
        </section>

        {/* ---------------- vertical coda ---------------- */}

        <section className="vb-chapter">
          <Eyebrow>{VOYAGES_PAGE.rhythm.eyebrow}</Eyebrow>
          <h2 className="vb-display vb-display--l" data-anima-title>
            <span className="vb-line">
              <AnimaSplitLine line={0}>
                {VOYAGES_PAGE.rhythm.title}
              </AnimaSplitLine>
            </span>
          </h2>
        </section>

        <section className="vb-double">
          <VoyageMedia
            slot="highlights-lifestyle"
            alt="Deck and current"
            className="vb-double__a"
            ratio="1090 / 760"
          />
          <VoyageMedia
            slot="home-story-craft-large"
            alt="The craft of the dahabiya"
            className="vb-double__b"
            ratio="668 / 860"
          />
        </section>

        {/* three ragged lines — the third pulled right */}
        <section className="vb-lines" data-anima-title>
          <p className="vb-display vb-lines__a">
            <span className="vb-line">
              <AnimaSplitLine line={0}>Sail slowly.</AnimaSplitLine>
            </span>
          </p>
          <p className="vb-display vb-lines__b">
            <span className="vb-line">
              <AnimaSplitLine line={1}>Arrive quietly.</AnimaSplitLine>
            </span>
          </p>
          <p className="vb-display vb-lines__c">
            <span className="vb-line">
              <AnimaSplitLine line={2}>Stay changed.</AnimaSplitLine>
            </span>
          </p>
        </section>

        <section className="vb-cta" id="reserve">
          <p className="vb-cta__body">{VOYAGES_PAGE.cta.body}</p>
          <BookNowTrigger className="vb-btn vb-btn--xl">
            {VOYAGES_PAGE.cta.primary}
          </BookNowTrigger>
        </section>

        <footer className="vb-foot">
          <VoyageMedia
            slot="home-call-to-action"
            alt=""
            className="vb-foot__bg"
          />

          <div className="vb-foot__index">
            {itineraries.map((voyage) => {
              const panel = resolveVoyagePanelContent({
                slug: voyage.slug,
                name: voyage.name,
                description: voyage.description,
                href: voyage.href,
              });
              return (
                <Link className="vb-foot__row" href={panel.detailsHref} key={voyage.id}>
                  <span className="vb-edit">{voyage.romanNumeral}</span>
                  <span className="vb-foot__route">{panel.routeTitle}</span>
                  <span className="vb-foot__nights">{panel.durationLabel}</span>
                  <i aria-hidden="true">↗</i>
                </Link>
              );
            })}
          </div>

          <div className="vb-foot__legal">
            <span>
              Hathor Cruise <span className="vb-reg">®</span> 2026
            </span>
            <nav aria-label="Legal">
              <Link href="/contact">Contact</Link>
              <Link href="/cruises">Cruises</Link>
              <Link href="/charter">Charter</Link>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  );
}
