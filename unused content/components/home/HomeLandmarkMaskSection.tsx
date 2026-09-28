"use client";

import { CSSProperties, type ReactNode } from "react";
import {
  HomeAmenitiesSequence,
  type AmenitiesLandmarkSlide,
  type AmenitiesSequenceImage,
  type AmenitiesStorySlide,
} from "@/components/home/HomeAmenitiesSequence";
import { AMENITIES_SEQUENCE_IMAGE_SLOTS } from "@/lib/amenities-sequence-images";
import {
  DEFAULT_AMENITIES_TYPOGRAPHY,
  type AmenitiesTypography,
} from "@/lib/amenities-typography-shared";
import type { SiteImageName } from "@/lib/site-image-slots";

export type LandmarkMaskSlide = AmenitiesLandmarkSlide;

type HomeLandmarkMaskSectionProps = {
  slides: LandmarkMaskSlide[];
  stories?: AmenitiesStorySlide[];
  images?: AmenitiesSequenceImage[];
  titleStyle?: CSSProperties;
  indicationStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
  amenitiesTypography?: AmenitiesTypography;
  voyages?: ReactNode;
};

const DEFAULT_AMENITIES_IMAGES: AmenitiesSequenceImage[] =
  AMENITIES_SEQUENCE_IMAGE_SLOTS.map((slot) => ({
    name: slot.name as SiteImageName,
    alt: slot.alt,
    previewAnchor: true,
  }));

/**
 * Homepage amenities sequence (React port of Springs intro→nature).
 * The iframe clone experiment blanked production — keep the working port.
 * Oracle for layout/scroll: /test-slide (public/springs-layout).
 */
export function HomeLandmarkMaskSection({
  slides,
  stories = [],
  images = DEFAULT_AMENITIES_IMAGES,
  titleStyle,
  indicationStyle,
  bodyStyle,
  amenitiesTypography = DEFAULT_AMENITIES_TYPOGRAPHY,
  voyages,
}: HomeLandmarkMaskSectionProps) {
  return (
    <HomeAmenitiesSequence
      landmarks={slides}
      stories={stories}
      images={images}
      titleStyle={titleStyle}
      indicationStyle={indicationStyle}
      bodyStyle={bodyStyle}
      amenitiesTypography={amenitiesTypography}
      voyages={voyages}
    />
  );
}

export default HomeLandmarkMaskSection;
