"use client";

import {
  HomeAmenitiesMaskSlider,
  type AmenitiesMaskSlide,
} from "@/components/home/HomeAmenitiesMaskSlider";
import type { SiteImageName } from "@/lib/site-image-slots";

export type TextStorySlide = {
  title: string;
  body: string;
  cta: string;
  href: string;
  imageName: SiteImageName;
  imageAlt?: string;
  alt?: string;
  previewAnchor?: boolean;
};

type HomeTextStorySectionProps = {
  slides: TextStorySlide[];
};

function storyTitleLines(title: string): string[] {
  const lines = title
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length > 1) return lines;
  const single = (lines[0] || title).replace(/\s+/g, " ").trim();
  if (/^NOT JUST A CRUISE\s+A WAY OF LIFE$/i.test(single)) {
    return ["NOT JUST A CRUISE", "A WAY OF LIFE"];
  }
  if (/^FINE DINING\s+ON DAHABIYA$/i.test(single)) {
    return ["FINE DINING", "ON DAHABIYA"];
  }
  return single ? [single] : [];
}

/** Way of Life / Dining — amenities `#i-slider` Fixed-Background Mask Reveal (cream). */
export function HomeTextStorySection({ slides }: HomeTextStorySectionProps) {
  const amenitiesSlides: AmenitiesMaskSlide[] = slides.map((slide) => ({
    titleLines: storyTitleLines(slide.title),
    body: slide.body,
    cta: slide.cta,
    href: slide.href,
    imageName: slide.imageName,
    imageAlt: slide.imageAlt ?? slide.alt ?? "",
    previewAnchor: slide.previewAnchor,
  }));

  return (
    <HomeAmenitiesMaskSlider
      slides={amenitiesSlides}
      theme="cream"
      id="home-story-amenities"
      ariaLabel="Way of life and dining"
    />
  );
}

export default HomeTextStorySection;
