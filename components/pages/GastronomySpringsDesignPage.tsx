"use client";

/* eslint-disable @next/next/no-img-element */

import type { CSSProperties, ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { AnimaTitleScroll } from "@/components/public/AnimaTitleScroll";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { diningPlateSlotName } from "@/lib/gastronomy-dining-media";
import { siteImageAnchorId } from "@/lib/site-image-preview";
import { toVercelOptimizedSrc } from "@/lib/local-optimized-site-images";

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
      id={previewAnchor ? siteImageAnchorId(image.slot ?? slot) : undefined}
      data-site-image={image.slot ?? slot}
    >
      <img src={toVercelOptimizedSrc(image.src)} alt={alt ?? image.alt} />
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
      data-site-image={front.slot ?? frontSlot}
      id={siteImageAnchorId(front.slot ?? frontSlot)}
    >
      <img src={toVercelOptimizedSrc(front.src)} alt={alt || front.alt} />
      <img src={toVercelOptimizedSrc(back.src)} alt="" aria-hidden data-site-image={back.slot ?? backSlot} />
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
      data-site-image={image.slot ?? slotName}
      id={siteImageAnchorId(image.slot ?? slotName)}
      style={style}
    >
      <img src={toVercelOptimizedSrc(image.src)} alt={image.alt} />
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
  story: {
    number: string;
    time: string;
    place: string;
    title: string;
    slot: string;
    alt: string;
    cta: string;
  };
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
        <a href="/contact">{story.cta}</a>
      </div>
      <h2 data-anima-title>{story.title}</h2>
    </Panel>
  );
}

export function GastronomySpringsDesignPage() {
  const { pages } = useWebsiteText();
  const copy = pages.gastronomy;
  const liveStories = stories.map((story, index) => ({
    ...story,
    ...(copy.stories[index] ?? {}),
  }));

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
                <span className="nib-chapter">{copy.introChapter}</span>
                <div className="nib-intro__titles" data-anima-title>
                  <h1>{copy.introTitle.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
                  <h2>{copy.introSecondTitle.split("\n").map((line) => <span key={line}>{line}</span>)}</h2>
                  <h2>{copy.introThirdTitle.split("\n").map((line, index) => index === 0 ? <span key={line}>{line}</span> : <em key={line}>{line}</em>)}</h2>
                </div>
                <p className="nib-intro__copy">{copy.introBody}</p>
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
                <span className="nib-side-label">{copy.tableLabel}</span>
              </Panel>

              <Panel className="nib-statement nib-surface--cream">
                <span className="nib-chapter">{copy.statementChapter}</span>
                <div className="nib-statement__title" data-anima-title>
                  {copy.statementTitle.split("\n").map((line) => <h2 key={line}>{line}</h2>)}
                </div>
                <p>{copy.statementBody}</p>
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
                <p>{copy.riverBody}</p>
              </Panel>

              <Panel className="nib-marquee nib-surface--cream" >
                <div aria-hidden>
                  <span>{copy.marquee}</span><b>✦</b><span>{copy.marquee}</span><b>✦</b><span>{copy.marquee}</span><b>✦</b>
                </div>
              </Panel>

              <Panel className="nib-atelier nib-surface--cream">
                <div className="nib-atelier__copy">
                  <span className="nib-chapter">{copy.coursesChapter}</span>
                  <h2 data-anima-title>{copy.coursesTitle.split("\n").map((line, index, lines) => <span key={line}>{index === lines.length - 1 ? <em>{line}</em> : line}{index < lines.length - 1 ? <br /> : null}</span>)}</h2>
                  <p>{copy.coursesBody}</p>
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
                  <p>{copy.values[0]?.body}</p>
                  <span>01</span><h2 data-anima-title>{copy.values[0]?.title}</h2>
                  <Plate number={3} className="nib-value__plate" />
                </div>
                <div className="nib-value">
                  <p>{copy.values[1]?.body}</p>
                  <span>02</span><h2 data-anima-title>{copy.values[1]?.title}</h2>
                  <SlotImage
                    slot={DINING_LIVE_SLOTS.fitness}
                    alt="Hathor onboard fitness"
                    className="nib-value__image"
                  />
                </div>
                <div className="nib-value">
                  <p>{copy.values[2]?.body}</p>
                  <span>03</span><h2 data-anima-title>{copy.values[2]?.title}</h2>
                  <SlotImage
                    slot={DINING_LIVE_SLOTS.suite}
                    alt="A calm Hathor suite"
                    className="nib-value__image"
                    previewAnchor={false}
                  />
                </div>
              </Panel>

              <Panel className="nib-stories-intro nib-surface--cream">
                <span className="nib-chapter">{copy.experiencesChapter}</span>
                <p>{copy.experiencesBody}</p>
              </Panel>

              {liveStories.map((story) => (
                <StoryPanel key={story.number} story={story} />
              ))}

              <Panel className="nib-story-end nib-surface--cream">
                <span className="nib-chapter">{copy.closingChapter}</span>
                <h2 data-anima-title>{copy.closingTitle.split("\n").map((line, index, lines) => <span key={line}>{index === lines.length - 1 ? <em>{line}</em> : line}{index < lines.length - 1 ? <br /> : null}</span>)}</h2>
                <p>{copy.closingBody}</p>
                <a className="public-btn-outline-gold nib-button" href="/booking"><span>{copy.closingCta}</span></a>
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
          <h2 data-anima-title>{copy.conciergeTitle.split("\n").map((line, index) => <span key={line}>{line}{index === 0 ? <br /> : null}</span>)}</h2>
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
          {copy.diningClosingTitle.split("\n").map((line) => <h2 key={line}>{line}</h2>)}
        </section>

        <section className="nib-contact-copy nib-surface--cream" data-nib-reveal>
          <div />
          <div>
            <p>{copy.conciergeBody}</p>
            <a href="mailto:reservations@hathorcruise.com">reservations@hathorcruise.com</a>
          </div>
        </section>

        <section className="nib-contact-action nib-surface--cream" data-nib-reveal>
          <a className="public-btn-outline-gold nib-button nib-button--large" href="/contact">
            <span>{copy.conciergeCta}</span>
          </a>
        </section>

        <section className="nib-epilogue nib-surface--cream" data-nib-reveal>
          <div className="nib-epilogue__social">
            <a href="https://www.instagram.com/hathorcruise/">INSTAGRAM</a><span>|</span>
            <a href="mailto:reservations@hathorcruise.com">reservations@hathorcruise.com</a><span>(2026)</span>
          </div>
          <div className="nib-epilogue__feature">
            <span>{copy.featureLabel}</span>
            <SlotImage
              slot={DINING_LIVE_SLOTS.celebration}
              alt="A private celebration on Hathor"
              previewAnchor={false}
            />
            <h3>{copy.featureTitle}</h3>
            <p>{copy.featureBody}</p>
          </div>
        </section>
      </main>

      <div className="public-site gastronomy-dining-footer">
        <Footer />
      </div>
    </div>
  );
}
