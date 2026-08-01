"use client";

import { ManagedImage } from "@/components/ui/ManagedImage";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";

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
    <section className="hl-hero" aria-label="Voyage highlights hero" data-hl-hero="">
      <div className="hl-hero__media">
        <div className="hl-hero__img-wrap" data-hl-hero-img="">
          <ManagedImage
            name="cruises-hero"
            alt="Hathor Dahabiya on the Nile — cultural voyage"
            fill
            priority
            sizes="100vw"
            className="hl-hero__img"
            previewAnchor={false}
          />
        </div>
        <div className="hl-hero__shade" data-hl-hero-shade="" aria-hidden="true" />
      </div>

      <div className="lx-shell">
        <div className="hl-hero__content">
          <p className="lx-label lx-label--light" data-hl-hero-label="">
            Cultural Journey
          </p>
          <h1 className="lx-display hl-hero__title">
            <span className="lx-mask" data-hl-hero-line="">
              <span>{titleLine1}</span>
            </span>
            <span className="lx-mask" data-hl-hero-line="">
              <span>{titleLine2}</span>
            </span>
          </h1>
          <p className="lx-script hl-hero__script" data-hl-hero-script="">
            A journey through living history.
          </p>
          <p className="lx-copy lx-copy--light hl-hero__copy" data-hl-hero-copy="">
            {supporting}
          </p>
          <div className="hl-hero__actions" data-hl-hero-actions="">
            <a href="#highlight-stories" className="lx-btn lx-btn--ivory">
              Explore the Landmarks
            </a>
            <BookNowTrigger className="lx-link" data-hl-light-link="">
              Book Your Voyage
            </BookNowTrigger>
          </div>
        </div>
      </div>

      <div className="hl-hero__rise" data-hl-hero-rise="" aria-hidden="true" />
    </section>
  );
}
