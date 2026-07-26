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
 * Full-bleed campaign:
 * - Short scroll pin when the image fills the viewport (pause to read)
 * - Letter-rise plays during that pause; reverses on scroll back up
 * - Book Now stays fixed (no motion); stroke-only pill
 * - Image keeps scrubbed zoom + soft parallax
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

    let charTween: gsap.core.Tween | null = null;
    let revealed = false;
    let disposed = false;

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

    const playLetters = () => {
      if (disposed || revealed || !chars.length) return;
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
      if (disposed || !revealed || !chars.length) return;
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

    const triggers: ScrollTrigger[] = [];

    const setup = () => {
      if (disposed) return;

      if (reduced) {
        if (chars.length) gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
        if (media) gsap.set(media, { scale: 1 });
        return;
      }

      if (chars.length) {
        gsap.set(chars, { yPercent: 100, autoAlpha: 0, force3D: true });
      }

      /*
       * Pin = scroll pause while the full-bleed image holds.
       * Letter rise fires on enter; reverse only when leaving back upward.
       */
      triggers.push(
        ScrollTrigger.create({
          id: "campaign-pin",
          trigger: root,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 0.75)}`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: playLetters,
          onEnterBack: playLetters,
          onLeaveBack: reverseLetters,
        }),
      );

      if (media) {
        gsap.set(media, { scale: 1.1, force3D: true });
        triggers.push(
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
          triggers.push(
            ScrollTrigger.create({
              id: "campaign-parallax-bg",
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.35,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                gsap.set(bg, {
                  yPercent: gsap.utils.interpolate(-4, 4, self.progress),
                });
              },
            }),
          );
        }
        if (headingMotion) {
          triggers.push(
            ScrollTrigger.create({
              id: "campaign-parallax-fg",
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                gsap.set(headingMotion, {
                  yPercent: gsap.utils.interpolate(-6, 6, self.progress),
                });
              },
            }),
          );
        }
      }

      /* Already sitting on the pinned frame (restore / deep link) */
      const rect = root.getBoundingClientRect();
      if (rect.top <= 2 && rect.bottom >= window.innerHeight * 0.85) {
        playLetters();
      }

      try {
        ScrollTrigger.refresh();
      } catch {
        /* ignore */
      }
    };

    /* Let Lenis + homepage ST finish booting so pin metrics stay stable */
    const tBoot = window.setTimeout(setup, 80);
    const tRefresh = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch {
        /* ignore */
      }
    }, 500);
    void document.fonts?.ready?.then(() => {
      try {
        ScrollTrigger.refresh();
      } catch {
        /* ignore */
      }
    });

    return () => {
      disposed = true;
      window.clearTimeout(tBoot);
      window.clearTimeout(tRefresh);
      charTween?.kill();
      triggers.forEach((st) => st.kill());
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
