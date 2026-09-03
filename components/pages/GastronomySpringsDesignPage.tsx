"use client";

/* eslint-disable @next/next/no-img-element */

import type { CSSProperties, ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { AnimaTitleScroll } from "@/components/public/AnimaTitleScroll";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { diningPlateSlotName } from "@/lib/gastronomy-dining-media";
import { siteImageAnchorId } from "@/lib/site-image-preview";

const typeStyle = {
  "--nib-display": '"Bitho Luxury", cursive',
  "--nib-copy": '"Rollgates Luxury Italic", serif',
} as CSSProperties;

/**
 * Live Dining Springs Design → dashboard Site Image slots.
 * Keep labels aligned with Admin → Site Images → Dining.
 */
const DINING_LIVE_SLOTS = {
  introHero: "dining-intro-hero",
  courses: "dining-course-layers",
  chef: "dining-first-light",
  service: "dining-lounge",
  table: "dining-closing",
  restaurant: "dining-private-menu",
  wine: "dining-wine-pairing",
  celebration: "dining-celebration",
  fitness: "wellness-fitness",
  suite: "room-suite",
} as const;

const stories = [
  {
    number: "01",
    time: "SUNRISE",
    place: "UPPER DECK",
    title: "BREAKFAST",
    slot: DINING_LIVE_SLOTS.introHero,
    alt: "Breakfast served aboard Hathor in the Nile morning light",
  },
  {
    number: "02",
    time: "EVENING",
    place: "DINING SALON",
    title: "CHEF'S TABLE",
    slot: DINING_LIVE_SLOTS.chef,
    alt: "Hathor's chef composing an evening course",
  },
  {
    number: "03",
    time: "GOLDEN HOUR",
    place: "RIVER DECK",
    title: "NILE SUPPER",
    slot: DINING_LIVE_SLOTS.table,
    alt: "An intimate supper overlooking the Nile",
  },
  {
    number: "04",
    time: "DAILY",
    place: "FITNESS DECK",
    title: "MOVE",
    slot: DINING_LIVE_SLOTS.fitness,
    alt: "Guests training in Hathor's onboard fitness space",
  },
  {
    number: "05",
    time: "ANY HOUR",
    place: "YOUR SUITE",
    title: "SUITE SERVICE",
    slot: DINING_LIVE_SLOTS.suite,
    alt: "Private service in a Hathor Nile suite",
  },
] as const;

function SlotImage({
  slot,
  alt,
  className = "",
  previewAnchor = true,
}: {
  slot: string;
  alt?: string;
  className?: string;
  previewAnchor?: boolean;
}) {
  const image = useSiteImage(slot);
  return (
    <figure
      className={className}
      id={previewAnchor ? siteImageAnchorId(slot) : undefined}
      data-site-image={slot}
    >
      <img src={image.src} alt={alt ?? image.alt} />
    </figure>
  );
}

function SlotFlipImage({
  frontSlot,
  backSlot,
  alt,
  className = "",
  axis = "up",
}: {
  frontSlot: string;
  backSlot: string;
  alt: string;
  className?: string;
  axis?: "up" | "left" | "right";
}) {
  const front = useSiteImage(frontSlot);
  const back = useSiteImage(backSlot);
  return (
    <figure
      className={`nib-flip nib-flip--${axis} ${className}`}
      data-nib-flip
      data-site-image={frontSlot}
      id={siteImageAnchorId(frontSlot)}
    >
      <img src={front.src} alt={alt || front.alt} />
      <img src={back.src} alt="" aria-hidden />
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
      id={siteImageAnchorId(slotName)}
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

function StoryPanel({
  story,
}: {
  story: (typeof stories)[number];
}) {
  const image = useSiteImage(story.slot);
  return (
    <Panel className="nib-story nib-surface--cream">
      <SlotImage
        slot={story.slot}
        alt={story.alt || image.alt}
        className="nib-story__image"
      />
      <div className="nib-story__meta">
        <span>{story.time}</span>
        <span>{story.place}</span>
        <span>{story.number}</span>
        <a href="/contact">Open Story</a>
      </div>
      <h2 data-anima-title>{story.title}</h2>
    </Panel>
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
                  Menus draw on Egyptian ingredients and familiar international influences,
                  with dishes prepared to suit the pace and setting of each day. Dining,
                  movement and rest are composed as one continuous experience.
                </p>
                <span className="nib-intro__index">01</span>
                <span className="nib-intro__copyright">HATHOR DAHABIYA ©2026</span>
              </Panel>

              <Panel className="nib-principal nib-surface--cream">
                <SlotImage
                  slot={DINING_LIVE_SLOTS.introHero}
                  alt="Dining beside the Nile aboard Hathor"
                  className="nib-principal__main"
                />
                <SlotFlipImage
                  className="nib-principal__top"
                  frontSlot={DINING_LIVE_SLOTS.courses}
                  backSlot={DINING_LIVE_SLOTS.chef}
                  alt="A sequence of Hathor tasting courses"
                  axis="up"
                />
                <SlotFlipImage
                  className="nib-principal__bottom"
                  frontSlot={DINING_LIVE_SLOTS.service}
                  backSlot={DINING_LIVE_SLOTS.table}
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
                <SlotFlipImage
                  className="nib-image-text__wide"
                  frontSlot={DINING_LIVE_SLOTS.restaurant}
                  backSlot={DINING_LIVE_SLOTS.wine}
                  alt="Hathor's intimate dining salon"
                  axis="right"
                />
                <SlotFlipImage
                  className="nib-image-text__small"
                  frontSlot={DINING_LIVE_SLOTS.celebration}
                  backSlot={DINING_LIVE_SLOTS.suite}
                  alt="A candlelit celebration on Hathor"
                  axis="left"
                />
                <p>
                  On Hathor, dining is part of the voyage—not a pause from it. Seasonal menus
                  bring together Egyptian flavours, fresh ingredients and attentive service,
                  served in settings shaped by the river.
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
                  <SlotImage
                    slot={DINING_LIVE_SLOTS.fitness}
                    alt="Hathor onboard fitness"
                    className="nib-value__image"
                  />
                </div>
                <div className="nib-value">
                  <p>Your suite is the quiet counterpoint: generous river views, thoughtful
                    details and private service whenever you prefer to stay in.</p>
                  <span>03</span><h2 data-anima-title>REST</h2>
                  <SlotImage
                    slot={DINING_LIVE_SLOTS.suite}
                    alt="A calm Hathor suite"
                    className="nib-value__image"
                    previewAnchor={false}
                  />
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
                <StoryPanel key={story.number} story={story} />
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
                <SlotFlipImage
                  frontSlot={DINING_LIVE_SLOTS.wine}
                  backSlot={DINING_LIVE_SLOTS.introHero}
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
          <SlotImage
            slot={DINING_LIVE_SLOTS.table}
            alt="A Hathor table prepared beside the river"
            previewAnchor={false}
          />
          <SlotImage
            slot={DINING_LIVE_SLOTS.fitness}
            alt="Hathor's onboard gym"
            previewAnchor={false}
          />
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
            <SlotImage
              slot={DINING_LIVE_SLOTS.celebration}
              alt="A private celebration on Hathor"
              previewAnchor={false}
            />
            <h3>PRIVATE DINING</h3>
            <p>Private dining can be arranged in selected onboard settings for guests seeking a more personal experience.</p>
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
