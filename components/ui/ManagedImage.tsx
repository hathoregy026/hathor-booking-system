"use client";

import Image, { type ImageProps } from "next/image";
import { useSiteImage } from "@/components/public/SiteImagesProvider";

type ManagedImageProps = Omit<ImageProps, "src" | "alt"> & {
  name: string;
  alt?: string;
};

export function ManagedImage({
  name,
  alt,
  className = "",
  ...props
}: ManagedImageProps) {
  const image = useSiteImage(name);
  const resolvedAlt = alt ?? image.alt;

  if (props.fill) {
    return (
      <Image
        src={image.src}
        alt={resolvedAlt}
        fill
        className={className}
        {...props}
      />
    );
  }

  return (
    <Image
      src={image.src}
      alt={resolvedAlt}
      className={className}
      width={props.width ?? 800}
      height={props.height ?? 600}
      {...props}
    />
  );
}
