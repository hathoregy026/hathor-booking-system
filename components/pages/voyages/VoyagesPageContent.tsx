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
        sizes="(max-width: 950px) 100vw, 70vw"
        className="vb-media__image"
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
    <div className={`vb-flip vb-flip--${axis} ${className}`} data-vb-flip>
      <VoyageMedia slot={front} alt={frontAlt} className="vb-flip__base" ratio={ratio} />
      <VoyageMedia slot={back} alt={backAlt} className="vb-flip__overlay" ratio={ratio} />
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

/** The circular badge — the reference's "Explorar" disc, used here as the CTA. */
function Disc({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      className="vb-disc"
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      <span>{children}</span>
      <i aria-hidden="true">↗</i>
    </Link>
  );
}

/** Three stacked full-bleed bands — the reference's vertical carousel finale. */
const BANDS = [
  { slot: "home-voyage-3n-aswan-luxor", label: "Philae", meta: "Aswan" },
  { slot: "home-voyage-4n-luxor-aswan", label: "Karnak", meta: "Luxor" },
  { slot: "home-voyage-7n-roundtrip", label: "Edfu", meta: "The bend" },
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
              {/* 01 — Opening chapter title, centred */}
              <Scene className="vb-open" id="voyages">
                <nav className="vb-open__nav" aria-label="Voyages page sections">
                  <a href="#itineraries">Itineraries</a>
                  <a href="#rhythm">The day</a>
                  <Link href="/charter">Charter</Link>
                  <a href="#reserve">Reserve</a>
                </nav>

                <div className="vb-open__inner">
                  <Eyebrow>{VOYAGES_PAGE.opening.eyebrow}</Eyebrow>

                  <div className="vb-open__title" data-anima-title>
                    <h1 className="vb-display vb-display--xl">
                      <span className="vb-line">
                        <AnimaSplitLine line={0}>
                          {VOYAGES_PAGE.hero.title}
                        </AnimaSplitLine>
                      </span>
                      <span className="vb-line">
                        <AnimaSplitLine line={1}>
                          {VOYAGES_PAGE.hero.secondTitle}
                        </AnimaSplitLine>
                      </span>
                    </h1>
                  </div>

                  <p className="vb-open__body">{VOYAGES_PAGE.hero.subtitle}</p>

                  {/* the departure-board strip */}
                  <dl className="vb-board">
                    <div>
                      <dt>Itineraries</dt>
                      <dd>{String(itineraries.length).padStart(2, "0")}</dd>
                    </div>
                    <div>
                      <dt>Nights</dt>
                      <dd>03 — 07</dd>
                    </div>
                    <div>
                      <dt>Route</dt>
                      <dd>Luxor ⇄ Aswan</dd>
                    </div>
                    <div>
                      <dt>Manner</dt>
                      <dd>All inclusive</dd>
                    </div>
                  </dl>
                </div>

                <p className="vb-open__mark">
                  Hathor Cruise <span className="vb-reg">®</span> 2026
                </p>
                <p className="vb-open__scroll">
                  <i />
                  Scroll
                </p>
              </Scene>

              {/* 02 — Three stacked bands */}
              <Scene className="vb-bands" aria-label="Along the river">
                {BANDS.map((band, index) => (
                  <div
                    className="vb-band"
                    key={band.slot}
                    style={{ ["--vb-i" as string]: index } as CSSProperties}
                  >
                    <VoyageMedia
                      slot={band.slot}
                      alt={`${band.label} on the Nile`}
                      priority={index === 0}
                      className="vb-band__media"
                    />
                    <p className="vb-band__label">
                      <span>{band.label}</span>
                      <em>{band.meta}</em>
                    </p>
                  </div>
                ))}
              </Scene>

              {/* 03 — Creed: Roman numerals, ragged setting */}
              <Scene className="vb-creed">
                <div className="vb-creed__head">
                  <Eyebrow>Why a dahabiya</Eyebrow>
                  <p className="vb-script">{VOYAGES_PAGE.opening.script}</p>
                </div>

                <ol className="vb-creed__list">
                  {VOYAGES_PAGE.manifesto.map((item, index) => (
                    <li className={`vb-creed__row vb-creed__row--${index}`} key={item.numeral}>
                      <span className="vb-creed__numeral vb-edit">{item.numeral}</span>
                      <h2 className="vb-creed__title vb-display">{item.title}</h2>
                      <p className="vb-creed__body">{item.body}</p>
                    </li>
                  ))}
                </ol>
              </Scene>

              {/* 04 — Itinerary panels, one per voyage, ghost numeral behind */}
              {itineraries.map((voyage, index) => {
                const panel = resolveVoyagePanelContent({
                  slug: voyage.slug,
                  name: voyage.name,
                  description: voyage.description,
                  href: voyage.href,
                });
                const tone = TONES[index % TONES.length];

                return (
                  <Scene
                    className={`vb-itin vb-itin--${tone}`}
                    key={voyage.id}
                    id={index === 0 ? "itineraries" : undefined}
                  >
                    <span className="vb-itin__ghost vb-edit" aria-hidden="true">
                      {voyage.romanNumeral}
                    </span>

                    <div className="vb-itin__media">
                      <VoyageMedia
                        slot={voyage.imageName}
                        alt={voyage.name}
                        ratio="1090 / 960"
                      />
                    </div>

                    <div className="vb-itin__copy">
                      <p className="vb-itin__duration">{panel.durationLabel}</p>
                      <h2 className="vb-itin__route vb-display" data-anima-title>
                        {panel.routeTitle}
                      </h2>
                      <p className="vb-itin__summary">{panel.summary}</p>

                      <ul className="vb-itin__highlights">
                        {panel.highlights.map((highlight) => (
                          <li key={highlight}>
                            <i aria-hidden="true" />
                            {highlight}
                          </li>
                        ))}
                      </ul>

                      <div className="vb-itin__foot">
                        <p className="vb-itin__meta">{voyage.meta}</p>
                        <Disc href={panel.detailsHref}>{panel.detailsLabel}</Disc>
                      </div>
                    </div>
                  </Scene>
                );
              })}

              {/* 05 — Rhythm filmstrip: four chapters at unequal heights */}
              <Scene className="vb-rhythm" id="rhythm">
                <div className="vb-rhythm__head">
                  <Eyebrow>{VOYAGES_PAGE.rhythm.eyebrow}</Eyebrow>
                  <h2 className="vb-display vb-display--l">
                    {VOYAGES_PAGE.rhythm.title}
                  </h2>
                </div>

                <div className="vb-rhythm__strip">
                  {VOYAGES_PAGE.rhythm.chapters.map((chapter, index) => (
                    <article
                      className="vb-chapter"
                      key={chapter.kicker}
                      style={{ ["--vb-i" as string]: index } as CSSProperties}
                    >
                      <p className="vb-chapter__kicker">
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        {chapter.kicker}
                      </p>
                      <VoyageMedia
                        slot={chapter.slot}
                        alt={chapter.title}
                        className="vb-chapter__media"
                        ratio="4 / 5"
                      />
                      <h3 className="vb-chapter__title vb-edit">{chapter.title}</h3>
                      <p className="vb-chapter__body">{chapter.body}</p>
                    </article>
                  ))}
                </div>
              </Scene>

              {/* 06 — Included aboard: staggered editorial masonry */}
              <Scene className="vb-included">
                <div className="vb-included__head">
                  <Eyebrow>{VOYAGES_PAGE.features.eyebrow}</Eyebrow>
                  <h2 className="vb-display vb-display--l">
                    {VOYAGES_PAGE.features.title}
                  </h2>
                </div>

                <div className="vb-included__grid">
                  {VOYAGES_PAGE.features.items.map((item, index) => (
                    <article
                      className="vb-feature"
                      key={item.id}
                      style={{ ["--vb-i" as string]: index } as CSSProperties}
                    >
                      <span className="vb-feature__num vb-edit">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="vb-feature__label">{item.label}</h3>
                      <p className="vb-feature__body">{item.body}</p>
                    </article>
                  ))}
                </div>
              </Scene>

              {/* 07 — Charter: a dark full-bleed act */}
              <Scene className="vb-charter">
                <FlipImage
                  className="vb-charter__media"
                  axis="up"
                  ratio="1483 / 960"
                  front={VOYAGES_PAGE.charter.image}
                  back="home-call-to-action"
                  frontAlt={VOYAGES_PAGE.charter.title}
                  backAlt="The deck at dusk"
                />
                <div className="vb-charter__copy">
                  <Eyebrow>{VOYAGES_PAGE.charter.eyebrow}</Eyebrow>
                  <h2 className="vb-display vb-display--l">
                    {VOYAGES_PAGE.charter.title}
                  </h2>
                  <p className="vb-script">{VOYAGES_PAGE.charter.script}</p>
                  <p className="vb-charter__body">{VOYAGES_PAGE.charter.body}</p>
                  <Disc href={VOYAGES_PAGE.charter.cta.href}>
                    {VOYAGES_PAGE.charter.cta.label}
                  </Disc>
                </div>
              </Scene>

              {/* 08 — Closing */}
              <Scene className="vb-closing">
                <div className="vb-closing__copy">
                  <Eyebrow>Next</Eyebrow>
                  <p className="vb-display vb-display--l">
                    {VOYAGES_PAGE.cta.title}
                  </p>
                </div>
              </Scene>
            </div>
          </div>
        </section>

        {/* Epilogue — a centred column, always vertical */}
        <section className="vb-epilogue" id="reserve">
          <div className="vb-epilogue__column">
            <Eyebrow>Reserve</Eyebrow>
            <h2 className="vb-display vb-display--xl" data-anima-title>
              <span className="vb-line">
                <AnimaSplitLine line={0}>{VOYAGES_PAGE.cta.title}</AnimaSplitLine>
              </span>
            </h2>
            <p className="vb-epilogue__body">{VOYAGES_PAGE.cta.body}</p>
            <p className="vb-script">{VOYAGES_PAGE.opening.script}</p>

            <div className="vb-epilogue__pills">
              <BookNowTrigger className="vb-btn vb-btn--xl vb-btn--solid">
                {VOYAGES_PAGE.cta.primary}
              </BookNowTrigger>
              <Link
                href={VOYAGES_PAGE.cta.secondary.href}
                className="vb-btn vb-btn--xl"
              >
                <span>{VOYAGES_PAGE.cta.secondary.label}</span>
              </Link>
            </div>
          </div>

          <div className="vb-epilogue__index">
            {itineraries.map((voyage) => {
              const panel = resolveVoyagePanelContent({
                slug: voyage.slug,
                name: voyage.name,
                description: voyage.description,
                href: voyage.href,
              });
              return (
                <Link className="vb-index-row" href={panel.detailsHref} key={voyage.id}>
                  <span className="vb-index-row__numeral vb-edit">
                    {voyage.romanNumeral}
                  </span>
                  <span className="vb-index-row__route">{panel.routeTitle}</span>
                  <span className="vb-index-row__nights">{panel.durationLabel}</span>
                  <span className="vb-index-row__go" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="vb-epilogue__legal">
            <span>
              Hathor Cruise <span className="vb-reg">®</span> 2026
            </span>
            <nav aria-label="Legal">
              <Link href="/contact">Contact</Link>
              <Link href="/cruises">Cruises</Link>
              <Link href="/charter">Charter</Link>
            </nav>
          </div>
        </section>
      </main>
    </div>
  );
}
