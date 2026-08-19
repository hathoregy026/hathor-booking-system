"use client";

/* eslint-disable @next/next/no-img-element */

import type { CSSProperties } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { GASTRONOMY_DINING_MEDIA as media } from "@/lib/gastronomy-dining-media";

const plate = (number: number) =>
  `/media/gastronomy-dining/dining-plate-${number}.png`;

const typeStyle = {
  "--gd-title-font": '"Gamgote", "Bitho Luxury", Georgia, serif',
  "--gd-script-font": '"Quiet Luxury", "Agraham", cursive',
  "--gd-body-font": 'var(--public-sans, "Plus Jakarta Sans", sans-serif)',
} as CSSProperties;

function Plate({ number, alt, className }: { number: number; alt: string; className: string }) {
  return (
    <figure className={className}>
      <img src={plate(number)} alt={alt} />
    </figure>
  );
}

export function GastronomySpringsDesignPage() {
  return (
    <div className="gastronomy-dining-shell">
      <div className="public-site gastronomy-dining-nav">
        <PublicNavbar />
      </div>

      <main className="gastronomy-dining-page" style={typeStyle}>
        <div className="gastronomy-dining-progress" aria-hidden>
          <i data-v6-progress />
        </div>

        <section className="dining-hero" data-v6-scroll>
          <div className="dining-hero__sticky">
            <figure className="dining-hero__layer dining-hero__layer--a">
              <img src={media.hero} alt="Dinner on Hathor beside the Nile" />
            </figure>
            <figure className="dining-hero__layer dining-hero__layer--b">
              <img src={media.table} alt="A table prepared for an evening voyage" />
            </figure>
            <figure className="dining-hero__layer dining-hero__layer--c">
              <img src={media.courses} alt="Hathor's tasting courses" />
            </figure>
            <figure className="dining-hero__layer dining-hero__layer--d">
              <img src={media.wine} alt="Wine served in the Nile evening light" />
            </figure>
            <div className="dining-hero__veil" />

            <div className="dining-hero__copy dining-hero__copy--open">
              <h1>
                <span className="gd-title-line">Dining on</span>
                <span className="gd-title-line">the Nile.</span>
              </h1>
              <span className="gd-script">A Table in Motion</span>
              <p>
                Egyptian flavours, thoughtful service and riverlight come together in an intimate
                dining experience composed around the rhythm of your voyage.
              </p>
            </div>
            <div className="dining-hero__copy dining-hero__copy--mid">
              <h2>
                <span className="gd-title-line">Riverlight at</span>
                <span className="gd-title-line">every course.</span>
              </h2>
              <span className="gd-script">Egypt, Served Slowly</span>
            </div>
            <div className="dining-hero__copy dining-hero__copy--end">
              <h2>
                <span className="gd-title-line">A voyage</span>
                <span className="gd-title-line">through taste.</span>
              </h2>
              <span className="gd-script">Enter the Hathor Table</span>
              <a className="public-btn-outline-gold gd-home-cta" href="#orbit">
                <span>Explore Dining</span>
              </a>
            </div>
            <div className="gastronomy-dining-hero__edge">DINING ON THE NILE 01 / 10</div>
          </div>
        </section>

        <section id="orbit" className="dining-orbit" data-v6-scroll>
          <div className="dining-orbit__sticky">
            <div className="dining-orbit__word">TASTE</div>
            <Plate number={1} alt="Hathor signature plate" className="dining-plate dining-plate--one" />
            <Plate number={2} alt="Hathor dessert plate" className="dining-plate dining-plate--two" />
            <Plate number={3} alt="Nile-inspired seafood plate" className="dining-plate dining-plate--three" />
            <Plate number={4} alt="Seasonal Egyptian plate" className="dining-plate dining-plate--four" />
            <Plate number={5} alt="Chef's tasting plate" className="dining-plate dining-plate--five" />
            <Plate number={6} alt="Hathor evening plate" className="dining-plate dining-plate--six" />
            <Plate number={7} alt="Hathor river plate" className="dining-plate dining-plate--seven" />
            <div className="dining-orbit__copy">
              <h2>
                <span className="gd-title-line">Seven plates.</span>
                <span className="gd-title-line">One Nile story.</span>
              </h2>
              <span className="gd-script">Time, Beautifully Slowed</span>
              <p>
                Each dish carries a different note of Egypt—bright herbs, warm spice, river fish
                and produce gathered close to the banks.
              </p>
            </div>
          </div>
        </section>

        <section className="dining-course" data-v6-scroll>
          <div className="dining-course__sticky">
            <figure className="dining-course__bg dining-course__bg--1">
              <img src={media.hero} alt="The opening course aboard Hathor" />
            </figure>
            <figure className="dining-course__bg dining-course__bg--2">
              <img src={media.experience} alt="Hathor's dining room beside the Nile" />
            </figure>
            <Plate number={1} alt="Opening plate" className="dining-course__cutout" />
            <div className="dining-course__meta">
              <h2>
                <span className="gd-title-line">First light</span>
                <span className="gd-title-line">on porcelain.</span>
              </h2>
              <span className="gd-script">The Opening Course</span>
              <p>
                A precise opening bite awakens the palate while the river changes colour beyond
                the windows.
              </p>
            </div>
          </div>
        </section>

        <section className="dining-course dining-course--sea" data-v6-scroll>
          <div className="dining-course__sticky">
            <figure className="dining-course__bg dining-course__bg--1">
              <img src={media.table} alt="The Nile course table setting" />
            </figure>
            <figure className="dining-course__bg dining-course__bg--2">
              <img src={media.wine} alt="Wine paired with the Nile course" />
            </figure>
            <Plate number={3} alt="Nile-inspired seafood plate" className="dining-course__cutout dining-course__cutout--right" />
            <div className="dining-course__meta dining-course__meta--left">
              <h2>
                <span className="gd-title-line">Fresh from</span>
                <span className="gd-title-line">the water’s edge.</span>
              </h2>
              <span className="gd-script">River &amp; Sea</span>
              <p>
                Morning market ingredients are prepared with restraint, letting each flavour meet
                the cool evening air.
              </p>
            </div>
          </div>
        </section>

        <section className="dining-cascade" data-v6-scroll>
          <div className="dining-cascade__sticky">
            <header>
              <h2>
                <span className="gd-title-line">Course after</span>
                <span className="gd-title-line">luminous course.</span>
              </h2>
              <span className="gd-script">The Passage of Flavour</span>
            </header>
            <div className="dining-cascade__stack">
              <figure><img src={media.courses} alt="A tableau of Hathor courses" /></figure>
              <figure><img src={media.chef} alt="The Hathor chef finishing a plate" /></figure>
              <figure><img src={media.service} alt="Warm service aboard Hathor" /></figure>
              <figure><img src={media.experience} alt="An intimate Nile table" /></figure>
              <figure><img src={media.table} alt="Dining beside the river" /></figure>
              <figure><img src={media.celebration} alt="A celebration aboard Hathor" /></figure>
            </div>
          </div>
        </section>

        <section className="dining-wine" data-v6-scroll>
          <div className="dining-wine__sticky">
            <img src={media.wine} alt="Wine service aboard Hathor" />
            <div className="dining-wine__veil" />
            <Plate number={6} alt="A plate chosen for the wine pairing" className="dining-wine__glass" />
            <div className="dining-wine__copy">
              <h2>
                <span className="gd-title-line">The pour</span>
                <span className="gd-title-line">joins the voyage.</span>
              </h2>
              <span className="gd-script">Cellar by Candlelight</span>
              <p>
                Carefully selected wines meet Egyptian ingredients in pairings paced around the
                conversation, never the clock.
              </p>
            </div>
          </div>
        </section>

        <section className="dining-chef" data-v6-scroll>
          <div className="dining-chef__sticky">
            <figure className="dining-chef__frame dining-chef__frame--back">
              <img src={media.table} alt="The dining room glowing at night" />
            </figure>
            <figure className="dining-chef__frame dining-chef__frame--front">
              <img src={media.chef} alt="Hathor's chef composing dinner" />
            </figure>
            <div className="dining-chef__copy">
              <h2>
                <span className="gd-title-line">Quiet service.</span>
                <span className="gd-title-line">Perfect timing.</span>
              </h2>
              <span className="gd-script">The Hathor Way</span>
              <p>
                Preferences are remembered, timings follow the room and each plate arrives with
                the quiet confidence of Hathor hospitality.
              </p>
            </div>
          </div>
        </section>

        <section className="dining-course dining-course--sweet" data-v6-scroll>
          <div className="dining-course__sticky">
            <figure className="dining-course__bg dining-course__bg--1">
              <img src={media.courses} alt="The final courses of the evening" />
            </figure>
            <figure className="dining-course__bg dining-course__bg--2">
              <img src={media.celebration} alt="Golden celebration light aboard Hathor" />
            </figure>
            <Plate number={2} alt="Hathor dessert plate" className="dining-course__cutout" />
            <div className="dining-course__meta">
              <h2>
                <span className="gd-title-line">Sweetness</span>
                <span className="gd-title-line">without hurry.</span>
              </h2>
              <span className="gd-script">The Last Light</span>
              <p>
                Dessert lingers with tea, quiet laughter and the lights of the Nile passing slowly
                beyond the deck.
              </p>
            </div>
          </div>
        </section>

        <section className="dining-gallery" data-v6-scroll>
          <div className="dining-gallery__sticky">
            <header>
              <h2>
                <span className="gd-title-line">Every plate.</span>
                <span className="gd-title-line">A private horizon.</span>
              </h2>
              <span className="gd-script">A Hathor Menu in Motion</span>
            </header>
            <Plate number={5} alt="Hathor plate one" className="dining-gallery__a" />
            <Plate number={6} alt="Hathor plate two" className="dining-gallery__b" />
            <Plate number={7} alt="Hathor plate three" className="dining-gallery__c" />
            <div className="dining-gallery__caption">
              Nile herbs. Egyptian citrus. Candlelight on gold. A menu shaped by the season, the
              route and the people gathered around your table.
            </div>
          </div>
        </section>

        <section id="concierge" className="dining-finale" data-v6-scroll>
          <div className="dining-finale__sticky">
            <img src={media.hero} alt="Private dining on Hathor at night" />
            <div className="dining-finale__veil" />
            <Plate number={4} alt="Hathor's final plate" className="dining-finale__plate" />
            <div className="dining-finale__copy">
              <h2>
                <span className="gd-title-line">Your evening.</span>
                <span className="gd-title-line">Beautifully yours.</span>
              </h2>
              <span className="gd-script">A Table on the Nile</span>
              <p>
                A birthday beneath the stars, a private family dinner or a quiet celebration—our
                team will shape the table around you.
              </p>
              <div className="dining-finale__actions">
                <a className="public-btn-outline-gold gd-home-cta" href="/contact"><span>Ask Concierge</span></a>
                <a className="public-btn-outline-gold gd-home-cta" href="/booking"><span>Book Voyage</span></a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="public-site gastronomy-dining-footer">
        <Footer />
      </div>
    </div>
  );
}
