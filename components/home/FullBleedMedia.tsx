"use client";

import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { ParallaxHeroImage } from "@/components/ui/ParallaxHeroImage";
import { HOMEPAGE_HERO } from "@/lib/homepage-content";
import { siteImageAnchorId } from "@/lib/site-image-preview";

type FullBleedMediaProps = {
  imageName: string;
  alt?: string;
  priority?: boolean;
  showCta?: boolean;
  className?: string;
};

export function FullBleedMedia({
  imageName,
  alt,
  priority = false,
  showCta = true,
  className = "",
}: FullBleedMediaProps) {
  const image = useSiteImage(imageName);

  return (
    <section
      id={siteImageAnchorId(imageName)}
      data-site-image={imageName}
      className={`hathor-full-media ${className}`.trim()}
      aria-hidden={false}
    >
      <ParallaxHeroImage
        src={image.src}
        alt={alt ?? image.alt}
        priority={priority}
        className="hathor-full-media__frame"
      />
      <div className="hathor-full-media__overlay" aria-hidden />
      {showCta ? (
        <BookNowTrigger className="hathor-full-media__cta public-btn-gold cursor-hover">
          {HOMEPAGE_HERO.cta}
        </BookNowTrigger>
      ) : null}
    </section>
  );
}
