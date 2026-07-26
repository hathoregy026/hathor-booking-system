"use client";

import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ManagedImage } from "@/components/ui/ManagedImage";

gsap.registerPlugin(ScrollTrigger);

const SILK_ROWS = ["TAKE YOUR", "VOYAGE", "TODAY"] as const;

type HomeCampaignSectionProps = {
  title: string;
  imageName: string;
  imageAlt: string;
  titleStyle?: CSSProperties;
  previewAnchor?: boolean;
};

/**
 * Call-to-action stage — same visual as the working pre-pin version.
 *
 * Motion is driven from layout (track rect) every ticker frame so Lenis /
 * ScrollTrigger scrub desync and overflow-x:clip cannot freeze the stage.
 * No pin, no manual ST scrub for the cover.
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
    let silkLocked = false;
    let lastInvite = -1;
    let lastCover = -1;
    let lastStick = -1;

    const showSilk = () => {
      if (!silkChars.length || silkLocked) return;
      silkLocked = true;
      gsap.set(silkChars, { yPercent: 0, autoAlpha: 1, force3D: true });
    };

    const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

    const sync = () => {
      if (killed || reduced || !coverTl || !inviteTl) return;

      const vh = window.innerHeight;
      const rect = track.getBoundingClientRect();
      const trackH = track.offsetHeight;
      const frameH = frame.offsetHeight || vh;
      const travel = Math.max(1, trackH - frameH);

      /* Phase A — invite while section approaches */
      const inviteStart = vh * 0.92;
      const inviteEnd = vh * 0.18;
      let inviteP = 0;
      if (rect.top <= inviteEnd) inviteP = 1;
      else if (rect.top < inviteStart) {
        inviteP = 1 - (rect.top - inviteEnd) / (inviteStart - inviteEnd);
      }
      inviteP = clamp01(inviteP);
      if (Math.abs(inviteP - lastInvite) > 0.001) {
        lastInvite = inviteP;
        if (!silkLocked) inviteTl.progress(inviteP);
      }

      /* Phase B — stick + cover while track owns the viewport */
      let coverP = 0;
      let stickY = 0;
      if (rect.top <= 0 && rect.bottom >= vh) {
        coverP = clamp01(-rect.top / travel);
        stickY = coverP * travel;
        inviteTl.progress(1);
        showSilk();
      } else if (rect.top > 0) {
        coverP = 0;
        stickY = 0;
      } else {
        coverP = 1;
        stickY = travel;
        inviteTl.progress(1);
        showSilk();
      }

      if (Math.abs(stickY - lastStick) > 0.25) {
        lastStick = stickY;
        gsap.set(frame, { y: stickY, force3D: true });
      }
      if (Math.abs(coverP - lastCover) > 0.001) {
        lastCover = coverP;
        coverTl.progress(coverP);
      }
    };

    if (reduced) {
      gsap.set(frame, { clearProps: "transform" });
      if (reveal) gsap.set(reveal, { yPercent: 0, clearProps: "transform" });
      if (silkChars.length) gsap.set(silkChars, { yPercent: 0, autoAlpha: 0 });
      if (chars.length) gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
      if (book) gsap.set(book, { autoAlpha: 1 });
      return;
    }

    if (reveal) gsap.set(reveal, { yPercent: 100, force3D: true });
    if (silkChars.length) {
      gsap.set(silkChars, { yPercent: 120, autoAlpha: 0, force3D: true });
    }
    if (chars.length) {
      gsap.set(chars, { yPercent: 115, autoAlpha: 0, force3D: true });
    }
    if (book) gsap.set(book, { autoAlpha: 0 });
    gsap.set(frame, { y: 0, force3D: true });

    inviteTl = gsap.timeline({ paused: true });
    if (silkChars.length) {
      const rows = gsap.utils.toArray<HTMLElement>(
        track.querySelectorAll(".hcta-silk-row"),
      );
      rows.forEach((row, rowIndex) => {
        const rowChars = row.querySelectorAll<HTMLElement>(".hcta-silk-char");
        inviteTl!.to(
          rowChars,
          {
            yPercent: 0,
            autoAlpha: 1,
            stagger: 0.014,
            duration: 0.42,
            ease: "none",
            force3D: true,
          },
          rowIndex * 0.1,
        );
      });
    }

    coverTl = gsap.timeline({ paused: true });
    coverTl.call(showSilk, undefined, 0);
    if (reveal) coverTl.set(reveal, { yPercent: 100, force3D: true }, 0);
    coverTl.to({}, { duration: 0.16 }, 0);
    if (reveal) {
      coverTl.to(
        reveal,
        {
          yPercent: 0,
          duration: 0.72,
          ease: "power3.inOut",
          force3D: true,
        },
        0.16,
      );
    }
    coverTl.to({}, { duration: 0.06 }, 0.88);
    if (chars.length) {
      coverTl.to(
        chars,
        {
          yPercent: 0,
          autoAlpha: 1,
          stagger: 0.02,
          duration: 0.16,
          ease: "none",
          force3D: true,
        },
        0.92,
      );
    }
    if (book) {
      coverTl.to(book, { autoAlpha: 1, duration: 0.1, ease: "none" }, 1.0);
    }
    coverTl.to({}, { duration: 0.18 }, 1.08);

    gsap.ticker.add(sync);
    sync();

    const onResize = () => {
      lastStick = -1;
      lastCover = -1;
      lastInvite = -1;
      sync();
    };
    window.addEventListener("resize", onResize);

    return () => {
      killed = true;
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(sync);
      gsap.set(frame, { clearProps: "transform" });
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
