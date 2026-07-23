"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import type { CSSProperties } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { HathorLogoTuner } from "@/components/public/HathorLogoTuner";
import { SocialBrandIcon } from "@/components/public/SocialBrandIcon";
import { PublicSiteHero } from "@/components/pages/PublicSiteHero";
import { GoldDustParticles } from "@/components/ui/GoldDustParticles";
import { ManagedImage } from "@/components/ui/ManagedImage";
import {
  EX_ABOUT,
  EX_CAROUSEL,
  EX_CTA,
  EX_GALLERY,
  EX_HERO,
  EX_PINNED,
  EX_TESTIMONIALS,
  EX_TEXT_BLOCKS,
  type ExCarouselSlide,
} from "@/lib/ex-page-content";
import { useExScrollMotion } from "@/hooks/useExScrollMotion";
import {
  useTypographyInlineStyle,
  useTypographySettings,
} from "@/components/public/TypographySettingsProvider";
import {
  DEFAULT_HERO_LOGO_TUNE,
  type HeroLogoTune,
  applyHeroLogoTuneToElement,
  heroLogoTuneToCssVars,
  heroLogoTuneToImportantCss,
  parseHeroLogoTune,
} from "@/lib/hero-logo-tune-shared";
import { siteImageAnchorId } from "@/lib/site-image-preview";
import { useBookingStore } from "@/store/bookingStore";

const GALLERY_PREVIEW_ANCHORS = new Set([
  "home-collage-living",
  "home-alt-highlights",
  "home-cinematic-still",
  "wellness-hero",
  "gastronomy-restaurant",
]);

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
  ...GALLERY_PREVIEW_ANCHORS,
]);

type HomePageClientProps = {
  heroLogoTune?: HeroLogoTune;
};

