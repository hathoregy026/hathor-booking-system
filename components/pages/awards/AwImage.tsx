"use client";

import Image from "next/image";

type AwImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/** Full-bleed Unsplash/remote image for awards cinema pages. */
export function AwImage({
  src,
  alt,
  className = "aw-fill",
  priority = false,
  sizes = "100vw",
}: AwImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      quality={90}
    />
  );
}
