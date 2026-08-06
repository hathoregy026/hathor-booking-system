"use client";

import Link from "next/link";
import { useRef } from "react";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useHomeChapterStack } from "@/hooks/useHomeChapterStack";
import type { SiteImageName } from "@/lib/site-image-slots";
import { siteImageAnchorId } from "@/lib/site-image-preview";

export type HomeTextStorySlide = {
  title: string;
  body: string;
  cta: string;
  href: string;
  imageName: SiteImageName;
  imageAlt: string;
  previewAnchor?: boolean;
};

type HomeTextStorySectionProps = {
  slides: HomeTextStorySlide[];
};

const LAYOUTS = ["sunset-rail", "dining-card"] as const;

/** Dining-style stacked sticky chapters for Way of Life / Fine Dining. */
export function HomeTextStorySection({ slides }: HomeTextStorySectionProps) {
  const rootRef = useRef<HTMLElement>(null);
  useHomeChapterStack(rootRef, slides.length);

  if (slides.length === 0) return null;

  return (
    <section
      ref={rootRef}
      className="home-chapters home-chapters--stories ex-content-section"
      id="escape"
      data-home-chapter-id="home-story-chapters"
      aria-label="Hathor experiences"
    >
      {slides.map((slide, index) => {
        const layout = LAYOUTS[index % LAYOUTS.length];
        const titleLines = slide.title
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        return (
          <article
            key={`${slide.href}-${slide.imageName}`}
            className="home-chapter"
            data-home-chapter={String(index)}
            data-home-layout={layout}
            aria-hidden={index === 0 ? "false" : "true"}
            style={{ zIndex: index + 1 }}
          >
            <div className="home-chapter__stage" data-home-chapter-stage>
              <div className="home-chapter__media-frame">
                <Link
                  href={slide.href}
                  className="home-chapter__media home-chapter__media-link"
                  data-home-chapter-media
                  aria-label={slide.cta}
                  id={
                    slide.previewAnchor
                      ? siteImageAnchorId(slide.imageName)
                      : undefined
                  }
                  data-site-image={
                    slide.previewAnchor ? slide.imageName : undefined
                  }
                >
                  <ManagedImage
                    name={slide.imageName}
                    alt={slide.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    className="object-cover object-center"
                    previewAnchor={false}
                  />
                </Link>
                <div className="home-chapter__shade" aria-hidden="true" />
              </div>

              <div className="home-chapter__copy">
                <h2
                  className="home-chapter__title typo-page-title"
                  data-home-chapter-rise
                >
                  {titleLines.map((line) => (
                    <span key={`${slide.imageName}-${line}`}>{line}</span>
                  ))}
                </h2>

                {slide.body ? (
                  <p
                    className="home-chapter__body typo-body-text"
                    data-home-chapter-rise
                  >
                    {slide.body}
                  </p>
                ) : null}

                {slide.cta ? (
                  <Link
                    className="home-chapter__cta"
                    href={slide.href}
                    data-home-chapter-rise
                  >
                    {slide.cta}
                  </Link>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
