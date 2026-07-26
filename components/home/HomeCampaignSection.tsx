"use client";

import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ManagedImage } from "@/components/ui/ManagedImage";

gsap.registerPlugin(ScrollTrigger);

const SILK_ROWS = ["TAKE YOUR", "VOYAGE", "TODAY"] as const;

/** How quickly the photograph eases toward its scroll target (lower = silkier). */
const REVEAL_LERP = 0.032;

type HomeCampaignSectionProps = {
  title: string;
  imageName: string;
  imageAlt: string;
  titleStyle?: CSSProperties;
  previewAnchor?: boolean;
};

type LenisLike = {
  on: (event: string, handler: () => void) => void;
  off?: (event: string, handler: () => void) => void;
};

/**
 * Call-to-action stage — zero layout mutation.
 * Invite rises and locks. Photograph covers it via a long scroll range
 * with frame-by-frame lerp so the rise stays slow and silky.
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
    let removeLenis: (() => void) | null = null;
    let bootTimer = 0;
    let tickerFn: (() => void) | null = null;

    const killOwned = () => {
      ["hcta-invite", "hcta-stage"].forEach((id) => {
        ScrollTrigger.getById(id)?.kill();
      });
    };

    const boot = () => {
      if (killed || !track.isConnected) return;

      if (tickerFn) {
        gsap.ticker.remove(tickerFn);
        tickerFn = null;
      }
      ctx?.revert();
      killOwned();

      ctx = gsap.context(() => {
        if (reduced) {
          gsap.set(frame, { clearProps: "transform" });
          if (reveal) gsap.set(reveal, { yPercent: 0 });
          if (silkChars.length) {
            gsap.set(silkChars, { yPercent: 0, autoAlpha: 0 });
          }
          if (chars.length) gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
          if (book) gsap.set(book, { autoAlpha: 1 });
          return;
        }

        let revealY = 100;
        let revealTarget = 100;

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

        /* Phase A — invite completes as the section arrives, then locks */
        const inviteTl = gsap.timeline({ paused: true });
        if (silkChars.length) {
          inviteTl.to(
            silkChars,
            {
              yPercent: 0,
              autoAlpha: 1,
              stagger: 0.028,
              duration: 1,
              ease: "none",
              force3D: true,
            },
            0,
          );
        }

        ScrollTrigger.create({
          id: "hcta-invite",
          trigger: track,
          start: "top 88%",
          end: "top top",
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: (self) => inviteTl.progress(self.progress),
          onRefresh: (self) => inviteTl.progress(self.progress),
        });

        /* On-image title — only after the photograph has mostly settled */
        const copyTl = gsap.timeline({ paused: true });
        if (chars.length) {
          copyTl.to(
            chars,
            {
              yPercent: 0,
              autoAlpha: 1,
              stagger: 0.02,
              duration: 0.7,
              ease: "none",
              force3D: true,
            },
            0,
          );
        }
        if (book) {
          copyTl.to(
            book,
            {
              autoAlpha: 1,
              duration: 0.35,
              ease: "none",
            },
            0.35,
          );
        }

        /*
         * Soft lerp: scroll only sets a target. The photograph eases toward
         * it every frame — never snaps with the wheel.
         */
        tickerFn = () => {
          if (!reveal) return;
          revealY += (revealTarget - revealY) * REVEAL_LERP;
          if (Math.abs(revealTarget - revealY) < 0.02) {
            revealY = revealTarget;
          }
          gsap.set(reveal, { yPercent: revealY, force3D: true });
        };
        gsap.ticker.add(tickerFn);

        const applyStage = (progress: number) => {
          const maxY = Math.max(0, track.offsetHeight - window.innerHeight);
          gsap.set(frame, { y: progress * maxY, force3D: true });
          inviteTl.progress(1);

          /*
           * 0.00–0.14  hold (invite locked, image waiting)
           * 0.14–0.90  image target eases from 100 → 0 over most of the stage
           * 0.90–1.00  on-image title
           */
          if (progress <= 0.14) {
            revealTarget = 100;
            copyTl.progress(0);
          } else if (progress < 0.9) {
            const t = (progress - 0.14) / (0.9 - 0.14);
            revealTarget = 100 * (1 - t);
            copyTl.progress(0);
          } else {
            revealTarget = 0;
            copyTl.progress((progress - 0.9) / 0.1);
          }
        };

        ScrollTrigger.create({
          id: "hcta-stage",
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true,
          onUpdate: (self) => applyStage(self.progress),
          onRefresh: (self) => applyStage(self.progress),
        });
      }, track);

      ScrollTrigger.refresh();
    };

    bootTimer = window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(boot);
      });
    }, 0);

    const onLoad = () => {
      try {
        ScrollTrigger.refresh();
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("load", onLoad);

    const lenis = (window as Window & { __hathorLenis?: LenisLike | null })
      .__hathorLenis;
    if (lenis?.on) {
      const onLenisScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onLenisScroll);
      removeLenis = () => lenis.off?.("scroll", onLenisScroll);
    }

    return () => {
      killed = true;
      window.clearTimeout(bootTimer);
      window.removeEventListener("load", onLoad);
      removeLenis?.();
      if (tickerFn) gsap.ticker.remove(tickerFn);
      killOwned();
      ctx?.revert();
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
