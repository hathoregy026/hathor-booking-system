"use client";

import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { AwImage } from "@/components/pages/awards/AwImage";
import { AW_IMG } from "@/lib/awards-cinema-media";

export function HighlightsHero() {
  return (
    <section className="aw-hero" data-aw-hero="" aria-label="Highlights hero">
      <div className="aw-hero__media">
        <div className="aw-hero__img" data-aw-hero-img="">
          <AwImage src={AW_IMG.nileGolden} alt="Nile at golden hour" priority />
        </div>
        <div className="aw-hero__shade" aria-hidden="true" />
      </div>
      <div className="aw-hero__content">
        <p className="aw-label" data-aw-hero-line="">
          Experience the Extraordinary
        </p>
        <h1 className="aw-hero__title aw-display" data-aw-hero-line="">
          Highlights
        </h1>
        <p className="aw-hero__sub aw-italic" data-aw-hero-line="">
          Discover the moments that define your journey through ancient Egypt
        </p>
      </div>
      <div className="aw-scroll-hint" aria-hidden="true">
        Scroll to Explore
        <span className="aw-scroll-hint__line" />
      </div>
    </section>
  );
}

const TEMPLE_BLOCKS = [
  {
    label: "01 / Ancient Wonders",
    title: "Temples of the Gods",
    body: "Stand before monuments that have witnessed millennia of human devotion. From Karnak to Luxor, each temple tells a story carved in stone.",
  },
  {
    label: "02 / Sacred Necropolis",
    title: "Valley of Kings",
    body: "Descend into the royal tombs where pharaohs were laid to rest with treasures for the afterlife. A journey into the heart of ancient Egyptian belief.",
  },
  {
    label: "03 / Monumental Ambition",
    title: "Abu Simbel",
    body: "Witness the colossal statues of Ramses II, carved into the mountainside over 3,000 years ago. A testament to human ambition and engineering mastery.",
  },
] as const;

export function HighlightsTemples() {
  return (
    <section className="hl-temples" data-hl-temples="" aria-label="The Temples">
      <div className="hl-temples__grid">
        <div className="hl-temples__media" data-hl-temples-media="">
          <div className="hl-temples__img" data-hl-temples-img="">
            <AwImage
              src={AW_IMG.luxorTemple}
              alt="Ancient Egyptian temple along the Nile"
              sizes="(max-width: 1023px) 100vw, 50vw"
            />
          </div>
        </div>
        <div className="hl-temples__copy">
          {TEMPLE_BLOCKS.map((block) => (
            <article
              key={block.title}
              className="hl-temples__block"
              data-aw-reveal=""
            >
              <p className="aw-label">{block.label}</p>
              <h2 className="hl-temples__title aw-display">{block.title}</h2>
              <p className="hl-temples__body">{block.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HighlightsNile() {
  return (
    <section className="hl-nile" data-hl-nile="" aria-label="The Nile">
      <div className="hl-nile__media">
        <div className="hl-nile__img" data-hl-nile-img="">
          <AwImage src={AW_IMG.nileGolden} alt="Felucca sailing on the Nile" />
        </div>
        <div className="hl-nile__shade" aria-hidden="true" />
      </div>
      <div className="hl-nile__content" data-aw-reveal="">
        <h2 className="hl-nile__title aw-display">Sail the Eternal River</h2>
        <p className="hl-nile__sub aw-italic">
          The Nile has been the lifeblood of civilization for 5,000 years. Now,
          it carries you through time itself.
        </p>
      </div>
    </section>
  );
}

const GALLERY = [
  {
    src: AW_IMG.suite,
    title: "Private Suites",
    body: "Quiet cabins opening onto the river — designed for unhurried mornings.",
  },
  {
    src: AW_IMG.dining,
    title: "Fine Dining",
    body: "Seasonal menus shaped around your preferences and the day’s voyage.",
  },
  {
    src: AW_IMG.spa,
    title: "Wellness",
    body: "Soft rituals and rest between temples, tombs and golden light.",
  },
  {
    src: AW_IMG.deck,
    title: "Deck at Sunset",
    body: "Open air, Nile breeze and the last light of Egypt.",
  },
  {
    src: AW_IMG.excursion,
    title: "Shore Excursions",
    body: "Guided encounters with the monuments that define the Upper Nile.",
  },
] as const;

export function HighlightsGallery() {
  return (
    <section
      className="hl-gallery"
      data-hl-gallery=""
      aria-label="Luxury onboard"
    >
      <div className="hl-gallery__runway">
        <div className="hl-gallery__pin" data-hl-gallery-pin="">
          <div className="hl-gallery__track" data-hl-gallery-track="">
            {GALLERY.map((card) => (
              <article key={card.title} className="hl-gallery__card">
                <AwImage
                  src={card.src}
                  alt={card.title}
                  sizes="(max-width: 1023px) 100vw, 60vw"
                  className="aw-fill"
                />
                <div className="hl-gallery__card-shade" aria-hidden="true" />
                <div className="hl-gallery__card-copy">
                  <h3 className="hl-gallery__card-title aw-display">
                    {card.title}
                  </h3>
                  <p className="hl-gallery__card-body">{card.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HighlightsCta() {
  return (
    <section className="aw-cta" data-hl-cta="" aria-label="Begin your journey">
      <div className="aw-hero__media">
        <AwImage src={AW_IMG.nileGolden} alt="Nile sunset" />
        <div className="aw-hero__shade--dark" aria-hidden="true" />
      </div>
      <div className="aw-cta__content" data-aw-reveal="">
        <h2 className="aw-cta__title aw-display">Begin Your Journey</h2>
        <p className="aw-cta__sub aw-italic">
          Secure your private passage through ancient Egypt
        </p>
        <BookNowTrigger className="aw-btn">Reserve Your Voyage</BookNowTrigger>
      </div>
    </section>
  );
}
