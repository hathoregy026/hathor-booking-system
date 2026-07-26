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

/**
 * Campaign block — image zoom/parallax + letter-rise/reverse on the title.
 * Book Now stays fixed (no entrance / no parallax); stroke-only pill.
 */
export function HomeCampaignSection({
  title,
  imageName,
  imageAlt,
  titleStyle,
  previewAnchor = true,
}: HomeCampaignSectionProps) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const mobile = window.innerWidth < 1024;

    const ctx = gsap.context(() => {
      const media =
        root.querySelector<HTMLElement>("img.campaign-bg") ||
        root.querySelector<HTMLElement>("img");
      const chars = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll(".campaign-heading .split-char"),
      );
      const headingMotion = root.querySelector<HTMLElement>(
        "[data-parallax='fg']",
      );
      const bg = root.querySelector<HTMLElement>("[data-parallax='bg']");

      if (reduced) {
        if (chars.length) gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
        if (media) gsap.set(media, { scale: 1 });
        return;
      }

      /* Image — scrubbed zoom (both scroll directions) */
      if (media) {
        gsap.fromTo(
          media,
          { scale: 1.12 },
          {
            scale: 1,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              id: "campaign-zoom",
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      /*
       * Title — letter rise when the image is almost full-bleed,
       * reverse when scrolling back up (Maison Élara toggleActions).
       */
      if (chars.length) {
        gsap.set(chars, { yPercent: 100, autoAlpha: 0, force3D: true });
        gsap.to(chars, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1,
          stagger: 0.03,
          ease: "power3.out",
          overwrite: "auto",
          scrollTrigger: {
            id: "campaign-letters",
            trigger: root,
            /* Fire when section top is near the top — image nearly fills the screen */
            start: "top 22%",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true,
            fastScrollEnd: true,
          },
        });
      }

      /* Soft parallax — image only (button is outside fg motion) */
      if (!touch && !mobile) {
        if (bg) {
          gsap.fromTo(
            bg,
            { yPercent: -4 },
            {
              yPercent: 4,
              ease: "none",
              scrollTrigger: {
                id: "campaign-parallax-bg",
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.35,
                invalidateOnRefresh: true,
              },
            },
          );
        }
        if (headingMotion) {
          gsap.fromTo(
            headingMotion,
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: "none",
              scrollTrigger: {
                id: "campaign-parallax-fg",
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.55,
                invalidateOnRefresh: true,
              },
            },
          );
        }
      }
    }, root);

    const refresh = () => {
      try {
        ScrollTrigger.refresh();
      } catch {
        /* ignore */
      }
    };
    refresh();
    const t1 = window.setTimeout(refresh, 160);
    const t2 = window.setTimeout(refresh, 640);
    void document.fonts?.ready?.then(refresh);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="campaign-section"
      id="campaign"
      aria-label="Campaign call to action"
    >
      <div className="campaign-img-reveal" data-parallax="bg">
        <ManagedImage
          name={imageName}
          alt={imageAlt}
          fill
          sizes="100vw"
          className="campaign-bg object-cover"
          previewAnchor={previewAnchor}
        />
      </div>

      <div className="campaign-overlay" aria-hidden="true" />

      <div className="campaign-fg">
        <div className="campaign-fg-stack">
          <div className="campaign-fg-motion" data-parallax="fg">
            <h2
              className="campaign-heading typo-on-images-title"
              style={titleStyle}
              aria-label={title}
            >
              {Array.from(title).map((ch, index) => (
                <span className="split-heading" key={`${ch}-${index}`}>
                  <span className="split-char">
                    {ch === " " ? "\u00A0" : ch}
                  </span>
                </span>
              ))}
            </h2>
          </div>
          <BookNowTrigger className="btn campaign-book-btn">
            Book Now
          </BookNowTrigger>
        </div>
      </div>
    </section>
  );
}
