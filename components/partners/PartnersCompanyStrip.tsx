"use client";

import Link from "next/link";
import { HOMEPAGE_PARTNERS } from "@/lib/homepage-content";
import "@/app/partners-company-strip.css";

const PARTNERS = [
  { id: "easy-trav", name: HOMEPAGE_PARTNERS.partners[0], mark: "easy-trav" },
  { id: "booking", name: HOMEPAGE_PARTNERS.partners[1], mark: "booking" },
  { id: "expedia", name: HOMEPAGE_PARTNERS.partners[2], mark: "expedia" },
  { id: "x-luxury", name: HOMEPAGE_PARTNERS.partners[3], mark: "x-luxury" },
] as const;

type PartnersCompanyStripProps = {
  /** Homepage teaser links to /partners. Page intro scrolls into the circle. */
  variant?: "teaser" | "intro";
};

function HathorWatermark() {
  return (
    <svg viewBox="0 0 280 460" aria-hidden="true" focusable="false">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="140" cy="58" r="32" />
        <path d="M70 92c22-56 58-82 70-86 12 4 48 30 70 86" />
        <path d="M108 96c8 14 16 22 32 22s24-8 32-22" />
        <path d="M86 128c10-28 32-46 54-46s44 18 54 46c8 24 4 54-10 78-18 32-36 44-44 46-8-2-26-14-44-46-14-24-18-54-10-78z" />
        <path d="M104 162c8-6 18-8 36-8s28 2 36 8" />
        <path d="M112 184c10 10 18 14 28 14s18-4 28-14" />
        <path d="M140 194v18" />
        <path d="M126 220c10 7 18 9 14 9s4-2 14-9" />
        <path d="M64 176c-20 26-30 60-24 96 10 52 44 78 100 82 56-4 90-30 100-82 6-36-4-70-24-96" />
        <path d="M58 228c34 10 56 14 82 14s48-4 82-14" />
        <path d="M54 264c36 12 58 16 86 16s50-4 86-16" />
        <path d="M56 300c34 14 56 18 84 18s50-4 84-18" />
        <path d="M88 156c-12 20-22 32-36 42" />
        <path d="M192 156c12 20 22 32 36 42" />
        <path d="M112 168c5 2 7 7 5 11M168 168c-5 2-7 7-5 11" />
      </g>
      <circle cx="118" cy="172" r="2.4" fill="currentColor" />
      <circle cx="162" cy="172" r="2.4" fill="currentColor" />
    </svg>
  );
}

function SailboatMark() {
  return (
    <svg viewBox="0 0 72 64" aria-hidden="true" focusable="false">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M34 8v38" />
        <path d="M34 10c1 10 8 22 22 30H34" />
        <path d="M34 16c-1 8-8 18-20 26h20" />
        <path d="M12 50c8 6 20 8 24 8s16-2 24-8" />
        <path d="M8 54c10 4 22 6 28 6s18-2 28-6" />
      </g>
    </svg>
  );
}

function OasisMark() {
  return (
    <svg viewBox="0 0 120 72" aria-hidden="true" focusable="false">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 58c18-6 32-22 40-38 8 16 14 28 28 38" />
        <path d="M22 58c10-4 18-16 22-28 4 12 10 22 22 28" />
        <path d="M78 34c2-14 8-24 14-28-2 10 0 20 6 28" />
        <path d="M96 32c1-12 6-20 12-24 0 10 1 18 6 24" />
        <path d="M80 34c8 2 14 4 18 12" />
        <path d="M98 32c6 2 10 6 14 12" />
        <path d="M4 62c18-8 36-10 56-6 16 4 28 2 56 6" />
        <path d="M70 58c6-2 14-8 18-16" />
      </g>
    </svg>
  );
}

function PartnerMark({ mark }: { mark: (typeof PARTNERS)[number]["mark"] }) {
  if (mark === "easy-trav") {
    return (
      <span className="partners-company__plate">
        <span>Easy</span>
        <span>Trav</span>
      </span>
    );
  }

  if (mark === "booking") {
    return (
      <span className="partners-company__wordmark partners-company__wordmark--booking">
        B.
      </span>
    );
  }

  if (mark === "expedia") {
    return (
      <span className="partners-company__wordmark partners-company__wordmark--expedia">
        <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
          <path
            d="M4 14 L14 4 M9 4h5v5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Expedia</span>
      </span>
    );
  }

  return (
    <span className="partners-company__wordmark partners-company__wordmark--xluxury">
      <svg viewBox="0 0 48 28" aria-hidden="true" focusable="false">
        <path
          d="M8 4 L24 24 L40 4 M16 4 L24 14 L32 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      X Luxury
    </span>
  );
}

function WaveHorizontal() {
  return (
    <svg
      className="partners-company__wave partners-company__wave--h"
      viewBox="0 0 1000 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M8 40 C 70 18 110 62 170 40 C 230 18 270 62 330 40 C 390 18 430 62 490 40 C 550 18 590 62 650 40 C 710 18 750 62 810 40 C 870 18 910 62 992 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
      />
    </svg>
  );
}

function WaveVertical() {
  return (
    <svg
      className="partners-company__wave partners-company__wave--v"
      viewBox="0 0 48 720"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M24 8 C 10 50 38 90 24 130 C 10 170 38 210 24 250 C 10 290 38 330 24 370 C 10 410 38 450 24 490 C 10 530 38 570 24 610 C 10 650 38 690 24 712"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function PartnersCompanyStrip({
  variant = "teaser",
}: PartnersCompanyStripProps) {
  const Heading = variant === "intro" ? "h1" : "h2";
  const ctaHref = variant === "intro" ? "#circle" : HOMEPAGE_PARTNERS.href;

  return (
    <section
      className={`partners-company partners-company--${variant}`}
      aria-labelledby="partners-company-title"
    >
      <div className="partners-company__watermark" aria-hidden="true">
        <HathorWatermark />
      </div>

      <div className="partners-company__intro">
        <header className="partners-company__copy">
          <p className="partners-company__eyebrow">
            {HOMEPAGE_PARTNERS.title}
          </p>
          <Heading className="partners-company__headline" id="partners-company-title">
            {HOMEPAGE_PARTNERS.headline}
          </Heading>
          <p className="partners-company__script">{HOMEPAGE_PARTNERS.script}</p>
        </header>
        <p className="partners-company__lead">{HOMEPAGE_PARTNERS.lead}</p>
      </div>

      <div className="partners-company__voyage">
        <WaveHorizontal />
        <WaveVertical />

        <div className="partners-company__end partners-company__end--sail" aria-hidden="true">
          <SailboatMark />
        </div>

        <ol className="partners-company__list">
          {PARTNERS.map((partner) => (
            <li key={partner.id} className="partners-company__stop">
              <div className="partners-company__mark" data-mark={partner.mark}>
                <PartnerMark mark={partner.mark} />
              </div>
              <i className="partners-company__dot" aria-hidden="true" />
              <p className="partners-company__name">{partner.name}</p>
            </li>
          ))}
        </ol>

        <div className="partners-company__end partners-company__end--oasis" aria-hidden="true">
          <OasisMark />
        </div>
      </div>

      <div className="partners-company__cta">
        <Link href={ctaHref} className="pn-btn">
          <span>{HOMEPAGE_PARTNERS.hrefLabel}</span>
        </Link>
      </div>
    </section>
  );
}
