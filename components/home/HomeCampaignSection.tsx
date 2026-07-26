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
 * Flow-layout frame + ScrollTrigger pin (track already reserves height).
 * Silk invite is never CSS-hidden — a stalled scrub must not leave a void.
 *
 * Phase A — gold invite rises as the section approaches.
 * Phase B — photograph rises over the locked invite, then on-image title.
 *
 * Conflict checks (do not regress):
 * - Only kills own ST ids (hcta-invite / hcta-stage) — never getAll().
 * - pinSpacing:false — track height owns scroll room (no spacer fight).
 * - Lenis: bind after parent mounts; rely on global ST.update too.
 * - overflow-x:clip on html breaks sticky — pin (fixed) is required.
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
    let lenisPoll = 0;

    const killOwned = () => {
      ["hcta-invite", "hcta-stage"].forEach((id) => {
        ScrollTrigger.getById(id)?.kill();
      });
    };

    const showSilk = () => {
      if (!silkChars.length) return;
      gsap.set(silkChars, { yPercent: 0, autoAlpha: 1, force3D: true });
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
          showSilk();
          gsap.set(silkChars, { autoAlpha: 0 });
          if (chars.length) gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
          if (book) gsap.set(book, { autoAlpha: 1 });
          return;
        }

        /* Image starts below — silk stays readable (never CSS-void) */
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
          end: "top top",
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => inviteTl.progress(self.progress),
          onRefresh: (self) => inviteTl.progress(self.progress),
        });

        const coverTl = gsap.timeline({ paused: true });

        /* Failsafe — lock invite readable before cover, even if invite ST lagged */
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
         * Pin the in-flow frame. Track height = scroll distance.
         * pinSpacing:false avoids spacer fighting the reserved 420vh.
         */
        ScrollTrigger.create({
          id: "hcta-stage",
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          pin: frame,
          pinSpacing: false,
          anticipatePin: 1,
          scrub: 1.35,
          invalidateOnRefresh: true,
          onEnter: () => {
            inviteTl.progress(1);
            showSilk();
          },
          onEnterBack: () => {
            inviteTl.progress(1);
            showSilk();
          },
          onUpdate: (self) => {
            inviteTl.progress(1);
            coverTl.progress(self.progress);
          },
          onRefresh: (self) => {
            if (self.progress > 0) {
              inviteTl.progress(1);
              showSilk();
            }
            coverTl.progress(self.progress);
          },
        });
      }, track);

      ScrollTrigger.refresh();
    };

    /* Sync boot in layout effect — no void frame before rAF */
    boot();

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
