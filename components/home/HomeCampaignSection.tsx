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
 * Full-bleed campaign — no pin (avoids layout jumps).
 * Letters rise when the image nearly fills the viewport; reverse on scroll up.
 * Book Now stays fixed; image keeps soft zoom/parallax only.
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

    const media =
      root.querySelector<HTMLElement>("img.campaign-bg") ||
      root.querySelector<HTMLElement>("img");
    const chars = Array.from(
      root.querySelectorAll<HTMLElement>(".campaign-heading .split-char"),
    );
    const headingMotion = root.querySelector<HTMLElement>(
      "[data-parallax='fg']",
    );
    const bg = root.querySelector<HTMLElement>("[data-parallax='bg']");

    let revealed = false;
    let charTween: gsap.core.Tween | null = null;
    const scrubTriggers: ScrollTrigger[] = [];
    let io: IntersectionObserver | null = null;

    const playLetters = () => {
      if (revealed || !chars.length) return;
      revealed = true;
      charTween?.kill();
      charTween = gsap.fromTo(
        chars,
        { yPercent: 100, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1.05,
          stagger: 0.035,
          ease: "power3.out",
          overwrite: true,
          force3D: true,
        },
      );
    };

    const reverseLetters = () => {
      if (!revealed || !chars.length) return;
      revealed = false;
      charTween?.kill();
      charTween = gsap.to(chars, {
        yPercent: 100,
        autoAlpha: 0,
        duration: 0.55,
        stagger: 0.02,
        ease: "power2.in",
        overwrite: true,
        force3D: true,
      });
    };

    if (reduced) {
      if (chars.length) gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
      if (media) gsap.set(media, { scale: 1 });
    } else {
      if (chars.length) {
        gsap.set(chars, { yPercent: 100, autoAlpha: 0, force3D: true });
      }

      /*
       * Letter rise when image is nearly full-bleed (high ratio).
       * No ScrollTrigger pin — pin-spacer was jumping the page.
       */
      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          const top = entry.boundingClientRect.top;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.72) {
            playLetters();
          } else if (!entry.isIntersecting && top > 0) {
            reverseLetters();
          }
        },
        {
          threshold: [0, 0.4, 0.55, 0.72, 0.85, 1],
          rootMargin: "0px",
        },
      );
      io.observe(root);

      if (media) {
        gsap.set(media, { scale: 1.1, force3D: true });
        scrubTriggers.push(
          ScrollTrigger.create({
            id: "campaign-zoom",
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              gsap.set(media, {
                scale: gsap.utils.interpolate(1.1, 1, self.progress),
              });
            },
          }),
        );
      }

      if (!touch && !mobile) {
        if (bg) {
          scrubTriggers.push(
            ScrollTrigger.create({
              id: "campaign-parallax-bg",
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.35,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                gsap.set(bg, {
                  yPercent: gsap.utils.interpolate(-3, 3, self.progress),
                });
              },
            }),
          );
        }
        if (headingMotion) {
          scrubTriggers.push(
            ScrollTrigger.create({
              id: "campaign-parallax-fg",
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.45,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                gsap.set(headingMotion, {
                  yPercent: gsap.utils.interpolate(-5, 5, self.progress),
                });
              },
            }),
          );
        }
      }

      requestAnimationFrame(() => {
        const rect = root.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
        if (visible / Math.min(rect.height, vh) >= 0.72) {
          playLetters();
        }
      });
    }

    const refresh = () => {
      try {
        ScrollTrigger.refresh();
      } catch {
        /* ignore */
      }
    };
    const t1 = window.setTimeout(refresh, 200);
    void document.fonts?.ready?.then(refresh);

    return () => {
      window.clearTimeout(t1);
      io?.disconnect();
      charTween?.kill();
      scrubTriggers.forEach((st) => st.kill());
      if (media) gsap.set(media, { clearProps: "transform" });
      if (bg) gsap.set(bg, { clearProps: "transform" });
      if (headingMotion) gsap.set(headingMotion, { clearProps: "transform" });
      if (chars.length) {
        gsap.set(chars, { clearProps: "transform,opacity,visibility" });
      }
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
