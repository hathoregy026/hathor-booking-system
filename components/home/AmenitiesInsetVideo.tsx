"use client";

import { FullBleedBackgroundVideo } from "@/components/public/FullBleedBackgroundVideo";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import {
  HATHOR_AMENITIES_INSET_VIDEO_MOBILE_SRC,
  HATHOR_AMENITIES_INSET_VIDEO_SRC,
} from "@/lib/amenities-video";

const INSET_POSTER_SLOT = "home-amenities-3" as const;

type AmenitiesInsetVideoProps = {
  alt: string;
};

/**
 * Amenities rising clip stage (`home-am-video__inset` / CMS slot `home-amenities-3`).
 * Same pattern as homepage hero: static MP4 + CMS poster; phones use poster
 * until a mobile encode is set on `HATHOR_AMENITIES_INSET_VIDEO_MOBILE_SRC`.
 */
export function AmenitiesInsetVideo({ alt }: AmenitiesInsetVideoProps) {
  const poster = useSiteImage(INSET_POSTER_SLOT);

  const imageFallback = (
    <ManagedImage
      name={INSET_POSTER_SLOT}
      alt={alt || poster.alt}
      fill
      sizes="100vw"
      className="object-cover"
      previewAnchor
    />
  );

  return (
    <FullBleedBackgroundVideo
      src={HATHOR_AMENITIES_INSET_VIDEO_SRC}
      mobileSrc={HATHOR_AMENITIES_INSET_VIDEO_MOBILE_SRC}
      poster={poster.src}
      alt={alt || poster.alt}
      className="home-am-video__inset-video"
      surface="amenities-inset-video"
      fallback={imageFallback}
    />
  );
}
