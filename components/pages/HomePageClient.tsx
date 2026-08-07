"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState, type CSSProperties } from "react";
import rotatingWheel from "@/assets/LOGOS/rotating-wheel-hathor-cruise.png";
import { HomeLandmarkMaskSection } from "@/components/home/HomeLandmarkMaskSection";
import LuxuryAccordion from "@/components/home/LuxuryAccordion";
import { HomeCampaignSection } from "@/components/home/HomeCampaignSection";
import { LuxuryMarquee } from "@/components/home/LuxuryMarquee";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { GalleryInstagramFollow } from "@/components/public/GalleryInstagramFollow";
import { HathorLogoTuner } from "@/components/public/HathorLogoTuner";
import { PublicSiteHero } from "@/components/pages/PublicSiteHero";
import { GoldDustParticles } from "@/components/ui/GoldDustParticles";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import {
  EX_ABOUT,
  EX_CAMPAIGN,
  EX_CAROUSEL,
  EX_GALLERY,
  EX_HERO,
  EX_PINNED,
  EX_TEXT_BLOCKS,
  type ExCarouselSlide,
} from "@/lib/ex-page-content";
import { AMENITIES_SEQUENCE_IMAGE_SLOTS } from "@/lib/amenities-sequence-images";
import type { HomepageAccordionCruise } from "@/lib/homepage-accordion-cruises";
import type { SiteImageName } from "@/lib/site-image-slots";
import { useExScrollMotion } from "@/hooks/useExScrollMotion";
import {
  useTypographyInlineStyle,
  useTypographySettings,
} from "@/components/public/TypographySettingsProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { combineDesktopAndNarrowCss } from "@/lib/admin-device-preview";
import {
  DEFAULT_HERO_LOGO_TUNE,
  type HeroLogoTune,
  heroLogoTuneToImportantCss,
  heroLogoTuneToNarrowImportantCss,
} from "@/lib/hero-logo-tune-shared";
import {
  DEFAULT_WHEEL_STAGE_SETTINGS,
  type WheelStageSettings,
} from "@/lib/wheel-stage-settings-shared";
import { siteImageAnchorId } from "@/lib/site-image-preview";
import { shouldSoftRefreshCms } from "@/lib/cms-soft-refresh";
import { useBookingStore } from "@/store/bookingStore";

const GALLERY_PREVIEW_ANCHORS = new Set([
  "moving-tilted-1",
  "moving-tilted-2",
  "moving-tilted-3",
  "moving-tilted-4",
  "moving-tilted-5",
]);

/** Full-resolution CMS photo for marquee cards (no Next image optimizer). */
function GalleryMarqueePhoto({
  name,
  alt,
}: {
  name: SiteImageName;
  alt: string;
}) {
  const image = useSiteImage(name);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- intentional: native full-res for tilted marquee
    <img
      src={image.src}
      alt={alt}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      draggable={false}
    />
  );
}

/** Every homepage-visible CMS slot should be findable for admin “View on live site”. */
const HOMEPAGE_PREVIEW_SLOTS = new Set([
  "home-hero-poster",
  "home-story-craft-large",
  "room-suite",
  "room-royal",
  "room-luxury",
  "home-amenities-1",
  "home-amenities-2",
  "home-amenities-3",
  "home-amenities-4",
  "home-amenities-5",
  "home-amenities-6",
  "home-amenities-7",
  "home-amenities-8",
  "home-amenities-9",
  "home-amenities-10",
  "home-amenities-11",
  "home-voyage-3n-aswan-luxor",
  "home-voyage-4n-luxor-aswan",
  "home-voyage-7n-roundtrip",
  "home-voyage-nile-majesty",
  "home-call-to-action",
  "home-wheel-stage",
  "home-wheel-image",
  ...GALLERY_PREVIEW_ANCHORS,
]);

type HomePageClientProps = {
  heroLogoTune?: HeroLogoTune;
  heroLogoTuneMobile?: HeroLogoTune;
  accordionCruises?: HomepageAccordionCruise[];
  wheelStage?: WheelStageSettings;
};

function paintLogoTune(desktop: HeroLogoTune, phone: HeroLogoTune) {
  /* CSS only — inline vars would beat phone @media overrides. */
  let tag = document.querySelector<HTMLStyleElement>(
    "style[data-hathor-logo-tune-live]",
  );
  if (!tag) {
    tag = document.createElement("style");
    tag.setAttribute("data-hathor-logo-tune-live", "");
    document.head.appendChild(tag);
  }
  tag.textContent = combineDesktopAndNarrowCss(
    heroLogoTuneToImportantCss(desktop),
    heroLogoTuneToNarrowImportantCss(phone),
  );
}

