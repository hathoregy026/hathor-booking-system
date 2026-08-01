"use client";

import { ManagedImage } from "@/components/ui/ManagedImage";

type HighlightsHeroProps = {
  titleLine1: string;
  titleLine2: string;
  supporting: string;
};

export function HighlightsHero({
  titleLine1,
  titleLine2,
  supporting,
}: HighlightsHeroProps) {
  return (
    <section className="hl-hero" aria-label="Highlights of the Nile" data-hl-hero="">
      <div className="hl-hero__media">
        <div className="hl-hero__img-wrap" data-hl-hero-img="">
          <ManagedImage
            name="landmark-hatshepsut"
            alt="Temple of Hatshepsut rising into the Theban cliffs"
            fill
            priority
            sizes="100vw"
            className="hl-hero__img"
            previewAnchor={false}
            style={{ objectPosition: "50% 42%" }}
          />
        </div>
        <div className="hl-hero__shade" data-hl-hero-shade="" aria-hidden="true" />
        <div className="hl-hero__veil" data-hl-hero-veil="" aria-hidden="true" />
      </div>

      <div className="lx-shell hl-hero__shell">
        <p className="lx-label lx-label--light" data-hl-hero-label="">
          Highlights
        </p>
        <h1 className="lx-display hl-hero__title">
          <span className="lx-mask" data-hl-hero-line="">
            <span>{titleLine1}</span>
          </span>
          <span className="lx-mask" data-hl-hero-line="">
            <span>{titleLine2}</span>
          </span>
        </h1>
        <span className="lx-horizon" data-hl-hero-horizon="" aria-hidden="true" />
        <p className="lx-copy lx-copy--light hl-hero__copy" data-hl-hero-copy="">
          {supporting}
        </p>
        <a
          href="#highlight-stories"
          className="lx-btn lx-btn--ivory hl-hero__cta"
          data-hl-hero-cta=""
        >
          Enter the Journey
        </a>
      </div>
    </section>
  );
}
