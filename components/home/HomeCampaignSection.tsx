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

type LenisLike = {
  on: (event: string, handler: () => void) => void;
  off?: (event: string, handler: () => void) => void;
};

/**
 * Call-to-action stage — zero layout mutation.
 *
 * Phase A (section approaches): gold invite rises and locks fully up.
 * Phase B (locked): unhurried hold, then photograph rises over the locked
 * invite (no reverse) — then on-image title.
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

    const killOwned = () => {
      ["hcta-invite", "hcta-stage"].forEach((id) => {
        ScrollTrigger.getById(id)?.kill();
      });
    };

    const boot = () => {
      if (killed || !track.isConnected) return;

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

        /*
         * Phase A — invite completes as you arrive (before / as stage locks).
         * Fully up when progress hits 1 (= section top meets viewport top).
         */
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
          scrub: 0.65,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            inviteTl.progress(self.progress);
          },
          onRefresh: (self) => {
            inviteTl.progress(self.progress);
          },
        });

        /*
         * Phase B — hold finished invite (locked, no reverse), then a slow
         * elegant photograph rise that simply covers the text.
         */
        const coverTl = gsap.timeline({ paused: true });

        if (silkChars.length) {
          coverTl.set(
            silkChars,
            { yPercent: 0, autoAlpha: 1, force3D: true },
            0,
          );
        }
        if (reveal) {
          coverTl.set(reveal, { yPercent: 100, force3D: true }, 0);
        }

        /* Hold — invite stays locked and fully readable */
        coverTl.to({}, { duration: 0.38 }, 0);

        /* Slow silk cover — text does not reverse; image simply rises over it */
        if (reveal) {
          coverTl.to(
            reveal,
            {
              yPercent: 0,
              duration: 0.48,
              ease: "power2.inOut",
              force3D: true,
            },
            0.38,
          );
        }

        /* Settle on the photograph before title */
        coverTl.to({}, { duration: 0.08 }, 0.86);

        if (chars.length) {
          coverTl.to(
            chars,
            {
              yPercent: 0,
              autoAlpha: 1,
              stagger: 0.018,
              duration: 0.18,
              ease: "none",
              force3D: true,
            },
            0.9,
          );
        }
        if (book) {
          coverTl.to(
            book,
            {
              autoAlpha: 1,
              duration: 0.12,
              ease: "none",
            },
            0.98,
          );
        }

        coverTl.to({}, { duration: 0.16 }, 1.08);

        ScrollTrigger.create({
          id: "hcta-stage",
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          /* Higher scrub = softer, less rushy lag behind the wheel */
          scrub: 1.15,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const maxY = Math.max(0, track.offsetHeight - window.innerHeight);
            gsap.set(frame, { y: self.progress * maxY, force3D: true });
            inviteTl.progress(1);
            coverTl.progress(self.progress);
          },
          onRefresh: (self) => {
            const maxY = Math.max(0, track.offsetHeight - window.innerHeight);
            gsap.set(frame, { y: self.progress * maxY, force3D: true });
            if (self.progress > 0) inviteTl.progress(1);
            coverTl.progress(self.progress);
          },
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
