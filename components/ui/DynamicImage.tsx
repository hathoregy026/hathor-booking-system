import Image from "next/image";
import { getSiteImageByName } from "@/lib/image-management";

type DynamicImageProps = {
  name: string;
  fallbackSrc: string;
  fallbackAlt: string;
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
  let src = fallbackSrc;
  let alt = fallbackAlt;

  try {
    const record = await getSiteImageByName(name);
    if (record?.url) {
      src = record.url;
      alt = record.altText || fallbackAlt;
    }
  } catch {
    /* fall back to placeholder */
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
