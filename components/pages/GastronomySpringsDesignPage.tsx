"use client";

/* eslint-disable @next/next/no-img-element */

import type { CSSProperties, ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { AnimaTitleScroll } from "@/components/public/AnimaTitleScroll";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { GASTRONOMY_DINING_MEDIA as media, diningPlateSlotName } from "@/lib/gastronomy-dining-media";

const typeStyle = {
  "--nib-display": '"Bitho Luxury", cursive',
  "--nib-copy": '"Rollgates Luxury Italic", serif',
} as CSSProperties;

const stories = [
  {
    number: "01",
    time: "SUNRISE",
    place: "UPPER DECK",
    title: "BREAKFAST",
    image: media.hero,
    alt: "Breakfast served aboard Hathor in the Nile morning light",
  },
  {
    number: "02",
    time: "EVENING",
    place: "DINING SALON",
    title: "CHEF'S TABLE",
    image: media.chef,
    alt: "Hathor's chef composing an evening course",
  },
  {
    number: "03",
    time: "GOLDEN HOUR",
    place: "RIVER DECK",
    title: "NILE SUPPER",
    image: media.table,
    alt: "An intimate supper overlooking the Nile",
  },
  {
    number: "04",
    time: "DAILY",
    place: "FITNESS DECK",
    title: "MOVE",
    image: "/media/hathor/r2/wellness-fitness.webp",
    alt: "Guests training in Hathor's onboard fitness space",
  },
  {
    number: "05",
    time: "ANY HOUR",
    place: "YOUR SUITE",
    title: "SUITE SERVICE",
    image: "/media/hathor/optimized/room-royal.webp",
    alt: "Private service in a Hathor Nile suite",
  },
] as const;

function Image({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <figure className={className}>
      <img src={src} alt={alt} />
    </figure>
  );
}

function FlipImage({
  front,
  back,
  alt,
  className = "",
  axis = "up",
}: {
  front: string;
  back: string;
  alt: string;
  className?: string;
  axis?: "up" | "left" | "right";
}) {
  return (
    <figure className={`nib-flip nib-flip--${axis} ${className}`} data-nib-flip>
      <img src={front} alt={alt} />
      <img src={back} alt="" aria-hidden />
    </figure>
  );
}

function Plate({
  number,
  className = "",
  style,
}: {
  number: number;
  className?: string;
  style?: CSSProperties;
}) {
  const slotName = diningPlateSlotName(number);
  const image = useSiteImage(slotName);
  if (!image.src.trim()) return null;
  return (
    <figure
      className={`nib-plate nib-plate--${number} ${className}`}
      data-nib-plate
      data-site-image={slotName}
      style={style}
    >
      <img src={image.src} alt={image.alt} />
    </figure>
  );
}

function Panel({ className, children }: { className: string; children: ReactNode }) {
  return (
    <article className={`nib-panel ${className}`} data-nib-panel>
      {children}
    </article>
  );
}

export function GastronomySpringsDesignPage() {
  return (
    <div className="gastronomy-dining-shell" style={typeStyle}>
      <AnimaTitleScroll />
      <div className="public-site gastronomy-dining-nav">
        <PublicNavbar />
      </div>

      <main className="nib-dining">
        <div className="nib-progress" aria-hidden>
          <i data-nib-progress />
        </div>

        <section className="nib-horizontal" data-nib-horizontal aria-label="The Hathor dining story">
          <div className="nib-horizontal__sticky">
            <div className="nib-fixed-brand" aria-hidden>HATHOR</div>
            <div className="nib-fixed-rail" aria-hidden>
              <span>DINING</span><span>MOVE</span><span>REST</span>
            </div>
            <div className="nib-track" data-nib-track>
              <Panel className="nib-intro nib-surface--cream">
                <span className="nib-chapter">Dining</span>
                <div className="nib-intro__titles" data-anima-title>
                  <h1><span>TABLES</span><span>ON THE NILE</span></h1>
                  <h2><span>MADE TO</span><span>MOVE WITH YOU</span></h2>
                  <h2><span>TASTE</span><em>EGYPT</em></h2>
                </div>
                <p className="nib-intro__copy">
                  In a world that hurries, Hathor sets another rhythm: market-led Egyptian
                  cooking, gracious service and time enough to watch the Nile change colour.
                  Meals, movement and suite rest are composed to last the voyage—not to
                  chase passing fashion.
                </p>
                <span className="nib-intro__index">01</span>
                <span className="nib-intro__copyright">HATHOR DAHABIYA ©2026</span>
              </Panel>

              <Panel className="nib-principal nib-surface--cream">
                <Image src={media.hero} alt="Dining beside the Nile aboard Hathor" className="nib-principal__main" />
                <FlipImage
                  className="nib-principal__top"
                  front={media.courses}
                  back={media.chef}
                  alt="A sequence of Hathor tasting courses"
                  axis="up"
                />
                <FlipImage
                  className="nib-principal__bottom"
                  front={media.service}
                  back={media.table}
                  alt="Warm attentive service aboard Hathor"
                  axis="up"
                />
                <span className="nib-side-label">THE TABLE</span>
              </Panel>

              <Panel className="nib-statement nib-surface--cream">
                <span className="nib-chapter">The experience</span>
                <div className="nib-statement__title" data-anima-title>
                  <h2>DINING THAT INVITES</h2>
                  <h2>YOU TO LINGER</h2>
                  <h2>MOVE WITH</h2>
                  <h2>THE RIVER</h2>
                </div>
                <p>
                  Every table is shaped around the people who gather there. Breakfast arrives
                  with first light; dinner follows the breeze; the gym stays close to the deck;
                  your suite remembers how you like to rest. Design, flavour and ease of life
                  meet as one Hathor day.
                </p>
              </Panel>

              <Panel className="nib-image-text nib-surface--gold">
                <FlipImage
                  className="nib-image-text__wide"
                  front={media.restaurant}
                  back={media.wine}
                  alt="Hathor's intimate dining salon"
                  axis="right"
                />
                <FlipImage
                  className="nib-image-text__small"
                  front={media.celebration}
                  back="/media/hathor/optimized/room-suite.webp"
                  alt="A candlelit celebration on Hathor"
                  axis="left"
                />
                <p>
                  On Hathor, dining is part of the voyage—not a pause from it. Egyptian produce,
                  fresh herbs and precise technique meet an atmosphere that remains warm,
                  unforced and open to the river: more comfort, more flavour, more quiet luxury.
                </p>
              </Panel>

              <Panel className="nib-marquee nib-surface--cream" >
                <div aria-hidden>
                  <span>RITUALS</span><b>✦</b><span>RITUALS</span><b>✦</b><span>RITUALS</span><b>✦</b>
                </div>
              </Panel>

              <Panel className="nib-atelier nib-surface--cream">
                <div className="nib-atelier__copy">
                  <span className="nib-chapter">Seven courses</span>
                  <h2 data-anima-title>PLATES THAT<br />ARRIVE<br /><em>LIKE MOMENTS</em></h2>
                  <p>
                    Each course enters slowly, settles into its place and gives the table time
                    to look, breathe and taste.
                  </p>
                </div>
                <div className="nib-atelier__plates" data-nib-plate-stage>
                  <Plate number={1} style={{ "--plate-delay": "0.00" } as CSSProperties} />
                  <Plate number={2} style={{ "--plate-delay": "0.08" } as CSSProperties} />
                  <Plate number={3} style={{ "--plate-delay": "0.16" } as CSSProperties} />
                  <Plate number={4} style={{ "--plate-delay": "0.24" } as CSSProperties} />
                  <Plate number={5} style={{ "--plate-delay": "0.32" } as CSSProperties} />
                  <Plate number={6} style={{ "--plate-delay": "0.40" } as CSSProperties} />
                  <Plate number={7} style={{ "--plate-delay": "0.48" } as CSSProperties} />
                </div>
              </Panel>

              <Panel className="nib-values nib-surface--gold">
                <div className="nib-value">
                  <p>Egyptian ingredients are treated with restraint: bright citrus, warm spice,
                    river fish and vegetables gathered close to the banks.</p>
                  <span>01</span><h2 data-anima-title>TABLE</h2>
                  <Plate number={3} className="nib-value__plate" />
                </div>
                <div className="nib-value">
                  <p>The onboard gym keeps movement close—an unhurried morning session while
                    palms and villages pass beyond the deck.</p>
                  <span>02</span><h2 data-anima-title>MOVEMENT</h2>
                  <Image src="/media/hathor/r2/wellness-fitness.webp" alt="Hathor onboard fitness" className="nib-value__image" />
                </div>
                <div className="nib-value">
                  <p>Your suite is the quiet counterpoint: generous river views, thoughtful
                    details and private service whenever you prefer to stay in.</p>
                  <span>03</span><h2 data-anima-title>REST</h2>
                  <Image src="/media/hathor/optimized/room-suite.webp" alt="A calm Hathor suite" className="nib-value__image" />
                </div>
              </Panel>

              <Panel className="nib-stories-intro nib-surface--cream">
                <span className="nib-chapter">Experiences</span>
                <p>
                  Luxury does not need to announce itself. It is felt in exact timing, a favourite
                  drink remembered, room to move and the freedom to dine wherever the river looks best.
                </p>
              </Panel>

              {stories.map((story) => (
                <Panel className="nib-story nib-surface--cream" key={story.number}>
                  <Image src={story.image} alt={story.alt} className="nib-story__image" />
                  <div className="nib-story__meta">
                    <span>{story.time}</span><span>{story.place}</span>
                    <span>{story.number}</span><a href="/contact">Open Story</a>
                  </div>
                  <h2 data-anima-title>{story.title}</h2>
                </Panel>
              ))}

              <Panel className="nib-story-end nib-surface--cream">
                <span className="nib-chapter">Beyond the table</span>
                <h2 data-anima-title>WHO SAID<br />PLEASURE<br />CANNOT BE<br /><em>FUNCTIONAL?</em></h2>
                <p>
                  Dining, movement and rest are composed as one continuous experience. Nothing is
                  rushed, nothing is overworked, and every detail serves the ease of life aboard.
                </p>
                <a className="public-btn-outline-gold nib-button" href="/booking"><span>Book Voyage</span></a>
              </Panel>

              <Panel className="nib-close nib-surface--gold">
                <FlipImage
                  front={media.wine}
                  back={media.hero}
                  alt="The last golden hour at the Hathor table"
                  axis="up"
                />
                <Plate number={4} className="nib-close__plate" />
                <span>02</span>
              </Panel>
            </div>
          </div>
        </section>

        <section className="nib-contact nib-surface--cream" data-nib-reveal>
          <span className="nib-contact__eyebrow">(Concierge)</span>
          <h2 data-anima-title>SHAPE YOUR<br />VOYAGE</h2>
        </section>

        <section className="nib-double nib-surface--cream" data-nib-reveal>
          <Image src={media.table} alt="A Hathor table prepared beside the river" />
          <Image src="/media/hathor/r2/wellness-fitness.webp" alt="Hathor's onboard gym" />
        </section>

        <section className="nib-lines nib-surface--cream" data-nib-reveal data-anima-title>
          <h2>DINING WITH</h2>
          <h2>ROOM TO</h2>
          <h2>BREATHE</h2>
        </section>

        <section className="nib-contact-copy nib-surface--cream" data-nib-reveal>
          <div />
          <div>
            <p>
              Tell us how you like to travel. Our team can shape private dinners, dietary requests,
              celebrations, fitness time and suite service around the natural pace of your Nile voyage.
            </p>
            <a href="mailto:reservations@hathorcruise.com">reservations@hathorcruise.com</a>
          </div>
        </section>

        <section className="nib-contact-action nib-surface--cream" data-nib-reveal>
          <a className="public-btn-outline-gold nib-button nib-button--large" href="/contact">
            <span>Plan Voyage</span>
          </a>
        </section>

        <section className="nib-epilogue nib-surface--cream" data-nib-reveal>
          <div className="nib-epilogue__social">
            <a href="https://www.instagram.com/hathorcruise/">INSTAGRAM</a><span>|</span>
            <a href="mailto:reservations@hathorcruise.com">reservations@hathorcruise.com</a><span>(2026)</span>
          </div>
          <div className="nib-epilogue__feature">
            <span>THE HATHOR TABLE</span>
            <Image src={media.celebration} alt="A private celebration on Hathor" />
            <h3>PRIVATE DINING</h3>
            <p>Egyptian flavour, candlelight and the Nile moving beside you.</p>
          </div>
          <div className="nib-epilogue__legal">
            <span>HATHOR DAHABIYA ©2026</span>
            <a href="/privacy">PRIVACY</a><a href="/terms">VOYAGE TERMS</a><a href="/contact">CONTACT</a>
          </div>
        </section>
      </main>

      <div className="public-site gastronomy-dining-footer">
        <Footer />
      </div>
    </div>
  );
}
