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
 * Luxury campaign pause without layout jump:
 * - `.campaign-shell` is 190vh in CSS from first paint (space reserved)
 * - Section pins inside it with pinSpacing:false (no late spacer)
 * - Scrubbed letters sync to the pause; reverse on scroll up
 * - Book Now stays fixed
 */
export function HomeCampaignSection({
  title,
  imageName,
  imageAlt,
  titleStyle,
  previewAnchor = true,
}: HomeCampaignSectionProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    const section = sectionRef.current;
    if (!shell || !section) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const mobile = window.innerWidth < 1024;

    const media =
      section.querySelector<HTMLElement>("img.campaign-bg") ||
      section.querySelector<HTMLElement>("img");
    const chars = Array.from(
      section.querySelectorAll<HTMLElement>(".campaign-heading .split-char"),
    );
    const headingMotion = section.querySelector<HTMLElement>(
      "[data-parallax='fg']",
    );
    const bg = section.querySelector<HTMLElement>("[data-parallax='bg']");

    const ctx = gsap.context(() => {
      if (reduced) {
        if (chars.length) gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
        if (media) gsap.set(media, { scale: 1 });
        return;
      }

      if (chars.length) {
        gsap.set(chars, { yPercent: 100, autoAlpha: 0, force3D: true });
      }
      if (media) {
        gsap.set(media, { scale: 1.08, force3D: true });
      }

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "campaign-hold",
          trigger: section,
          start: "top top",
          endTrigger: shell,
          end: "bottom bottom",
          pin: true,
          pinSpacing: false,
          anticipatePin: 0,
          scrub: 1.25,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          onRefresh: (self) => {
            const pin = self.pin as HTMLElement | null;
            if (!pin) return;
            gsap.set(pin, {
              x: 0,
              left: 0,
              marginLeft: 0,
              clearProps: "marginRight",
            });
          },
        },
      });

      /* Rise through the first half of the hold */
      if (chars.length) {
        tl.to(
          chars,
          {
            yPercent: 0,
            autoAlpha: 1,
            stagger: { each: 0.045, ease: "none" },
            duration: 0.5,
            force3D: true,
          },
          0,
        );
      }

      if (media) {
        tl.to(media, { scale: 1, duration: 1, force3D: true }, 0);
      }

      /* Second half — settled hold */
      tl.to({}, { duration: 0.5 }, 0.5);

      if (!touch && !mobile && bg) {
        gsap.fromTo(
          bg,
          { yPercent: -3 },
          {
            yPercent: 3,
            ease: "none",
            scrollTrigger: {
              id: "campaign-parallax-bg",
              trigger: shell,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      if (!touch && !mobile && headingMotion) {
        gsap.fromTo(
          headingMotion,
          { yPercent: -3 },
          {
            yPercent: 3,
            ease: "none",
            scrollTrigger: {
              id: "campaign-parallax-fg",
              trigger: section,
              start: "top top",
              endTrigger: shell,
              end: "bottom bottom",
              scrub: 0.55,
              invalidateOnRefresh: true,
            },
          },
        );
      }
    }, shell);

    const refresh = () => {
      try {
        ScrollTrigger.refresh();
      } catch {
        /* ignore */
      }
    };
    refresh();
    const t1 = window.setTimeout(refresh, 200);
    const t2 = window.setTimeout(refresh, 800);
    void document.fonts?.ready?.then(refresh);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={shellRef} className="campaign-shell">
      <section
        ref={sectionRef}
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
    </div>
  );
}
