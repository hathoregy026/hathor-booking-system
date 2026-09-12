"use client";

import Link from "next/link";
import { Cormorant_Garamond, EB_Garamond, Ms_Madi } from "next/font/google";
import {
  Fragment,
  useEffect,
  useRef,
  type ComponentType,
  type CSSProperties,
} from "react";
import {
  HathorWatermark,
  PartnersJourneyRiver,
} from "@/components/partners/PartnersCompanyArt";
import {
  BookingMark,
  EasyTravMark,
  ExpediaMark,
  XLuxuryMark,
} from "@/components/partners/PartnerMarks";
import { HOMEPAGE_PARTNERS } from "@/lib/homepage-content";
import "@/app/partners-company-strip.css";

/* Faces matched against the original band art. The band sits below the fold. */
const displayFace = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "600",
  variable: "--pc-font-display",
  display: "swap",
  preload: false,
});

const textFace = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--pc-font-text",
  display: "swap",
  preload: false,
});

const scriptFace = Ms_Madi({
  subsets: ["latin"],
  weight: "400",
  variable: "--pc-font-script",
  display: "swap",
  preload: false,
});

const PARTNER_MARKS: Record<string, ComponentType<{ className?: string }>> = {
  "Easy Trav Tourism": EasyTravMark,
  Booking: BookingMark,
  Expedia: ExpediaMark,
  "X Luxury Hospitality": XLuxuryMark,
};

type PartnersCompanyStripProps = {
  variant?: "teaser" | "intro";
};

export function PartnersCompanyStrip({
  variant = "teaser",
}: PartnersCompanyStripProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const Root = variant === "intro" ? "div" : "section";
  const ctaHref = variant === "intro" ? "#circle" : HOMEPAGE_PARTNERS.href;
  const words = HOMEPAGE_PARTNERS.headline.split(" ");

  /* Entrance plays once per part as it scrolls in; ambient loops pause off-screen. */
  useEffect(() => {
    const frame = frameRef.current;
    const journey = journeyRef.current;
    if (!frame || !journey) return;
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    frame.dataset.pcMotion = "";
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === frame) {
            frame.toggleAttribute("data-pc-visible", entry.isIntersecting);
            if (entry.intersectionRatio >= 0.15) frame.dataset.pcState = "in";
          } else if (entry.intersectionRatio >= 0.3) {
            frame.dataset.pcJourney = "in";
          }
        }
      },
      { threshold: [0, 0.15, 0.3] },
    );
    observer.observe(frame);
    observer.observe(journey);

    return () => observer.disconnect();
  }, []);

  /* Phones swipe the journey sideways; only then is it a keyboard stop too. */
  useEffect(() => {
    const journey = journeyRef.current;
    if (!journey || !("ResizeObserver" in window)) return;

    const sync = () => {
      if (journey.scrollWidth - journey.clientWidth > 1) journey.tabIndex = 0;
      else journey.removeAttribute("tabindex");
    };
    const resize = new ResizeObserver(sync);
    resize.observe(journey);

    return () => resize.disconnect();
  }, []);

  return (
    <Root
      className={`partners-company partners-company--${variant} ${displayFace.variable} ${textFace.variable} ${scriptFace.variable}`}
      aria-labelledby="partners-company-title"
    >
      <div ref={frameRef} className="partners-company__frame">
        <div className="partners-company__canvas">
          <HathorWatermark />

          <header className="partners-company__head">
            <div className="partners-company__intro">
              <p className="partners-company__eyebrow">
                <span className="partners-company__eyebrow-text">
                  {HOMEPAGE_PARTNERS.title}
                </span>
                <i aria-hidden="true" />
              </p>
              <h2 className="partners-company__title" id="partners-company-title">
                <span className="partners-company__words">
                  {words.map((word, index) => (
                    <Fragment key={`${word}-${index}`}>
                      {index > 0 ? " " : null}
                      <span
                        className="partners-company__word"
                        style={{ "--pc-w": index } as CSSProperties}
                      >
                        <span>{word}</span>
                      </span>
                    </Fragment>
                  ))}
                </span>
                <span className="partners-company__phone-title">
                  {HOMEPAGE_PARTNERS.title}
                </span>
              </h2>
              <p className="partners-company__script">
                {HOMEPAGE_PARTNERS.script}
              </p>
            </div>

            <p className="partners-company__lead">
              {HOMEPAGE_PARTNERS.leadLines.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 ? " " : null}
                  <span
                    className="partners-company__lead-line"
                    style={{ "--pc-l": index } as CSSProperties}
                  >
                    {line}
                  </span>
                </Fragment>
              ))}
            </p>
          </header>

          <div ref={journeyRef} className="partners-company__journey">
            <div className="partners-company__track">
              <PartnersJourneyRiver />
              <ol className="partners-company__list" aria-label="Hathor partners">
                {HOMEPAGE_PARTNERS.partners.map((name, index) => {
                  const Mark = PARTNER_MARKS[name];
                  return (
                    <li
                      key={name}
                      className="partners-company__partner"
                      style={{ "--pc-i": index } as CSSProperties}
                    >
                      <span className="partners-company__logo">
                        {Mark ? <Mark /> : null}
                      </span>
                      <span className="partners-company__node" aria-hidden="true" />
                      <span className="partners-company__name">{name}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>

        <div className="partners-company__cta">
          <Link href={ctaHref} className="pn-btn">
            <span>{HOMEPAGE_PARTNERS.hrefLabel}</span>
          </Link>
        </div>
      </div>
    </Root>
  );
}
