"use client";

import type { CSSProperties } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ManagedImage } from "@/components/ui/ManagedImage";

type HomeCampaignSectionProps = {
  title: string;
  imageName: string;
  imageAlt: string;
  titleStyle?: CSSProperties;
  previewAnchor?: boolean;
};

/**
 * Full-bleed Call to action between testimonials and Begin your Nile escape.
 * Pin + letter rise/reverse are owned by useExScrollMotion (same Lenis boot as stack).
 */
export function HomeCampaignSection({
  title,
  imageName,
  imageAlt,
  titleStyle,
  previewAnchor = true,
}: HomeCampaignSectionProps) {
  return (
    <section
      className="campaign-section"
      id="campaign"
      aria-label="Campaign call to action"
      data-campaign-section
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
              data-campaign-title
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
