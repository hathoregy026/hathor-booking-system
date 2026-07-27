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

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

type LenisScroll = {
  scroll: number;
  on: (event: "scroll", fn: () => void) => void;
  off: (event: "scroll", fn: () => void) => void;
};

type HathorWindow = Window & {
  __hathorLenis?: LenisScroll | null;
};

function readScrollY(): number {
  const lenis = (window as HathorWindow).__hathorLenis;
  if (lenis && typeof lenis.scroll === "number") return lenis.scroll;
  return window.scrollY || document.documentElement.scrollTop || 0;
}

type HomeCampaignSectionProps = {
  title: string;
  imageName: string;
  imageAlt: string;
  titleStyle?: CSSProperties;
  previewAnchor?: boolean;
};

/**
 * Home CTA — Lenis-synced stick + wipe.
 *
 * Driven from scroll Y (not gsap.ticker + rect) so motion stays locked to
 * what Lenis renders. Direct transforms — no timeline progress scrub on
 * letter stagger (that caused visible bounce when scrolling).
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
    const silkRows = gsap.utils.toArray<HTMLElement>(
      track.querySelectorAll(".hcta-silk-row"),
    );
    const silkChars = gsap.utils.toArray<HTMLElement>(
      track.querySelectorAll(".hcta-silk-char"),
    );
    const chars = gsap.utils.toArray<HTMLElement>(
      track.querySelectorAll(".hcta-heading .hcta-char"),
    );
    const book = track.querySelector<HTMLElement>(".hcta-book");

    if (!frame) return;

    let killed = false;
    let trackStart = 0;
    let bindTimer = 0;

    const setFrameY = gsap.quickSetter(frame, "y", "px");
    const setRevealY =
      reveal != null
        ? gsap.quickSetter(reveal, "yPercent", "%")
        : null;

    const silkRowChars = silkRows.map((row) =>
      gsap.utils.toArray<HTMLElement>(row.querySelectorAll(".hcta-silk-char")),
    );

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

    const measure = () => {
      trackStart = track.getBoundingClientRect().top + readScrollY();
    };

    const applyInvite = (inviteP: number) => {
      silkRowChars.forEach((rowChars, rowIndex) => {
        const rowDelay = rowIndex * 0.16;
        rowChars.forEach((char, charIndex) => {
          const delay = rowDelay + charIndex * 0.012;
          const denom = Math.max(0.001, 1 - delay);
          const p = smoothstep(clamp01((inviteP - delay) / denom));
          gsap.set(char, {
            yPercent: 120 * (1 - p),
            autoAlpha: p > 0.03 ? 1 : 0,
            force3D: true,
          });
        });
      });
    };

    const applyTitle = (titleP: number) => {
      const p = smoothstep(titleP);
      chars.forEach((char, index) => {
        const delay = index * 0.012;
        const denom = Math.max(0.001, 1 - delay);
        const cp = clamp01((p - delay) / denom);
        gsap.set(char, {
          yPercent: 120 * (1 - cp),
          autoAlpha: cp > 0.03 ? 1 : 0,
          force3D: true,
        });
      });
      if (book) {
        const bp = clamp01((p - 0.35) / 0.65);
        gsap.set(book, { autoAlpha: bp, y: 10 * (1 - bp) });
      }
    };

    const sync = () => {
      if (killed) return;

      const scroll = readScrollY();
      const vh = window.innerHeight;
      const travel = Math.max(1, track.offsetHeight - frame.offsetHeight);
      const offset = scroll - trackStart;

      const stickY = Math.max(0, Math.min(travel, offset));
      setFrameY(stickY);

      const inviteRange = vh * 0.88;
      const inviteP =
        offset < 0 ? clamp01(1 - (-offset) / inviteRange) : 1;
      applyInvite(inviteP);

      const coverP = clamp01(stickY / travel);
      const wipeStart = 0.1;
      const wipeEnd = 0.82;
      const wipeP = smoothstep(
        clamp01((coverP - wipeStart) / (wipeEnd - wipeStart)),
      );
      setRevealY?.((1 - wipeP) * 100);

      const titleStart = 0.84;
      const titleP = clamp01((coverP - titleStart) / (1 - titleStart));
      applyTitle(titleP);
    };

    measure();
    sync();

    const remeasureSoon = () => {
      requestAnimationFrame(() => {
        measure();
        sync();
      });
    };

    const onScroll = () => sync();
    const onResize = () => {
      measure();
      sync();
    };

    let lenisBound: LenisScroll | null = null;
    const bindLenis = () => {
      const lenis = (window as HathorWindow).__hathorLenis;
      if (!lenis?.on) return false;
      lenis.on("scroll", onScroll);
      lenisBound = lenis;
      return true;
    };

    if (!bindLenis()) {
      window.addEventListener("scroll", onScroll, { passive: true });
      bindTimer = window.setInterval(() => {
        if (bindLenis()) {
          window.clearInterval(bindTimer);
          window.removeEventListener("scroll", onScroll);
        }
      }, 40);
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("load", remeasureSoon);

    const rootObserver = new MutationObserver(() => {
      if (document.documentElement.classList.contains("ex-scroll-ready")) {
        remeasureSoon();
        rootObserver.disconnect();
      }
    });
    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      killed = true;
      rootObserver.disconnect();
      window.removeEventListener("load", remeasureSoon);
      window.clearInterval(bindTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      lenisBound?.off("scroll", onScroll);
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
