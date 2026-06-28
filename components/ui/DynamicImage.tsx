import Image from "next/image";
import { getSiteImageByName } from "@/lib/image-management";
import { shouldUseDatabaseSiteImageUrl } from "@/lib/resolve-site-images";
import { getDefaultSiteImage } from "@/lib/site-image-slots";

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

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={sizes}
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
    />
  );
}
