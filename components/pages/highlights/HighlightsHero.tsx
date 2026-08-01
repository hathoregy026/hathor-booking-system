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
        <div className="hl-hero__curtain" data-hl-hero-curtain="" aria-hidden="true" />
        <div className="hl-hero__overlay" data-hl-hero-overlay="" aria-hidden="true" />
      </div>

      <div className="lux-ed-shell hl-hero__shell">
        <div className="lux-ed-grid hl-hero__grid">
          <aside className="hl-hero__rail" data-hl-hero-marker="">
            <span className="lux-ed-rail__num">01</span>
            <span>Cultural Cinema</span>
            <span className="hl-hero__rail-line" aria-hidden="true" />
            <span>Voyage Highlights</span>
          </aside>

          <div className="hl-hero__lower">
            <p className="lux-ed-label lux-ed-label--light" data-hl-hero-eyebrow="">
              Hathor · The Nile
            </p>
            <h1 className="hl-hero__h1">
              <span className="lux-ed-display lux-ed-mask-line" data-hl-hero-line="">
                <span>{lineOne}</span>
              </span>
              <span className="lux-ed-script hl-hero__script" data-hl-hero-script="">
                Moments shaped by the eternal river.
              </span>
              <span className="lux-ed-display lux-ed-mask-line" data-hl-hero-line="">
                <span>{lineTwo}</span>
              </span>
            </h1>
          </div>

          <div className="hl-hero__aside" data-hl-hero-copy="">
            <p className="hl-hero__float-caption" aria-hidden="true">
              Ancient banks · Quiet water
            </p>
            <p className="lux-ed-copy lux-ed-copy--light">{subtitle}</p>
            <div className="hl-hero__actions" data-hl-hero-actions="">
              <a href="#highlight-stories" className="lux-ed-btn lux-ed-btn--ivory">
                Enter the Chapters
                <span className="lux-ed-btn__arrow" aria-hidden="true">→</span>
              </a>
              <BookNowTrigger className="lux-ed-link hl-hero__book">
                Book Your Voyage
                <span className="lux-ed-link__arrow" aria-hidden="true">→</span>
              </BookNowTrigger>
            </div>
          </div>
        </div>
      </div>

      <div className="hl-hero__plane" data-hl-hero-plane="" aria-hidden="true" />

      <div className="hl-hero__scroll" data-hl-hero-scroll="" aria-hidden="true">
        <span>Scroll to discover</span>
        <span className="hl-hero__scroll-line" />
      </div>
    </section>
  );
}
