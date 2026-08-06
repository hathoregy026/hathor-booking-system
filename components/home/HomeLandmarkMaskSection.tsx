"use client";

import { CSSProperties } from "react";
import {
  HomeAmenitiesSequence,
  type AmenitiesLandmarkSlide,
  type AmenitiesSequenceImage,
  type AmenitiesStorySlide,
} from "@/components/home/HomeAmenitiesSequence";
import { AMENITIES_SEQUENCE_IMAGE_SLOTS } from "@/lib/amenities-sequence-images";
import type { SiteImageName } from "@/lib/site-image-slots";

export type LandmarkMaskSlide = AmenitiesLandmarkSlide;

type HomeLandmarkMaskSectionProps = {
  slides: LandmarkMaskSlide[];
  stories?: AmenitiesStorySlide[];
  images?: AmenitiesSequenceImage[];
  titleStyle?: CSSProperties;
  indicationStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
};

const DEFAULT_AMENITIES_IMAGES: AmenitiesSequenceImage[] =
  AMENITIES_SEQUENCE_IMAGE_SLOTS.map((slot) => ({
    name: slot.name as SiteImageName,
    alt: slot.alt,
    previewAnchor: true,
  }));

/** Homepage amenities-faithful sequence (intro → video → slider → opening). */
export function HomeLandmarkMaskSection({
  slides,
  stories = [],
  images = DEFAULT_AMENITIES_IMAGES,
  titleStyle,
  indicationStyle,
  bodyStyle,
}: HomeLandmarkMaskSectionProps) {
  return (
    <HomeAmenitiesSequence
      landmarks={slides}
      stories={stories}
      images={images}
      titleStyle={titleStyle}
      indicationStyle={indicationStyle}
      bodyStyle={bodyStyle}
    />
  );
}

export default HomeLandmarkMaskSection;
