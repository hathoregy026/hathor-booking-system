"use client";

import Image, { type ImageProps } from "next/image";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";
import { siteImageSlotForFile } from "@/lib/site-image-by-file";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";

/**
 * The live photo behind a hard-coded catalog URL.
 * When the file belongs to a dashboard slot, the slot's current image wins and
 * the caller can mark the element for the admin "View on site" link.
 */
export function useManagedSource(src: string): {
  src: string;
  slot: string | null;
  alt: string | null;
} {
  const slot = siteImageSlotForFile(src);
  /* Hooks stay unconditional; the result is only read for a known slot. */
  const managed = useSiteImage(slot ?? "");
  if (!slot) return { src, slot: null, alt: null };
  return { src: managed.src?.trim() || src, slot, alt: managed.alt || null };
}

type ManagedSourceImageProps = Omit<ImageProps, "src"> & { src: string };

/** `next/image` for catalog photographs the dashboard also controls. */
export function ManagedSourceImage({
  src,
  alt,
  quality = SITE_IMAGE_QUALITY,
  ...props
}: ManagedSourceImageProps) {
  const managed = useManagedSource(src);
  const resolved = originSrcForNextImage(managed.src);
  return (
    <Image
      {...props}
      key={resolved}
      src={resolved}
      alt={alt || managed.alt || ""}
      quality={quality}
      data-site-image={managed.slot ?? undefined}
    />
  );
}
