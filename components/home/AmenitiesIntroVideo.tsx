"use client";

import { FullBleedBackgroundVideo } from "@/components/public/FullBleedBackgroundVideo";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import {
  HATHOR_AMENITIES_INTRO_VIDEO_MOBILE_SRC,
  HATHOR_AMENITIES_INTRO_VIDEO_SRC,
} from "@/lib/amenities-video";
import type { SiteImageName } from "@/lib/site-image-slots";

type AmenitiesIntroVideoProps = {
  imageName: SiteImageName;
  alt: string;
  previewAnchor?: boolean;
};

/**
 * Amenities `i-intro` fullscreen media (scroll-hole sticky chapter).
 * CMS slot is the poster; Bar reel plays when SRC is set.
 */
export function AmenitiesIntroVideo({
  imageName,
  alt,
  previewAnchor = true,
}: AmenitiesIntroVideoProps) {
  const poster = useSiteImage(imageName);

  const imageFallback = (
    <ManagedImage
      name={imageName}
      alt={alt}
      fill
      sizes="100vw"
      className="object-cover"
      priority
      previewAnchor={previewAnchor}
    />
  );

  return (
    <FullBleedBackgroundVideo
      src={HATHOR_AMENITIES_INTRO_VIDEO_SRC}
      mobileSrc={HATHOR_AMENITIES_INTRO_VIDEO_MOBILE_SRC}
      poster={poster.src}
      alt={alt || poster.alt}
      className="home-am-intro__media-video"
      surface="amenities-intro-video"
      fallback={imageFallback}
    />
  );
}