function paintLogoTune(tune: HeroLogoTune) {
  const root = document.querySelector<HTMLElement>(".ex-root");
  const hero = document.querySelector<HTMLElement>(
    ".ex-root .home-hero-container",
  );
  applyHeroLogoTuneToElement(root, tune);
  applyHeroLogoTuneToElement(hero, tune);

  let tag = document.querySelector<HTMLStyleElement>(
    "style[data-hathor-logo-tune-live]",
  );
  if (!tag) {
    tag = document.createElement("style");
    tag.setAttribute("data-hathor-logo-tune-live", "");
    document.head.appendChild(tag);
  }
  tag.textContent = heroLogoTuneToImportantCss(tune);
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
}: HomePageClientProps) {
  useExScrollMotion();

  const typography = useTypographySettings();
  const stackEyebrowStyle = useTypographyInlineStyle("on_images_indication");
  const stackTitleStyle = useTypographyInlineStyle("on_images_title");
  const stackBodyStyle = useTypographyInlineStyle("on_images_body");
  const itinerariesIndicationStyle = useTypographyInlineStyle("page_subtitle");
  const galleryIndicationStyle = useTypographyInlineStyle("page_subtitle");
  const aboutTitleStyle = useTypographyInlineStyle("page_title");
  const aboutIndicationStyle = useTypographyInlineStyle("page_subtitle");
  const aboutBodyStyle = useTypographyInlineStyle("body_text");

  const onImagesTitleLines = (
    typography.on_images_copy.title.trim() || EX_PINNED.title
  )
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const stackSlides = EX_PINNED.slides.map((slide, index) => {
    const useCms = index === 0;
    const titleRaw = useCms
      ? typography.on_images_copy.title.trim() || slide.title
      : slide.title;
    const titleLines = titleRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    return {
      ...slide,
      titleLines:
        titleLines.length > 0
          ? titleLines
          : index === 0
            ? onImagesTitleLines
            : [slide.title],
      indication: useCms
        ? typography.on_images_copy.indication.trim() || slide.indication
        : slide.indication,
      body: useCms
        ? typography.on_images_copy.body.trim() || slide.body
        : slide.body,
    };
  });

  const [liveTune, setLiveTune] = useState(heroLogoTune);

  useEffect(() => {
    setLiveTune(heroLogoTune);
  }, [heroLogoTune]);

  useLayoutEffect(() => {
    paintLogoTune(liveTune);
  }, [liveTune]);

  /* Lock both text+image frames to the taller title+body+button stack. */
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
        if (copy) {
          copy.style.height = "";
          copy.style.minHeight = "";
        }
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

      rows.forEach((row) => {
        const parent = row.querySelector<HTMLElement>(".home-text-img-parent");
        const copy = row.querySelector<HTMLElement>(".home-text-img-copy");
        const px = `${maxCopy}px`;
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

  /* Re-fetch so a stale HTML shell still picks up the latest Save. */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const bust = Date.now();
        const res = await fetch(`/api/hero-logo-tune?t=${bust}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) return;
        const contentType = res.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) return;
        const data = (await res.json()) as { tune?: unknown };
        if (cancelled) return;
        setLiveTune(parseHeroLogoTune(data.tune));
      } catch {
        /* keep SSR tune — Cloudflare challenges / offline */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const logoTuneStyle = heroLogoTuneToCssVars(liveTune) as CSSProperties;

  return (
    <div className="ex-root" style={logoTuneStyle} data-hathor-logo-tuned="">
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
          logoPartsVariant={liveTune.partsVariant}
        />

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
                      previewAnchor={HOMEPAGE_PREVIEW_SLOTS.has(item.name)}
                    />
                  ))}
                </div>
                <div className="radius-heading">
                  <h2 className="typo-page-title" style={aboutTitleStyle}>
                    Elegance is
                    <br />
                    a way of life.
                  </h2>
                </div>
                <div className="radius-sub-heading radius-indication">
                  <h3
                    className="typo-page-subtitle"
                    style={aboutIndicationStyle}
                  >
                    {EX_ABOUT.eyebrow}
                  </h3>
                </div>
                <div className="radius-p">
                  <p className="typo-body-text" style={aboutBodyStyle}>
                    {EX_ABOUT.body}
                  </p>
                </div>
                <Link className="btn btn-dark radius-button" href="/about">
                  Discover More
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="services-section ex-content-section" id="services">
          <div className="services-intro">
            <div className="home-carousel-h2">
              <h2>{EX_CAROUSEL.title}</h2>
            </div>
            <div className="home-carousel-h3">
              <h3 className="typo-page-subtitle" style={itinerariesIndicationStyle}>
                {EX_CAROUSEL.subtitle}
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
              Explore Our Itineraries
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
                  <h2 className="ex-stack-scroll__title" style={stackTitleStyle}>
                    {slide.titleLines.map((line) => (
                      <span
                        key={`${slide.imageName}-${line}`}
                        className="ex-stack-scroll__title-line"
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

        <section className="text-img-section ex-content-section" id="escape">
          {EX_TEXT_BLOCKS.map((block, index) => (
            <div
              key={block.title}
              className={`text-img-row${index % 2 === 1 ? " is-reverse" : ""}`}
            >
              <div className="home-text-img-parent">
                <Link
                  href={block.href}
                  className="home-text-img-container media-hover"
                  aria-label={block.cta}
                >
                  <ManagedImage
                    name={block.imageName}
                    alt={block.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    previewAnchor={HOMEPAGE_PREVIEW_SLOTS.has(block.imageName)}
                  />
                </Link>
              </div>
              <div className="home-text-img-copy">
                <div className="home-text-h2">
                  <h2>
                    {block.title.split("\n").map((line, lineIndex, lines) => (
                      <span key={`${block.title}-${lineIndex}`}>
                        {line}
                        {lineIndex < lines.length - 1 ? <br /> : null}
                      </span>
                    ))}
                  </h2>
                </div>
                <div className="home-text-p">
                  <p>{block.body}</p>
                </div>
                <Link className="btn btn-dark home-text-button" href={block.href}>
                  {block.cta}
                </Link>
              </div>
            </div>
          ))}
        </section>

        <section className="gallery-section ex-content-section" id="gallery">
          <div className="gallery-header">
            <div className="gallery-h2">
              <h2>{EX_GALLERY.title}</h2>
              <a
                className="gallery-ig-link typo-page-subtitle"
                href={EX_GALLERY.indicationHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: galleryIndicationStyle.fontFamily,
                  fontSize: galleryIndicationStyle.fontSize,
                  lineHeight: galleryIndicationStyle.lineHeight,
                  letterSpacing: galleryIndicationStyle.letterSpacing,
                  textShadow: galleryIndicationStyle.textShadow,
                }}
                aria-label="Hathor Cruise on Instagram"
              >
                <SocialBrandIcon
                  platform="instagram"
                  className="gallery-ig-link__icon"
                />
                <span className="gallery-ig-link__handle">
                  {EX_GALLERY.indication}
                </span>
              </a>
            </div>
          </div>

          <div className="gallery-grid">
            {EX_GALLERY.images.map((item, index) => (
              <Link
                key={`${item.imageName}-${index}`}
                href={item.href}
                className="gallery-item media-hover"
                id={
                  GALLERY_PREVIEW_ANCHORS.has(item.imageName)
                    ? siteImageAnchorId(item.imageName)
                    : undefined
                }
                data-site-image={
                  GALLERY_PREVIEW_ANCHORS.has(item.imageName)
                    ? item.imageName
                    : undefined
                }
                aria-label={item.alt}
              >
                <ManagedImage
                  name={item.imageName}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover"
                  previewAnchor={false}
                />
              </Link>
            ))}
          </div>

          <div className="gallery-container">
            <BookNowTrigger className="btn btn-dark gallery-button">
              Book Your Cruise
            </BookNowTrigger>
          </div>
        </section>

        <section className="testimonials-section ex-content-section" id="reviews">
          <div className="testimonials-header">
            <div className="testimonial-h2">
              <h2>{EX_TESTIMONIALS.title}</h2>
            </div>
          </div>

          <div className="testimonials-grid">
            {EX_TESTIMONIALS.cards.map((card) => (
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

        <section className="cta-section ex-content-section" id="visit">
          <div className="cta-inner">
            <h2>{EX_CTA.title}</h2>
            <p>{EX_CTA.body}</p>
            <BookNowTrigger className="btn btn-filled">Book Your Experience</BookNowTrigger>
          </div>
        </section>
        </div>
      </main>
    </div>
  );
}
