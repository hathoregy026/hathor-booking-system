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
 * Hero-scale gold invite on site cream lifts away to the photograph.
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
    const silk = track.querySelector<HTMLElement>("[data-hcta-silk]");
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
    let silkTextTween: gsap.core.Tween | null = null;
    let removeLenis: (() => void) | null = null;
    let bootTimer = 0;

    const boot = () => {
      if (killed || !track.isConnected) return;

      ctx?.revert();
      st?.kill();
      silkTextTween?.kill();
      ScrollTrigger.getById("hcta-silk-text")?.kill();

      ctx = gsap.context(() => {
        if (reduced) {
          gsap.set(frame, { clearProps: "transform" });
          if (silk) gsap.set(silk, { yPercent: -101, autoAlpha: 0 });
          if (silkChars.length) {
            gsap.set(silkChars, { yPercent: 0, autoAlpha: 1 });
          }
          if (chars.length) gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
          if (book) gsap.set(book, { autoAlpha: 1 });
          return;
        }

        if (silk) {
          gsap.set(silk, { yPercent: 0, autoAlpha: 1 });
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

        /* Hero invite — clear letter rise when the cream stage enters view */
        if (silkChars.length) {
          silkTextTween = gsap.to(silkChars, {
            yPercent: 0,
            autoAlpha: 1,
            stagger: 0.028,
            duration: 0.7,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: {
              id: "hcta-silk-text",
              trigger: track,
              start: "top 90%",
              end: "top top",
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true,
            },
          });
        }

        const story = gsap.timeline({ paused: true });

        if (silk) {
          story.to(
            silk,
            {
              yPercent: -101,
              duration: 0.28,
              ease: "none",
              force3D: true,
            },
            0,
          );
        }

        story.to({}, { duration: 0.08 }, 0.28);

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
            0.34,
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
            0.42,
          );
        }

        story.to({}, { duration: 0.22 }, 0.52);

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
          scrub: 0.45,
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
      silkTextTween?.kill();
      ScrollTrigger.getById("hcta-silk-text")?.kill();
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
