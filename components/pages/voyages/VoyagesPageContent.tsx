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
      style={ratio ? ({ "--vb-ratio": ratio } as CSSProperties) : undefined}
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
      <VoyageMedia
        slot={back}
        alt={backAlt}
        className="vb-flip__over"
        ratio={ratio}
      />
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

    const tick = () => {
      frame = 0;
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

export type VoyagesPageContentProps = {
  voyages: HomepageAccordionCruise[];
};

export function VoyagesPageContent({ voyages }: VoyagesPageContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { wrapRef, active, setActive } = useFollowImage();
  const itineraries = voyages.slice(0, 4);

  useVoyagesEditorialFlow({ rootRef, runRef, trackRef });

  return (
    <div ref={rootRef} className="voyages-boring">
      <div className="vb-progress" aria-hidden="true">
        <i data-vb-progress />
      </div>

      <main>
        <section ref={runRef} className="vb-run" aria-label="Hathor voyages">
          <div className="vb-stage">
            <div ref={trackRef} className="vb-track">
              <Scene className="vb-intro" id="voyages">
                <VoyageMedia
                  slot="highlights-hero"
                  alt="The Nile in golden light"
                  priority
                  className="vb-intro__image"
                />
                <div className="vb-intro__veil" aria-hidden="true" />
                <p className="vb-kicker">{VOYAGES_PAGE.opening.eyebrow}</p>
                <h1 className="vb-intro__title vb-display" data-anima-title>
                  <span className="vb-line">
                    <AnimaSplitLine line={0}>Our</AnimaSplitLine>
                  </span>
                  <span className="vb-line vb-intro__offset">
                    <AnimaSplitLine line={1}>Voyages</AnimaSplitLine>
                  </span>
                  <span className="vb-line vb-intro__script">
                    <AnimaSplitLine line={2}>
                      {VOYAGES_PAGE.hero.secondTitle}
                    </AnimaSplitLine>
                  </span>
                </h1>
                <p className="vb-intro__copy">{VOYAGES_PAGE.hero.subtitle}</p>
                <a className="vb-intro__cue" href="#itineraries">
                  Explore the journeys <span aria-hidden="true">→</span>
                </a>
              </Scene>

              <Scene className="vb-principal">
                <VoyageMedia
                  slot="home-cinematic-still"
                  alt="Hathor sailing the Nile"
                  className="vb-principal__wide"
                />
                <Flip
                  className="vb-principal__portrait"
                  axis="up"
                  ratio="4 / 5"
                  front="about-hero"
                  back="home-story-way-of-life"
                  frontAlt="Hathor under sail"
                  backAlt="Life aboard Hathor"
                />
              </Scene>

              <Scene className="vb-manifesto">
                <div className="vb-manifesto__inner">
                  <p className="vb-kicker">The Hathor way</p>
                  <h2 className="vb-manifesto__title vb-display" data-anima-title>
                    <span className="vb-line">
                      <AnimaSplitLine line={0}>Sail at</AnimaSplitLine>
                    </span>
                    <span className="vb-line vb-manifesto__offset">
                      <AnimaSplitLine line={1}>a dahabiya&apos;s</AnimaSplitLine>
                    </span>
                    <span className="vb-line">
                      <AnimaSplitLine line={2}>pace</AnimaSplitLine>
                    </span>
                  </h2>
                  <p className="vb-manifesto__copy">{VOYAGES_PAGE.opening.body[0]}</p>
                </div>
              </Scene>

              <Scene className="vb-duet vb-duet--ink">
                <Flip
                  className="vb-duet__portrait"
                  axis="right"
                  ratio="3 / 4"
                  front="room-suite"
                  back="room-royal"
                  frontAlt="A suite aboard Hathor"
                  backAlt="The Royal Suite"
                />
                <Flip
                  className="vb-duet__landscape"
                  axis="left"
                  ratio="7 / 5"
                  front="gastronomy-table"
                  back="gastronomy-restaurant"
                  frontAlt="Dining on the Nile"
                  backAlt="Hathor restaurant"
                />
                <p className="vb-duet__script">{VOYAGES_PAGE.opening.script}</p>
              </Scene>

              <Scene className="vb-marquee">
                <div className="vb-marquee__line" aria-hidden="true">
                  <span>Intimate</span><i>·</i><span>All-inclusive</span><i>·</i>
                  <span>Private</span><i>·</i><span>Intimate</span><i>·</i>
                </div>
              </Scene>

              <Scene className="vb-duet vb-duet--paper">
                <Flip
                  className="vb-duet__portrait"
                  axis="left"
                  ratio="3 / 4"
                  front="highlights-lifestyle"
                  back="home-story-craft-large"
                  frontAlt="Life on deck"
                  backAlt="The craft of Hathor"
                />
                <Flip
                  className="vb-duet__landscape"
                  axis="up"
                  ratio="7 / 5"
                  front="home-split-courtyard"
                  back="home-story-legacy-large"
                  frontAlt="Quiet life aboard"
                  backAlt="The Nile landscape"
                />
              </Scene>

              <Scene className="vb-creed">
                <div className="vb-creed__wrap" ref={wrapRef}>
                  <p className="vb-kicker">The promise</p>
                  <ol className="vb-creed__list">
                    {VOYAGES_PAGE.manifesto.map((item, index) => (
                      <li
                        className="vb-creed__row"
                        key={item.numeral}
                        onPointerEnter={() => setActive(index)}
                        onPointerLeave={() => setActive(-1)}
                      >
                        <span className="vb-creed__numeral">{item.numeral}</span>
                        <h2 className="vb-creed__title vb-display">{item.title}</h2>
                        <p className="vb-creed__body">{item.body}</p>
                      </li>
                    ))}
                  </ol>
                  <div className={`vb-follow${active >= 0 ? " is-on" : ""}`} aria-hidden="true">
                    {CREED_IMAGES.map((slot, index) => (
                      <VoyageMedia
                        key={slot}
                        slot={slot}
                        alt=""
                        className={`vb-follow__img${active === index ? " is-active" : ""}`}
                        ratio="4 / 5"
                      />
                    ))}
                  </div>
                </div>
              </Scene>

              <Scene className="vb-journeys-intro" id="itineraries">
                <p className="vb-kicker">Choose your passage</p>
                <h2 className="vb-journeys-intro__title vb-display">
                  The Nile,<br />your rhythm.
                </h2>
                <p>{VOYAGES_PAGE.opening.body[1]}</p>
              </Scene>

              {itineraries.map((voyage, index) => {
                const panel = resolveVoyagePanelContent({
                  slug: voyage.slug,
                  name: voyage.name,
                  description: voyage.description,
                  href: voyage.href,
                });

                return (
                  <Scene className="vb-journey" key={voyage.id}>
                    <VoyageMedia
                      slot={voyage.imageName}
                      alt={voyage.name}
                      className="vb-journey__image"
                    />
                    <div className="vb-journey__shade" aria-hidden="true" />
                    <span className="vb-journey__number">0{index + 1}</span>
                    <p className="vb-journey__meta">
                      {panel.durationLabel}<span>·</span>{voyage.ports}
                    </p>
                    <h2 className="vb-journey__title vb-display">{panel.routeTitle}</h2>
                    <Link className="vb-journey__link" href={panel.detailsHref}>
                      {panel.detailsLabel} <span aria-hidden="true">↗</span>
                    </Link>
                  </Scene>
                );
              })}

              <Scene className="vb-close">
                <VoyageMedia
                  slot="home-voyage-nile-majesty"
                  alt="Hathor on the Nile"
                  className="vb-close__image"
                />
                <div className="vb-close__shade" aria-hidden="true" />
                <p className="vb-kicker">Private charter</p>
                <h2 className="vb-close__title vb-display">{VOYAGES_PAGE.charter.title}</h2>
                <p className="vb-close__script">{VOYAGES_PAGE.charter.script}</p>
                <Link className="vb-close__link" href={VOYAGES_PAGE.charter.cta.href}>
                  {VOYAGES_PAGE.charter.cta.label} <span aria-hidden="true">→</span>
                </Link>
              </Scene>
            </div>
          </div>
        </section>

        <section className="vb-reserve" id="reserve">
          <p className="vb-kicker">Begin your journey</p>
          <h2 className="vb-reserve__title vb-display">{VOYAGES_PAGE.cta.title}</h2>
          <p className="vb-reserve__copy">{VOYAGES_PAGE.cta.body}</p>
          <BookNowTrigger className="vb-reserve__button">
            {VOYAGES_PAGE.cta.primary}
          </BookNowTrigger>
        </section>
      </main>
    </div>
  );
}
