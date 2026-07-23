"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SocialBrandIcon } from "@/components/public/SocialBrandIcon";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { EX_GALLERY } from "@/lib/ex-page-content";

type GalleryInstagramFollowProps = {
  handleStyle?: CSSProperties;
};

/** Soft reaction glyphs — rendered inside cream bubbles for a Hathor feel */
const FLOAT_EMOJIS = [
  { glyph: "☺", label: "smile", x: "8%", delay: "0.2s", drift: "-12px" },
  { glyph: "♥", label: "heart", x: "22%", delay: "0.55s", drift: "10px" },
  { glyph: "👍", label: "thumbs up", x: "38%", delay: "0.9s", drift: "-8px" },
  { glyph: "✈", label: "plane", x: "55%", delay: "1.15s", drift: "14px" },
  { glyph: "🛥", label: "ship", x: "72%", delay: "1.45s", drift: "-10px" },
  { glyph: "✨", label: "sparkles", x: "88%", delay: "1.75s", drift: "8px" },
] as const;

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
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(el);
    const fallback = window.setTimeout(() => setIsVisible(true), 2800);

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
      <p className="instagram-follow__eyebrow instagram-follow__copy">
        {EX_GALLERY.followEyebrow}
      </p>

      <a
        className="gallery-ig-link typo-page-subtitle instagram-follow__copy"
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

      <div className="instagram-follow__divider instagram-follow__copy" aria-hidden="true">
        <span className="instagram-follow__divider-line" />
        <span className="instagram-follow__divider-mark">✦</span>
        <span className="instagram-follow__divider-line" />
      </div>

      <div className="instagram-follow__stage" aria-hidden={!isVisible}>
        <div className="instagram-follow__emoji-field" aria-hidden="true">
          {FLOAT_EMOJIS.map((item) => (
            <span
              key={item.label}
              className="instagram-float-emoji"
              style={
                {
                  left: item.x,
                  "--ig-emoji-delay": item.delay,
                  "--ig-emoji-drift": item.drift,
                } as CSSProperties
              }
            >
              <span className="instagram-float-emoji__inner">{item.glyph}</span>
            </span>
          ))}
        </div>

        <ul className="instagram-follow__circles">
          {EX_GALLERY.followPreviews.map((preview, index) => (
            <li
              key={preview.imageName}
              className="instagram-follow__bubble"
              style={{ "--ig-bubble-delay": `${0.15 + index * 0.22}s` } as CSSProperties}
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
    </div>
  );
}
