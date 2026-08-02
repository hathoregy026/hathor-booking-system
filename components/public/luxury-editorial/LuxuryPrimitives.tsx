"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ManagedImage } from "@/components/ui/ManagedImage";

type ImageRevealProps = {
  name: string;
  alt: string;
  sizes: string;
  className?: string;
  mediaClassName?: string;
  priority?: boolean;
  caption?: string;
  objectPosition?: string;
  previewAnchor?: boolean;
  children?: ReactNode;
};

export function LuxuryImageReveal({
  name,
  alt,
  sizes,
  className = "",
  mediaClassName = "",
  priority = false,
  caption,
  objectPosition,
  previewAnchor = true,
  children,
}: ImageRevealProps) {
  return (
    <figure className={`lux-image-reveal ${className}`.trim()} data-lux-media="">
      <div className={`lux-image-reveal__mask lux-media ${mediaClassName}`.trim()}>
        <ManagedImage
          name={name}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="lux-image-reveal__image object-cover"
          previewAnchor={previewAnchor}
          style={objectPosition ? { objectPosition } : undefined}
        />
        <span className="lux-image-reveal__veil" aria-hidden="true" />
        {children}
      </div>
      {caption ? (
        <figcaption className="lux-image-reveal__caption">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

type MagneticLinkProps = {
  href: string;
  children: React.ReactNode;
  inverse?: boolean;
  className?: string;
  ariaLabel?: string;
  onClick?: () => void;
};

export function LuxuryMagneticLink({
  href,
  children,
  inverse = false,
  className = "",
  ariaLabel,
  onClick,
}: MagneticLinkProps) {
  const classes = `lux-magnetic-link${inverse ? " lux-magnetic-link--inverse" : ""}${className ? ` ${className}` : ""}`;
  const inner = (
    <>
      <span className="lux-magnetic-link__label">{children}</span>
      <span className="lux-magnetic-link__line" aria-hidden="true" />
      <span className="lux-magnetic-link__circle" aria-hidden="true">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h13M13 6l6 6-6 6" />
        </svg>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={classes} aria-label={ariaLabel} onClick={onClick}>
        {inner}
      </button>
    );
  }

  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className={classes} aria-label={ariaLabel}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} aria-label={ariaLabel}>
      {inner}
    </Link>
  );
}
