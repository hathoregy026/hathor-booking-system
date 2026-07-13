"use client";

import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { HATHOR_BRAND_NAME } from "@/lib/branding";
import {
  EX_ABOUT,
  EX_CAROUSEL,
  EX_CTA,
  EX_GALLERY,
  EX_GOLD_LOGO_SRC,
  EX_HERO,
  EX_PINNED,
  EX_TESTIMONIALS,
  EX_TEXT_BLOCKS,
  EX_WELLNESS,
} from "@/lib/ex-page-content";
import { HOMEPAGE_HERO } from "@/lib/homepage-content";
import { useExScrollMotion } from "@/hooks/useExScrollMotion";

export function ExClient() {
  useExScrollMotion();

  return (
    <div className="ex-root">
      <main id="top">
        <section className="home-hero-container" aria-label="Hero">
          <div className="hero-media">
            <img src={EX_HERO.image} alt={EX_HERO.imageAlt} />
          </div>
          <div className="hero-overlay" aria-hidden="true" />

          <div className="home-hero-cover" aria-hidden="true" />

          <div className="hero-logo-mark" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="hero-logo-img"
              src={EX_GOLD_LOGO_SRC}
              alt={HATHOR_BRAND_NAME}
              width={1600}
              height={560}
            />
          </div>

          <div className="hero-content">
            <h1 className="hero-heading">
              <span className="hero-line hero-line--right">{EX_HERO.lineRight}</span>
              <span className="hero-line hero-line--left">{EX_HERO.lineLeft}</span>
            </h1>
          </div>

          <div className="hero-button">
            <BookNowTrigger className="btn btn-light hero-cta">
              <span className="hero-cta-text">{HOMEPAGE_HERO.cta}</span>
            </BookNowTrigger>
          </div>

          <div className="hero-side hero-side--left" aria-hidden="true">
            <span>{EX_HERO.sideLeft}</span>
          </div>
          <div className="hero-side hero-side--right" aria-hidden="true">
            <span>{EX_HERO.sideRight}</span>
          </div>

          <div className="hero-scroll-hint" aria-hidden="true">
            Scroll
          </div>
        </section>

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
                      <img
                        src={EX_ABOUT.image}
                        alt={EX_ABOUT.imageAlt}
                        width={900}
                        height={1200}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="radius-decor" aria-hidden="true">
                  {EX_ABOUT.decor.map((src) => (
                    <img key={src} src={src} alt="" />
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
                      <img src={slide.image} alt={slide.alt} />
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
          className="home-scroll-container ex-content-section"
          id="details"
          aria-label="Every landmark, a pleasure"
        >
          <div className="home-scroll-bg" aria-hidden="true">
            <img className="large-bg-icon" src={EX_PINNED.bgIcon} alt="" />
          </div>

          <div className="home-scroll-images" aria-hidden="true">
            {EX_PINNED.images.map((src) => (
              <div key={src} className="move-up-img">
                <img src={src} alt="" />
              </div>
            ))}
          </div>

          <div className="home-scroll-content">
            <div>
              <div className="home-scroll-h2">
                <h2>
                  Every landmark,
                  <br />
                  a pleasure.
                </h2>
              </div>
              <div className="home-scroll-p">
                <p>{EX_PINNED.body}</p>
              </div>
            </div>
            <div />
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
                  <img src={block.image} alt={block.alt} />
                </div>
              </div>
              <div>
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
            {EX_GALLERY.images.map((item) => (
              <div key={item.src} className="gallery-item">
                <img src={item.src} alt={item.alt} />
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
