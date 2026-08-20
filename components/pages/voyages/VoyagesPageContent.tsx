"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
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
}: {
  slot: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const image = useSiteImage(slot);
  return (
    <figure className={`vb-media ${className}`}>
      <Image
        src={image.src}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 70vw"
        className="vb-media__image"
      />
    </figure>
  );
}

function SplitText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <span className={`vb-split ${className}`} aria-label={children}>
      {Array.from(children).map((character, index) => (
        <span
          key={`${character}-${index}`}
          aria-hidden="true"
          className="vb-split__char"
          style={
            {
              "--char-index": index,
              "--char-direction": index % 2 === 0 ? 1 : -1,
            } as CSSProperties
          }
        >
          {character === " " ? "\u00a0" : character}
        </span>
      ))}
    </span>
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

const PRINCIPLES = [
  {
    number: "01",
    title: "THREE",
    count: "03",
    text: VOYAGES_PAGE.manifesto[0]!.body,
    slot: "home-voyage-3n-aswan-luxor",
  },
  {
    number: "02",
    title: "FOUR",
    count: "04",
    text: VOYAGES_PAGE.manifesto[1]!.body,
    slot: "home-voyage-4n-luxor-aswan",
  },
  {
    number: "03",
    title: "SEVEN",
    count: "07",
    text: VOYAGES_PAGE.manifesto[2]!.body,
    slot: "home-voyage-7n-roundtrip",
  },
] as const;

