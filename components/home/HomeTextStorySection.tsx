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
      className="home-story ex-content-section"
      id="escape"
      aria-label="Hathor experiences"
    >
      <div className="home-story__viewport">
        {slides.map((slide, index) => {
          const titleLines = slide.title
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
          const reverse = index % 2 === 1;

          return (
            <article
              key={`${slide.href}-${slide.imageName}`}
              className={`home-story__slide${reverse ? " is-reverse" : ""}`}
              data-home-story-slide={String(index)}
              aria-hidden={index === 0 ? "false" : "true"}
            >
              <div className="home-story__media home-text-img-parent">
                <Link
                  href={slide.href}
                  className="home-story__media-link home-text-img-container"
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
                    unoptimized={false}
                    className="object-cover object-center"
                    previewAnchor={false}
                  />
                </Link>
              </div>

              <div className="home-story__copy">
                <div className="home-story__heading">
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
                </div>
                {slide.body ? (
                  <p className="home-story__body typo-body-text">{slide.body}</p>
                ) : null}
                {slide.cta ? (
                  <div className="home-story__actions">
                    <Link className="btn btn-dark home-story__cta" href={slide.href}>
                      {slide.cta}
                    </Link>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
