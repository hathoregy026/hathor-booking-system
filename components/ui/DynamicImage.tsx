import Image from "next/image";
import { getSiteImageByName } from "@/lib/image-management";
import { isRemoteCmsImageUrl } from "@/lib/site-image-url";
import { shouldUseDatabaseSiteImageUrl } from "@/lib/resolve-site-images";
import { getDefaultSiteImage } from "@/lib/site-image-slots";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";

type DynamicImageProps = {
  name: string;
  fallbackSrc?: string;
  fallbackAlt?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
};

export async function DynamicImage({
  name,
  fallbackSrc,
  fallbackAlt,
  className = "",
  fill,
  width,
  height,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  quality = SITE_IMAGE_QUALITY,
}: DynamicImageProps) {
  const defaults = getDefaultSiteImage(name);
  let src = fallbackSrc ?? defaults.src;
  let alt = fallbackAlt ?? defaults.alt;

  try {
    const record = await getSiteImageByName(name);
    if (record?.url && shouldUseDatabaseSiteImageUrl(record.url)) {
      src = record.url;
      alt = record.altText || alt;
    }
  } catch {
    /* fall back to slot defaults */
  }

  const unoptimized = isRemoteCmsImageUrl(src);

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={sizes}
        quality={quality}
        unoptimized={unoptimized}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 800}
      height={height ?? 600}
      className={className}
      priority={priority}
      sizes={sizes}
      quality={quality}
      unoptimized={unoptimized}
    />
  );
}
