"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import {
  refreshCruisesHeroStripes,
  useCruisesScrollTransition,
} from "@/hooks/useCruisesScrollTransition";
import { useCruisesGiantLogo } from "@/hooks/useCruisesGiantLogo";
import { useSiteImage } from "@/components/public/SiteImagesProvider";

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

export type CruisesScrollRevealProps = {
  heroTitle: string;
  title: string;
  subtitle?: string;
  breadcrumb: string;
  imageName: string;
  imageAlt?: string;
  sheetBelowLanding?: ReactNode;
  children: ReactNode;
};

/**
 * Standard hero + Venetian stripes. Giant logo centered in hero, rises from behind content.
 */
export function CruisesScrollReveal({
  heroTitle,
  title,
  subtitle,
  breadcrumb,
  imageName,
  imageAlt,
  sheetBelowLanding,
  children,
}: CruisesScrollRevealProps) {
  const image = useSiteImage(imageName);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const giantLogoRef = useRef<HTMLDivElement>(null);

  useCruisesScrollTransition({
    root: rootRef,
    stage: stageRef,
    mask: maskRef,
    heroCopy: heroCopyRef,
  });

  useCruisesGiantLogo(rootRef, giantLogoRef);

  useEffect(() => {
    document.documentElement.classList.add("cruises-scroll-ready");
    return () => {
      document.documentElement.classList.remove("cruises-scroll-ready");
    };
  }, []);

  return (
    <div className="cruises-page">
      <section ref={rootRef} data-cruises-hero className="cruises-hero-runway">
        <div ref={stageRef} className="cruises-hero-stage">
          <div className="cruises-hero-media">
            <img
              src={image.src}
              alt={imageAlt ?? image.alt}
              fetchPriority="high"
              decoding="async"
              onLoad={() => refreshCruisesHeroStripes()}
            />
            <div className="cruises-hero-media__shade" aria-hidden />
          </div>

          <div ref={giantLogoRef} className="cruises-giant-logo giant-logo-container">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BACK_LOGO_SRC} alt="Hathor" />
          </div>

          <div ref={maskRef} className="cruises-hero-mask" aria-hidden="true" />

          <div ref={heroCopyRef} className="cruises-hero-copy">
            <div className="hathor-container cruises-hero-copy__inner">
              <nav className="hathor-breadcrumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span aria-hidden>/</span>
                <span aria-current="page">{breadcrumb}</span>
              </nav>
              <h1 className="cruises-hero-title">{heroTitle}</h1>
              {subtitle ? (
                <p className="cruises-hero-subtitle">{subtitle}</p>
              ) : null}
              <div className="hathor-gold-line cruises-hero-gold-line" />
            </div>
          </div>
        </div>
      </section>

      <section
        className="cruises-page-body"
        aria-label="Cruise listings"
        aria-labelledby="cruises-landing-title"
      >
        <div className="cruises-page-intro hathor-container">
          <h2 id="cruises-landing-title" className="cruises-page-intro__title">
            {title}
          </h2>
        </div>

        {sheetBelowLanding ? (
          <div className="cruises-page-filters">{sheetBelowLanding}</div>
        ) : null}

        <div className="cruises-page-content">{children}</div>
      </section>
    </div>
  );
}
