"use client";

import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { AwImage } from "@/components/pages/awards/AwImage";
import { CE_IMG } from "@/lib/awards-cinema-media";

export function HighlightsHook() {
  return (
    <section className="hl-hook" aria-label="The Journey">
      <p className="ce-label reveal-label mb-8" style={{ opacity: 0 }}>
        The Journey
      </p>
      <h1 className="hl-hook__h1 ce-serif">
        <span className="hl-hook__mask">
          <span className="block reveal-text">Where Time</span>
        </span>
        <span className="hl-hook__mask">
          <span className="block reveal-text ce-italic" style={{ color: "#1C1C1C" }}>
            Stands Still.
          </span>
        </span>
      </h1>
      <p className="hl-hook__sub reveal-subtext" style={{ opacity: 0 }}>
        A curated voyage through the heart of ancient Egypt, designed for those
        who seek the extraordinary.
      </p>
    </section>
  );
}

export function HighlightsTemples() {
  return (
    <section className="hl-temples" aria-labelledby="hl-temples-title">
      <div className="hl-temples__media">
        <div className="hl-temples__frame">
          <div className="parallax-img hl-temples__img">
            <AwImage
              src={CE_IMG.temples}
              fallbackSrc={CE_IMG.templesFallback}
              alt="Ancient Egyptian temple"
              sizes="(max-width: 767px) 100vw, 42vw"
              className="ce-fill"
            />
          </div>
        </div>
      </div>
      <div className="hl-temples__copy">
        <p
          className="ce-label"
          style={{ letterSpacing: "0.2em", marginBottom: "1.5rem" }}
        >
          01 / Ancient Wonders
        </p>
        <h2 id="hl-temples-title" className="hl-temples__title ce-serif">
          Temples of the Gods
        </h2>
        <p className="ce-body-copy hl-temples__body">
          Stand before monuments that have witnessed millennia of human
          devotion. From the towering columns of Karnak to the intimate
          sanctuaries of Luxor, each stone tells a story carved by the hands of
          masters.
        </p>
        <div className="hl-temples__rule" aria-hidden="true" />
        <a href="/cruises" className="ce-story-link">
          Read the Story
        </a>
      </div>
    </section>
  );
}

export function HighlightsNile() {
  return (
    <section className="hl-nile" aria-label="The Nile">
      <div className="parallax-bg hl-nile__img">
        <AwImage src={CE_IMG.nile} alt="Golden hour on the Nile" />
      </div>
      <div className="hl-nile__shade" aria-hidden="true" />
      <blockquote className="hl-nile__quote ce-serif ce-italic reveal-subtext">
        &ldquo;The Nile has been the lifeblood of civilization for 5,000 years.
        Now, it carries you through time itself.&rdquo;
      </blockquote>
    </section>
  );
}

export function HighlightsOnboard() {
  return (
    <section className="hl-onboard" aria-labelledby="hl-onboard-title">
      <div className="hl-onboard__inner">
        <header className="hl-onboard__head">
          <p className="ce-label">Onboard</p>
          <h2 id="hl-onboard-title" className="hl-onboard__title ce-serif">
            Sanctuaries at Sea
          </h2>
        </header>
        <div className="hl-onboard__grid">
          <article className="hl-onboard__item hl-onboard__item--lg group">
            <AwImage
              src={CE_IMG.suite}
              alt="Private suite interior"
              sizes="(max-width: 767px) 100vw, 50vw"
            />
          </article>
          <article className="hl-onboard__item hl-onboard__item--sm group">
            <AwImage
              src={CE_IMG.dining}
              alt="Fine dining"
              sizes="(max-width: 767px) 100vw, 50vw"
            />
          </article>
          <article className="hl-onboard__item hl-onboard__item--sm group">
            <AwImage
              src={CE_IMG.spa}
              alt="Spa and wellness"
              sizes="(max-width: 767px) 100vw, 50vw"
            />
          </article>
        </div>
      </div>
    </section>
  );
}

export function HighlightsInvite() {
  return (
    <section className="hl-invite" aria-labelledby="hl-invite-title">
      <h2 id="hl-invite-title" className="hl-invite__title ce-serif">
        Begin Your Journey
      </h2>
      <p className="ce-body-copy hl-invite__sub">
        Secure your private passage through ancient Egypt.
      </p>
      <BookNowTrigger className="ce-btn">Reserve Your Voyage</BookNowTrigger>
    </section>
  );
}
