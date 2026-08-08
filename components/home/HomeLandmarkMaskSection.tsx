"use client";

import { type ReactNode } from "react";
import { HomeAmenitiesSpringsClone } from "@/components/home/HomeAmenitiesSpringsClone";

type HomeLandmarkMaskSectionProps = {
  /** @deprecated Kept so HomePageClient can pass old props without crashing — ignored. */
  slides?: unknown;
  stories?: unknown;
  images?: unknown;
  titleStyle?: unknown;
  indicationStyle?: unknown;
  bodyStyle?: unknown;
  voyages?: ReactNode;
};

/**
 * Homepage amenities = pure Springs clone (images + colours unchanged).
 * Hathor CMS restyle later from archive/home-amenities-hathor-backup.
 */
export function HomeLandmarkMaskSection({
  voyages,
}: HomeLandmarkMaskSectionProps) {
  return <HomeAmenitiesSpringsClone voyages={voyages} />;
}

export default HomeLandmarkMaskSection;
