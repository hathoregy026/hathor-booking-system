"use client";

import { ManagedImage } from "@/components/ui/ManagedImage";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";

type HighlightsHeroProps = {
  titleMain: string;
  titleSecond: string;
  subtitle: string;
};

export function HighlightsHero({
  titleMain,
  titleSecond,
  subtitle,
}: HighlightsHeroProps) {
  const lineOne = titleMain.trim() || "DAHABIYA";
  const lineTwo = titleSecond.trim() || "CRUISE HIGHLIGHTS";

  return (
    <section className="hl-hero" aria-label="Voyage highlights hero">
      <div className="hl-hero__media">
        <div className="hl-hero__img-wrap" data-hl-hero-img="">
          <ManagedImage
            name="highlights-hero"
            alt="Hathor Dahabiya on the Nile at dusk"
            fill
            priority
            sizes="100vw"
            className="hl-hero__img"
          />
        </div>
        <div
          className="hl-hero__overlay"
          data-hl-hero-overlay=""
          aria-hidden="true"
        />
        <div className="hl-hero__vignette" aria-hidden="true" />
      </div>

      <div className="hl-shell hl-hero__inner">
        <div className="hl-hero__content">
          <p
            className="hl-eyebrow hl-eyebrow--light"
            data-hl-hero-eyebrow=""
          >
            Hathor · The Nile
          </p>
          <p className="hl-hero__chapter" data-hl-hero-chapter="">
            Voyage Highlights
          </p>

          <h1 className="hl-hero__title-block">
            <span className="hl-display hl-hero__line" data-hl-hero-line="">
              <span>{lineOne}</span>
            </span>
            <span className="hl-display hl-hero__line" data-hl-hero-line="">
              <span>{lineTwo}</span>
            </span>
          </h1>

          <p className="hl-script hl-hero__script" data-hl-hero-script="">
            Moments shaped by the eternal river.
          </p>

          <p className="hl-body hl-body--light" data-hl-hero-copy="">
            {subtitle ||
              "Discover the ancient landmarks, quiet riverbanks and intimate experiences that define a voyage aboard Hathor."}
          </p>

          <div className="hl-hero__actions" data-hl-hero-actions="">
            <a href="#highlight-stories" className="hl-btn hl-btn--ivory">
              Explore the Highlights
              <span className="hl-btn__arrow" aria-hidden="true">
                →
              </span>
            </a>
            <BookNowTrigger className="hl-link hl-link--light">
              Book Your Voyage
              <span className="hl-link__arrow" aria-hidden="true">
                →
              </span>
            </BookNowTrigger>
          </div>
        </div>

        <div className="hl-hero__marker" data-hl-hero-marker="">
          <span className="hl-hero__marker-num">01</span>
          <span>Highlights</span>
        </div>
      </div>

      <p className="hl-hero__caption" aria-hidden="true">
        Hathor Dahabiya · The Nile
      </p>

      <div
        className="hl-hero__scroll"
        data-hl-hero-scroll=""
        aria-hidden="true"
      >
        <span>Scroll to discover</span>
        <span className="hl-hero__scroll-line" />
      </div>
    </section>
  );
}
