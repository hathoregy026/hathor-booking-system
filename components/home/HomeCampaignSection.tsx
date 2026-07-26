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
 * Call-to-action stage.
 *
 * Frame is pinned by ScrollTrigger (pinSpacing: false — track already
 * reserves height). Manual y-stick was failing under Lenis/refresh and
 * left an empty cream gap with the photo half off-screen.
 *
 * Phase A — gold invite rises as the section approaches.
 * Phase B — photograph rises over the locked invite, then on-image title.
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
    let lenisPoll = 0;

    const killOwned = () => {
      ["hcta-invite", "hcta-stage"].forEach((id) => {
        ScrollTrigger.getById(id)?.kill();
      });
    };

    const bindLenis = () => {
      if (removeLenis) return;
      const lenis = (window as Window & { __hathorLenis?: LenisLike | null })
        .__hathorLenis;
      if (!lenis?.on) return;
      const onLenisScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onLenisScroll);
      removeLenis = () => lenis.off?.("scroll", onLenisScroll);
    };

    const boot = () => {
      if (killed || !track.isConnected) return;

      ctx?.revert();
      killOwned();
      bindLenis();

      ctx = gsap.context(() => {
        if (reduced) {
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

        /*
         * Phase A — invite finishes well BEFORE the stage locks.
         */
        const inviteTl = gsap.timeline({ paused: true });
        if (silkChars.length) {
          const rows = gsap.utils.toArray<HTMLElement>(
            track.querySelectorAll(".hcta-silk-row"),
          );
          rows.forEach((row, rowIndex) => {
            const rowChars =
              row.querySelectorAll<HTMLElement>(".hcta-silk-char");
            inviteTl.to(
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
          end: "top 18%",
          scrub: 0.45,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            inviteTl.progress(self.progress);
          },
          onRefresh: (self) => {
            inviteTl.progress(self.progress);
          },
        });

        /*
         * Phase B — pin the frame for the tall track; scrub only drives cover.
         * pinSpacing: false — track height already creates the scroll room.
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
          coverTl.to(
            book,
            {
              autoAlpha: 1,
              duration: 0.1,
              ease: "none",
            },
            1.0,
          );
        }

        coverTl.to({}, { duration: 0.18 }, 1.08);

        ScrollTrigger.create({
          id: "hcta-stage",
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          pin: frame,
          pinSpacing: false,
          anticipatePin: 1,
          scrub: 1.65,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            inviteTl.progress(1);
            coverTl.progress(self.progress);
          },
          onRefresh: (self) => {
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

    /* Parent Lenis often mounts after this child effect — keep trying briefly */
    bindLenis();
    lenisPoll = window.setInterval(() => {
      bindLenis();
      if (removeLenis || killed) window.clearInterval(lenisPoll);
    }, 50);
    window.setTimeout(() => window.clearInterval(lenisPoll), 2000);

    const onLoad = () => {
      try {
        ScrollTrigger.refresh();
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("load", onLoad);

    return () => {
      killed = true;
      window.clearTimeout(bootTimer);
      window.clearInterval(lenisPoll);
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
