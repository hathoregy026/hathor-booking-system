"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
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
        sizes="(max-width: 950px) 100vw, 72vw"
        className="vb-media__image"
      />
    </figure>
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

export type VoyagesPageContentProps = {
  voyages: HomepageAccordionCruise[];
};

export function VoyagesPageContent({ voyages }: VoyagesPageContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
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
                <div className="vb-intro__copy">
                  <p className="vb-kicker">{VOYAGES_PAGE.opening.eyebrow}</p>
                  <h1 className="vb-intro__title vb-display">
                    <span>Our</span>
                    <span>Voyages</span>
                    <em>{VOYAGES_PAGE.hero.secondTitle}</em>
                  </h1>
                  <p className="vb-intro__lead">{VOYAGES_PAGE.hero.subtitle}</p>
                </div>
                <VoyageMedia
                  slot="cruises-hero"
                  alt="Hathor at golden hour on the Nile"
                  priority
                  className="vb-intro__media"
                />
              </Scene>

              <Scene className="vb-gallery vb-gallery--ink">
                <VoyageMedia
                  slot="about-hero"
                  alt="Hathor sailing the Nile"
                  className="vb-gallery__large"
                  fit="contain"
                />
                <VoyageMedia
                  slot="highlights-lifestyle"
                  alt="Quiet life aboard Hathor"
                  className="vb-gallery__small"
                  fit="contain"
                />
              </Scene>

              <Scene className="vb-statement">
                <p className="vb-kicker">The Hathor way</p>
                <h2 className="vb-statement__title vb-display">
                  <span>Sail at</span>
                  <span>a dahabiya&apos;s</span>
                  <span>pace</span>
                </h2>
                <p className="vb-statement__body">{VOYAGES_PAGE.opening.body[0]}</p>
              </Scene>

              <Scene className="vb-gallery vb-gallery--cream">
                <VoyageMedia
                  slot="room-royal"
                  alt="Hathor Royal Suite"
                  className="vb-gallery__portrait"
                  fit="contain"
                />
                <VoyageMedia
                  slot="gastronomy-table"
                  alt="Dining aboard Hathor"
                  className="vb-gallery__landscape"
                  fit="contain"
                />
              </Scene>

              <Scene className="vb-values">
                <p className="vb-kicker">The promise</p>
                <ol className="vb-values__list">
                  {VOYAGES_PAGE.manifesto.map((item) => (
                    <li className="vb-values__item" key={item.numeral}>
                      <span className="vb-values__number">0{item.numeral}</span>
                      <h2 className="vb-values__title vb-display">{item.title}</h2>
                      <p className="vb-values__body">{item.body}</p>
                    </li>
                  ))}
                </ol>
              </Scene>

              <Scene className="vb-journeys-intro" id="itineraries">
                <p className="vb-kicker">Choose your passage</p>
                <h2 className="vb-journeys-intro__title vb-display">
                  The Nile,<br />your rhythm.
                </h2>
                <p className="vb-journeys-intro__body">{VOYAGES_PAGE.opening.body[1]}</p>
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
                  <Scene
                    className={`vb-journey vb-journey--${index + 1}`}
                    key={voyage.id}
                  >
                    <div className="vb-journey__frame">
                      <VoyageMedia
                        slot={voyage.imageName}
                        alt={voyage.name}
                        className="vb-journey__media"
                        fit="contain"
                      />
                    </div>
                    <div className="vb-journey__content">
                      <p className="vb-journey__number">0{index + 1}</p>
                      <h2 className="vb-journey__title vb-display">{panel.routeTitle}</h2>
                      <p className="vb-journey__meta">
                        {isCharter ? "Private charter" : panel.durationLabel}
                        <span aria-hidden="true">—</span>
                        {isCharter ? "Custom itinerary" : voyage.ports}
                      </p>
                      <Link className="vb-journey__link" href={panel.detailsHref}>
                        {isCharter ? "Explore private charter" : panel.detailsLabel}
                        <span aria-hidden="true">↗</span>
                      </Link>
                    </div>
                  </Scene>
                );
              })}

              <Scene className="vb-charter">
                <div className="vb-charter__copy">
                  <p className="vb-kicker">Private charter</p>
                  <h2 className="vb-charter__title vb-display">{VOYAGES_PAGE.charter.title}</h2>
                  <p className="vb-charter__script">{VOYAGES_PAGE.charter.script}</p>
                  <Link className="vb-charter__link" href={VOYAGES_PAGE.charter.cta.href}>
                    {VOYAGES_PAGE.charter.cta.label}<span aria-hidden="true">→</span>
                  </Link>
                </div>
                <VoyageMedia
                  slot="home-voyage-nile-majesty"
                  alt="Hathor private charter"
                  className="vb-charter__media"
                  fit="contain"
                />
              </Scene>
            </div>
          </div>
        </section>

        <section className="vb-reserve" id="reserve">
          <p className="vb-kicker">Begin your journey</p>
          <h2 className="vb-reserve__title vb-display">{VOYAGES_PAGE.cta.title}</h2>
          <p className="vb-reserve__body">{VOYAGES_PAGE.cta.body}</p>
          <BookNowTrigger className="vb-reserve__button">
            {VOYAGES_PAGE.cta.primary}
          </BookNowTrigger>
        </section>
      </main>
    </div>
  );
}
