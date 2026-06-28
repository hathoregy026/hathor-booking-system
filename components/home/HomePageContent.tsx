"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { HeroScrollIndicator } from "@/components/layout/Header";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { TestimonialsCarousel } from "@/components/public/TestimonialsCarousel";
import {
  HOMEPAGE_ABOUT,
  HOMEPAGE_ACCOMMODATIONS,
  HOMEPAGE_DINING,
  HOMEPAGE_HERO,
  HOMEPAGE_HIGHLIGHTS,
  HOMEPAGE_ITINERARIES,
  HOMEPAGE_LIFESTYLE,
  HOMEPAGE_REVIEWS,
  HOMEPAGE_WELLNESS,
  HOMEPAGE_WELCOME,
} from "@/lib/homepage-content";
import { UNSPLASH_IMAGES } from "@/lib/unsplash-images";

const ITINERARY_IMAGES = [
  UNSPLASH_IMAGES.itineraryAswanLuxor,
  UNSPLASH_IMAGES.itineraryLuxorAswan,
  UNSPLASH_IMAGES.itineraryRoundTrip,
];

const ACCOMMODATION_IMAGES = [
  UNSPLASH_IMAGES.luxuryRoom,
  UNSPLASH_IMAGES.luxurySuite,
  UNSPLASH_IMAGES.royalSuite,
  UNSPLASH_IMAGES.charter,
];

const STATS = [
  { value: "8", label: "Luxury Cabins" },
  { value: "2", label: "Suites" },
  { value: "2", label: "Royal Suites" },
  { value: "12", label: "Guest Capacity" },
] as const;

function DiscoverLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="hathor-discover-link cursor-hover">
      <span>{children}</span>
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

