"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSiteImage } from "@/components/public/SiteImagesProvider";

export type JourneyStep = 1 | 2 | 3;

const STEPS: { id: JourneyStep | 4; name: string }[] = [
  { id: 1, name: "Journey" },
  { id: 2, name: "Guests & Suites" },
  { id: 3, name: "Details & Payment" },
  { id: 4, name: "Request sent" },
];

/** Fine numbered stepper shared by every booking screen. */
export function JourneyProgress({
  step,
  onJump,
}: {
  step: JourneyStep | 4;
  onJump?: (step: JourneyStep) => void;
}) {
  return (
    <nav className="hj-progress" aria-label="Booking progress">
      {STEPS.map((entry, index) => {
        const canJump = Boolean(onJump) && entry.id < step && entry.id !== 4;
        const className = [
          "hj-progress__step",
          step === entry.id ? "hj-progress__step--on" : "",
          step > entry.id ? "hj-progress__step--done" : "",
        ].filter(Boolean).join(" ");
        const inner = (
          <>
            <span className="hj-progress__dot">{step > entry.id ? "✓" : entry.id}</span>
            <span className="hj-progress__name">{entry.name}</span>
          </>
        );
        return (
          <div key={entry.id} style={{ display: "contents" }}>
            {index > 0 ? <span className="hj-progress__line" aria-hidden /> : null}
            {canJump ? (
              <button
                type="button"
                className={className}
                aria-current={step === entry.id ? "step" : undefined}
                onClick={() => onJump?.(entry.id as JourneyStep)}
              >
                {inner}
              </button>
            ) : (
              <div className={className} aria-current={step === entry.id ? "step" : undefined}>
                {inner}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function PanelHead({
  step,
  of = 4,
  title,
  titleId,
  lede,
}: {
  step: number;
  of?: number;
  title: string;
  titleId?: string;
  lede: string;
}) {
  return (
    <header className="hj-panel__head">
      <p className="hj-panel__kicker">Step {step} of {of}</p>
      <h1 id={titleId}>{title}</h1>
      <p>{lede}</p>
    </header>
  );
}

/** Dashboard → Website Images → Booking: one photograph for every step banner. */
export const BOOKING_BANNER_SLOT = "booking-banner";

/**
 * The desktop step header: one photograph across the page (chosen in the
 * dashboard), with the step number, title and a line of copy on a paper wash,
 * and a line in the footer's script. Tablet and phone keep the PanelHead
 * instead (the banner is display:none there).
 */
export function StepBanner({
  step,
  kicker,
  title,
  lede,
  quote,
}: {
  step: number;
  kicker: string;
  title: string;
  lede: string;
  quote?: string;
}) {
  const photo = useSiteImage(BOOKING_BANNER_SLOT);
  return (
    <header className="hj-banner">
      {photo.src ? <Image className="hj-banner__img" data-site-image={BOOKING_BANNER_SLOT} src={photo.src} alt="" fill priority sizes="100vw" /> : null}
      <span className="hj-banner__shade" aria-hidden />
      <div className="hj-banner__copy">
        <span className="hj-banner__num" aria-hidden>
          {String(step).padStart(2, "0")}
          <span className="hj-banner__of">of 04</span>
        </span>
        <span className="hj-banner__text">
          <span className="hj-banner__kicker">Step {step} of 4 · {kicker}</span>
          <h1 className="hj-banner__title">{title}</h1>
          <span className="hj-banner__lede">{lede}</span>
        </span>
      </div>
      {quote ? <span className="hj-banner__quote" aria-hidden>{quote}</span> : null}
    </header>
  );
}

/** The closing band of a step, as in the reference: the name, the promise, the three words. */
export function JourneyBand() {
  return (
    <div className="hj-band" aria-hidden>
      <span className="hj-band__brand">
        Hathor
        <small>Dahabiya</small>
      </span>
      <span className="hj-band__line">A slower way<br />to see a greater Egypt</span>
      <span className="hj-band__words">Luxury. Heritage. Belonging.</span>
    </div>
  );
}

/**
 * A quiet "scroll" hint at the foot of the screen while there is more of the
 * step below, instead of boxes that scroll on their own. It fades once the
 * guest starts scrolling or reaches the end.
 */
export function ScrollCue() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const update = () => {
      const below = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      setShow(window.scrollY < 120 && below > 160);
    };
    const first = window.requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const settle = window.setTimeout(update, 900);
    return () => {
      window.cancelAnimationFrame(first);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.clearTimeout(settle);
    };
  }, []);
  return (
    <span className={`hj-cue${show ? " hj-cue--on" : ""}`} aria-hidden>
      Scroll
      <span className="hj-cue__line" />
    </span>
  );
}

export type GuideItem = { label: string; hint?: string; done: boolean };

/**
 * A small map of what to do on this step. Items tick as the guest completes
 * them, and the first open item is marked as the one to do now.
 */
export function StepGuide({ items, heading = "Your map for this step" }: { items: GuideItem[]; heading?: string }) {
  const current = items.findIndex(item => !item.done);
  return (
    <div className="hj-guide" role="group" aria-label={heading}>
      <span className="hj-guide__heading">{heading}</span>
      <ol className="hj-guide__list">
        {items.map((item, index) => {
          const state = item.done ? "done" : index === current ? "now" : "next";
          return (
            <li key={item.label} className={`hj-guide__item hj-guide__item--${state}`} aria-current={state === "now" ? "step" : undefined}>
              <span className="hj-guide__dot" aria-hidden>{item.done ? "✓" : index + 1}</span>
              <span className="hj-guide__text">
                <span className="hj-guide__label">{item.label}</span>
                {item.hint ? <span className="hj-guide__hint">{item.hint}</span> : null}
              </span>
              {item.done ? <span className="hj-sr">(done)</span> : state === "now" ? <span className="hj-sr">(next to do)</span> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
