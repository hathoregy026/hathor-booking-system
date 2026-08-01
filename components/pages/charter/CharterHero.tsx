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
    <section className="ch-hero" aria-label="Private charter hero">
      <div className="ch-hero__media">
        <div className="ch-hero__img-wrap" data-charter-hero-img="">
          <ManagedImage
            name="charter-hero"
            alt="Overhead view of the Hathor Dahabiya deck and pools on the Nile"
            fill
            priority
            sizes="100vw"
            className="ch-hero__img"
          />
        </div>
        <div className="ch-hero__curtain" data-charter-hero-curtain="" aria-hidden="true" />
        <div
          className="ch-hero__overlay"
          data-charter-hero-overlay=""
          aria-hidden="true"
        />
      </div>

      <div className="lux-ed-shell ch-hero__shell">
        <div className="lux-ed-grid ch-hero__grid">
          <div className="ch-hero__rail" data-charter-hero-marker="">
            <span className="lux-ed-rail__num">01</span>
            <span>Private Invitation</span>
            <span className="ch-hero__rail-meta">Luxor · Aswan · Cairo</span>
          </div>

          <div className="ch-hero__title-zone">
            <p className="lux-ed-label lux-ed-label--light" data-charter-hero-eyebrow="">
              Hathor · Private Charter
            </p>

            <h1 className="ch-hero__h1">
              <span className="lux-ed-display lux-ed-mask-line ch-hero__line" data-charter-hero-line="">
                <span>{lineOne}</span>
              </span>
              <span className="lux-ed-script ch-hero__script" data-charter-hero-script="">
                {subtitle}
              </span>
              <span className="lux-ed-display lux-ed-mask-line ch-hero__line" data-charter-hero-line="">
                <span>{lineTwo}</span>
              </span>
            </h1>
          </div>

          <div className="ch-hero__copy-zone" data-charter-hero-copy="">
            <hr className="lux-ed-rule lux-ed-rule--gold ch-hero__rule" data-charter-hero-rule="" />
            <p className="lux-ed-copy lux-ed-copy--light">{supporting}</p>
            <div className="ch-hero__actions" data-charter-hero-actions="">
              <a href="#charter-request" className="lux-ed-btn lux-ed-btn--ivory">
                Request a Private Voyage
                <span className="lux-ed-btn__arrow" aria-hidden="true">→</span>
              </a>
              <a href="#charter-introduction" className="lux-ed-link" style={{ color: "rgba(245,239,228,0.85)" }}>
                Enter the Experience
                <span className="lux-ed-link__arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <p className="ch-hero__caption" aria-hidden="true">
            The vessel · entirely yours
          </p>
        </div>
      </div>

      <div className="ch-hero__scroll" data-charter-hero-scroll="" aria-hidden="true">
        <span>Descend</span>
        <span className="ch-hero__scroll-line" />
      </div>
    </section>
  );
}
