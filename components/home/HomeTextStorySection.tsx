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

/** Way of Life / Dining — amenities `#i-slider` Fixed-Background Mask Reveal (cream). */
export function HomeTextStorySection({ slides }: HomeTextStorySectionProps) {
  const amenitiesSlides: AmenitiesMaskSlide[] = slides.map((slide) => ({
    titleLines: [slide.title],
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
