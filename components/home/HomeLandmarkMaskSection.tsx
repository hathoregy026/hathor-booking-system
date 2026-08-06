"use client";

import { useRef, type CSSProperties } from "react";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useHomeStoryFixedMaskReveal } from "@/hooks/useHomeStoryFixedMaskReveal";
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

/** Full-viewport dining-page mask reveal for the homepage landmark stories. */
export function HomeLandmarkMaskSection({
  slides,
  titleStyle,
  indicationStyle,
  bodyStyle,
}: HomeLandmarkMaskSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useHomeStoryFixedMaskReveal(sectionRef, slides.length);

  if (slides.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="home-stack-mask ex-content-section"
      id="details"
      data-home-mask-id="home-landmark-fixed-mask"
      aria-label="Hathor landmark stories"
    >
      <div className="home-stack-mask__stage">
        <div className="home-stack-mask__images">
          {slides.map((slide, index) => (
            <figure
              key={`landmark-image-${slide.imageName}`}
              className="home-stack-mask__image-panel"
              data-home-story-panel={String(index)}
              aria-hidden={index === 0 ? "false" : "true"}
            >
              <div className="home-stack-mask__image" data-home-mask-image>
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
            </figure>
          ))}
        </div>

        <div className="home-stack-mask__shade" aria-hidden="true" />

        <div className="home-stack-mask__captions">
          <span className="home-stack-mask__pager" aria-hidden="true">
            <i data-home-story-pager-num>01</i>
            {" / "}
            {String(slides.length).padStart(2, "0")}
          </span>

          {slides.map((slide, index) => (
            <article
              key={`landmark-copy-${slide.imageName}`}
              className="home-stack-mask__caption-item typo-on-images"
              data-home-story-caption={String(index)}
              aria-hidden={index === 0 ? "false" : "true"}
            >
              <h2
                className="home-stack-mask__title typo-on-images-title"
                style={titleStyle}
              >
                {slide.titleLines.map((line) => (
                  <span key={`${slide.imageName}-${line}`}>{line}</span>
                ))}
              </h2>
              <p
                className="home-stack-mask__indication typo-on-images-indication"
                style={indicationStyle}
              >
                {slide.indication}
              </p>
              <p
                className="home-stack-mask__body typo-on-images-body"
                style={bodyStyle}
              >
                {slide.body}
              </p>
            </article>
          ))}

          <div className="home-stack-mask__progress" aria-hidden="true">
            <span data-home-story-progress data-home-story-progress-axis="x" />
          </div>
        </div>
      </div>
    </section>
  );
}
