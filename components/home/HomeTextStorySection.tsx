"use client";

import Link from "next/link";
import { useRef } from "react";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useHomeStoryFixedMaskReveal } from "@/hooks/useHomeStoryFixedMaskReveal";
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

/** Direct homepage adaptation of the dining page's fixed-background slider. */
export function HomeTextStorySection({ slides }: HomeTextStorySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useHomeStoryFixedMaskReveal(sectionRef, slides.length);

  if (slides.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="home-dining-slider ex-content-section"
      id="escape"
      aria-label="Hathor experiences"
    >
      <div className="home-dining-slider__stage">
        <div className="home-dining-slider__caption">
          <div className="home-dining-slider__caption-items">
            {slides.map((slide, index) => {
              const titleLines = slide.title
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);

              return (
                <article
                  key={`caption-${slide.href}-${slide.imageName}`}
                  className="home-dining-slider__caption-item"
                  data-home-story-caption={String(index)}
                  aria-hidden={index === 0 ? "false" : "true"}
                >
                  <h2 className="home-dining-slider__title typo-page-title">
                    {titleLines.map((line) => (
                      <span
                        key={`${slide.imageName}-${line}`}
                        className="home-dining-slider__title-line"
                      >
                        {line}
                      </span>
                    ))}
                  </h2>
                  <div className="home-dining-slider__caption-footer">
                    {slide.body ? (
                      <p className="home-dining-slider__body typo-body-text">
                        {slide.body}
                      </p>
                    ) : null}
                    {slide.cta ? (
                      <Link
                        className="home-dining-slider__cta"
                        href={slide.href}
                      >
                        {slide.cta}
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
          <div className="home-dining-slider__progress" aria-hidden="true">
            <span data-home-story-progress />
          </div>
        </div>

        <div className="home-dining-slider__images">
          {slides.map((slide, index) => (
            <figure
              key={`image-${slide.href}-${slide.imageName}`}
              className="home-dining-slider__image-panel"
              data-home-story-panel={String(index)}
              aria-hidden={index === 0 ? "false" : "true"}
            >
              <div className="home-dining-slider__image">
                <Link
                  href={slide.href}
                  className="home-dining-slider__image-link"
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
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    className="object-cover object-center"
                    previewAnchor={false}
                  />
                </Link>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
