"use client";

import { ManagedImage } from "@/components/ui/ManagedImage";

type CharterHeroProps = {
  titleLine1: string;
  titleLine2: string;
  supporting: string;
};

export function CharterHero({
  titleLine1,
  titleLine2,
  supporting,
}: CharterHeroProps) {
  return (
    <section className="ch-hero" aria-label="Private charter hero">
      <div className="ch-hero__media">
        <div className="ch-hero__img-wrap" data-ch-hero-img="">
          <ManagedImage
            name="charter-hero"
            alt="Overhead view of the Hathor Dahabiya deck and pools on the Nile"
            fill
            priority
            sizes="100vw"
            className="ch-hero__img"
          />
        </div>
        <div className="ch-hero__curtain" data-ch-hero-curtain="" aria-hidden="true" />
        <div className="ch-hero__shade" data-ch-hero-shade="" aria-hidden="true" />
      </div>

      <div className="lx-shell">
        <div className="ch-hero__content">
          <p className="lx-label lx-label--light" data-ch-hero-label="">
            Private Charter
          </p>
          <h1 className="lx-display ch-hero__title">
            <span className="lx-mask" data-ch-hero-line="">
              <span>{titleLine1}</span>
            </span>
            <span className="lx-mask" data-ch-hero-line="">
              <span>{titleLine2}</span>
            </span>
          </h1>
          <p className="lx-script ch-hero__script" data-ch-hero-script="">
            composed around you
          </p>
          <p className="lx-copy lx-copy--light ch-hero__copy" data-ch-hero-copy="">
            {supporting}
          </p>
          <div className="ch-hero__actions" data-ch-hero-actions="">
            <a href="#charter-request" className="lx-btn lx-btn--ivory">
              Request a Private Voyage
            </a>
            <a href="#charter-introduction" className="lx-link" data-ch-light-link="">
              Discover the Experience
            </a>
          </div>
        </div>
      </div>

      <div className="ch-hero__scroll" data-ch-hero-scroll="" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
