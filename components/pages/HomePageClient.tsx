"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { HathorLogoTuner } from "@/components/public/HathorLogoTuner";
import { PublicSiteHero } from "@/components/pages/PublicSiteHero";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { HATHOR_BRAND_NAME, HATHOR_DAHABIYA_WORDMARK_SRC } from "@/lib/branding";
import {
  EX_ABOUT,
  EX_CAROUSEL,
  EX_CTA,
  EX_GALLERY,
  EX_HERO,
  EX_PINNED,
  EX_TESTIMONIALS,
  EX_TEXT_BLOCKS,
  EX_WELLNESS,
} from "@/lib/ex-page-content";
import { useExScrollMotion } from "@/hooks/useExScrollMotion";
import {
  DEFAULT_HERO_LOGO_TUNE,
  type HeroLogoTune,
  heroLogoTuneToCssVars,
} from "@/lib/hero-logo-tune";
import { siteImageAnchorId } from "@/lib/site-image-preview";

const GALLERY_PREVIEW_ANCHORS = new Set([
  "home-collage-living",
  "home-alt-highlights",
  "home-cinematic-still",
  "wellness-hero",
  "gastronomy-restaurant",
]);

type HomePageClientProps = {
  heroLogoTune?: HeroLogoTune;
};

export function HomePageClient({
  heroLogoTune = DEFAULT_HERO_LOGO_TUNE,
}: HomePageClientProps) {
  useExScrollMotion();

  const logoTuneStyle = heroLogoTuneToCssVars(heroLogoTune) as CSSProperties;

  return (
    <div className="ex-root" style={logoTuneStyle}>
      <HathorLogoTuner />
      <main id="top">
        <PublicSiteHero
          animate={false}
          splitLetterLogo
          lineRight={EX_HERO.lineRight}
          lineLeft={EX_HERO.lineLeft}
          lineLeftImageSrc={HATHOR_DAHABIYA_WORDMARK_SRC}
          posterImageName={EX_HERO.imageName}
        />

        <section className="about-section ex-content-section" id="about">
          <div className="section-inner">
            <div className="about-layout">
              <div>
                <div className="radius-sub-heading">
                  <h3>{EX_ABOUT.eyebrow}</h3>
                </div>
                <div className="radius-img-container">
                  <div className="radius-img-container-inner">
                    <div className="general-reveal-img">
                      <ManagedImage
                        name={EX_ABOUT.imageName}
                        alt={EX_ABOUT.imageAlt}
                        width={900}
                        height={1200}
                        sizes="(max-width: 768px) 100vw, 42vw"
                        className="h-auto w-full object-cover"
                      />
                    </div>
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
                      previewAnchor={
                        item.name === "home-collage-small" ||
                        item.name === "home-collage-large"
                      }
                    />
                  ))}
                </div>
                <div className="radius-heading">
                  <h2>
                    Elegance is
                    <br />
                    a way of life.
                  </h2>
                </div>
                <div className="radius-p">
                  <p>{EX_ABOUT.body}</p>
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
              <h3>{EX_CAROUSEL.subtitle}</h3>
            </div>
          </div>

          <div className="home-carousel">
            <div className="carousel-track">
              {EX_CAROUSEL.slides.map((slide) => (
                <article key={slide.title} className="carousel-slide">
                  <div className="carousel-container-parent">
                    <div className="carousel-container">
                      <ManagedImage
                        name={slide.imageName}
                        alt={slide.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                        previewAnchor={false}
                      />
                      <div className="carousel-heading">
                        <h2>{slide.title}</h2>
                      </div>
                    </div>
                  </div>
                </article>
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
              {EX_PINNED.slides.map((slide, index) => (
                <div key={slide.imageName} className="ex-stack-scroll__card">
                  <div
                    className="ex-stack-scroll__card-media"
                    id={
                      slide.imageName === "home-split-courtyard" ||
                      slide.imageName === "home-story-legacy-large"
                        ? `site-image-${slide.imageName}`
                        : undefined
                    }
                    data-site-image={
                      slide.imageName === "home-split-courtyard" ||
                      slide.imageName === "home-story-legacy-large"
                        ? slide.imageName
                        : undefined
                    }
                    data-site-image-pin-index={String(index)}
                    data-site-image-pin-total={String(EX_PINNED.slides.length)}
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

            <div className="ex-stack-scroll__copy">
              <p className="ex-stack-scroll__eyebrow">Nile · Hathor</p>
              <h2 className="ex-stack-scroll__title">
                <span className="ex-stack-scroll__title-line">Every landmark,</span>
                <span className="ex-stack-scroll__title-line">a pleasure.</span>
              </h2>
              <p className="ex-stack-scroll__body">{EX_PINNED.body}</p>
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
                <div className="home-text-img-container">
                  <ManagedImage
                    name={block.imageName}
                    alt={block.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    previewAnchor={block.imageName === "gastronomy-restaurant"}
                  />
                </div>
              </div>
              <div className="home-text-img-copy">
                <div className="home-text-h2">
                  <h2>{block.title}</h2>
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
            </div>
          </div>

          <div className="gallery-grid">
            {EX_GALLERY.images.map((item, index) => (
              <div
                key={`${item.imageName}-${index}`}
                className="gallery-item"
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
              >
                <ManagedImage
                  name={item.imageName}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover"
                  previewAnchor={false}
                />
              </div>
            ))}
          </div>

          <div className="gallery-container">
            <div className="gallery-sm">
              <h2>{EX_GALLERY.ctaTitle}</h2>
            </div>
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
      </main>

      <footer className="site-footer ex-site-footer">
        <div className="footer-inner">
          <div className="footer-brand">{HATHOR_BRAND_NAME}</div>
          <div className="footer-note">
            {EX_WELLNESS.tag} · Ultra Luxury Dahabiya Nile Cruise
          </div>
        </div>
      </footer>
    </div>
  );
}