function EditorialSection({
  eyebrow,
  title,
  subtitle,
  body,
  href,
  hrefLabel = "Learn more",
  imageSrc,
  imageAlt,
  imageLeft = false,
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body: string;
  href?: string;
  hrefLabel?: string;
  imageSrc: string;
  imageAlt: string;
  imageLeft?: boolean;
  dark?: boolean;
}) {
  return (
    <section
      className={`hathor-editorial ${dark ? "hathor-editorial--dark" : ""}`}
    >
      <div className="hathor-container">
        <div
          className={`hathor-editorial__grid ${imageLeft ? "hathor-editorial__grid--reverse" : ""}`}
        >
          <ScrollReveal direction={imageLeft ? "right" : "left"}>
            <div className="hathor-editorial__image-wrap">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="hathor-editorial__image object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal direction={imageLeft ? "left" : "right"} delay={120}>
            <div className="hathor-editorial__content">
              {eyebrow && (
                <p className="hathor-section-eyebrow">{eyebrow}</p>
              )}
              <h2 className="hathor-section-title">{title}</h2>
              {subtitle && (
                <p className="hathor-section-subtitle">{subtitle}</p>
              )}
              <div className="hathor-gold-line hathor-gold-line--left" />
              <p className="hathor-body-text">{body}</p>
              {href && <DiscoverLink href={href}>{hrefLabel}</DiscoverLink>}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

export function HomePageContent() {
  return (
    <>
      <section className="lux-hero">
        <Image
          src={UNSPLASH_IMAGES.heroHomepage}
          alt={UNSPLASH_IMAGES.heroHomepageAlt}
          fill
          priority
          className="lux-hero__bg-image object-cover"
          sizes="100vw"
        />
        <div className="lux-hero__overlay" />
        <div className="lux-hero__content">
          <p className="lux-hero__eyebrow">{HOMEPAGE_HERO.eyebrow}</p>
          <h1 className="lux-hero__title">{HOMEPAGE_HERO.title}</h1>
          <p className="lux-hero__subtitle">{HOMEPAGE_HERO.subtitle}</p>
          <div className="lux-hero__actions">
            <BookNowTrigger className="public-btn-gold cursor-hover">
              {HOMEPAGE_HERO.cta}
            </BookNowTrigger>
            <Link href="#discover" className="public-btn-outline-gold cursor-hover">
              Discover
            </Link>
          </div>
        </div>
        <HeroScrollIndicator />
      </section>

      <section id="discover" className="hathor-section hathor-section--surface">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="hathor-section-header">
              <p className="hathor-section-eyebrow">{HOMEPAGE_ITINERARIES.title}</p>
              <h2 className="hathor-section-title">{HOMEPAGE_ITINERARIES.subtitle}</h2>
              <div className="hathor-gold-line" />
              <p className="hathor-body-text mx-auto mt-6 max-w-2xl text-center">
                {HOMEPAGE_ITINERARIES.intro}
              </p>
            </div>
          </ScrollReveal>

          <div className="hathor-itinerary-grid">
            {HOMEPAGE_ITINERARIES.cards.map((card, index) => (
              <ScrollReveal key={card.title} delay={index * 100}>
                <article className="hathor-itinerary-card cursor-hover">
                  <div className="hathor-itinerary-card__image">
                    <Image
                      src={ITINERARY_IMAGES[index]}
                      alt={`${card.title} Nile cruise itinerary`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="hathor-itinerary-card__body">
                    <h3 className="hathor-itinerary-card__title">{card.title}</h3>
                    <p className="hathor-itinerary-card__duration">{card.duration}</p>
                    <p className="hathor-itinerary-card__schedule">{card.schedule}</p>
                    <DiscoverLink href={card.href}>Learn more</DiscoverLink>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="hathor-section hathor-section--dark">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="hathor-section-header">
              <h2 className="hathor-section-title text-[var(--hathor-cream)]">
                {HOMEPAGE_ACCOMMODATIONS.title}
              </h2>
              <div className="hathor-gold-line" />
              <p className="hathor-body-text mx-auto mt-6 max-w-3xl text-center text-[var(--hathor-text-light)]">
                {HOMEPAGE_ACCOMMODATIONS.intro}
              </p>
            </div>
          </ScrollReveal>

          <div className="hathor-accommodation-grid">
            {HOMEPAGE_ACCOMMODATIONS.cards.map((card, index) => (
              <ScrollReveal key={card.title} delay={index * 80}>
                <Link href={card.href} className="hathor-accommodation-card cursor-hover group">
                  <div className="hathor-accommodation-card__image">
                    <Image
                      src={ACCOMMODATION_IMAGES[index]}
                      alt={card.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </div>
                  <div className="hathor-accommodation-card__body">
                    <h3 className="hathor-accommodation-card__title">{card.title}</h3>
                    <p className="hathor-accommodation-card__text">{card.description}</p>
                    {"cta" in card && card.cta ? (
                      <span className="hathor-discover-link mt-4 inline-flex">
                        {card.cta}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </span>
                    ) : null}
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="hathor-stats-band">
        <div className="hathor-container">
          <div className="hathor-stats-grid">
            {STATS.map((stat, index) => (
              <ScrollReveal key={stat.label} delay={index * 80}>
                <div className="hathor-stat">
                  <p className="hathor-stat__value">{stat.value}</p>
                  <p className="hathor-stat__label">{stat.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <EditorialSection
        title={HOMEPAGE_LIFESTYLE.title}
        body={HOMEPAGE_LIFESTYLE.body}
        href={HOMEPAGE_LIFESTYLE.href}
        imageSrc={UNSPLASH_IMAGES.lifestyle}
        imageAlt="Travelers enjoying life aboard a luxury Dahabiya on the Nile"
      />

      <EditorialSection
        title={HOMEPAGE_HIGHLIGHTS.title}
        subtitle={HOMEPAGE_HIGHLIGHTS.subtitle}
        body={HOMEPAGE_HIGHLIGHTS.body}
        href={HOMEPAGE_HIGHLIGHTS.href}
        imageSrc={UNSPLASH_IMAGES.highlights}
        imageAlt="Ancient Egyptian Temple of Hatshepsut at Luxor"
        imageLeft
        dark
      />

      <section className="hathor-section hathor-section--cream">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="hathor-section-eyebrow">{HOMEPAGE_WELCOME.eyebrow}</p>
              <h2 className="hathor-section-title">{HOMEPAGE_WELCOME.title}</h2>
              <div className="hathor-gold-line" />
              <p className="hathor-body-text mt-6">{HOMEPAGE_WELCOME.body}</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <EditorialSection
        title={HOMEPAGE_DINING.title}
        body={HOMEPAGE_DINING.body}
        href={HOMEPAGE_DINING.href}
        hrefLabel={HOMEPAGE_DINING.tag}
        imageSrc={UNSPLASH_IMAGES.dining}
        imageAlt="Elegant fine dining restaurant aboard Hathor Dahabiya"
      />

      <EditorialSection
        title={HOMEPAGE_WELLNESS.title}
        subtitle={HOMEPAGE_WELLNESS.subtitle}
        body={HOMEPAGE_WELLNESS.body}
        href={HOMEPAGE_WELLNESS.href}
        imageSrc={UNSPLASH_IMAGES.wellness}
        imageAlt="Tranquil spa wellness experience on the Nile"
        imageLeft
        dark
      />

      <EditorialSection
        title={HOMEPAGE_ABOUT.title}
        subtitle={HOMEPAGE_ABOUT.subtitle}
        body={HOMEPAGE_ABOUT.body}
        href={HOMEPAGE_ABOUT.href}
        imageSrc={UNSPLASH_IMAGES.about}
        imageAlt="Panoramic Nile view from Hathor Dahabiya deck"
      />

      <section className="hathor-section hathor-section--surface">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="hathor-section-header">
              <h2 className="hathor-section-title">{HOMEPAGE_REVIEWS.title}</h2>
              <div className="hathor-gold-line" />
              <p className="hathor-body-text mx-auto mt-6 max-w-2xl text-center">
                {HOMEPAGE_REVIEWS.body}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <TestimonialsCarousel backgroundImage={UNSPLASH_IMAGES.testimonials} />

      <section className="lux-cta-band">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="lux-cta-band__decor" aria-hidden />
            <h2 className="lux-cta-band__title">
              Ready to Embark on Your Journey?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-light text-[var(--lux-text-grey)]">
              Reserve your place aboard Hathor Dahabiya and discover the Nile
              as it was meant to be experienced.
            </p>
            <BookNowTrigger className="public-btn-gold mt-8 inline-flex cursor-hover">
              Book Now
            </BookNowTrigger>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
