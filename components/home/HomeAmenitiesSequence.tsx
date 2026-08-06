"use client";

import { CSSProperties, useRef } from "react";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useHomeAmenitiesSequence } from "@/hooks/useHomeAmenitiesSequence";
import { AMENITIES_SEQUENCE_IMAGE_SLOTS } from "@/lib/amenities-sequence-images";
import type { SiteImageName } from "@/lib/site-image-slots";

const GOLD = "#B69F64";
const CREAM = "#ece8df";
const INK = "#1c1712";

export type AmenitiesLandmarkSlide = {
  titleLines: string[];
  indication: string;
  body: string;
  /** @deprecated Text-only — images come from dedicated amenities slots 1–11. */
  imageName?: SiteImageName;
  alt?: string;
  imageAlt?: string;
  previewAnchor?: boolean;
};

export type AmenitiesStorySlide = {
  title: string;
  body: string;
  cta: string;
  href: string;
  /** @deprecated Text-only — images come from dedicated amenities slots 1–11. */
  imageName?: SiteImageName;
  alt?: string;
  imageAlt?: string;
  previewAnchor?: boolean;
};

export type AmenitiesSequenceImage = {
  name: SiteImageName;
  alt: string;
  previewAnchor?: boolean;
};

type HomeAmenitiesSequenceProps = {
  landmarks: AmenitiesLandmarkSlide[];
  stories: AmenitiesStorySlide[];
  /** Eleven unique CMS images in scroll appearance order. */
  images?: AmenitiesSequenceImage[];
  titleStyle?: CSSProperties;
  indicationStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
};

function withColor(
  style: CSSProperties | undefined,
  color: string,
): CSSProperties {
  return {
    ...style,
    color,
    WebkitTextFillColor: color,
  };
}

function resolveImages(
  images: AmenitiesSequenceImage[] | undefined,
): AmenitiesSequenceImage[] {
  const defaults = AMENITIES_SEQUENCE_IMAGE_SLOTS.map((slot) => ({
    name: slot.name as SiteImageName,
    alt: slot.alt,
    previewAnchor: true,
  }));
  if (!images?.length) return defaults;
  return defaults.map((fallback, index) => {
    const next = images[index];
    if (!next?.name) return fallback;
    return {
      name: next.name,
      alt: next.alt?.trim() || fallback.alt,
      previewAnchor: next.previewAnchor ?? true,
    };
  });
}

/**
 * Faithful Springs amenities layout sequence:
 * i-intro → i-video → i-slider → i-opening
 *
 * Surfaces: gold #B69F64 / cream #ece8df
 * On-image type: site typography + #B69F64
 * On-gold/cream panels: site typography + dark ink for contrast
 *
 * Eleven unique CMS images (slots 1–11) — one per visual mount.
 */
