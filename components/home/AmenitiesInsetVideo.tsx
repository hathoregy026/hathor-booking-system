"use client";

import { FullBleedBackgroundVideo } from "@/components/public/FullBleedBackgroundVideo";
import {
  HATHOR_AMENITIES_INSET_VIDEO_MOBILE_SRC,
  HATHOR_AMENITIES_INSET_VIDEO_SRC,
} from "@/lib/amenities-video";

type AmenitiesInsetVideoProps = {
  alt: string;
};

/**
 * Amenities rising clip stage (`home-am-video__inset` / CMS slot `home-amenities-3`).
 * Full sticky stage — Bar reel only (no CMS still).
 */
export function AmenitiesInsetVideo({ alt }: AmenitiesInsetVideoProps) {
  const fallback = (
    <div
      className="home-am-video__inset-fallback"
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        background: "#0f0c09",
      }}
    />
  );

  return (
    <FullBleedBackgroundVideo
      src={HATHOR_AMENITIES_INSET_VIDEO_SRC}
      mobileSrc={HATHOR_AMENITIES_INSET_VIDEO_MOBILE_SRC}
      poster=""
      alt={alt}
      className="home-am-video__inset-video"
      surface="amenities-inset-video"
      fallback={fallback}
    />
  );
}
