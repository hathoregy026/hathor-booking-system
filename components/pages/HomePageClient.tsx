"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import movingShip from "@/assets/moving-on-site.webp";
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
  EX_TESTIMONIALS,
  EX_TEXT_BLOCKS,
  type ExCarouselSlide,
} from "@/lib/ex-page-content";
import type { HomepageAccordionCruise } from "@/lib/homepage-accordion-cruises";
import type { SiteImageName } from "@/lib/site-image-slots";
import { useExScrollMotion } from "@/hooks/useExScrollMotion";
import {
  useTypographyInlineStyle,
  useTypographySettings,
} from "@/components/public/TypographySettingsProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { combineDesktopAndPhoneCss } from "@/lib/admin-device-preview";
import {
  DEFAULT_HERO_LOGO_TUNE,
  type HeroLogoTune,
  heroLogoTuneToImportantCss,
} from "@/lib/hero-logo-tune-shared";
import { siteImageAnchorId } from "@/lib/site-image-preview";
import { useBookingStore } from "@/store/bookingStore";

const GALLERY_PREVIEW_ANCHORS = new Set([
  "moving-tilted-1",
  "moving-tilted-2",
  "moving-tilted-3",
  "moving-tilted-4",
  "moving-tilted-5",
]);

/** Gallery marquee — native img (GSAP/CSS expect this structure), optimized via Next. */
function GalleryMarqueePhoto({
  name,
  alt,
}: {
  name: SiteImageName;
  alt: string;
}) {
  const image = useSiteImage(name);
  const src = /^https?:\/\//i.test(image.src)
    ? `/_next/image?${new URLSearchParams({
        url: image.src,
        w: "640",
        q: "72",
      }).toString()}`
    : image.src;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- marquee CSS depends on native img sizing
    <img
      src={src}
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
  "home-collage-small",
  "home-collage-large",
  "home-split-courtyard",
  "cruises-hero",
  "room-suite",
  "room-royal",
  "room-luxury",
  "about-hero",
  "home-story-legacy-large",
  "gastronomy-restaurant",
  "home-voyage-3n-aswan-luxor",
  "home-voyage-4n-luxor-aswan",
  "home-voyage-7n-roundtrip",
  "home-voyage-nile-majesty",
  "home-call-to-action",
  ...GALLERY_PREVIEW_ANCHORS,
]);