export function HomeAmenitiesSequence({
  landmarks,
  stories,
  images: imagesProp,
  titleStyle,
  indicationStyle,
  bodyStyle,
}: HomeAmenitiesSequenceProps) {
  const rootRef = useRef<HTMLElement>(null);
  const images = resolveImages(imagesProp);

  const intro = landmarks[0];
  const videoMain = landmarks[1] ?? landmarks[0];
  const videoInset = landmarks[2] ?? landmarks[1] ?? landmarks[0];

  const sliderSlides = [
    landmarks[2]
      ? {
          titleLines: landmarks[2].titleLines,
          indication: landmarks[2].indication,
          body: landmarks[2].body,
          image: images[3],
        }
      : null,
    landmarks[3]
      ? {
          titleLines: landmarks[3].titleLines,
          indication: landmarks[3].indication,
          body: landmarks[3].body,
          image: images[4],
        }
      : null,
    stories[0]
      ? {
          titleLines: [stories[0].title],
          indication: stories[0].cta,
          body: stories[0].body,
          image: images[5],
        }
      : null,
    stories[1]
      ? {
          titleLines: [stories[1].title],
          indication: stories[1].cta,
          body: stories[1].body,
          image: images[6],
        }
      : null,
  ].filter(Boolean) as Array<{
    titleLines: string[];
    indication: string;
    body: string;
    image: AmenitiesSequenceImage;
  }>;

  const openingCards = [
    stories[0]
      ? {
          image: images[8],
          label: stories[0].title,
        }
      : null,
    stories[1]
      ? {
          image: images[9],
          label: stories[1].title,
        }
      : null,
    landmarks[1]
      ? {
          image: images[10],
          label: landmarks[1].indication,
        }
      : null,
  ].filter(Boolean) as Array<{
    image: AmenitiesSequenceImage;
    label: string;
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

  const introImage = images[0];
  const videoHeroImage = images[1];
  const videoInsetImage = images[2];
  const openingLeftImage = images[7];

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
              name={introImage.name}
              alt={introImage.alt}
              fill
              sizes="100vw"
              className="object-cover"
              priority
              previewAnchor={introImage.previewAnchor}
            />
            <div className="home-am-intro__dim" data-am-intro-dim aria-hidden />
          </div>

          <div className="home-am-intro__caption" data-am-intro-title>
            <h2
              className="home-am-intro__title home-am-on-image-text typo-on-images-title"
              style={onImageTitle}
            >
              {intro.titleLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
            <p
              className="home-am-intro__indication home-am-on-image-text typo-on-images-indication"
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
            <p
              className="home-am-intro__cream-text typo-on-images-body"
              style={onPanelBody}
            >
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
                name={videoHeroImage.name}
                alt={videoHeroImage.alt}
                fill
                sizes="100vw"
                className="object-cover"
                previewAnchor={videoHeroImage.previewAnchor}
              />
            </div>

            <div className="home-am-video__copy" data-am-video-copy>
              <p
                className="home-am-on-image-text typo-on-images-body"
                style={onImageBody}
              >
                {videoMain.body}
              </p>
            </div>

            <div className="home-am-video__title" data-am-video-title>
              <h2
                className="home-am-on-image-text typo-on-images-title"
                style={onImageTitle}
              >
                {(videoMain.titleLines.length
                  ? videoMain.titleLines
                  : [videoMain.indication]
                ).map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>
            </div>

            <div className="home-am-video__inset" data-am-video-inset>
              <ManagedImage
                name={videoInsetImage.name}
                alt={videoInsetImage.alt}
                fill
                sizes="(max-width: 1024px) 70vw, 42vw"
                className="object-cover"
                previewAnchor={videoInsetImage.previewAnchor}
              />
            </div>

            <div
              className="home-am-video__caption"
              data-am-video-caption
              style={{ background: GOLD }}
            >
              <h3 className="typo-on-images-title" style={onPanelTitle}>
                {videoInset?.titleLines?.join(" ") || videoMain.indication}
              </h3>
              <p className="typo-on-images-body" style={onPanelBody}>
                {videoInset?.body || videoMain.body}
              </p>
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
                      key={`slider-cap-${slide.image.name}-${index}`}
                      className="home-am-slider__caption"
                      data-amenities-caption
                      aria-hidden={index === 0 ? "false" : "true"}
                    >
                      <p
                        className="typo-on-images-indication"
                        style={onPanelIndication}
                      >
                        {slide.indication}
                      </p>
                      <h2 className="typo-on-images-title" style={onPanelTitle}>
                        {slide.titleLines.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </h2>
                      <p className="typo-on-images-body" style={onPanelBody}>
                        {slide.body}
                      </p>
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
                    key={`slider-img-${slide.image.name}-${index}`}
                    className="home-am-slider__panel"
                    data-amenities-panel
                    aria-hidden={index === 0 ? "false" : "true"}
                  >
                    <ManagedImage
                      name={slide.image.name}
                      alt={slide.image.alt}
                      fill
                      sizes="(max-width: 480px) 100vw, 50vw"
                      className="object-cover"
                      priority={index === 0}
                      previewAnchor={slide.image.previewAnchor}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 4) i-opening — fixed left image + right rail with small cards */}
      <div
        className="home-am-opening home-am-chapter"
        data-am-opening
        data-am-chapter
      >
        <div className="home-am-opening__sticky home-am-chapter__stage" data-am-stage>
          <div className="home-am-opening__left" data-am-opening-left>
            <ManagedImage
              name={openingLeftImage.name}
              alt={openingLeftImage.alt}
              fill
              sizes="(max-width: 480px) 100vw, 50vw"
              className="object-cover"
              previewAnchor={openingLeftImage.previewAnchor}
            />
          </div>

          <div
            className="home-am-opening__right"
            data-am-opening-right
            style={{ background: GOLD }}
          >
            <h2
              className="home-am-opening__title typo-on-images-title"
              data-am-opening-title
              style={onPanelTitle}
            >
              {stories[0]?.title ||
                landmarks[3]?.titleLines.join(" ") ||
                intro.titleLines.join(" ")}
            </h2>

            <div className="home-am-opening__rail" data-am-opening-rail>
              <p
                className="home-am-opening__rail-text typo-on-images-body"
                style={onPanelBody}
              >
                {stories[0]?.body || landmarks[3]?.body || intro.body}
              </p>
              <div className="home-am-opening__cards">
                {openingCards.map((card, index) => (
                  <figure
                    key={`opening-card-${card.image.name}-${index}`}
                    className="home-am-opening__card"
                    data-am-opening-card
                  >
                    <div className="home-am-opening__card-media">
                      <ManagedImage
                        name={card.image.name}
                        alt={card.image.alt}
                        fill
                        sizes="210px"
                        className="object-cover"
                        previewAnchor={card.image.previewAnchor}
                      />
                    </div>
                    <figcaption
                      className="home-am-on-image-text typo-on-images-indication"
                      style={onImageIndication}
                    >
                      {card.label}
                    </figcaption>
                  </figure>
                ))}
              </div>
              {stories[0]?.href ? (
                <a
                  className="home-am-opening__cta typo-on-images-indication"
                  href={stories[0].href}
                  style={onPanelIndication}
                >
                  {stories[0].cta}
                </a>
              ) : null}
              {stories[1]?.href ? (
                <a
                  className="home-am-opening__cta typo-on-images-indication"
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
    </section>
  );
}

export default HomeAmenitiesSequence;
