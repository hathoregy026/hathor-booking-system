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
 * Full-bleed campaign block with letter-rise title, Book Now fade, scrubbed zoom.
 * Motion is self-contained so homepage Lenis boot / typography re-renders cannot drop it.
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

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const mobile = window.innerWidth < 1024;

    const ctx = gsap.context(() => {
      const media =
        root.querySelector<HTMLElement>("img.campaign-bg") ||
        root.querySelector<HTMLElement>("img");
      const chars = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll(".campaign-heading .split-char"),
      );
      const btn = root.querySelector<HTMLElement>(".campaign-book-btn");
      const bg = root.querySelector<HTMLElement>("[data-parallax='bg']");
      const fg = root.querySelector<HTMLElement>("[data-parallax='fg']");

      /* Full-bleed cover — never leave a clipped empty strip above the photo */
      if (media) {
        gsap.set(media, { clipPath: "inset(0% 0% 0% 0%)", scale: 1.12 });
        if (!reduced) {
          gsap.fromTo(
            media,
            { scale: 1.12 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        } else {
          gsap.set(media, { scale: 1 });
        }
      }

      if (reduced) {
        if (chars.length) gsap.set(chars, { yPercent: 0, opacity: 1 });
        if (btn) gsap.set(btn, { y: 0, opacity: 1 });
        return;
      }

      if (chars.length) {
        gsap.set(chars, { yPercent: 110, opacity: 0 });
        gsap.to(chars, {
          yPercent: 0,
          opacity: 1,
          duration: 1.05,
          stagger: 0.035,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root,
            start: "top 72%",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true,
          },
        });
      }

      if (btn) {
        gsap.set(btn, { y: 28, opacity: 0 });
        gsap.to(btn, {
          y: 0,
          opacity: 1,
          duration: 0.85,
          delay: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root,
            start: "top 72%",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true,
          },
        });
      }

      if (!touch && !mobile) {
        if (bg) {
          gsap.fromTo(
            bg,
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.35,
              },
            },
          );
        }
        if (fg) {
          gsap.fromTo(
            fg,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.55,
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
    const t1 = window.setTimeout(refresh, 120);
    const t2 = window.setTimeout(refresh, 500);
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
          <BookNowTrigger className="btn campaign-book-btn">
            Book Now
          </BookNowTrigger>
        </div>
      </div>
    </section>
  );
}
