"use client";

import { CSSProperties } from "react";
import {
  HomeAmenitiesSequence,
  type AmenitiesLandmarkSlide,
  type AmenitiesStorySlide,
} from "@/components/home/HomeAmenitiesSequence";

export type LandmarkMaskSlide = AmenitiesLandmarkSlide;

type HomeLandmarkMaskSectionProps = {
  slides: LandmarkMaskSlide[];
  stories?: AmenitiesStorySlide[];
  titleStyle?: CSSProperties;
  indicationStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
};

/** Homepage amenities-faithful sequence (intro → video → slider → opening). */
export function HomeLandmarkMaskSection({
  slides,
  stories = [],
  titleStyle,
  indicationStyle,
  bodyStyle,
}: HomeLandmarkMaskSectionProps) {
  return (
    <HomeAmenitiesSequence
      landmarks={slides}
      stories={stories}
      titleStyle={titleStyle}
      indicationStyle={indicationStyle}
      bodyStyle={bodyStyle}
    />
  );
}

export default HomeLandmarkMaskSection;