const PROJECT_TONES = ["cream", "ink", "gold", "cream"] as const;
const PROJECT_TITLES = ["Three", "Four", "Seven", "Charter"] as const;

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
            <div ref={trackRef} className="vb-track">
              <Scene className="vb-intro">
                <div className="vb-intro__inner">
                  <nav className="vb-intro__menu" aria-label="Voyages page sections">
                    <a href="#voyages">Voyages</a>
                    <a href="#itineraries">Itineraries</a>
                    <Link href="/charter">Charter</Link>
                    <BookNowTrigger className="vb-intro__book">Book Now</BookNowTrigger>
                  </nav>
                  <p className="vb-marker">Voyages</p>
                  <p className="vb-copyright">Hathor Cruise ©2026</p>

                  <div className="vb-intro__title" id="voyages">
                    <h1 className="vb-intro__title-part vb-intro__title-part--one">
                      <SplitText>Our</SplitText>
                      <br />
                      <SplitText>Voyages</SplitText>
                    </h1>
                    <h1 className="vb-intro__title-part vb-intro__title-part--two">
                      <SplitText>on the</SplitText>
                      <br />
                      <SplitText>Nile</SplitText>
                    </h1>
                    <h1 className="vb-intro__title-part vb-intro__title-part--three">
                      <SplitText>private</SplitText>
                      <br />
                      <SplitText>sailings</SplitText>
                    </h1>
                  </div>

                  <p className="vb-intro__body">{VOYAGES_PAGE.hero.subtitle}</p>
                  <div className="vb-intro__wordmark" aria-label="Hathor Nile dahabiya">
                    <span>HATHOR</span>
                    <em>Nile</em>
                    <strong>dahabiya</strong>
                  </div>
                </div>
              </Scene>

              <Scene className="vb-image-lead">
                <VoyageMedia
                  slot="home-voyage-7n-roundtrip"
                  alt="Hathor sailing the Nile"
                  priority
                  className="vb-image-lead__main"
                />
                <div className="vb-flip vb-image-lead__flip">
                  <VoyageMedia
                    slot="home-voyage-3n-aswan-luxor"
                    alt="Aswan to Luxor voyage"
                  />
                  <VoyageMedia
                    slot="home-voyage-4n-luxor-aswan"
                    alt="Luxor to Aswan voyage"
                  />
                </div>
              </Scene>

              <Scene className="vb-manifesto">
                <p className="vb-marker">The river</p>
                <div className="vb-manifesto__headline vb-big-title">
                  <SplitText>Sail Egypt</SplitText>
                  <SplitText>at a dahabiya</SplitText>
                  <SplitText>pace</SplitText>
                </div>
                <p className="vb-manifesto__body">{VOYAGES_PAGE.opening.body[0]}</p>
              </Scene>

              <Scene className="vb-collage">
                <div className="vb-collage__tile vb-collage__tile--one vb-flip">
                  <VoyageMedia
                    slot="home-voyage-nile-majesty"
                    alt="Nile Majesty private charter"
                  />
                  <VoyageMedia
                    slot="highlights-lifestyle"
                    alt="Life aboard Hathor"
                  />
                </div>
                <div className="vb-collage__tile vb-collage__tile--two vb-flip">
                  <VoyageMedia
                    slot="home-voyage-4n-luxor-aswan"
                    alt="Classic Nile voyage"
                  />
                  <VoyageMedia
                    slot="home-cinematic-still"
                    alt="Hathor on the river"
                  />
                </div>
                <p>{VOYAGES_PAGE.opening.body[1]}</p>
              </Scene>

              <Scene className="vb-marquee" aria-label="Voyages">
                <div className="vb-marquee__rail">
                  {[0, 1, 2].map((item) => (
                    <span key={item}>
                      VOYAGES <b>✦</b>
                    </span>
                  ))}
                </div>
              </Scene>

              <Scene className="vb-image-pair">
                <div className="vb-flip vb-image-pair__left">
                  <VoyageMedia
                    slot="home-voyage-3n-aswan-luxor"
                    alt="Aswan departure"
                  />
                  <VoyageMedia
                    slot="home-call-to-action"
                    alt="Deck on the Nile"
                  />
                </div>
                <div className="vb-flip vb-image-pair__right">
                  <VoyageMedia slot="gastronomy-table" alt="Dining on the Nile" />
                  <VoyageMedia slot="room-royal" alt="Royal Suite aboard Hathor" />
                </div>
              </Scene>

              <Scene className="vb-principles" id="itineraries">
                {PRINCIPLES.map((stat) => (
                  <article className="vb-principle" key={stat.number}>
                    <p className="vb-principle__copy">{stat.text}</p>
                    <div className="vb-principle__heading">
                      <span>{stat.count}</span>
                      <h2>{stat.title}</h2>
                    </div>
                    <VoyageMedia
                      slot={stat.slot}
                      alt={`${stat.title.toLowerCase()} night voyage aboard Hathor`}
                      className="vb-principle__hover"
                    />
                  </article>
                ))}
              </Scene>

              <Scene className="vb-projects-intro">
                <p className="vb-marker">Itineraries</p>
                <p>
                  Four private passages — three, four, and seven nights, or the
                  dahabiya entirely yours.
                </p>
              </Scene>

              {itineraries.map((item, index) => {
                const panel = resolveVoyagePanelContent({
                  slug: item.slug,
                  name: item.name,
                  description: item.description,
                  href: item.href,
                });
                const tone = PROJECT_TONES[index] ?? "cream";
                const title = PROJECT_TITLES[index] ?? panel.routeTitle;

                return (
                  <Scene
                    className={`vb-project vb-project--${index + 1} vb-project--${tone}`}
                    key={item.id}
                  >
                    <div className="vb-project__shell">
                      <VoyageMedia
                        slot={item.imageName}
                        alt={panel.routeTitle}
                        className="vb-project__image"
                      />
                      <div className="vb-project__data">
                        <span>{panel.durationLabel}</span>
                        <span>{panel.routeTitle}</span>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <Link href={panel.detailsHref}>View Details</Link>
                      </div>
                      <h2>{title}</h2>
                    </div>
                  </Scene>
                );
              })}

              <Scene className="vb-last-project">
                <div className="vb-last-project__images">
                  <VoyageMedia
                    slot="gastronomy-restaurant"
                    alt="Dining aboard Hathor"
                  />
                  <VoyageMedia slot="highlights-lifestyle" alt="Deck living" />
                  <VoyageMedia slot="room-royal" alt="Suite rest after shore days" />
                  <Link href="/gastronomy" className="vb-last-project__link">
                    <span>↗</span> Explore Dining
                  </Link>
                </div>
                <div className="vb-last-project__copy">
                  <p className="vb-marker">Onboard</p>
                  <div className="vb-big-title">
                    <SplitText>Every voyage</SplitText>
                    <SplitText>fully</SplitText>
                    <SplitText>composed</SplitText>
                  </div>
                  <p>{VOYAGES_PAGE.features.items[0]!.body}</p>
                </div>
              </Scene>

              <Scene className="vb-closing">
                <div className="vb-flip vb-closing__media">
                  <VoyageMedia
                    slot="home-voyage-nile-majesty"
                    alt="Nile Majesty charter"
                  />
                  <VoyageMedia
                    slot="home-voyage-7n-roundtrip"
                    alt="Seven-night Nile round trip"
                  />
                </div>
              </Scene>
            </div>
          </div>
        </section>

        <section className="vb-epilogue" id="reserve">
          <header className="vb-epilogue__title">
            <span>(Reserve)</span>
            <h2>
              SAIL
              <br />
              THE NILE
            </h2>
          </header>
          <div className="vb-epilogue__images">
            <VoyageMedia
              slot="home-voyage-7n-roundtrip"
              alt="Hathor voyage on the Nile"
            />
            <VoyageMedia
              slot="home-voyage-nile-majesty"
              alt="Private charter on the Nile"
            />
          </div>
          <div className="vb-epilogue__statement vb-big-title">
            <span>Private</span>
            <span>sailings on</span>
            <span>the Nile</span>
          </div>
          <div className="vb-epilogue__contact">
            <p>{VOYAGES_PAGE.cta.body}</p>
          </div>
          <div className="vb-epilogue__pills">
            <BookNowTrigger className="btn btn-dark">Book Now</BookNowTrigger>
            <Link href="/cruises" className="public-btn-outline-gold">
              View Itineraries
            </Link>
          </div>
          <p className="vb-epilogue__outro">{VOYAGES_PAGE.opening.script}</p>
          <div className="vb-epilogue__social">
            <a href="https://www.instagram.com/hathorcruise/">INSTAGRAM</a>
            <span>|</span>
            <a href="mailto:reservations@hathorcruise.com">
              reservations@hathorcruise.com
            </a>
            <span>|</span>
          </div>
          <div className="vb-epilogue__feature">
            <div className="vb-epilogue__monogram" aria-hidden="true">
              HATHOR
            </div>
            <span>(VOYAGES)</span>
            <VoyageMedia slot="home-voyage-4n-luxor-aswan" alt="Hathor on the Nile" />
            <h3>DAHABIYA</h3>
            <p>
              Intimate itineraries
              <br />
              from Luxor to Aswan
            </p>
          </div>
          <div className="vb-epilogue__legal">
            <span>HATHOR CRUISE ©2026</span>
            <Link href="/contact">PRIVACY</Link>
            <Link href="/contact">COOKIES</Link>
            <Link href="/contact">LEGAL</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
