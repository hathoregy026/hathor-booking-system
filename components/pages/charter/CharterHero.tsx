"use client";

import { ManagedImage } from "@/components/ui/ManagedImage";

type CharterHeroProps = {
  titleMain: string;
  titleSecond: string;
  subtitle: string;
  supporting: string;
};

export function CharterHero({
  titleMain,
  titleSecond,
  subtitle,
  supporting,
}: CharterHeroProps) {
  const lineOne = titleMain.trim() || "THE NILE";
  const lineTwo = titleSecond.trim() || "EXCLUSIVELY YOURS";

  return (
    <section className="charter-hero" aria-label="Private charter hero">
      <div className="charter-hero__media">
        <div className="charter-hero__img-wrap" data-charter-hero-img="">
          <ManagedImage
            name="charter-hero"
            alt="Overhead view of the Hathor Dahabiya deck and pools on the Nile"
            fill
            priority
            sizes="100vw"
            className="charter-hero__img"
          />
        </div>
        <div
          className="charter-hero__overlay"
          data-charter-hero-overlay=""
          aria-hidden="true"
        />
      </div>

      <div className="charter-hero__inner">
        <div className="charter-hero__content">
          <p
            className="charter-eyebrow charter-eyebrow--light"
            data-charter-hero-eyebrow=""
          >
            Private Charter · The Nile
          </p>

          <h1 className="charter-hero__title-block">
            <span className="charter-display charter-hero__line" data-charter-hero-line="">
              <span>{lineOne}</span>
            </span>
            <span
              className="charter-script charter-hero__script"
              data-charter-hero-script=""
            >
              {subtitle}
            </span>
            <span className="charter-display charter-hero__line" data-charter-hero-line="">
              <span>{lineTwo}</span>
            </span>
          </h1>

          <p
            className="charter-copy charter-copy--light"
            data-charter-hero-copy=""
          >
            {supporting}
          </p>

          <div className="charter-hero__actions" data-charter-hero-actions="">
            <a href="#charter-request" className="charter-btn charter-btn--ivory">
              Request a Private Voyage
              <span className="charter-btn__arrow" aria-hidden="true">
                →
              </span>
            </a>
            <a href="#charter-introduction" className="charter-link">
              Discover the Experience
              <span className="charter-link__arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>

        <div className="charter-hero__marker" data-charter-hero-marker="">
          <span className="charter-hero__marker-num">01</span>
          <span>Private Charter</span>
        </div>
      </div>

      <div className="charter-hero__scroll" data-charter-hero-scroll="" aria-hidden="true">
        <span>Scroll</span>
        <span className="charter-hero__scroll-line" />
      </div>
    </section>
  );
}
