"use client";

import { CSSProperties, useRef } from "react";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useAmenitiesFixedMaskReveal } from "@/hooks/useAmenitiesFixedMaskReveal";
import { amenitiesWipeAngleForIndex } from "@/lib/fixed-mask-reveal";
import type { SiteImageName } from "@/lib/site-image-slots";

const DARK_GOLD = "#B69F64";

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

  const darkTitleStyle =
    theme === "dark"
      ? ({ ...titleStyle, color: DARK_GOLD } satisfies CSSProperties)
      : titleStyle;
  const darkIndicationStyle =
    theme === "dark"
      ? ({ ...indicationStyle, color: DARK_GOLD } satisfies CSSProperties)
      : indicationStyle;
  const darkBodyStyle =
    theme === "dark"
      ? ({
          ...bodyStyle,
          color: "rgba(182, 159, 100, 0.88)",
        } satisfies CSSProperties)
      : bodyStyle;

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
                    <h2
                      className="home-amenities-slider__title"
                      style={darkTitleStyle}
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
                    {slide.indication ? (
                      <p
                        className="home-amenities-slider__indication"
                        style={darkIndicationStyle}
                      >
                        {slide.indication}
                      </p>
                    ) : null}
                    <p
                      className="home-amenities-slider__body"
                      style={darkBodyStyle}
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
                  className={`home-amenities-slider__panel home-amenities-slider__panel--wipe-${amenitiesWipeAngleForIndex(index)}`}
                  data-amenities-panel
                  data-amenities-wipe={amenitiesWipeAngleForIndex(index)}
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
