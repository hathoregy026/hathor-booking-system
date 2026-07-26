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
 * soft exposure + drift → quiet beat → letter rise → hold → release.
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
    const veil = track.querySelector<HTMLElement>(".hcta-veil");
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
          if (media) {
            gsap.set(media, {
              clearProps: "filter,transform",
              yPercent: 0,
              autoAlpha: 1,
            });
          }
          if (veil) gsap.set(veil, { autoAlpha: 1 });
          if (chars.length) gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
          if (book) gsap.set(book, { autoAlpha: 1 });
          return;
        }

        /*
         * Full-bleed always (no inset clip, no Ken Burns zoom).
         * Image motion: soft exposure lift + slow vertical drift —
         * editorial / luxury, layout untouched.
         */
        if (mediaWrap) {
          gsap.set(mediaWrap, { clearProps: "clipPath" });
        }
        if (media) {
          gsap.set(media, {
            scale: 1,
            yPercent: 10,
            filter: "brightness(0.48) saturate(0.78)",
            autoAlpha: 1,
            force3D: true,
          });
        }
        if (veil) {
          gsap.set(veil, { autoAlpha: 0.92 });
        }
        if (chars.length) {
          gsap.set(chars, { yPercent: 115, autoAlpha: 0, force3D: true });
        }
        if (book) {
          gsap.set(book, { autoAlpha: 0 });
        }
        gsap.set(frame, { y: 0, force3D: true });

        const story = gsap.timeline({ paused: true });

        /* 1) Dawn / exposure — image wakes into full light */
        if (media) {
          story.to(
            media,
            {
              yPercent: 0,
              filter: "brightness(1) saturate(1)",
              duration: 0.36,
              ease: "none",
              force3D: true,
            },
            0,
          );
        }
        if (veil) {
          story.to(
            veil,
            {
              autoAlpha: 1,
              duration: 0.36,
              ease: "none",
            },
            0,
          );
        }

        /* 2) Quiet beat before copy */
        story.to({}, { duration: 0.1 }, 0.36);

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
            0.46,
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
            0.54,
          );
        }

        /* 4) Reading pause while still stuck */
        story.to({}, { duration: 0.28 }, 0.66);

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
