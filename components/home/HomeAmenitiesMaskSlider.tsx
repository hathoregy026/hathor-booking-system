"use client";

import { CSSProperties, useRef } from "react";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useAmenitiesFixedMaskReveal } from "@/hooks/useAmenitiesFixedMaskReveal";
import type { SiteImageName } from "@/lib/site-image-slots";

export type AmenitiesMaskSlide = {
  titleLines: string[];
  indication?: string;
  body: string;
  cta?: string;
  href?: string;
  imageName: SiteImageName;
  imageAlt: string;
  previewAnchor?: boolean;
};

type HomeAmenitiesMaskSliderProps = {
  slides: AmenitiesMaskSlide[];
  theme: "dark" | "cream";
  id: string;
  ariaLabel: string;
  titleStyle?: CSSProperties;
  indicationStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
};

/**
 * Springs amenities `#i-slider` Fixed-Background Mask Reveal:
 * sticky dual columns, caption rises from bottom, images fall from top,
 * then stacked image wipes with scale + caption handoffs.
 */
export function HomeAmenitiesMaskSlider({
  slides,
  theme,
  id,
  ariaLabel,
  titleStyle,
  indicationStyle,
  bodyStyle,
}: HomeAmenitiesMaskSliderProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useAmenitiesFixedMaskReveal(sectionRef, slides.length);

  if (slides.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={`home-amenities-slider home-amenities-slider--${theme} home-amenities-slider--count-${slides.length}`}
      aria-label={ariaLabel}
      data-amenities-mask-id={id}
      data-amenities-theme={theme}
    >
      <div className="home-amenities-slider__sticky">
        <div className="home-amenities-slider__stage">
          <div className="home-amenities-slider__row">
            <div
              className="home-amenities-slider__caption-col"
              data-amenities-caption-col
            >
              <div className="home-amenities-slider__caption-stack">
                {slides.map((slide, index) => (
                  <div
                    key={`${id}-caption-${slide.imageName}-${index}`}
                    className="home-amenities-slider__caption"
                    data-amenities-caption
                    aria-hidden={index === 0 ? "false" : "true"}
                  >
                    {slide.indication ? (
                      <p
                        className="home-amenities-slider__indication"
                        style={indicationStyle}
                      >
                        {slide.indication}
                      </p>
                    ) : null}
                    <h2
                      className="home-amenities-slider__title"
                      style={titleStyle}
                    >
                      {slide.titleLines.map((line) => (
                        <span
                          key={`${id}-title-${index}-${line}`}
                          className="home-amenities-slider__title-line"
                        >
                          {line}
                        </span>
                      ))}
                    </h2>
                    <p
                      className="home-amenities-slider__body"
                      style={bodyStyle}
                    >
                      {slide.body}
                    </p>
                    {slide.cta && slide.href ? (
                      <a
                        className="home-amenities-slider__cta"
                        href={slide.href}
                      >
                        {slide.cta}
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>

              <div
                className="home-amenities-slider__scrollbar"
                aria-hidden="true"
              >
                <div
                  className="home-amenities-slider__scrollbar-progress"
                  data-amenities-progress
                />
              </div>
            </div>

            <div
              className="home-amenities-slider__images-col"
              data-amenities-images-col
            >
              {slides.map((slide, index) => (
                <div
                  key={`${id}-panel-${slide.imageName}-${index}`}
                  className="home-amenities-slider__panel"
                  data-amenities-panel
                  aria-hidden={index === 0 ? "false" : "true"}
                >
                  <div
                    className="home-amenities-slider__media"
                    data-amenities-media
                  >
                    <ManagedImage
                      name={slide.imageName}
                      alt={slide.imageAlt}
                      fill
                      sizes="(max-width: 480px) 100vw, 50vw"
                      className="home-amenities-slider__image object-cover"
                      priority={index === 0}
                      previewAnchor={slide.previewAnchor}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeAmenitiesMaskSlider;
