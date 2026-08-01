"use client";

import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { AwImage } from "@/components/pages/awards/AwImage";
import { CE_IMG } from "@/lib/awards-cinema-media";

export function HighlightsHook() {
  return (
    <section className="hl-hook" aria-label="The Journey">
      <div>
        <p className="ce-label" data-ce-line="">
          The Journey
        </p>
        <h1 className="hl-hook__title">
          <span className="hl-hook__line1 ce-display" data-ce-line="">
            Where Time
          </span>
          <span className="hl-hook__line2 ce-italic" data-ce-line="">
            Stands Still.
          </span>
        </h1>
        <p className="hl-hook__sub" data-ce-line="">
          A curated voyage through the heart of ancient Egypt, designed for those
          who seek the extraordinary.
        </p>
      </div>
    </section>
  );
}

export function HighlightsTemples() {
  return (
    <section className="hl-temples" aria-labelledby="hl-temples-title">
      <div className="ce-shell ce-shell--wide hl-temples__grid">
        <div className="ce-img-frame ce-img-frame--gold hl-temples__media">
          <div className="luxury-image" data-ce-image="">
            <AwImage
              src={CE_IMG.temples}
              fallbackSrc={CE_IMG.templesFallback}
              alt="Ancient Egyptian temple"
              sizes="(max-width: 1023px) 100vw, 55vw"
            />
          </div>
        </div>
        <div className="hl-temples__copy" data-ce-reveal="">
          <p className="ce-label" style={{ letterSpacing: "0.2em", fontSize: "0.7rem" }}>
            01 / Ancient Wonders
          </p>
          <h2 id="hl-temples-title" className="hl-temples__title ce-display">
            Temples of the Gods
          </h2>
          <p className="ce-body">
            Stand before monuments that have witnessed millennia of human
            devotion. From the towering columns of Karnak to the intimate
            sanctuaries of Luxor, each stone tells a story carved by the hands of
            masters.
          </p>
          <span className="ce-gold-rule" aria-hidden="true" />
          <a href="/cruises" className="ce-link">
            Read More
          </a>
        </div>
      </div>
    </section>
  );
}

export function HighlightsNile() {
  return (
    <section className="hl-nile" aria-labelledby="hl-nile-title">
      <div className="hl-nile__media">
        <div className="luxury-image" data-ce-image="">
          <AwImage src={CE_IMG.nile} alt="Golden hour on the Nile" />
        </div>
        <div className="hl-nile__shade" aria-hidden="true" />
      </div>
      <div className="hl-nile__content" data-ce-reveal="">
        <h2 id="hl-nile-title" className="hl-nile__title ce-display">
          Sail the Eternal River
        </h2>
        <p className="hl-nile__sub ce-italic">
          The Nile has been the lifeblood of civilization for 5,000 years. Now, it
          carries you through time itself.
        </p>
      </div>
    </section>
  );
}

const ONBOARD = [
  {
    src: CE_IMG.suite,
    caption: "Private Suites",
    large: true,
  },
  {
    src: CE_IMG.dining,
    caption: "Fine Dining",
    large: false,
  },
  {
    src: CE_IMG.spa,
    caption: "Wellness",
    large: false,
  },
] as const;

export function HighlightsOnboard() {
  return (
    <section className="hl-onboard" aria-labelledby="hl-onboard-title">
      <div className="ce-shell ce-shell--wide">
        <header className="hl-onboard__head" data-ce-reveal="">
          <p className="ce-label">Onboard</p>
          <h2 id="hl-onboard-title" className="hl-onboard__title ce-display">
            Quiet Luxury
          </h2>
        </header>
        <div className="hl-onboard__masonry">
          {ONBOARD.map((item) => (
            <article
              key={item.caption}
              className={`hl-onboard__item${item.large ? " hl-onboard__item--lg" : ""}`}
            >
              <div className="luxury-image" data-ce-image="" style={{ position: "absolute", inset: 0 }}>
                <AwImage
                  src={item.src}
                  alt={item.caption}
                  sizes={item.large ? "(max-width: 899px) 100vw, 58vw" : "(max-width: 899px) 100vw, 40vw"}
                />
              </div>
              <p className="hl-onboard__caption">{item.caption}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HighlightsInvite() {
  return (
    <section className="hl-invite" aria-labelledby="hl-invite-title">
      <h2 id="hl-invite-title" className="hl-invite__title ce-display" data-ce-reveal="">
        Begin Your Journey
      </h2>
      <p className="hl-invite__sub" data-ce-reveal="">
        Secure your private passage through ancient Egypt.
      </p>
      <div data-ce-reveal="">
        <BookNowTrigger className="ce-btn">Reserve Your Voyage</BookNowTrigger>
      </div>
    </section>
  );
}
