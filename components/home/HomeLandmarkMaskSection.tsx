"use client";

import { CSSProperties } from "react";
import {
  HomeAmenitiesMaskSlider,
  type AmenitiesMaskSlide,
} from "@/components/home/HomeAmenitiesMaskSlider";
import type { SiteImageName } from "@/lib/site-image-slots";

export type LandmarkMaskSlide = {
  titleLines: string[];
  indication: string;
  body: string;
  imageName: SiteImageName;
  alt?: string;
  imageAlt?: string;
  previewAnchor?: boolean;
};

type HomeLandmarkMaskSectionProps = {
  slides: LandmarkMaskSlide[];
  titleStyle?: CSSProperties;
  indicationStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
};

/** Four-image landmark story — amenities `#i-slider` Fixed-Background Mask Reveal. */
export function HomeLandmarkMaskSection({
  slides,
  titleStyle,
  indicationStyle,
  bodyStyle,
}: HomeLandmarkMaskSectionProps) {
  const amenitiesSlides: AmenitiesMaskSlide[] = slides.map((slide) => ({
    titleLines: slide.titleLines,
    indication: slide.indication,
    body: slide.body,
    imageName: slide.imageName,
    imageAlt: slide.imageAlt ?? slide.alt ?? "",
    previewAnchor: slide.previewAnchor,
  }));

  return (
    <HomeAmenitiesMaskSlider
      slides={amenitiesSlides}
      theme="dark"
      id="home-landmark-amenities"
      ariaLabel="Landmark stories"
      titleStyle={titleStyle}
      indicationStyle={indicationStyle}
      bodyStyle={bodyStyle}
    />
  );
}

export default HomeLandmarkMaskSection;
