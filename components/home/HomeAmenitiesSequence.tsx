"use client";

import { CSSProperties, useRef, type ReactNode } from "react";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useTypographyInlineStyle } from "@/components/public/TypographySettingsProvider";
import { useHomeAmenitiesSequence } from "@/hooks/useHomeAmenitiesSequence";
import { AMENITIES_SEQUENCE_IMAGE_SLOTS } from "@/lib/amenities-sequence-images";
import type { SiteImageName } from "@/lib/site-image-slots";

const GOLD = "#B69F64";
const CREAM = "#ece8df";
const WHITE = "#ffffff";

export type AmenitiesLandmarkSlide = {
  titleLines: string[];
  indication: string;
  body: string;
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
  images?: AmenitiesSequenceImage[];
  titleStyle?: CSSProperties;
  indicationStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
  /** Springs i-nature — must be direct sibling after i-opening inside this sequence */
  voyages?: ReactNode;
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
 * Springs infrastructure amenities clone (i-intro → i-video → i-slider → i-opening).
 * Markup + data-parallax keys match the Springs clone; content is Hathor CMS.
 */
export function HomeAmenitiesSequence({
  landmarks,
  stories,
  images: imagesProp,
  titleStyle,
  indicationStyle,
  bodyStyle,
  voyages,
}: HomeAmenitiesSequenceProps) {
  const rootRef = useRef<HTMLElement>(null);
  const images = resolveImages(imagesProp);

  const intro = landmarks[0];
  const videoMain = landmarks[1] ?? landmarks[0];
  const videoInset = landmarks[2] ?? landmarks[1] ?? landmarks[0];

  /** Intentional line breaks for story titles (and CMS titles without `\n`). */
  const storyTitleLines = (title: string): string[] => {
    const lines = title
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length > 1) return lines;
    const single = (lines[0] || title).replace(/\s+/g, " ").trim();
    const known: Array<[RegExp, string[]]> = [
      [
        /^NOT JUST A CRUISE\s+A WAY OF LIFE$/i,
        ["NOT JUST A CRUISE", "A WAY OF LIFE"],
      ],
      [/^FINE DINING\s+ON DAHABIYA$/i, ["FINE DINING", "ON DAHABIYA"]],
    ];
    for (const [re, parts] of known) {
      if (re.test(single)) return parts;
    }
    return single ? [single] : [];
  };

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
          titleLines: storyTitleLines(stories[0].title),
          indication: stories[0].cta,
          body: stories[0].body,
          image: images[5],
        }
      : null,
    stories[1]
      ? {
          titleLines: storyTitleLines(stories[1].title),
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

  /* Springs i-opening list labels: short uppercase captions on the photo, not full titles. */
  const shortCardLabel = (raw: string) => {
    const lines = raw
      .split(/\n/)
      .map((line) => line.trim().replace(/\.$/, ""))
      .filter(Boolean);
    if (!lines.length) return raw.trim();
    return [...lines].sort((a, b) => a.length - b.length)[0] || lines[0];
  };

  /* Always 3 cards → dashboard slots home-amenities-9 / 10 / 11 (never gate on copy). */
  const openingCards: Array<{
    image: AmenitiesSequenceImage;
    label: string;
  }> = [
    {
      image: images[8],
      label: shortCardLabel(stories[0]?.title || "A Way of Life"),
    },
    {
      image: images[9],
      label: shortCardLabel(stories[1]?.title || "Dahabiya"),
    },
    {
      image: images[10],
      label: shortCardLabel(
        landmarks[1]?.indication ||
          landmarks[1]?.titleLines?.join("\n") ||
          "Private Nile Sailing",
      ),
    },
  ];

  const openingTitleFormatted = (
    landmarks[3]?.titleLines?.length
      ? landmarks[3].titleLines
      : ["GOLDEN HOUR", "ON THE NILE"]
  )
    .map((line) => line.replace(/\.$/, "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+on\s+the\s+/i, " on\u00A0the ")
    .replace(/\s+ON\s+THE\s+/i, " on\u00A0the ");

  useHomeAmenitiesSequence(rootRef, sliderSlides.length);

  if (!intro) return null;

  const creamBodyStyle = useTypographyInlineStyle("body_text");
  const onImageTitle = withColor(titleStyle, WHITE);
  const onImageIndication = withColor(indicationStyle, WHITE);
  const onCreamTitle = withColor(titleStyle, GOLD);
  const onGoldTitle = withColor(titleStyle, WHITE);
  const onGoldIndication = withColor(indicationStyle, WHITE);
  const onGoldBody = withColor(bodyStyle, WHITE);

  const introImage = images[0];
  const videoHeroImage = images[1];
  const videoInsetImage = images[2];
  const openingLeftImage = images[7];
  const natureImage = images[11];
  const natureCaption =
    stories[2]?.body?.trim() ||
    stories[1]?.body?.trim() ||
    "On the Nile, every bend opens another chapter — private dahabiya passages where light, water, and quiet company write the itinerary.";

  return (
    <section
      ref={rootRef}
      className="home-am-sequence"
      aria-label="Amenities-style Nile stories"
    >
      {/* ===== i-intro ===== */}
      <div
        className="home-am-intro home-am-chapter home-am-chapter--under-next sticky sticky--full-height sticky--under-next"
        data-am-intro
        data-am-chapter
        id="home-am-intro"
      >
        <div className="home-am-chapter__stage sticky__layer sticky__layer--sticky sticky--full-height">
          <div className="home-am-intro__content">
            <div
              className="home-am-intro__media background background--cover"
              data-am-intro-media
              data-plugin="parallax"
              data-parallax-pattern="introImage"
              data-parallax-clamp="true"
              data-parallax-measure-selector="[data-am-chapter]"
            >
              <div
                data-plugin="parallax"
                data-parallax-enable-mq="lg-up"
                data-parallax-clamp="true"
                data-parallax-measure-selector="[data-am-chapter]"
                data-parallax-0-0='{"transform":"translateX(0%) scale(1.2)"}'
                data-parallax--200-0='{"transform":"translateX(-36%) scale(1.0)"}'
                className="home-am-intro__media-picture"
              >
                <ManagedImage
                  name={introImage.name}
                  alt={introImage.alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                  previewAnchor={introImage.previewAnchor}
                />
              </div>
              <div
                className="home-am-intro__dim"
                data-am-intro-dim
                data-plugin="parallax"
                data-parallax-clamp="true"
                data-parallax-measure-selector="[data-am-chapter]"
                data-parallax-enable-mq="null"
                data-parallax-0-0='{"opacity":"1"}'
                data-parallax--50-0='{"opacity":"0"}'
                aria-hidden
              />
            </div>

            <div
              className="home-am-intro__caption"
              data-am-intro-title
              data-plugin="parallax"
              data-parallax-enable-mq="null"
              data-parallax-pattern="infrastructureIntroCaptionDesktop infrastructureIntroCaptionMobile"
              data-parallax-measure-selector="[data-am-chapter]"
            >
              <h2
                className="home-am-intro__title home-am-on-image-text typo-on-images-title"
                style={onImageTitle}
              >
                {intro.titleLines.map((line) => (
                  <span key={line} className="home-am-title-line">
                    {line}
                  </span>
                ))}
              </h2>
              <p
                className="home-am-intro__indication home-am-on-image-text typo-on-images-indication"
                style={onImageIndication}
              >
                {intro.indication}
              </p>
            </div>
          </div>

          <div
            className="home-am-intro__cream"
            data-am-intro-cream
            data-plugin="parallax"
            data-parallax-enable-mq="lg-up"
            data-parallax-clamp="true"
            data-parallax-measure-selector="[data-am-chapter]"
            data-parallax-0-0='{"clip-path":"polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)"}'
            data-parallax--100-0='{"clip-path":"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"}'
            style={{ background: CREAM }}
          >
            <p
              className="home-am-intro__cream-text typo-body-text"
              style={creamBodyStyle}
            >
              {intro.body}
            </p>
          </div>

          {/* Phone cream wipe from bottom — Springs mobile panel */}
          <div
            className="home-am-intro__cream home-am-intro__cream--phone"
            data-plugin="parallax"
            data-parallax-enable-mq="md-down"
            data-parallax-clamp="true"
            data-parallax-measure-selector="[data-am-chapter]"
            data-parallax-0-0='{"clip-path":"polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"}'
            data-parallax--100-0='{"clip-path":"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"}'
            style={{ background: CREAM }}
          >
            <p
              className="home-am-intro__cream-text typo-body-text"
              style={creamBodyStyle}
            >
              {intro.body}
            </p>
          </div>
        </div>
      </div>

      {/* ===== i-video ===== */}
      {videoMain ? (
        <div
          className="home-am-video home-am-chapter home-am-chapter--under-previous home-am-chapter--under-next sticky sticky--full-height sticky--under-previous sticky--under-next"
          data-am-video
          data-am-chapter
          id="home-am-video"
        >
          <div className="home-am-chapter__stage sticky__layer sticky__layer--sticky sticky--full-height">
            <div
              className="home-am-video__hero-wrap"
              data-plugin="parallax"
              data-parallax-pattern="videoTranslate"
              data-parallax-clamp="true"
              data-parallax-measure-selector="[data-am-chapter]"
            >
              <div
                className="home-am-video__hero"
                data-am-video-hero
                data-plugin="parallax"
                data-parallax-pattern="videoZoom"
                data-parallax-clamp="true"
                data-parallax-measure-selector="[data-am-chapter]"
              >
                <ManagedImage
                  name={videoHeroImage.name}
                  alt={videoHeroImage.alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  previewAnchor={videoHeroImage.previewAnchor}
                />
              </div>
            </div>

            <div
              className="home-am-video__title-stack"
              data-am-video-title
              data-plugin="parallax"
              data-parallax-pattern="videoTitle"
              data-parallax-clamp="true"
              data-parallax-measure-selector="[data-am-chapter]"
            >
              <div className="home-am-video__title">
                <h2
                  className="home-am-on-cream-title typo-on-images-title"
                  style={onCreamTitle}
                >
                  {(videoMain.titleLines.length
                    ? videoMain.titleLines
                    : [videoMain.indication]
                  ).map((line) => (
                    <span key={line} className="home-am-title-line">
                      {line}
                    </span>
                  ))}
                </h2>
              </div>
              <p
                className="home-am-video__title-body typo-body-text"
                style={creamBodyStyle}
              >
                {intro.body}
              </p>
            </div>

            <div
              className="home-am-video__inset"
              data-am-video-inset
              data-plugin="parallax"
              data-parallax-pattern="videoImage"
              data-parallax-clamp="true"
              data-parallax-measure-selector="[data-am-chapter]"
            >
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
              data-plugin="parallax"
              data-parallax-enable-mq="null"
              data-parallax-clamp="true"
              data-parallax-measure-selector="[data-am-chapter]"
              data-parallax--160-0='{"clip-path":"polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"}'
              data-parallax--300-0='{"clip-path":"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"}'
              style={{ background: GOLD }}
            >
              <h3 className="typo-on-images-title" style={onGoldTitle}>
                {videoInset?.titleLines?.join(" ") || videoMain.indication}
              </h3>
              <p className="typo-on-images-body" style={onGoldBody}>
                {videoInset?.body || videoMain.body}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* ===== i-slider ===== */}
      {sliderSlides.length > 0 ? (
        <div
          className="home-am-slider home-am-chapter home-am-chapter--under-previous home-am-chapter--under-next sticky sticky--full-height sticky--under-previous sticky--under-next"
          data-am-slider
          data-am-chapter
          id="home-am-slider"
        >
          <div className="home-am-chapter__stage sticky__layer sticky__layer--sticky sticky--full-height">
            <div className="home-am-slider__row">
              <div
                className="home-am-slider__caption-col"
                data-amenities-caption-col
                data-plugin="parallax"
                data-parallax-enable-mq="md-up"
                data-parallax-clamp="true"
                data-parallax-measure-selector="[data-am-chapter]"
                data-parallax-0-0='{"clip-path":"polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"}'
                data-parallax--100-0='{"clip-path":"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"}'
                style={{ background: GOLD }}
              >
                <div className="home-am-slider__caption-stack content-animation content-animation--ready">
                  {sliderSlides.map((slide, index) => (
                    <div
                      key={`slider-cap-${slide.image.name}-${index}`}
                      className={`home-am-slider__caption${index === 0 ? "" : " is-hidden"}`}
                      data-amenities-caption
                      data-content-animation-item={String(index + 1)}
                      aria-hidden={index === 0 ? "false" : "true"}
                    >
                      <h2 className="typo-on-images-title" style={onGoldTitle}>
                        {slide.titleLines.map((line) => (
                          <span
                            key={`${slide.image.name}-${line}`}
                            className="home-am-title-line"
                          >
                            {line}
                          </span>
                        ))}
                      </h2>
                      {slide.indication ? (
                        <p
                          className="typo-on-images-indication"
                          style={onGoldIndication}
                        >
                          {slide.indication}
                        </p>
                      ) : null}
                      <p className="typo-on-images-body" style={onGoldBody}>
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
                data-plugin="parallax"
                data-parallax-enable-mq="md-up"
                data-parallax-clamp="true"
                data-parallax-measure-selector="[data-am-chapter]"
                data-parallax-0-0='{"clip-path":"polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"}'
                data-parallax--100-0='{"clip-path":"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"}'
              >
                {sliderSlides.map((slide, index) => {
                  const base = index * 100;
                  const open = base + 100;
                  const settle = base + 200;
                  return (
                    <div
                      key={`slider-img-${slide.image.name}-${index}`}
                      className="home-am-slider__panel"
                      data-amenities-panel
                      data-plugin="parallax"
                      data-parallax-enable-mq="md-up"
                      data-parallax-clamp="true"
                      data-parallax-measure-selector="[data-am-chapter]"
                      {...(index === 0
                        ? {
                            "data-parallax--0-0":
                              '{"clip-path":"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)","transform":"scale(1.2)"}',
                            "data-parallax--100-0":
                              '{"clip-path":"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)","transform":"scale(1.1)"}',
                            "data-parallax--200-0":
                              '{"clip-path":"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)","transform":"scale(1.0)"}',
                          }
                        : {
                            [`data-parallax--${base}-0`]:
                              '{"clip-path":"polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)","transform":"scale(1.2)"}',
                            [`data-parallax--${open}-0`]:
                              '{"clip-path":"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)","transform":"scale(1.1)"}',
                            [`data-parallax--${settle}-0`]:
                              '{"clip-path":"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)","transform":"scale(1.0)"}',
                          })}
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
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ===== i-opening — Springs infrastructure amenities opening (literal) ===== */}
      <div
        className="home-am-opening home-am-chapter home-am-chapter--under-previous home-am-chapter--under-previous-after-next home-am-chapter--under-next sticky sticky--full-height sticky--under-previous sticky--under-next"
        data-am-opening
        data-am-chapter
        id="home-am-opening"
      >
        <div className="home-am-chapter__stage sticky__layer sticky__layer--sticky sticky--full-height">
          <div className="home-am-opening__content">
            <div
              className="home-am-opening__images"
              data-am-opening-left
              data-plugin="parallax"
              data-parallax-enable-mq="md-up"
              data-parallax-clamp="true"
              data-parallax-measure-selector="[data-am-chapter]"
              data-parallax-0-0='{"clip-path":"polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"}'
              data-parallax--100-0='{"clip-path":"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"}'
            >
              <div
                data-plugin="parallax"
                data-parallax-enable-mq="null"
                data-parallax-clamp="true"
                data-parallax-measure-selector="[data-am-chapter]"
                data-parallax-0-0='{"transform":"scale(1.2)"}'
                data-parallax--300-0='{"transform":"scale(1.0)"}'
                className="home-am-opening__images-media"
              >
                <ManagedImage
                  name={openingLeftImage.name}
                  alt={openingLeftImage.alt}
                  fill
                  sizes="(max-width: 480px) 100vw, 50vw"
                  className="object-cover"
                  priority
                  previewAnchor={openingLeftImage.previewAnchor}
                />
              </div>
            </div>

            <div
              className="home-am-opening__caption"
              data-am-opening-title-panel
              data-plugin="parallax"
              data-parallax-enable-mq="md-up"
              data-parallax-clamp="true"
              data-parallax-measure-selector="[data-am-chapter]"
              data-parallax-0-0='{"clip-path":"polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"}'
              data-parallax--100-0='{"clip-path":"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"}'
            >
              {/* Springs: title sits on sticky caption panel (fixed) while cards scroll */}
              <div className="home-am-opening__caption-title">
                <h2 className="home-am-opening__title" data-am-opening-title>
                  {openingTitleFormatted}
                </h2>
              </div>
              <div className="home-am-opening__gradient" aria-hidden="true">
                <div />
              </div>
            </div>
          </div>
        </div>

        {/* Springs right column: body + 3 cards stacked vertically, scroll with gold runway */}
        <div
          className="home-am-opening__right-column sticky__layer"
          data-am-opening-right
          data-plugin="parallax"
          data-parallax-enable-mq="md-up"
          data-parallax-clamp="true"
          data-parallax-measure-selector="[data-am-chapter]"
          /* Springs i-opening right-column — literal keyframes */
          data-parallax-0-0='{"clip-path":"polygon(50vw 0vh, 100% 0vh, 100% 0vh, 50vw 0vh)"}'
          data-parallax--100-0='{"clip-path":"polygon(50vw 100vh, 100% 100vh, 100% 200vh, 50vw 200vh)"}'
          data-parallax--101-0='{"clip-path":"polygon(50vw 100vh, 100% 100vh, 100% 350vh, 50vw 350vh)"}'
        >
          <div className="home-am-opening__right-inner">
            <p
              className="home-am-opening__caption-text typo-on-images-body"
              style={onGoldBody}
            >
              {stories[0]?.body || landmarks[3]?.body || intro.body}
            </p>

            <div className="home-am-opening__list-wrap">
              <div className="home-am-opening__list" data-am-opening-cards>
                {openingCards.map((card, index) => (
                  <div
                    key={`opening-card-${card.image.name}-${index}`}
                    className="home-am-opening__list-item"
                    data-am-opening-card={card.image.name}
                  >
                    <div className="home-am-opening__list-item-media">
                      <ManagedImage
                        name={card.image.name}
                        alt={card.image.alt}
                        fill
                        sizes="(max-width: 480px) 48vw, 210px"
                        className="object-cover"
                        loading="eager"
                        previewAnchor={card.image.previewAnchor}
                      />
                    </div>
                    <div className="home-am-opening__list-item-text">
                      {card.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== i-nature — literal Springs handoff after i-opening ===== */}
      <div
        className="home-am-nature home-am-chapter home-am-chapter--under-previous home-am-chapter--under-next sticky sticky--full-height sticky--under-previous sticky--under-next"
        data-am-nature
        data-am-chapter
        id="home-am-nature"
      >
        <div className="home-am-nature__stage home-am-chapter__stage sticky__layer sticky__layer--sticky sticky--full-height">
          <div className="home-am-nature__content">
            {/* Springs: .background.background--cover + img parallax measure .sticky */}
            <div
              className="home-am-nature__media"
              data-plugin="parallax"
              data-parallax-enable-mq="null"
              data-parallax-clamp="true"
              data-parallax-measure-selector=".sticky"
              data-parallax-100-0='{"transform":"scale(1.2)"}'
              data-parallax--200-0='{"transform":"scale(1.0)"}'
            >
              <ManagedImage
                name={natureImage.name}
                alt={natureImage.alt}
                fill
                sizes="100vw"
                className="object-cover"
                loading="eager"
                previewAnchor={natureImage.previewAnchor}
              />
            </div>

            <div className="home-am-nature__caption">
              <p className="home-am-nature__caption-text home-am-on-image-text">
                {natureCaption}
              </p>
            </div>

            <div className="home-am-nature__gradient" aria-hidden="true">
              <div />
            </div>
          </div>
        </div>
      </div>

      {/* ===== Our Voyages list — follows nature (Springs i-interiors position) ===== */}
      {voyages ? (
        <div
          className="home-am-voyages home-am-chapter home-am-chapter--under-previous sticky sticky--full-height sticky--under-previous sticky--under-next"
          data-am-voyages
          data-am-chapter
          id="home-am-voyages"
        >
          <div className="home-am-voyages__stage home-am-chapter__stage sticky__layer sticky__layer--sticky sticky--full-height">
            {voyages}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default HomeAmenitiesSequence;
