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
    <section className="ch-hero" aria-label="Private charter" data-ch-hero="">
      <div className="ch-hero__media">
        <div className="ch-hero__img-wrap" data-ch-hero-img="">
          <ManagedImage
            name="charter-hero"
            alt="Private deck and pools aboard Hathor Dahabiya"
            fill
            priority
            sizes="100vw"
            className="ch-hero__img"
          />
        </div>
        <div className="ch-hero__veil" data-ch-hero-veil="" aria-hidden="true" />
        <div className="ch-hero__shade" data-ch-hero-shade="" aria-hidden="true" />
      </div>

      <div className="lx-shell">
        <div className="ch-hero__content">
          <span className="lx-horizon ch-hero__line" data-ch-hero-line-gold="" aria-hidden="true" />
          <h1 className="lx-display ch-hero__title">
            <span className="lx-mask" data-ch-hero-line="">
              <span>{titleLine1}</span>
            </span>
            <span className="lx-mask" data-ch-hero-line="">
              <span>{titleLine2}</span>
            </span>
          </h1>
          <p className="lx-script ch-hero__script" data-ch-hero-script="">
            composed for you
          </p>
          <p className="lx-copy lx-copy--light ch-hero__copy" data-ch-hero-copy="">
            {supporting}
          </p>
          <a
            href="#charter-request"
            className="lx-btn lx-btn--ivory"
            data-ch-hero-cta=""
          >
            Request a Private Voyage
          </a>
        </div>
      </div>
    </section>
  );
}
