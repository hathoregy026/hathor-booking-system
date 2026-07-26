"use client";

import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ManagedImage } from "@/components/ui/ManagedImage";

const SILK_ROWS = ["TAKE YOUR", "VOYAGE", "TODAY"] as const;

/** Exponential damp — silky catch-up, frame-rate independent */
function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

type HomeCampaignSectionProps = {
  title: string;
  imageName: string;
  imageAlt: string;
  titleStyle?: CSSProperties;
  previewAnchor?: boolean;
};

/**
 * Call-to-action stage — elegant layout-driven motion.
 *
 * 1) Gold invite rises as the section arrives
 * 2) Brief hold, then photograph glides up and erases the invite
 * 3) On-image title + Book Now rise in
 *
 * All values are damped toward scroll targets so Lenis never writes jumps.
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

    /* Smoothed state */
    let inviteS = 0;
    let stageS = 0;
    let imageS = 0;
    let titleS = 0;
    let stickS = 0;

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
      gsap.set(silkChars, { yPercent: 110, autoAlpha: 0, force3D: true });
    }
    if (chars.length) {
      gsap.set(chars, { yPercent: 110, autoAlpha: 0, force3D: true });
    }
    if (book) gsap.set(book, { autoAlpha: 0, y: 12 });
    gsap.set(frame, { y: 0, force3D: true });

    /* Invite letter rise — scrubbed by smoothed invite progress */
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
            stagger: 0.018,
            duration: 0.55,
            ease: "none",
            force3D: true,
          },
          rowIndex * 0.12,
        );
      });
    }

    const sync = () => {
      if (killed || !inviteTl) return;

      const dt = gsap.ticker.deltaRatio(60);
      const vh = window.innerHeight;
      const rect = track.getBoundingClientRect();
      const travel = Math.max(1, track.offsetHeight - (frame.offsetHeight || vh));

      /* --- targets from layout --- */
      let inviteT = 0;
      const inviteStart = vh * 0.9;
      const inviteEnd = vh * 0.12;
      if (rect.top <= inviteEnd) inviteT = 1;
      else if (rect.top < inviteStart) {
        inviteT = 1 - (rect.top - inviteEnd) / (inviteStart - inviteEnd);
      }
      inviteT = clamp01(inviteT);

      /* Stick distance while the tall track owns the viewport */
      const stickT = clamp01(-rect.top / travel) * travel;
      const stageT = clamp01(stickT / travel);

      /*
       * Stage remap (elegant pacing on the locked scroll):
       *  0.00–0.14  hold gold invite
       *  0.14–0.78  photograph rises / erases invite
       *  0.78–1.00  on-image title + book
       */
      let imageT = 0;
      let titleT = 0;
      if (stageT <= 0.14) {
        imageT = 0;
        titleT = 0;
      } else if (stageT < 0.78) {
        imageT = (stageT - 0.14) / 0.64;
        titleT = 0;
      } else {
        imageT = 1;
        titleT = (stageT - 0.78) / 0.22;
      }
      imageT = clamp01(imageT);
      titleT = clamp01(titleT);

      /* Soft ease on the wipe so it never feels mechanical */
      const imageEased = imageT * imageT * (3 - 2 * imageT); /* smoothstep */

      /*
       * Damping — stick tracks scroll closely; cover & title stay lazier.
       * Higher lambda = snappier. Values tuned for luxury glide.
       */
      inviteS = damp(inviteS, inviteT, 7.5, dt);
      stickS = damp(stickS, stickT, 14, dt);
      stageS = damp(stageS, stageT, 9, dt);
      imageS = damp(imageS, imageEased, 5.5, dt);
      titleS = damp(titleS, titleT, 6.2, dt);

      if (stageS > 0.02) {
        inviteS = damp(inviteS, 1, 12, dt);
      }

      inviteTl.progress(inviteS);
      gsap.set(frame, { y: stickS, force3D: true });

      if (reveal) {
        gsap.set(reveal, {
          yPercent: (1 - imageS) * 100,
          force3D: true,
        });
      }

      if (chars.length) {
        const y = (1 - titleS) * 110;
        const a = titleS;
        gsap.set(chars, {
          yPercent: y,
          autoAlpha: a,
          force3D: true,
        });
      }
      if (book) {
        gsap.set(book, {
          autoAlpha: titleS,
          y: (1 - titleS) * 14,
          force3D: true,
        });
      }
    };

    gsap.ticker.add(sync);
    sync();

    const onResize = () => sync();
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
