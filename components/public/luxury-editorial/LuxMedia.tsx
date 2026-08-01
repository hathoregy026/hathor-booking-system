"use client";

import { ManagedImage } from "@/components/ui/ManagedImage";

type LuxMediaProps = {
  name: string;
  alt: string;
  sizes: string;
  direction?: "left" | "right" | "top" | "bottom" | "slit";
  parallax?: number;
  className?: string;
  priority?: boolean;
  objectPosition?: string;
  previewAnchor?: boolean;
};

export function LuxMedia({
  name,
  alt,
  sizes,
  direction = "bottom",
  parallax,
  className = "",
  priority,
  objectPosition,
  previewAnchor = true,
}: LuxMediaProps) {
  return (
    <figure
      className={`lux-mediaFrame lux-hoverMedia ${className}`.trim()}
      data-lux-media={direction}
    >
      <div
        className="lux-mediaFrame__inner"
        {...(parallax != null
          ? { "data-lux-parallax": String(parallax) }
          : {})}
        style={{ position: "absolute", inset: 0 }}
      >
        <ManagedImage
          name={name}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="lux-mediaFrame__image object-cover"
          previewAnchor={previewAnchor}
          style={objectPosition ? { objectPosition } : undefined}
        />
      </div>
    </figure>
  );
}
