"use client";

import { CSSProperties, useRef, type ReactNode } from "react";
import Link from "next/link";
import { AmenitiesRisingVideo } from "@/components/home/AmenitiesRisingVideo";
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
    const joined = (lines.length ? lines.join(" ") : title)
      .replace(/\s+/g, " ")
      .trim();
    /* Two lines: “FINE DINING” / “ON DAHABIYA” (override CMS breaks). */
    if (/^FINE DINING\s+ON\s+DAHABIYA$/i.test(joined)) {
      /* NBSP keeps the second line from wrapping mid-phrase */
      return ["FINE DINING", "ON\u00A0DAHABIYA"];
    }
    if (lines.length > 1) return lines;
    const single = joined;
    const known: Array<[RegExp, string[]]> = [
      [
        /^NOT JUST A CRUISE\s+A WAY OF LIFE$/i,
        ["NOT JUST A CRUISE", "A WAY OF LIFE"],
      ],
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

  /* Four climbing cards → slots 9 / 10 / 11 / 13 (never gate on copy). */
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
    {
      image: images[11],
      label: shortCardLabel(
        landmarks[2]?.indication ||
          landmarks[2]?.titleLines?.join("\n") ||
          "Spa & Wellness",
      ),
    },
  ];

  /* Springs opening title: line breaks (h1 + <br>), not one jammed string */
  const openingTitleLines = (
    landmarks[3]?.titleLines?.length
      ? landmarks[3].titleLines
      : ["GOLDEN HOUR", "ON THE NILE"]
  )
    .map((line) => line.replace(/\.$/, "").trim())
    .filter(Boolean);

  /* Fixed gold-column copy (pinned while RC cards scroll) */
  const openingFixedTitleLines = ["SOUL OF", "THE NILE"];
  const openingFixedBody =
    "Aboard a quiet dahabiya, Egypt arrives without hurry — warm company, elegant cabins, and the river unfolding one measured bend at a time.";

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
  const natureImage = images[12];
  const natureStory = stories[2] ?? stories[1];
  const natureTitleLines = storyTitleLines(
    natureStory?.title?.trim() || "FINE DINING\nON DAHABIYA",
  );
  /* Small sub under the title — same role as slider indication. */
  const natureIndication = "Gastronomy";
  const natureCaption =
    natureStory?.body?.trim() ||
    "Restaurant craft meets warm hospitality — fresh local ingredients, Egyptian and international flavours, each meal a quiet celebration on the Nile.";
  const natureCtaHref = natureStory?.href?.trim() || "/gastronomy";

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
                {/*
                  Same pattern as homepage hero video (PublicSiteHero).
                  Until HATHOR_AMENITIES_RISING_VIDEO_SRC is set, CMS image shows.
                */}
                <AmenitiesRisingVideo
                  imageName={videoHeroImage.name}
                  alt={videoHeroImage.alt}
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

            {/*
              Springs: .col.col--lg-6.i-video__caption + videoCaptionMoveUp
              (reveal, then ride up off-screen — not a static bottom card).
            */}
            <div
              className="home-am-video__caption"
              data-am-video-caption
              data-plugin="parallax"
              data-parallax-pattern="videoCaptionMoveUp"
              data-parallax-enable-mq="null"
              data-parallax-clamp="true"
              data-parallax-measure-selector="[data-am-chapter]"
              data-distance="1"
            >
              <h3 className="typo-on-images-title" style={onGoldTitle}>
                {videoInset?.titleLines?.join(" ") || videoMain.indication}
              </h3>
              <p
                className="typo-on-images-body home-am-video__caption-text"
                data-am-video-caption-text
                style={onGoldBody}
              >
                {videoInset?.body || videoMain.body}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/*
        Springs: <section class="section ui-dark-background"> wraps i-slider → i-opening
        (and following dark chapters). Hairlines at 50vw show that colour, not cream.
        Hathor equivalent: gold band matching RC / caption.
      */}
      <div className="home-am-dark-band">
      {/* ===== i-slider ===== */}
      {sliderSlides.length > 0 ? (
        <div
          className="home-am-slider home-am-chapter home-am-chapter--under-previous home-am-chapter--under-next sticky sticky--full-height sticky--under-previous sticky--under-next"
          data-am-slider
          data-am-chapter
          id="home-am-slider"
        >
          <div className="home-am-chapter__stage sticky__layer sticky__layer--sticky sticky--full-height">
            {/*
              Springs: .i-slider__content.row data-parallax-pattern="infrastructureSliderScroll"
              Caption open/progress is driven in useHomeAmenitiesSequence (same progress math).
            */}
            <div
              className="home-am-slider__row"
              data-plugin="parallax"
              data-parallax-pattern="infrastructureSliderScroll"
              data-parallax-enable-mq="md-up"
              data-parallax-clamp="true"
              data-parallax-measure-selector=".sticky"
            >
              <div
                className="home-am-slider__caption-col"
                data-amenities-caption-col
                data-plugin="parallax"
                data-parallax-enable-mq="md-up"
                data-parallax-clamp="true"
                data-parallax-measure-selector=".sticky"
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
                data-parallax-measure-selector=".sticky"
                data-parallax-0-0='{"clip-path":"polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"}'
                data-parallax--100-0='{"clip-path":"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"}'
              >
                {sliderSlides.map((slide, index) => {
                  /* Springs panel N: --(N*100)-0 hidden → --((N+1)*100)-0 open → --((N+2)*100)-0 settle */
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
                      data-parallax-measure-selector=".sticky"
                      style={
                        {
                          "--am-slider-panel-z": index + 1,
                        } as CSSProperties
                      }
                      {...(index === 0
                        ? {
                            /* Springs first panel: data-parallax--000-0 */
                            "data-parallax--000-0":
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
              data-parallax-measure-selector=".sticky"
              data-parallax-0-0='{"clip-path":"polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"}'
              data-parallax--100-0='{"clip-path":"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"}'
            >
              <div
                data-plugin="parallax"
                data-parallax-enable-mq="null"
                data-parallax-clamp="true"
                data-parallax-measure-selector=".sticky"
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

            {/* Springs i-opening__caption — transparent, title above scrolling RC cards */}
            <div
              className="home-am-opening__caption"
              data-am-opening-title-panel
              data-plugin="parallax"
              data-parallax-enable-mq="md-up"
              data-parallax-clamp="true"
              data-parallax-measure-selector=".sticky"
              data-parallax-0-0='{"clip-path":"polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"}'
              data-parallax--100-0='{"clip-path":"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"}'
            >
              <div className="home-am-opening__caption-title">
                <h2
                  className="home-am-opening__title home-am-on-image-text typo-on-images-title"
                  data-am-opening-title
                  style={onGoldTitle}
                >
                  {openingTitleLines.map((line) => (
                    <span key={line} className="home-am-title-line">
                      {line}
                    </span>
                  ))}
                </h2>
              </div>
              <div className="home-am-opening__gradient" aria-hidden="true">
                <div />
              </div>
            </div>
          </div>
        </div>

        {/*
          Springs sticky__layer.i-opening__right-column — scrolls; cards slide up.
          Copy lives HERE (not on the pinned stage) so it only appears with the
          3-card row when this clip-path band opens — never during the earlier
          slider → opening handoff.
        */}
        <div
          className="home-am-opening__right-column sticky__layer"
          data-am-opening-right
          data-plugin="parallax"
          data-parallax-enable-mq="md-up"
          data-parallax-clamp="true"
          data-parallax-measure-selector=".sticky"
          data-parallax-0-0='{"clip-path":"polygon(49.75vw 0vh, 100% 0vh, 100% 0vh, 49.75vw 0vh)"}'
          data-parallax--100-0='{"clip-path":"polygon(49.75vw 100vh, 100% 100vh, 100% 200vh, 49.75vw 200vh)"}'
          data-parallax--101-0='{"clip-path":"polygon(49.75vw 100vh, 100% 100vh, 100% 350vh, 49.75vw 350vh)"}'
        >
          <div className="home-am-opening__right-inner">
            <div className="home-am-opening__cards-band">
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

              {/* Same typo tokens as slider gold captions; sticky in the gold */}
              <div className="home-am-opening__rail-copy">
                <h3 className="typo-on-images-title" style={onGoldTitle}>
                  {openingFixedTitleLines.map((line) => (
                    <span key={line} className="home-am-title-line">
                      {line}
                    </span>
                  ))}
                </h3>
                <p className="typo-on-images-body" style={onGoldBody}>
                  {openingFixedBody}
                </p>
                <Link
                  href="/highlights"
                  className="public-btn-outline-gold home-am-opening__cta"
                >
                  Discover more
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== i-nature — full-bleed image only (caption is the next gold sibling) ===== */}
      <div
        className="home-am-nature home-am-chapter home-am-chapter--under-previous sticky sticky--full-height sticky--under-previous sticky--under-next home-am-chapter--under-next"
        data-am-nature
        data-am-chapter
        id="home-am-nature"
      >
        <div className="home-am-nature__stage home-am-chapter__stage sticky__layer sticky__layer--sticky sticky--full-height">
          <div className="home-am-nature__content">
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
          </div>
        </div>
      </div>

      {/*
        Outside #home-am-nature (clip-path was hiding the band). Nature under-next
        pulls this short gold panel up over the pinned photo — not a tall empty slab.
      */}
      <div
        className="home-am-nature__gold-band"
        data-am-nature-caption
        id="home-am-nature-caption"
      >
        <div className="home-am-nature__copy">
          {/*
            Sized by Amenities Sequence typography (dashboard) — same title /
            indication / body roles as slider gold captions.
          */}
          <h3 className="home-am-nature__title typo-on-images-title">
            {natureTitleLines.map((line) => (
              <span key={line} className="home-am-title-line">
                {line}
              </span>
            ))}
          </h3>
          <p className="home-am-nature__indication typo-on-images-indication">
            {natureIndication}
          </p>
          <p className="home-am-nature__body typo-on-images-body">
            {natureCaption}
          </p>
          <Link
            href={natureCtaHref}
            className="public-btn-outline-gold home-am-opening__cta home-am-nature__cta"
          >
            Discover more
          </Link>
        </div>
      </div>
      </div>{/* /.home-am-dark-band — Springs ui-dark-background */}

      {/*
        Our Voyages — Hathor accordion (NOT Springs i-interiors sticky runway).
        Must stay in normal document flow: no sticky stage, no under-previous
        clip, no loco pin. columns/open panel need height:auto overflow:visible.
      */}
      {voyages ? (
        <div className="home-am-voyages" data-am-voyages id="home-am-voyages">
          <div className="home-am-voyages__stage">{voyages}</div>
        </div>
      ) : null}
    </section>
  );
}

export default HomeAmenitiesSequence;
