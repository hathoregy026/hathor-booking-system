"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { CruisesPageListings } from "@/components/pages/CruisesPageListings";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import {
  refreshCruisesScrollReveal,
  useCruisesScrollReveal,
} from "@/hooks/useCruisesScrollReveal";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { CRUISES_PAGE } from "@/lib/page-content";

export type CruisesScrollRevealProps = {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  imageName?: string;
  imageAlt?: string;
  children: ReactNode;
};

export function CruisesScrollReveal({
  title,
  subtitle = CRUISES_PAGE.hero.subtitle,
  breadcrumb = "Cruises",
  imageName = "cruises-hero",
  imageAlt,
  children,
}: CruisesScrollRevealProps) {
  const image = useSiteImage(imageName);
  const trackRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLDivElement>(null);
  const secondTitleRef = useRef<HTMLDivElement>(null);
  const creamSheetRef = useRef<HTMLDivElement>(null);
  const heroMediaRef = useRef<HTMLDivElement>(null);

  useCruisesScrollReveal({
    track: trackRef,
    heroTitle: heroTitleRef,
    secondTitle: secondTitleRef,
    creamSheet: creamSheetRef,
    heroMedia: heroMediaRef,
  });

  return (
    <div data-cruises-scroll-reveal className="cruises-scroll-reveal">
      <div ref={trackRef} className="reveal-track">
        <div className="sticky-viewport">
          <div ref={heroMediaRef} className="reveal-layer reveal-layer--media">
            <img
              src={image.src}
              alt={imageAlt ?? image.alt}
              fetchPriority="high"
              decoding="async"
              onLoad={() => refreshCruisesScrollReveal()}
            />
            <div className="reveal-layer__overlay" aria-hidden />
          </div>

          <div
            ref={creamSheetRef}
            className="reveal-layer reveal-layer--cream-sheet"
            aria-hidden
          />

          <div ref={heroTitleRef} className="reveal-layer reveal-layer--hero-title">
            <div className="hathor-container reveal-layer__copy">
              <nav className="hathor-breadcrumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span aria-hidden>/</span>
                <span aria-current="page">{breadcrumb}</span>
              </nav>
              <h1 className="hathor-page-hero__title">{title}</h1>
              {subtitle ? (
                <p className="hathor-page-hero__subtitle">{subtitle}</p>
              ) : null}
              <div className="hathor-gold-line" />
            </div>
          </div>

          <div
            ref={secondTitleRef}
            className="reveal-layer reveal-layer--second-title"
            aria-labelledby="cruises-landing-title"
          >
            <div className="hathor-container reveal-layer__copy">
              <h2 id="cruises-landing-title" className="reveal-second-title">
                {title}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="hathor-page-body hathor-page-cream-floor cruises-page-cream">
        <div className="page-layout__main">
          <CruisesPageListings cruises={HATHOR_CRUISES} />
          {children}
        </div>
      </div>
    </div>
  );
}
