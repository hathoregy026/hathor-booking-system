"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SocialBrandIcon } from "@/components/public/SocialBrandIcon";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { EX_GALLERY } from "@/lib/ex-page-content";

type GalleryInstagramFollowProps = {
  handleStyle?: CSSProperties;
};

export function GalleryInstagramFollow({
  handleStyle,
}: GalleryInstagramFollowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setIsVisible(true);
      return;
    }

    // If already on screen (deep link / refresh mid-page), show immediately.
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh * 0.92 && rect.bottom > vh * 0.08) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -4% 0px" },
    );

    observer.observe(el);

    // Safety: never leave the block permanently invisible.
    const fallback = window.setTimeout(() => setIsVisible(true), 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`instagram-follow${isVisible ? " is-visible" : ""}`}
      aria-label="Follow Hathor on Instagram"
    >
      <p className="instagram-follow__eyebrow instagram-follow__item">
        {EX_GALLERY.followEyebrow}
      </p>

      <a
        className="gallery-ig-link typo-page-subtitle instagram-follow__item"
        href={EX_GALLERY.indicationHref}
        target="_blank"
        rel="noopener noreferrer"
        style={handleStyle}
        aria-label="Hathor Cruise on Instagram"
      >
        <SocialBrandIcon
          platform="instagram"
          className="gallery-ig-link__icon"
        />
        <span className="gallery-ig-link__handle">{EX_GALLERY.indication}</span>
      </a>

      <div className="instagram-follow__divider instagram-follow__item" aria-hidden="true">
        <span className="instagram-follow__divider-line" />
        <span className="instagram-follow__divider-mark">✦</span>
        <span className="instagram-follow__divider-line" />
      </div>

      <ul className="instagram-follow__circles">
        {EX_GALLERY.followPreviews.map((preview, index) => (
          <li
            key={preview.imageName}
            className="instagram-follow__item"
            style={{ "--ig-stagger": `${0.9 + index * 0.3}s` } as CSSProperties}
          >
            <a
              className="instagram-circle"
              href={EX_GALLERY.indicationHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={preview.alt}
            >
              <ManagedImage
                name={preview.imageName}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
                previewAnchor={false}
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
