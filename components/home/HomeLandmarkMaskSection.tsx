"use client";

import { CSSProperties, type ReactNode } from "react";
import {
  type AmenitiesLandmarkSlide,
  type AmenitiesSequenceImage,
  type AmenitiesStorySlide,
} from "@/components/home/HomeAmenitiesSequence";
import { HomeAmenitiesSpringsPortal } from "@/components/home/HomeAmenitiesSpringsPortal";
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
  voyages?: ReactNode;
};

const DEFAULT_AMENITIES_IMAGES: AmenitiesSequenceImage[] =
  AMENITIES_SEQUENCE_IMAGE_SLOTS.map((slot) => ({
    name: slot.name as SiteImageName,
    alt: slot.alt,
    previewAnchor: true,
  }));

/**
 * Homepage amenities = literal Springs document (/home-amenities-springs),
 * same source as /test-slide. Layout/scroll/joins stay in Springs;
 * Hathor only injects CMS media/copy and mounts Our Voyages after.
 */
export function HomeLandmarkMaskSection({
  slides,
  stories = [],
  images: _images = DEFAULT_AMENITIES_IMAGES,
  titleStyle,
  indicationStyle,
  bodyStyle,
  voyages,
}: HomeLandmarkMaskSectionProps) {
  return (
    <HomeAmenitiesSpringsPortal
      landmarks={slides}
      stories={stories}
      titleStyle={titleStyle}
      indicationStyle={indicationStyle}
      bodyStyle={bodyStyle}
      voyages={voyages}
    />
  );
}

export default HomeLandmarkMaskSection;
