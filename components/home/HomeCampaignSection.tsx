"use client";

import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ManagedImage } from "@/components/ui/ManagedImage";

gsap.registerPlugin(ScrollTrigger);

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
 * Tall CSS track reserves space from first paint. Transform-stick (no pin).
 * Image: crystal focus-pull over a sharp base plate (never black) + gold sheen.
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
    const base = track.querySelector<HTMLElement>("[data-hcta-base]");
    const frost = track.querySelector<HTMLElement>("[data-hcta-frost]");
    const sheen = track.querySelector<HTMLElement>("[data-hcta-sheen]");
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

      ctx = gsap.context(() => {
        if (reduced) {
          gsap.set(frame, { clearProps: "transform" });
          if (frost) gsap.set(frost, { autoAlpha: 0, clearProps: "filter" });
          if (sheen) gsap.set(sheen, { autoAlpha: 0 });
          if (chars.length) gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
          if (book) gsap.set(book, { autoAlpha: 1 });
          return;
        }

        /*
         * Sharp base plate is always full-bleed underneath — nothing black
         * can ever show. Frosted twin resolves into clarity; gold sheen sweeps.
         */
        if (base) {
          gsap.set(base, { autoAlpha: 1 });
        }
        if (frost) {
          gsap.set(frost, {
            autoAlpha: 1,
            filter: "blur(28px)",
            force3D: true,
          });
        }
        if (sheen) {
          gsap.set(sheen, { autoAlpha: 0.85, xPercent: -120 });
        }
        if (chars.length) {
          gsap.set(chars, { yPercent: 115, autoAlpha: 0, force3D: true });
        }
        if (book) {
          gsap.set(book, { autoAlpha: 0 });
        }
        gsap.set(frame, { y: 0, force3D: true });

        const story = gsap.timeline({ paused: true });

        /* 1) Crystal focus — frost lifts while gold light travels */
        if (frost) {
          story.to(
            frost,
            {
              autoAlpha: 0,
              filter: "blur(0px)",
              duration: 0.38,
              ease: "none",
              force3D: true,
            },
            0,
          );
        }
        if (sheen) {
          story.to(
            sheen,
            {
              xPercent: 120,
              duration: 0.42,
              ease: "none",
            },
            0.02,
          );
          story.to(
            sheen,
            {
              autoAlpha: 0,
              duration: 0.12,
              ease: "none",
            },
            0.32,
          );
        }

        /* 2) Quiet beat */
        story.to({}, { duration: 0.1 }, 0.4);

        /* 3) Letter rise */
        if (chars.length) {
          story.to(
            chars,
            {
              yPercent: 0,
              autoAlpha: 1,
              stagger: 0.018,
              duration: 0.18,
              ease: "none",
              force3D: true,
            },
            0.5,
          );
        }
        if (book) {
          story.to(
            book,
            {
              autoAlpha: 1,
              duration: 0.1,
              ease: "none",
            },
            0.58,
          );
        }

        /* 4) Reading pause */
        story.to({}, { duration: 0.28 }, 0.7);

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
          scrub: 0.7,
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
        <div className="hcta-media" data-hcta-media>
          {/* Sharp plate — always visible, always full-bleed */}
          <div className="hcta-shot hcta-shot--base" data-hcta-base>
            <ManagedImage
              name={imageName}
              alt={imageAlt}
              fill
              sizes="100vw"
              className="hcta-bg object-cover"
              previewAnchor={previewAnchor}
            />
          </div>
          {/* Frosted twin — dissolves to reveal the plate (no black ever) */}
          <div
            className="hcta-shot hcta-shot--frost"
            data-hcta-frost
            aria-hidden="true"
          >
            <ManagedImage
              name={imageName}
              alt=""
              fill
              sizes="100vw"
              className="hcta-bg object-cover"
              previewAnchor={false}
            />
          </div>
        </div>

        <div className="hcta-sheen" data-hcta-sheen aria-hidden="true" />
        <div className="hcta-veil" aria-hidden="true" />

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
