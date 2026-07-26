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
 * Tall CSS track reserves space from first paint. The frame is transform-stuck
 * inside that track (no GSAP pin / no pin-spacer). Scroll progress drives
 * image reveal → quiet beat → letter rise → hold → release.
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
    const mediaWrap = track.querySelector<HTMLElement>("[data-hcta-media]");
    const media =
      track.querySelector<HTMLElement>("img.hcta-bg") ||
      track.querySelector<HTMLElement>("img");
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
          if (mediaWrap) {
            gsap.set(mediaWrap, { clipPath: "inset(0% 0% 0% 0%)" });
          }
          if (media) gsap.set(media, { scale: 1 });
          if (chars.length) gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
          if (book) gsap.set(book, { autoAlpha: 1 });
          return;
        }

        /* Start states — image veiled, letters sunk, book quiet */
        if (mediaWrap) {
          gsap.set(mediaWrap, {
            clipPath: "inset(14% 10% 14% 10%)",
          });
        }
        if (media) {
          gsap.set(media, { scale: 1.28, force3D: true });
        }
        if (chars.length) {
          gsap.set(chars, { yPercent: 115, autoAlpha: 0, force3D: true });
        }
        if (book) {
          gsap.set(book, { autoAlpha: 0 });
        }
        gsap.set(frame, { y: 0, force3D: true });

        /*
         * Scrubbed storyboard (progress 0→1 through the reserved track).
         * No pin — layout height never changes after first paint.
         */
        const story = gsap.timeline({ paused: true });

        /* 1) Image opens into full-bleed */
        if (mediaWrap) {
          story.to(
            mediaWrap,
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.26,
              ease: "none",
            },
            0,
          );
        }
        if (media) {
          story.to(
            media,
            {
              scale: 1.06,
              duration: 0.26,
              ease: "none",
              force3D: true,
            },
            0,
          );
        }

        /* 2) Settle + small quiet beat before copy */
        if (media) {
          story.to(
            media,
            {
              scale: 1,
              duration: 0.12,
              ease: "none",
              force3D: true,
            },
            0.26,
          );
        }
        story.to({}, { duration: 0.08 }, 0.34);

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
            0.42,
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
            0.5,
          );
        }

        /* 4) Reading pause while still stuck */
        story.to({}, { duration: 0.28 }, 0.62);

        /* 5) Soft finish into release */
        if (media) {
          story.to(
            media,
            {
              scale: 1.02,
              duration: 0.1,
              ease: "none",
              force3D: true,
            },
            0.9,
          );
        }

        const sync = (progress: number) => {
          const maxY = Math.max(0, track.offsetHeight - window.innerHeight);
          const y = progress * maxY;
          gsap.set(frame, { y, force3D: true });
          story.progress(progress);
        };

        st = ScrollTrigger.create({
          id: "hcta-stage",
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.65,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            sync(self.progress);
          },
          onRefresh: (self) => {
            sync(self.progress);
          },
        });

        sync(st.progress);
      }, track);

      ScrollTrigger.refresh();
    };

    /*
     * Child layout effects run before Lenis boots in useExScrollMotion.
     * Wait two frames so ST measures against the live Lenis scroller.
     */
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