type HomePageClientProps = {
  heroLogoTune?: HeroLogoTune;
  heroLogoTuneMobile?: HeroLogoTune;
  accordionCruises?: HomepageAccordionCruise[];
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
  tag.textContent = combineDesktopAndPhoneCss(
    heroLogoTuneToImportantCss(desktop),
    heroLogoTuneToImportantCss(phone),
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

  const [liveTune, setLiveTune] = useState(heroLogoTune);
  const [liveTuneMobile, setLiveTuneMobile] = useState(heroLogoTuneMobile);

  useEffect(() => {
    setLiveTune(heroLogoTune);
  }, [heroLogoTune]);

  useEffect(() => {
    setLiveTuneMobile(heroLogoTuneMobile);
  }, [heroLogoTuneMobile]);

  useLayoutEffect(() => {
    paintLogoTune(liveTune, liveTuneMobile);
  }, [liveTune, liveTuneMobile]);

  /* Both rows share one height: taller title+body+button stack. Image matches that. */
  useLayoutEffect(() => {
    const section = document.getElementById("escape");
    if (!section) return;

    const mq = window.matchMedia("(max-width: 1024px)");
    const rows = Array.from(
      section.querySelectorAll<HTMLElement>(".text-img-row"),
    );

    const clearHeights = () => {
      rows.forEach((row) => {
        const parent = row.querySelector<HTMLElement>(".home-text-img-parent");
        const copy = row.querySelector<HTMLElement>(".home-text-img-copy");
        if (parent) parent.style.height = "";
        if (copy) copy.style.height = "";
      });
    };

    const sync = () => {
      clearHeights();
      if (mq.matches || rows.length === 0) return;

      const maxCopy = Math.max(
        ...rows.map((row) => {
          const copy = row.querySelector<HTMLElement>(".home-text-img-copy");
          return copy ? Math.ceil(copy.getBoundingClientRect().height) : 0;
        }),
      );
      if (maxCopy <= 0) return;

      const px = `${maxCopy}px`;
      rows.forEach((row) => {
        const parent = row.querySelector<HTMLElement>(".home-text-img-parent");
        const copy = row.querySelector<HTMLElement>(".home-text-img-copy");
        if (parent) parent.style.height = px;
        if (copy) copy.style.height = px;
      });
    };

    const ro = new ResizeObserver(() => {
      sync();
    });
    rows.forEach((row) => {
      row
        .querySelectorAll(".home-text-h2, .home-text-p, .home-text-button")
        .forEach((el) => ro.observe(el));
    });
    window.addEventListener("resize", sync);
    mq.addEventListener("change", sync);
    sync();

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      mq.removeEventListener("change", sync);
      clearHeights();
    };
  }, []);

  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const logoPartsVariant = isPhone
    ? liveTuneMobile.partsVariant
    : liveTune.partsVariant;

  return (
    <div className="ex-root" data-hathor-logo-tuned="">
      <HathorLogoTuner />
      <main id="top">
        <PublicSiteHero
          animate={false}
          splitLetterLogo
          playVideo
          lineRight={EX_HERO.lineRight}
          lineLeft={EX_HERO.lineLeft}
          heroPage="home"
          posterImageName={EX_HERO.imageName}
          logoPartsVariant={logoPartsVariant}
        />

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
                <div className="radius-decor" aria-hidden="true">
                  {EX_ABOUT.decor.map((item) => (
                    <ManagedImage
                      key={item.name}
                      name={item.name}
                      alt={item.alt}
                      width={42}
                      height={42}
                      sizes="42px"
                      unoptimized={false}
                      previewAnchor={HOMEPAGE_PREVIEW_SLOTS.has(item.name)}
                    />
                  ))}
                </div>
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

        <section
          className="ex-stack-scroll ex-content-section"
          id="details"
          data-site-image-pin-root
          aria-label="Every landmark, a pleasure"
        >
          <div className="ex-stack-scroll__viewport">
            <div className="ex-stack-scroll__cards" aria-hidden="true">
              {stackSlides.map((slide, index) => (
                <div key={slide.imageName} className="ex-stack-scroll__card">
                  <div
                    className="ex-stack-scroll__card-media"
                    id={
                      HOMEPAGE_PREVIEW_SLOTS.has(slide.imageName)
                        ? `site-image-${slide.imageName}`
                        : undefined
                    }
                    data-site-image={
                      HOMEPAGE_PREVIEW_SLOTS.has(slide.imageName)
                        ? slide.imageName
                        : undefined
                    }
                    data-site-image-pin-index={String(index)}
                    data-site-image-pin-total={String(stackSlides.length)}
                  >
                    <ManagedImage
                      name={slide.imageName}
                      alt={slide.alt}
                      fill
                      sizes="100vw"
                      unoptimized={false}
                      className="object-cover object-center"
                      previewAnchor={false}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="ex-stack-scroll__copy typo-on-images">
              {stackSlides.map((slide, index) => (
                <div
                  key={`copy-${slide.imageName}`}
                  className="ex-stack-scroll__copy-panel"
                  data-stack-copy-index={String(index)}
                  aria-hidden={index === 0 ? "false" : "true"}
                >
                  <h2
                    className="ex-stack-scroll__title typo-on-images-title"
                    style={stackTitleStyle}
                  >
                    {slide.titleLines.map((line) => (
                      <span
                        key={`${slide.imageName}-${line}`}
                        className="ex-stack-scroll__title-line typo-on-images-title"
                        style={stackTitleStyle}
                      >
                        {line}
                      </span>
                    ))}
                  </h2>
                  <p
                    className="ex-stack-scroll__eyebrow typo-on-images-indication"
                    style={stackEyebrowStyle}
                  >
                    {slide.indication}
                  </p>
                  <p
                    className="ex-stack-scroll__body typo-on-images-body"
                    style={stackBodyStyle}
                  >
                    {slide.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <LuxuryAccordion
          items={accordionCruises.map((cruise) => ({
            id: cruise.id,
            name: cruise.name,
            description: cruise.description,
            imageName: cruise.imageName,
            romanNumeral: cruise.romanNumeral,
            meta: cruise.meta,
            href: cruise.href,
            ctaLabel: "Check Voyages",
          }))}
        />

        <section
          className="home-ship-passage ex-content-section"
          aria-label="Hathor sailing across the Nile"
        >
          <div className="home-ship-passage__stage">
            <div className="home-ship-passage__vessel" data-home-moving-ship>
              <Image
                src={movingShip}
                alt="Hathor Dahabiya sailing"
                className="home-ship-passage__image"
                sizes="(max-width: 767px) 94vw, 72vw"
                priority={false}
              />
            </div>
          </div>
        </section>

        <section className="text-img-section ex-content-section" id="escape">
          {EX_TEXT_BLOCKS.map((block, index) => {
            const cms = websiteText.home.textBlocks[index];
            const title = cms?.title ?? block.title;
            const body = cms?.body ?? block.body;
            const cta = cms?.cta ?? block.cta;
            return (
            <div
              key={block.href}
              className={`text-img-row${index % 2 === 1 ? " is-reverse" : ""}`}
            >
              <div className="home-text-img-parent">
                <Link
                  href={block.href}
                  className="home-text-img-container media-hover"
                  aria-label={cta}
                >
                  <ManagedImage
                    name={block.imageName}
                    alt={block.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized={false}
                    className="object-cover"
                    previewAnchor={HOMEPAGE_PREVIEW_SLOTS.has(block.imageName)}
                  />
                </Link>
              </div>
              <div className="home-text-img-copy">
                <div className="home-text-h2">
                  <h2>
                    {title.split("\n").map((line, lineIndex, lines) => (
                      <span key={`${title}-${lineIndex}`}>
                        {line}
                        {lineIndex < lines.length - 1 ? <br /> : null}
                      </span>
                    ))}
                  </h2>
                </div>
                <div className="home-text-p">
                  <p>{body}</p>
                </div>
                <Link className="btn btn-dark home-text-button" href={block.href}>
                  {cta}
                </Link>
              </div>
            </div>
            );
          })}
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
      </main>
    </div>
  );
}
