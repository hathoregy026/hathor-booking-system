"use client";

import { FullBleedBackgroundVideo } from "@/components/public/FullBleedBackgroundVideo";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import {
  HATHOR_AMENITIES_RISING_VIDEO_MOBILE_SRC,
  HATHOR_AMENITIES_RISING_VIDEO_SRC,
} from "@/lib/amenities-video";
import type { SiteImageName } from "@/lib/site-image-slots";

type AmenitiesRisingVideoProps = {
  imageName: SiteImageName;
  alt: string;
  previewAnchor?: boolean;
};

/**
 * Amenities `i-video` / rising full-bleed media.
 * Uses CMS slot as poster; plays MP4 when `HATHOR_AMENITIES_RISING_VIDEO_SRC` is set
 * (same rules as homepage hero video).
 */
export function AmenitiesRisingVideo({
  imageName,
  alt,
  previewAnchor = true,
}: AmenitiesRisingVideoProps) {
  const poster = useSiteImage(imageName);

  const imageFallback = (
    <ManagedImage
      name={imageName}
      alt={alt}
      fill
      sizes="100vw"
      className="object-cover"
      previewAnchor={previewAnchor}
    />
  );

  return (
    <FullBleedBackgroundVideo
      src={HATHOR_AMENITIES_RISING_VIDEO_SRC}
      mobileSrc={HATHOR_AMENITIES_RISING_VIDEO_MOBILE_SRC}
      poster={poster.src}
      alt={alt || poster.alt}
      className="home-am-video__hero-video"
      surface="amenities-rising-video"
      fallback={imageFallback}
    />
  );
}
