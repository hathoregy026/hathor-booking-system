"use client";

import Link from "next/link";
import { ManagedImage } from "@/components/ui/ManagedImage";
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

export function HomeTextStorySection({ slides }: HomeTextStorySectionProps) {
  if (slides.length === 0) return null;

  return (
    <section
      className="home-story ex-content-section signature-fog-rise"
      id="escape"
      data-mobile-fog-rise=""
      aria-label="Hathor experiences"
    >
      <div className="home-story__viewport">
        <div className="home-story__stage">
          <div className="home-story__media" aria-hidden="true">
            {slides.map((slide, index) => (
              <div
                key={slide.imageName}
                className="home-story__card"
                data-home-story-card={String(index)}
              >
                <div
                  className="home-story__card-media"
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
                    sizes="(max-width: 768px) 100vw, min(1200px, 92vw)"
                    unoptimized={false}
                    className="object-cover object-center"
                    previewAnchor={false}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="home-story__copy">
            {slides.map((slide, index) => {
              const titleLines = slide.title
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);
              return (
                <div
                  key={`copy-${slide.href}-${slide.imageName}`}
                  className="home-story__panel"
                  data-home-story-panel={String(index)}
                  aria-hidden={index === 0 ? "false" : "true"}
                >
                  <h2 className="home-story__title typo-page-title">
                    {titleLines.map((line) => (
                      <span
                        key={`${slide.imageName}-${line}`}
                        className="home-story__title-line"
                      >
                        {line}
                      </span>
                    ))}
                  </h2>
                  {slide.body ? (
                    <p className="home-story__body typo-body-text">{slide.body}</p>
                  ) : null}
                  {slide.cta ? (
                    <Link
                      className="btn btn-dark home-story__cta"
                      href={slide.href}
                    >
                      {slide.cta}
                    </Link>
                  ) : null}
                </div>
              );
            })}

            {slides.length > 1 ? (
              <div
                className="home-story__pager"
                data-home-story-pager
                aria-hidden="true"
              >
                <span
                  className="home-story__pager-num"
                  data-home-story-pager-num
                >
                  01
                </span>
                <div className="home-story__pager-rail">
                  <span
                    className="home-story__pager-line"
                    data-home-story-pager-line
                    style={{
                      transform: `scaleY(${1 / Math.max(slides.length, 1)})`,
                    }}
                  />
                </div>
                <span className="home-story__pager-total">
                  {String(slides.length).padStart(2, "0")}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
