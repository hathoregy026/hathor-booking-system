"use client";

import { CSSProperties, useRef } from "react";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useHomeAmenitiesSequence } from "@/hooks/useHomeAmenitiesSequence";
import type { SiteImageName } from "@/lib/site-image-slots";

const GOLD = "#B69F64";
const CREAM = "#ece8df";
const INK = "#1c1712";

export type AmenitiesLandmarkSlide = {
  titleLines: string[];
  indication: string;
  body: string;
  imageName: SiteImageName;
  alt?: string;
  imageAlt?: string;
  previewAnchor?: boolean;
};

export type AmenitiesStorySlide = {
  title: string;
  body: string;
  cta: string;
  href: string;
  imageName: SiteImageName;
  alt?: string;
  imageAlt?: string;
  previewAnchor?: boolean;
};

type HomeAmenitiesSequenceProps = {
  landmarks: AmenitiesLandmarkSlide[];
  stories: AmenitiesStorySlide[];
  titleStyle?: CSSProperties;
  indicationStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
};

function withColor(
  style: CSSProperties | undefined,
  color: string,
): CSSProperties {
  return { ...style, color };
}

/**
 * Faithful Springs amenities layout sequence:
 * i-intro → i-video → i-slider → i-opening
 *
 * Surfaces: gold #B69F64 / cream #ece8df
 * On-image type: site typography + #B69F64
 * On-gold/cream panels: site typography + dark ink for contrast
 */
