"use client";

import type { ReactNode } from "react";
import { ManagedImage } from "@/components/ui/ManagedImage";

type LuxuryMediaProps = {
  name: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  objectPosition?: string;
  parallax?: boolean;
  clipUp?: boolean;
  hover?: boolean;
  previewAnchor?: boolean;
  children?: ReactNode;
};

export function LuxuryMedia({
  name,
  alt,
  sizes,
  className = "",
  priority = false,
  objectPosition,
  parallax = false,
  clipUp = false,
  hover = false,
  previewAnchor = true,
  children,
}: LuxuryMediaProps) {
  return (
    <figure
      className={`luxMedia ${className}`.trim()}
      data-lux-media=""
      {...(parallax ? { "data-lux-parallax": "" } : {})}
      {...(clipUp ? { "data-lux-clip": "up" } : {})}
      {...(hover ? { "data-lux-hover": "" } : {})}
    >
      <ManagedImage
        name={name}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
        previewAnchor={previewAnchor}
        style={objectPosition ? { objectPosition } : undefined}
      />
      {children}
    </figure>
  );
}
