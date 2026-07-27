"use client";

import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ManagedImage } from "@/components/ui/ManagedImage";

const SILK_ROWS = ["TAKE YOUR", "VOYAGE", "TODAY"] as const;

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

type HomeCampaignSectionProps = {
  title: string;
  imageName: string;
  imageAlt: string;
  titleStyle?: CSSProperties;
  previewAnchor?: boolean;
};

/**
 * Home CTA — layout-locked stick + cover.
 *
 * Lenis and ScrollTrigger progress disagree on this page (frame was stuck
 * ~323px low and felt jumpy). Stick + timelines are driven only from
 * getBoundingClientRect — no ScrollTrigger, no damp.
 */
export function HomeCampaignSection({
  title,
  imageName,
  imageAlt,
  titleStyle,
  previewAnchor = true,
}: HomeCampaignSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const frame = track.querySelector<HTMLElement>("[data-hcta-frame]");
    const reveal = track.querySelector<HTMLElement>("[data-hcta-reveal]");
    const silkChars = gsap.utils.toArray<HTMLElement>(
      track.querySelectorAll(".hcta-silk-char"),
    );
    const chars = gsap.utils.toArray<HTMLElement>(
      track.querySelectorAll(".hcta-heading .hcta-char"),
    );
    const book = track.querySelector<HTMLElement>(".hcta-book");

    if (!frame) return;

    let killed = false;
    let inviteTl: gsap.core.Timeline | null = null;
    let coverTl: gsap.core.Timeline | null = null;
    let lastY = -1;
    let lastInvite = -1;
    let lastCover = -1;

    if (reduced) {
      gsap.set(frame, { clearProps: "transform" });
      if (reveal) gsap.set(reveal, { yPercent: 0, clearProps: "transform" });
      if (silkChars.length) gsap.set(silkChars, { yPercent: 0, autoAlpha: 0 });
      if (chars.length) gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
      if (book) gsap.set(book, { autoAlpha: 1, y: 0 });
      return;
    }

    gsap.set(frame, { y: 0, force3D: true });
    if (reveal) gsap.set(reveal, { yPercent: 100, force3D: true });
    if (silkChars.length) {
      gsap.set(silkChars, { yPercent: 120, autoAlpha: 0, force3D: true });
    }
    if (chars.length) {
      gsap.set(chars, { yPercent: 120, autoAlpha: 0, force3D: true });
    }
    if (book) gsap.set(book, { autoAlpha: 0, y: 10 });

    inviteTl = gsap.timeline({ paused: true });
    if (silkChars.length) {
      inviteTl.to(
        silkChars,
        {
          yPercent: 0,
          autoAlpha: 1,
          stagger: 0.02,
          duration: 1,
          ease: "none",
          force3D: true,
        },
        0,
      );
    }

    coverTl = gsap.timeline({ paused: true });
    /* Do not touch silk here — invite timeline owns those letters */
    if (reveal) coverTl.set(reveal, { yPercent: 100, force3D: true }, 0);
    coverTl.to({}, { duration: 0.12 }, 0);
    if (reveal) {
      coverTl.to(
        reveal,
        { yPercent: 0, duration: 0.72, ease: "none", force3D: true },
        0.12,
      );
    }
    coverTl.to({}, { duration: 0.04 }, 0.84);
    if (chars.length) {
      coverTl.to(
        chars,
        {
          yPercent: 0,
          autoAlpha: 1,
          stagger: 0.016,
          duration: 0.14,
          ease: "none",
          force3D: true,
        },
        0.86,
      );
    }
    if (book) {
      coverTl.to(
        book,
        { autoAlpha: 1, y: 0, duration: 0.1, ease: "none" },
        0.95,
      );
    }
    coverTl.to({}, { duration: 0.1 }, 1.05);

    const sync = () => {
      if (killed || !inviteTl || !coverTl) return;

      const vh = window.innerHeight;
      const rect = track.getBoundingClientRect();
      const travel = Math.max(1, track.offsetHeight - vh);

      /* Exact stick from layout — matches what the eye sees with Lenis */
      const y = Math.max(0, Math.min(travel, -rect.top));
      if (y !== lastY) {
        lastY = y;
        gsap.set(frame, { y, force3D: true });
      }

      let inviteP = 0;
      let coverP = 0;

      if (rect.top > 0) {
        /* Approaching: rise gold invite */
        const start = vh * 0.88;
        inviteP = rect.top >= start ? 0 : clamp01(1 - rect.top / start);
        coverP = 0;
      } else {
        /* Locked: invite fully up, photograph erase by scroll */
        inviteP = 1;
        coverP = clamp01(y / travel);
      }

      if (Math.abs(inviteP - lastInvite) > 0.0005) {
        lastInvite = inviteP;
        inviteTl.progress(inviteP);
      }
      if (Math.abs(coverP - lastCover) > 0.0005) {
        lastCover = coverP;
        coverTl.progress(coverP);
      }
    };

    gsap.ticker.add(sync);
    sync();

    const onResize = () => {
      lastY = -1;
      sync();
    };
    window.addEventListener("resize", onResize);

    return () => {
      killed = true;
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(sync);
      gsap.set(frame, { clearProps: "transform" });
      if (reveal) gsap.set(reveal, { clearProps: "transform" });
    };
  }, []);

  return (
    <div
      ref={trackRef}
      className="hcta-track"
      id="campaign"
      aria-label="Campaign call to action"
      data-hcta-track
    >
      <div className="hcta-frame" data-hcta-frame>
        <div className="hcta-silk" data-hcta-silk>
          <div className="hcta-silk-copy" aria-hidden="true">
            {SILK_ROWS.map((row) => (
              <div className="hcta-silk-row" key={row}>
                {Array.from(row).map((ch, index) => (
                  <span className="hcta-silk-letter" key={`${row}-${index}`}>
                    <span className="hcta-silk-char">
                      {ch === " " ? "\u00A0" : ch}
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="hcta-reveal" data-hcta-reveal>
          <div className="hcta-media" data-hcta-media>
            <ManagedImage
              name={imageName}
              alt={imageAlt}
              fill
              sizes="100vw"
              className="hcta-bg object-cover"
              previewAnchor={previewAnchor}
            />
          </div>
          <div className="hcta-veil" aria-hidden="true" />
        </div>

        <div className="hcta-copy">
          <h2
            className="hcta-heading typo-on-images-title"
            style={titleStyle}
            aria-label={title}
            data-typo-role="on_images_title"
          >
            {Array.from(title).map((ch, index) => (
              <span className="hcta-letter" key={`${ch}-${index}`}>
                <span className="hcta-char">
                  {ch === " " ? "\u00A0" : ch}
                </span>
              </span>
            ))}
          </h2>
          <BookNowTrigger className="btn hcta-book">Book Now</BookNowTrigger>
        </div>
      </div>
    </div>
  );
}
