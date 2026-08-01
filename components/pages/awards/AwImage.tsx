"use client";

import Image from "next/image";
import { useState } from "react";

type AwImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fallbackSrc?: string;
};

/** Full-bleed remote image for cream editorial pages. */
export function AwImage({
  src,
  alt,
  className = "ce-fill",
  priority = false,
  sizes = "100vw",
  fallbackSrc,
}: AwImageProps) {
  const [current, setCurrent] = useState(src);

  return (
    <Image
      src={current}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      quality={90}
      onError={() => {
        if (fallbackSrc && current !== fallbackSrc) setCurrent(fallbackSrc);
      }}
    />
  );
}
