"use client";

import { useRef, type CSSProperties } from "react";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useHomeChapterStack } from "@/hooks/useHomeChapterStack";
import type { SiteImageName } from "@/lib/site-image-slots";

export type HomeLandmarkMaskSlide = {
  imageName: SiteImageName;
  alt: string;
  titleLines: string[];
  indication: string;
  body: string;
  previewAnchor?: boolean;
};

type HomeLandmarkMaskSectionProps = {
  slides: HomeLandmarkMaskSlide[];
  titleStyle?: CSSProperties;
  indicationStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
};

const LAYOUTS = [
  "cinematic",
  "split-right",
  "editorial-card",
  "closing-frame",
] as const;

/** Dining-style stacked sticky chapters for homepage landmark stories. */
export function HomeLandmarkMaskSection({
  slides,
  titleStyle,
  indicationStyle,
  bodyStyle,
}: HomeLandmarkMaskSectionProps) {
  const rootRef = useRef<HTMLElement>(null);
  useHomeChapterStack(rootRef, slides.length);

  if (slides.length === 0) return null;

  return (
    <section
      ref={rootRef}
      className="home-chapters home-chapters--landmarks ex-content-section"
      id="details"
      data-home-chapter-id="home-landmark-chapters"
      aria-label="Hathor landmark stories"
    >
      {slides.map((slide, index) => {
        const layout = LAYOUTS[index % LAYOUTS.length];
        const creamCopy =
          layout === "split-right" || layout === "editorial-card";
        const creamColor = creamCopy
          ? ({
              color: "#B69F64",
              WebkitTextFillColor: "#B69F64",
            } as CSSProperties)
          : {};

        return (
          <article
            key={slide.imageName}
            className="home-chapter"
            data-home-chapter={String(index)}
            data-home-layout={layout}
            aria-hidden={index === 0 ? "false" : "true"}
            style={{ zIndex: index + 1 }}
          >
            <div className="home-chapter__stage" data-home-chapter-stage>
              <div className="home-chapter__media-frame">
                <div
                  className="home-chapter__media"
                  data-home-chapter-media
                >
                  <ManagedImage
                    name={slide.imageName}
                    alt={slide.alt}
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    className="object-cover object-center"
                    previewAnchor={slide.previewAnchor}
                  />
                </div>
                <div className="home-chapter__shade" aria-hidden="true" />
              </div>

              <div
                className={
                  creamCopy
                    ? "home-chapter__copy"
                    : "home-chapter__copy typo-on-images"
                }
              >
                <span
                  className="home-chapter__pager"
                  data-home-chapter-rise
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                  {" / "}
                  {String(slides.length).padStart(2, "0")}
                </span>

                <h2
                  className={
                    creamCopy
                      ? "home-chapter__title typo-page-title"
                      : "home-chapter__title typo-on-images-title"
                  }
                  data-home-chapter-rise
                  style={{ ...titleStyle, ...creamColor }}
                >
                  {slide.titleLines.map((line) => (
                    <span key={`${slide.imageName}-${line}`}>{line}</span>
                  ))}
                </h2>

                <p
                  className={
                    creamCopy
                      ? "home-chapter__indication typo-page-subtitle"
                      : "home-chapter__indication typo-on-images-indication"
                  }
                  data-home-chapter-rise
                  style={{ ...indicationStyle, ...creamColor }}
                >
                  {slide.indication}
                </p>

                <p
                  className={
                    creamCopy
                      ? "home-chapter__body typo-body-text"
                      : "home-chapter__body typo-on-images-body"
                  }
                  data-home-chapter-rise
                  style={{ ...bodyStyle, ...creamColor }}
                >
                  {slide.body}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
