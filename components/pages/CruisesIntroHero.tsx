"use client";

import Link from "next/link";
import {
  useRef,
  type CSSProperties,
  type ComponentPropsWithoutRef,
} from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useCruisesIntroScroll } from "@/hooks/useCruisesIntroScroll";
import { CRUISES_PAGE } from "@/lib/page-content";

function SplitLine({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const words = children.split(/\s+/).filter(Boolean);

  return (
    <span className={`cr-intro__split ${className}`} aria-label={children}>
      {words.map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} className="cr-intro__word" aria-hidden="true">
          {Array.from(word).map((character, charIndex) => {
            const index = wordIndex * 8 + charIndex;
            return (
              <span
                key={`${character}-${charIndex}`}
                className="cr-intro__char"
                style={
                  {
                    "--char-index": index,
                    "--char-direction": index % 2 === 0 ? 1 : -1,
                  } as CSSProperties
                }
              >
                {character}
              </span>
            );
          })}
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
    <section
      className={`cr-intro__scene ${className}`}
      data-cr-intro-scene=""
      {...props}
    >
      {children}
    </section>
  );
}

/**
 * Short Suites-style landing: cream intro with rising titles, then a few
 * horizontal scrolls to the right into a Nile still before the listing.
 */
export function CruisesIntroHero() {
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useCruisesIntroScroll({ runRef, trackRef });

  return (
    <div className="cr-intro" aria-label="Cruises introduction">
      <section ref={runRef} className="cr-intro__run">
        <div className="cr-intro__stage">
          <div className="cr-intro__progress" aria-hidden="true">
            <i data-cr-intro-progress />
          </div>
          <div ref={trackRef} className="cr-intro__track">
            <Scene className="cr-intro__copy" aria-label="Cruises">
              <div className="cr-intro__inner">
                <nav className="cr-intro__menu" aria-label="Cruises page sections">
                  <a href="#cruises-listing">Cruises</a>
                  <Link href="/voyages">Voyages</Link>
                  <Link href="/contact">Contact</Link>
                  <BookNowTrigger className="cr-intro__book">Book Now</BookNowTrigger>
                </nav>
                <p className="cr-intro__marker">Cruises</p>
                <p className="cr-intro__copyright">Hathor Dahabiya ©2026</p>

                <div className="cr-intro__titles">
                  <h1 className="cr-intro__title cr-intro__title--one">
                    <SplitLine>Cruises</SplitLine>
                    <br />
                    <SplitLine>of the Nile</SplitLine>
                  </h1>
                  <h1 className="cr-intro__title cr-intro__title--two">
                    <SplitLine>where</SplitLine>
                    <br />
                    <SplitLine>Egypt sails</SplitLine>
                  </h1>
                  <h1 className="cr-intro__title cr-intro__title--three">
                    <SplitLine>meets</SplitLine>
                    <br />
                    <SplitLine>luxury</SplitLine>
                  </h1>
                </div>

                <p className="cr-intro__body">{CRUISES_PAGE.hero.subtitle}</p>
                <div className="cr-intro__wordmark" aria-label="Hathor Nile dahabiya">
                  <span>HATHOR</span>
                  <em>Nile</em>
                  <strong>dahabiya</strong>
                </div>
              </div>
            </Scene>

            <Scene className="cr-intro__media" aria-hidden="true">
              <figure className="cr-intro__still">
                <ManagedImage
                  name="cruises-hero"
                  alt=""
                  fill
                  priority
                  previewAnchor={false}
                  className="cr-intro__image"
                  sizes="(max-width: 1024px) 100vw, 92vw"
                />
              </figure>
              <div className="cr-intro__flip">
                <figure>
                  <ManagedImage
                    name="home-voyage-4n-luxor-aswan"
                    alt=""
                    fill
                    previewAnchor={false}
                    className="cr-intro__image"
                    sizes="(max-width: 1024px) 70vw, 42vw"
                  />
                </figure>
                <figure>
                  <ManagedImage
                    name="home-voyage-nile-majesty"
                    alt=""
                    fill
                    previewAnchor={false}
                    className="cr-intro__image"
                    sizes="(max-width: 1024px) 70vw, 42vw"
                  />
                </figure>
              </div>
            </Scene>
          </div>
        </div>
      </section>
    </div>
  );
}
