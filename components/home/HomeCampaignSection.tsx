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
 * Scrubbed: gold invite rises → image rises to cover while invite reverses →
 * on-image title. Scroll up reverses the whole story.
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
    let st: ScrollTrigger | null = null;
    let removeLenis: (() => void) | null = null;
    let bootTimer = 0;

    const boot = () => {
      if (killed || !track.isConnected) return;

      ctx?.revert();
      st?.kill();
      ScrollTrigger.getById("hcta-silk-text")?.kill();
      ScrollTrigger.getById("hcta-stage")?.kill();

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

        /* Image panel starts below the cream invite */
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

        const story = gsap.timeline({ paused: true });

        /* 1) Invite letters rise — fully scrubbed with scroll */
        if (silkChars.length) {
          story.to(
            silkChars,
            {
              yPercent: 0,
              autoAlpha: 1,
              stagger: 0.02,
              duration: 0.22,
              ease: "none",
              force3D: true,
            },
            0,
          );
        }

        /* 2) Image rises to cover while invite animates back */
        if (silkChars.length) {
          story.to(
            silkChars,
            {
              yPercent: 120,
              autoAlpha: 0,
              stagger: 0.016,
              duration: 0.28,
              ease: "none",
              force3D: true,
            },
            0.24,
          );
        }
        if (reveal) {
          story.to(
            reveal,
            {
              yPercent: 0,
              duration: 0.32,
              ease: "none",
              force3D: true,
            },
            0.24,
          );
        }

        /* 3) Quiet beat on the photograph */
        story.to({}, { duration: 0.08 }, 0.54);

        /* 4) On-image title + Book Now */
        if (chars.length) {
          story.to(
            chars,
            {
              yPercent: 0,
              autoAlpha: 1,
              stagger: 0.014,
              duration: 0.16,
              ease: "none",
              force3D: true,
            },
            0.6,
          );
        }
        if (book) {
          story.to(
            book,
            {
              autoAlpha: 1,
              duration: 0.08,
              ease: "none",
            },
            0.68,
          );
        }

        /* 5) Reading pause */
        story.to({}, { duration: 0.2 }, 0.78);

        const sync = (progress: number) => {
          const maxY = Math.max(0, track.offsetHeight - window.innerHeight);
          gsap.set(frame, { y: progress * maxY, force3D: true });
          story.progress(progress);
        };

        st = ScrollTrigger.create({
          id: "hcta-stage",
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => sync(self.progress),
          onRefresh: (self) => sync(self.progress),
        });

        sync(st.progress);
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
      st?.kill();
      ScrollTrigger.getById("hcta-stage")?.kill();
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
        {/* Cream + gold invite — stays put; image rises over it */}
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

        {/* Photograph panel — rises from below to cover the invite */}
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
