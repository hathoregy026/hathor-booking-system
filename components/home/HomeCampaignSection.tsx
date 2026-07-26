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
 * Luxury campaign pause without a JavaScript pin:
 * - CSS sticky supplies the hold without injecting a pin spacer
 * - One scrubbed timeline reveals/reverses the letters and zooms the image
 * - Book Now remains fixed
 */
export function HomeCampaignSection({
  title,
  imageName,
  imageAlt,
  titleStyle,
  previewAnchor = true,
}: HomeCampaignSectionProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const media =
      shell.querySelector<HTMLElement>("img.campaign-bg") ||
      shell.querySelector<HTMLElement>("img");
    const chars = Array.from(
      shell.querySelectorAll<HTMLElement>(".campaign-heading .split-char"),
    );

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

      /*
       * The sticky frame is already holding when this range starts.
       * Scrub makes the reveal deterministic in both directions:
       * scrolling down raises the letters; scrolling up lowers them.
       */
      const tl = gsap.timeline({
        scrollTrigger: {
          id: "campaign-hold",
          trigger: shell,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      if (media) {
        tl.to(
          media,
          {
            scale: 1,
            duration: 1,
            ease: "none",
            force3D: true,
          },
          0,
        );
      }

      /* Rise early in the hold, then leave a quiet reading beat. */
      if (chars.length) {
        tl.to(
          chars,
          {
            yPercent: 0,
            autoAlpha: 1,
            stagger: 0.025,
            duration: 0.38,
            ease: "power3.out",
            force3D: true,
          },
          0.08,
        );
      }

      tl.to({}, { duration: 0.3 }, 0.7);
    }, shell);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={shellRef} className="campaign-shell">
      <section
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
