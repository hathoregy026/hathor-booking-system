"use client";

import Image, { type ImageProps } from "next/image";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { siteImageAnchorId } from "@/lib/site-image-preview";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";

export { SITE_IMAGE_QUALITY };

type ManagedImageProps = Omit<ImageProps, "src" | "alt"> & {
  name: string;
  alt?: string;
  /**
   * When true (default), sets id=site-image-{name} for admin live preview links.
   * Set false when the same slot name appears more than once on a page.
   */
  previewAnchor?: boolean;
};

export function ManagedImage({
  name,
  alt,
  className = "",
  previewAnchor = true,
  id,
  quality = SITE_IMAGE_QUALITY,
  unoptimized = false,
  ...props
}: ManagedImageProps) {
  const image = useSiteImage(name);
  const nextSrc = originSrcForNextImage(image.src);
  const resolvedAlt = alt ?? image.alt;
  const anchorId = previewAnchor ? siteImageAnchorId(name) : undefined;

  if (props.fill) {
    return (
      <Image
        {...props}
        key={nextSrc}
        src={nextSrc}
        alt={resolvedAlt}
        fill
        quality={quality}
        unoptimized={unoptimized}
        className={className}
        id={id ?? anchorId}
        data-site-image={name}
      />
    );
  }

  return (
    <Image
      {...props}
      key={nextSrc}
      src={nextSrc}
      alt={resolvedAlt}
      quality={quality}
      unoptimized={unoptimized}
      className={className}
      width={props.width ?? 800}
      height={props.height ?? 600}
      id={id ?? anchorId}
      data-site-image={name}
    />
  );
}