function ItineraryCarouselSlide({ slide }: { slide: ExCarouselSlide }) {
  const router = useRouter();
  const hydrateFromModal = useBookingStore((state) => state.hydrateFromModal);

  const openCruise = () => {
    hydrateFromModal({
      duration: slide.duration,
      roomConfigs: [
        {
          roomType: slide.roomType,
          adults: 1,
          children: 0,
        },
      ],
    });
    router.push("/booking");
  };

  return (
    <article className="carousel-slide">
      <button
        type="button"
        className="carousel-slide__hit"
        onClick={openCruise}
        aria-label={`Book ${slide.title}`}
      >
        <div className="carousel-container-parent">
          <div className="carousel-container">
            <ManagedImage
              name={slide.imageName}
              alt={slide.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 38vw"
              unoptimized={false}
              className="object-cover"
              previewAnchor={HOMEPAGE_PREVIEW_SLOTS.has(slide.imageName)}
            />
            <div className="carousel-heading">
              <h2>{slide.title}</h2>
            </div>
          </div>
        </div>
      </button>
    </article>
  );
}

export function HomePageClient({
  heroLogoTune = DEFAULT_HERO_LOGO_TUNE,
  heroLogoTuneMobile = heroLogoTune,
  accordionCruises = [],
  wheelStage = DEFAULT_WHEEL_STAGE_SETTINGS,
}: HomePageClientProps) {
  useExScrollMotion();

  const typography = useTypographySettings();
  const websiteText = useWebsiteText();
  const stackEyebrowStyle = useTypographyInlineStyle("on_images_indication");
  const stackTitleStyle = useTypographyInlineStyle("on_images_title");
  const stackBodyStyle = useTypographyInlineStyle("on_images_body");
  const itinerariesIndicationStyle = useTypographyInlineStyle("page_subtitle");
  const galleryIndicationStyle = useTypographyInlineStyle("page_subtitle");
  const aboutTitleStyle = useTypographyInlineStyle("page_title");
  const aboutIndicationStyle = useTypographyInlineStyle("page_subtitle");
  const aboutBodyStyle = useTypographyInlineStyle("body_text");
  const campaignTitleStyle = useTypographyInlineStyle("on_images_title");

  const aboutHeadingLines = websiteText.home.about.heading
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const stackSlides = EX_PINNED.slides.map((slide, index) => {
    const cms = websiteText.home.stackSlides[index];
    const titleRaw =
      cms?.title?.trim() ||
      (index === 0 ? typography.on_images_copy.title.trim() : "") ||
      slide.title;
    const titleLines = titleRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    return {
      ...slide,
      titleLines: titleLines.length > 0 ? titleLines : [slide.title],
      indication:
        cms?.indication?.trim() ||
        (index === 0
          ? typography.on_images_copy.indication.trim()
          : "") ||
        slide.indication,
      body:
        cms?.body?.trim() ||
        (index === 0 ? typography.on_images_copy.body.trim() : "") ||
        slide.body,
    };
  });

  const [softTune, setSoftTune] = useState<typeof heroLogoTune | null>(null);
  const [softTuneMobile, setSoftTuneMobile] = useState<
    typeof heroLogoTuneMobile | null
  >(null);
  const liveTune = softTune ?? heroLogoTune;
  const liveTuneMobile = softTuneMobile ?? heroLogoTuneMobile;

  /* Soft refresh so phone logo saves show even if ISR HTML is briefly stale.
   * Gated to admin preview (?logoTune=1 / ?cmsRefresh=1) to avoid live DB hits. */
  useEffect(() => {
    if (!shouldSoftRefreshCms()) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/hero-logo-tune?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          tune?: unknown;
          tuneMobile?: unknown;
        };
        if (cancelled) return;
        if (data.tune) {
          // Soft override only — provider props remain the SSR source of truth.
          const { parseHeroLogoTune } = await import(
            "@/lib/hero-logo-tune-shared"
          );
          setSoftTune(parseHeroLogoTune(data.tune));
        }
        if (data.tuneMobile) {
          const { parseHeroLogoTune } = await import(
            "@/lib/hero-logo-tune-shared"
          );
          setSoftTuneMobile(parseHeroLogoTune(data.tuneMobile));
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    paintLogoTune(liveTune, liveTuneMobile);
  }, [liveTune, liveTuneMobile]);

  return (
    <div className="ex-root" data-hathor-logo-tuned="">
      <HathorLogoTuner />
      {/* Layout already provides <main>; keep #top for hash / scroll targets */}
      <div id="top">
        <div className="home-hero-runway">
          <PublicSiteHero
            animate={false}
            splitLetterLogo
            playVideo
            lineRight={EX_HERO.lineRight}
            lineLeft={EX_HERO.lineLeft}
            heroPage="home"
            posterImageName={EX_HERO.imageName}
            logoPartsVariant={liveTune.partsVariant}
            mobileLogoPartsVariant={liveTuneMobile.partsVariant}
          />
        </div>

        <LuxuryMarquee />

        <div className="ex-content-dust" style={{ position: "relative" }}>
          <GoldDustParticles />

        <section className="about-section ex-content-section" id="about">
          <div className="section-inner">
            <div className="about-layout">
              <div>
                <div className="radius-img-container">
                  <div className="radius-img-container-inner">
                    <Link
                      href="/about"
                      className="general-reveal-img media-hover"
                      aria-label="Discover more about Hathor"
                    >
                      <ManagedImage
                        name={EX_ABOUT.imageName}
                        alt={EX_ABOUT.imageAlt}
                        width={900}
                        height={1200}
                        sizes="(max-width: 768px) 100vw, 42vw"
                        unoptimized={false}
                        className="h-auto w-full object-cover"
                      />
                    </Link>
                  </div>
                </div>
              </div>

              <div>
                <div className="radius-heading">
                  <h2 className="typo-page-title" style={aboutTitleStyle}>
                    {aboutHeadingLines.map((line, index) => (
                      <span key={`${line}-${index}`}>
                        {index > 0 ? <br /> : null}
                        {line}
                      </span>
                    ))}
                  </h2>
                </div>
                <div className="radius-sub-heading radius-indication">
                  <h3
                    className="typo-page-subtitle"
                    style={aboutIndicationStyle}
                  >
                    {websiteText.home.about.eyebrow}
                  </h3>
                </div>
                <div className="radius-p">
                  <p className="typo-body-text" style={aboutBodyStyle}>
                    {websiteText.home.about.body}
                  </p>
                </div>
                <Link className="btn btn-dark radius-button" href="/about">
                  {websiteText.home.about.cta}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="services-section ex-content-section" id="services">
          <div className="services-intro">
            <div className="home-carousel-h2">
              <h2>{websiteText.home.carousel.title}</h2>
            </div>
            <div className="home-carousel-h3">
              <h3 className="typo-page-subtitle" style={itinerariesIndicationStyle}>
                {websiteText.home.carousel.subtitle}
              </h3>
            </div>
          </div>

          <div className="home-carousel">
            <div className="carousel-track">
              {EX_CAROUSEL.slides.map((slide) => (
                <ItineraryCarouselSlide key={slide.key} slide={slide} />
              ))}
            </div>

            <div className="carousel-nav">
              <button type="button" data-carousel-prev aria-label="Previous slide">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button type="button" data-carousel-next aria-label="Next slide">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="services-cta">
            <Link className="btn btn-dark general-button" href="/cruises">
              {websiteText.home.carousel.exploreCta}
            </Link>
          </div>
        </section>

        <HomeLandmarkMaskSection
          slides={stackSlides.map((slide) => ({
            ...slide,
            previewAnchor: false,
          }))}
          stories={EX_TEXT_BLOCKS.map((block, index) => {
            const cms = websiteText.home.textBlocks[index];
            return {
              title: cms?.title?.trim() || block.title,
              body: cms?.body?.trim() || block.body,
              cta: cms?.cta?.trim() || block.cta,
              href: block.href,
              imageName: block.imageName,
              imageAlt: block.alt,
              previewAnchor: false,
            };
          })}
          images={AMENITIES_SEQUENCE_IMAGE_SLOTS.map((slot) => ({
            name: slot.name as SiteImageName,
            alt: slot.alt,
            previewAnchor: HOMEPAGE_PREVIEW_SLOTS.has(slot.name),
          }))}
          titleStyle={stackTitleStyle}
          indicationStyle={stackEyebrowStyle}
          bodyStyle={stackBodyStyle}
        />

        {/* Our Voyages — between amenities sequence and wheel portal */}
        <LuxuryAccordion
          items={accordionCruises.map((cruise) => ({
            id: cruise.id,
            name: cruise.name,
            description: cruise.description,
            imageName: cruise.imageName,
            romanNumeral: cruise.romanNumeral,
            meta: cruise.meta,
            href: cruise.href,
            slug: cruise.slug,
            basePriceCents: cruise.basePriceCents,
            ctaLabel: "Check Voyages",
          }))}
        />

        <section
          className="home-helm-portal ex-content-section"
          aria-label="Enter the Hathor voyage"
          data-home-helm-portal
        >
          <div className="home-helm-portal__viewport">
            {/* Parchment stage: full-viewport, sun/compass dead-center under the wheel.
                Stays visible while the wheel opens; circle-reveal media sits above it.
                CMS slot: home-wheel-stage (dashboard → Homepage). */}
            <div
              className="home-helm-portal__stage"
              aria-hidden="true"
              style={
                {
                  ["--home-wheel-stage-opacity"]: String(wheelStage.opacity),
                } as CSSProperties
              }
            >
              <ManagedImage
                name="home-wheel-stage"
                alt=""
                fill
                sizes="100vw"
                className="home-helm-portal__stage-image"
                priority={false}
                previewAnchor
              />
            </div>

            <div className="home-helm-portal__media" data-home-helm-media>
              <ManagedImage
                name="home-wheel-image"
                alt="Wheel portal — Hathor Dahabiya on the Nile"
                fill
                sizes="100vw"
                className="home-helm-portal__media-image object-cover"
                previewAnchor
              />
              <div className="home-helm-portal__shade" aria-hidden="true" />
            </div>

            <div className="home-helm-portal__wheel" data-home-helm-wheel>
              <Image
                src={rotatingWheel}
                alt=""
                className="home-helm-portal__wheel-image"
                sizes="(max-width: 767px) 76vw, min(48vw, 68vh)"
                priority={false}
              />
            </div>
          </div>
        </section>

        <section className="gallery-section ex-content-section" id="gallery">
          <GalleryInstagramFollow
            title={websiteText.home.gallery.title}
            handleStyle={{
              fontFamily: galleryIndicationStyle.fontFamily,
              fontSize: galleryIndicationStyle.fontSize,
              lineHeight: galleryIndicationStyle.lineHeight,
              letterSpacing: galleryIndicationStyle.letterSpacing,
              textShadow: galleryIndicationStyle.textShadow,
            }}
          />

          <div
            className="gallery-marquee"
            aria-label="Hathor gallery — scrolling images"
          >
            <div className="gallery-marquee__stage">
              <div className="gallery-marquee__band">
                <div className="gallery-marquee__track">
                  {[0, 1].map((copy) => (
                    <div
                      key={`gallery-copy-${copy}`}
                      className="gallery-marquee__group"
                      aria-hidden={copy === 1 ? "true" : undefined}
                    >
                      {EX_GALLERY.images.map((item, index) => (
                        <Link
                          key={`${copy}-${item.imageName}-${index}`}
                          href={item.href}
                          className={
                            copy === 1
                              ? "gallery-item gallery-item--visual"
                              : "gallery-item"
                          }
                          tabIndex={copy === 1 ? -1 : undefined}
                          id={
                            copy === 0 &&
                            GALLERY_PREVIEW_ANCHORS.has(item.imageName)
                              ? siteImageAnchorId(item.imageName)
                              : undefined
                          }
                          data-site-image={
                            copy === 0 &&
                            GALLERY_PREVIEW_ANCHORS.has(item.imageName)
                              ? item.imageName
                              : undefined
                          }
                          aria-label={item.alt}
                        >
                          <span className="gallery-item__frame" aria-hidden="true">
                            <GalleryMarqueePhoto
                              name={item.imageName}
                              alt={item.alt}
                            />
                          </span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="gallery-container">
            <BookNowTrigger className="btn btn-dark gallery-button">
              Book Now
            </BookNowTrigger>
          </div>
        </section>

        <section className="testimonials-section ex-content-section" id="reviews">
          <div className="testimonials-header">
            <div className="testimonial-h2">
              <h2>{websiteText.home.testimonials.title}</h2>
            </div>
          </div>

          <div className="testimonials-grid">
            {websiteText.home.testimonials.cards.map((card) => (
              <article key={card.name} className="testimonial-card">
                <div className="testimonial-stars" aria-label="5 stars">
                  ★★★★★
                </div>
                <h3>{card.name}</h3>
                <p>&ldquo;{card.quote}&rdquo;</p>
              </article>
            ))}
          </div>
        </section>

        <HomeCampaignSection
          title={websiteText.home.campaign.title}
          imageName={EX_CAMPAIGN.imageName}
          imageAlt={EX_CAMPAIGN.imageAlt}
          titleStyle={campaignTitleStyle}
          previewAnchor={HOMEPAGE_PREVIEW_SLOTS.has(EX_CAMPAIGN.imageName)}
        />
        </div>
      </div>
    </div>
  );
}
