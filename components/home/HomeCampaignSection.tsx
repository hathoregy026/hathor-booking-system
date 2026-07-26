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
 * Call-to-action stage.
 *
 * No ScrollTrigger pin — ancestors use overflow-x:clip which prevents
 * position:fixed pins (frame stayed relative inside a 100vh spacer while
 * the 420vh track painted empty cream).
 *
 * Instead: absolute frame + per-frame layout stick from track rect, and
 * cover progress derived from the same layout. Lenis-safe.
 *
 * Phase A — gold invite rises as the section approaches.
 * Phase B — photograph rises over the locked invite, then on-image title.
 *
 * Conflict checks:
 * - Does not pin (won't fight overflow-x:clip / pin-spacers).
 * - Only kills own ids (hcta-invite / hcta-stage).
 * - Silk never CSS-hidden (stalled motion ≠ void).
 * - Does not call ScrollTrigger.getAll().kill().
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
    let ctx: gsap.Context | null = null;
    let tickerFn: ((time: number) => void) | null = null;
    let inviteTl: gsap.core.Timeline | null = null;
    let coverTl: gsap.core.Timeline | null = null;
    let silkLocked = false;

    const killOwned = () => {
      ["hcta-invite", "hcta-stage"].forEach((id) => {
        ScrollTrigger.getById(id)?.kill();
      });
    };

    const showSilk = () => {
      if (!silkChars.length || silkLocked) return;
      silkLocked = true;
      gsap.set(silkChars, { yPercent: 0, autoAlpha: 1, force3D: true });
    };

    /** Layout progress 0–1 while the tall track owns the viewport. */
    const stageProgress = () => {
      const total = Math.max(1, track.offsetHeight - window.innerHeight);
      const scrolled = Math.min(total, Math.max(0, -track.getBoundingClientRect().top));
      return scrolled / total;
    };

    const stickFrame = (progress: number) => {
      const maxY = Math.max(0, track.offsetHeight - frame.offsetHeight);
      gsap.set(frame, { y: progress * maxY, force3D: true });
    };

    const syncStage = () => {
      if (killed || reduced || !coverTl) return;
      const p = stageProgress();
      stickFrame(p);
      if (p > 0 || track.getBoundingClientRect().top <= 0) {
        inviteTl?.progress(1);
        showSilk();
      }
      coverTl.progress(p);
    };

    const boot = () => {
      if (killed || !track.isConnected) return;

      ctx?.revert();
      killOwned();
      silkLocked = false;

      ctx = gsap.context(() => {
        if (reduced) {
          gsap.set(frame, { clearProps: "transform" });
          if (reveal) gsap.set(reveal, { yPercent: 0, clearProps: "transform" });
          if (silkChars.length) {
            gsap.set(silkChars, { yPercent: 0, autoAlpha: 0 });
          }
          if (chars.length) gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
          if (book) gsap.set(book, { autoAlpha: 1 });
          return;
        }

        if (reveal) {
          gsap.set(reveal, { yPercent: 100, force3D: true });
        }
        if (silkChars.length) {
          gsap.set(silkChars, { yPercent: 120, autoAlpha: 0, force3D: true });
        }
        if (chars.length) {
          gsap.set(chars, { yPercent: 115, autoAlpha: 0, force3D: true });
        }
        if (book) {
          gsap.set(book, { autoAlpha: 0 });
        }
        gsap.set(frame, { y: 0, force3D: true });

        inviteTl = gsap.timeline({ paused: true });
        if (silkChars.length) {
          const rows = gsap.utils.toArray<HTMLElement>(
            track.querySelectorAll(".hcta-silk-row"),
          );
          rows.forEach((row, rowIndex) => {
            const rowChars =
              row.querySelectorAll<HTMLElement>(".hcta-silk-char");
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

        ScrollTrigger.create({
          id: "hcta-invite",
          trigger: track,
          start: "top 92%",
          end: "top top",
          scrub: 0.45,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (!silkLocked) inviteTl?.progress(self.progress);
          },
          onRefresh: (self) => {
            if (!silkLocked) inviteTl?.progress(self.progress);
          },
        });

        coverTl = gsap.timeline({ paused: true });
        coverTl.call(showSilk, undefined, 0);
        if (reveal) {
          coverTl.set(reveal, { yPercent: 100, force3D: true }, 0);
        }
        coverTl.to({}, { duration: 0.14 }, 0);
        if (reveal) {
          coverTl.to(
            reveal,
            {
              yPercent: 0,
              duration: 0.72,
              ease: "power3.inOut",
              force3D: true,
            },
            0.14,
          );
        }
        coverTl.to({}, { duration: 0.06 }, 0.86);
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
            0.9,
          );
        }
        if (book) {
          coverTl.to(
            book,
            { autoAlpha: 1, duration: 0.1, ease: "none" },
            0.98,
          );
        }
        coverTl.to({}, { duration: 0.16 }, 1.06);

        /*
         * Lightweight ST only for refresh hooks — motion is layout-driven
         * via ticker so Lenis / overflow-x:clip cannot desync the stick.
         */
        ScrollTrigger.create({
          id: "hcta-stage",
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true,
          onRefresh: () => syncStage(),
        });
      }, track);

      syncStage();
      ScrollTrigger.refresh();
      syncStage();
    };

    boot();

    tickerFn = () => {
      syncStage();
    };
    if (!reduced) {
      gsap.ticker.add(tickerFn);
    }

    const onLoad = () => {
      try {
        ScrollTrigger.refresh();
        syncStage();
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("load", onLoad);
    window.addEventListener("resize", syncStage);

    return () => {
      killed = true;
      window.removeEventListener("load", onLoad);
      window.removeEventListener("resize", syncStage);
      if (tickerFn) gsap.ticker.remove(tickerFn);
      killOwned();
      ctx?.revert();
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