export function HomeAmenitiesSequence({
  landmarks,
  stories,
  titleStyle,
  indicationStyle,
  bodyStyle,
}: HomeAmenitiesSequenceProps) {
  const rootRef = useRef<HTMLElement>(null);

  const intro = landmarks[0];
  const videoMain = landmarks[1] ?? landmarks[0];
  const videoInset = landmarks[2] ?? landmarks[1] ?? landmarks[0];

  const sliderSlides = [
    landmarks[2],
    landmarks[3],
    stories[0]
      ? {
          titleLines: [stories[0].title],
          indication: stories[0].cta,
          body: stories[0].body,
          imageName: stories[0].imageName,
          imageAlt: stories[0].imageAlt ?? stories[0].alt,
          previewAnchor: stories[0].previewAnchor,
        }
      : null,
    stories[1]
      ? {
          titleLines: [stories[1].title],
          indication: stories[1].cta,
          body: stories[1].body,
          imageName: stories[1].imageName,
          imageAlt: stories[1].imageAlt ?? stories[1].alt,
          previewAnchor: stories[1].previewAnchor,
        }
      : null,
  ].filter(Boolean) as Array<{
    titleLines: string[];
    indication: string;
    body: string;
    imageName: SiteImageName;
    imageAlt?: string;
    previewAnchor?: boolean;
  }>;

  const openingLeft = landmarks[3] ?? landmarks[landmarks.length - 1];
  const openingCards = [
    stories[0]
      ? {
          imageName: stories[0].imageName,
          label: stories[0].title,
          alt: stories[0].imageAlt ?? stories[0].alt ?? "",
          previewAnchor: stories[0].previewAnchor,
        }
      : null,
    stories[1]
      ? {
          imageName: stories[1].imageName,
          label: stories[1].title,
          alt: stories[1].imageAlt ?? stories[1].alt ?? "",
          previewAnchor: stories[1].previewAnchor,
        }
      : null,
    landmarks[1]
      ? {
          imageName: landmarks[1].imageName,
          label: landmarks[1].indication,
          alt: landmarks[1].imageAlt ?? landmarks[1].alt ?? "",
          previewAnchor: landmarks[1].previewAnchor,
        }
      : null,
  ].filter(Boolean) as Array<{
    imageName: SiteImageName;
    label: string;
    alt: string;
    previewAnchor?: boolean;
  }>;

  useHomeAmenitiesSequence(rootRef, sliderSlides.length);

  if (!intro) return null;

  // On images → site fonts + gold + tiny halo (CSS class handles halo)
  const onImageTitle = withColor(titleStyle, GOLD);
  const onImageIndication = withColor(indicationStyle, GOLD);
  const onImageBody = withColor(bodyStyle, GOLD);

  // On gold / cream panels → site fonts + dark ink (contrast)
  const onPanelTitle = withColor(titleStyle, INK);
  const onPanelIndication = withColor(indicationStyle, INK);
  const onPanelBody = withColor(bodyStyle, INK);

  return (
    <section
      ref={rootRef}
      className="home-am-sequence"
      aria-label="Amenities-style Nile stories"
    >
      {/* 1) i-intro — fullscreen → slides left → cream text */}
      <div
        className="home-am-intro home-am-chapter"
        data-am-intro
        data-am-chapter
      >
        <div className="home-am-intro__sticky home-am-chapter__stage" data-am-stage>
          <div className="home-am-intro__media" data-am-intro-media>
            <ManagedImage
              name={intro.imageName}
              alt={intro.imageAlt ?? intro.alt ?? ""}
              fill
              sizes="100vw"
              className="object-cover"
              priority
              previewAnchor={intro.previewAnchor}
            />
            <div className="home-am-intro__dim" data-am-intro-dim aria-hidden />
          </div>

          <div className="home-am-intro__caption" data-am-intro-title>
            <h2
              className="home-am-intro__title home-am-on-image-text"
              style={onImageTitle}
            >
              {intro.titleLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
            <p
              className="home-am-intro__indication home-am-on-image-text"
              style={onImageIndication}
            >
              {intro.indication}
            </p>
          </div>

          <div
            className="home-am-intro__cream"
            data-am-intro-cream
            style={{ background: CREAM }}
          >
            <p className="home-am-intro__cream-text" style={onPanelBody}>
              {intro.body}
            </p>
          </div>
        </div>
      </div>

      {/* 2) i-video — huge image rises, title, inset image, caption card */}
      {videoMain ? (
        <div
          className="home-am-video home-am-chapter"
          data-am-video
          data-am-chapter
        >
          <div className="home-am-video__sticky home-am-chapter__stage" data-am-stage>
            <div className="home-am-video__hero" data-am-video-hero>
              <ManagedImage
                name={videoMain.imageName}
                alt={videoMain.imageAlt ?? videoMain.alt ?? ""}
                fill
                sizes="100vw"
                className="object-cover"
                previewAnchor={videoMain.previewAnchor}
              />
            </div>

            <div className="home-am-video__copy" data-am-video-copy>
              <p className="home-am-on-image-text" style={onImageBody}>
                {videoMain.body}
              </p>
            </div>

            <div className="home-am-video__title" data-am-video-title>
              <h2 className="home-am-on-image-text" style={onImageTitle}>
                {(videoMain.titleLines.length
                  ? videoMain.titleLines
                  : [videoMain.indication]
                ).map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>
            </div>

            {videoInset ? (
              <div className="home-am-video__inset" data-am-video-inset>
                <ManagedImage
                  name={videoInset.imageName}
                  alt={videoInset.imageAlt ?? videoInset.alt ?? ""}
                  fill
                  sizes="(max-width: 1024px) 70vw, 42vw"
                  className="object-cover"
                  previewAnchor={videoInset.previewAnchor}
                />
              </div>
            ) : null}

            <div
              className="home-am-video__caption"
              data-am-video-caption
              style={{ background: GOLD }}
            >
              <h3 style={onPanelTitle}>
                {videoInset?.titleLines?.join(" ") || videoMain.indication}
              </h3>
              <p style={onPanelBody}>{videoInset?.body || videoMain.body}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* 3) i-slider — half text / half image stack */}
      {sliderSlides.length > 0 ? (
        <div
          className="home-am-slider home-am-chapter"
          data-am-slider
          data-am-chapter
        >
          <div className="home-am-slider__sticky home-am-chapter__stage" data-am-stage>
            <div className="home-am-slider__row">
              <div
                className="home-am-slider__caption-col"
                data-amenities-caption-col
                style={{ background: GOLD }}
              >
                <div className="home-am-slider__caption-stack">
                  {sliderSlides.map((slide, index) => (
                    <div
                      key={`slider-cap-${slide.imageName}-${index}`}
                      className="home-am-slider__caption"
                      data-amenities-caption
                      aria-hidden={index === 0 ? "false" : "true"}
                    >
                      <p style={onPanelIndication}>{slide.indication}</p>
                      <h2 style={onPanelTitle}>
                        {slide.titleLines.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </h2>
                      <p style={onPanelBody}>{slide.body}</p>
                    </div>
                  ))}
                </div>
                <div className="home-am-slider__scrollbar" aria-hidden>
                  <div
                    className="home-am-slider__scrollbar-progress"
                    data-amenities-progress
                  />
                </div>
              </div>

              <div
                className="home-am-slider__images-col"
                data-amenities-images-col
              >
                {sliderSlides.map((slide, index) => (
                  <div
                    key={`slider-img-${slide.imageName}-${index}`}
                    className="home-am-slider__panel"
                    data-amenities-panel
                    aria-hidden={index === 0 ? "false" : "true"}
                  >
                    <ManagedImage
                      name={slide.imageName}
                      alt={slide.imageAlt ?? ""}
                      fill
                      sizes="(max-width: 480px) 100vw, 50vw"
                      className="object-cover"
                      priority={index === 0}
                      previewAnchor={slide.previewAnchor}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 4) i-opening — fixed left image + right rail with small cards */}
      {openingLeft ? (
        <div
          className="home-am-opening home-am-chapter"
          data-am-opening
          data-am-chapter
        >
          <div className="home-am-opening__sticky home-am-chapter__stage" data-am-stage>
            <div className="home-am-opening__left" data-am-opening-left>
              <ManagedImage
                name={openingLeft.imageName}
                alt={openingLeft.imageAlt ?? openingLeft.alt ?? ""}
                fill
                sizes="(max-width: 480px) 100vw, 50vw"
                className="object-cover"
                previewAnchor={openingLeft.previewAnchor}
              />
            </div>

            <div
              className="home-am-opening__right"
              data-am-opening-right
              style={{ background: GOLD }}
            >
              <h2
                className="home-am-opening__title"
                data-am-opening-title
                style={onPanelTitle}
              >
                {stories[0]?.title || openingLeft.titleLines.join(" ")}
              </h2>

              <div className="home-am-opening__rail" data-am-opening-rail>
                <p className="home-am-opening__rail-text" style={onPanelBody}>
                  {stories[0]?.body || openingLeft.body}
                </p>
                <div className="home-am-opening__cards">
                  {openingCards.map((card, index) => (
                    <figure
                      key={`opening-card-${card.imageName}-${index}`}
                      className="home-am-opening__card"
                      data-am-opening-card
                    >
                      <div className="home-am-opening__card-media">
                        <ManagedImage
                          name={card.imageName}
                          alt={card.alt}
                          fill
                          sizes="210px"
                          className="object-cover"
                          previewAnchor={card.previewAnchor}
                        />
                      </div>
                      <figcaption
                        className="home-am-on-image-text"
                        style={onImageIndication}
                      >
                        {card.label}
                      </figcaption>
                    </figure>
                  ))}
                </div>
                {stories[0]?.href ? (
                  <a
                    className="home-am-opening__cta"
                    href={stories[0].href}
                    style={onPanelIndication}
                  >
                    {stories[0].cta}
                  </a>
                ) : null}
                {stories[1]?.href ? (
                  <a
                    className="home-am-opening__cta"
                    href={stories[1].href}
                    style={onPanelIndication}
                  >
                    {stories[1].cta}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default HomeAmenitiesSequence;
