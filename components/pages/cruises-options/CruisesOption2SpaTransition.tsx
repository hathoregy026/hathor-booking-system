"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useCruisesOption2SpaTransition } from "@/hooks/useCruisesOption2SpaTransition";

export type CruisesOption2SpaTransitionProps = {
  title: string;
  heroTitle?: string;
  breadcrumb: string;
  imageName: string;
  imageAlt?: string;
  sheetBelowLanding?: ReactNode;
  children: ReactNode;
};

/** Option 2 — spa one-elevator: sticky stage, all content inside rising sheet. */
export function CruisesOption2SpaTransition({
  title,
  heroTitle,
  breadcrumb,
  imageName,
  imageAlt,
  sheetBelowLanding,
  children,
}: CruisesOption2SpaTransitionProps) {
  const image = useSiteImage(imageName);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);

  useCruisesOption2SpaTransition({
    root: rootRef,
    stage: stageRef,
    mask: maskRef,
    sheet: sheetRef,
    heroCopy: heroCopyRef,
  });

  return (
    <section
      ref={rootRef}
      data-page-transition
      data-cruises-option-2
      className="cruises-option-2-spa hathor-page-scroll-transition hathor-page-hero"
    >
      <div ref={stageRef} className="pt-stage">
        <div className="pt-hero">
          <div className="pt-hero__media">
            <img
              src={image.src}
              alt={imageAlt ?? image.alt}
              fetchPriority="high"
              decoding="async"
            />
            <div className="pt-hero__overlay" aria-hidden />
          </div>
          <div ref={maskRef} className="pt-mask" aria-hidden="true" />
          <div ref={heroCopyRef} className="pt-hero__copy">
            <div className="hathor-container hathor-page-hero__content">
              <nav className="hathor-breadcrumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span aria-hidden>/</span>
                <span aria-current="page">{breadcrumb}</span>
              </nav>
              <h1 className="hathor-page-hero__title hathor-page-hero__title--feature">
                {heroTitle ?? title}
              </h1>
              <div className="hathor-gold-line" />
            </div>
          </div>
        </div>
        <div ref={sheetRef} className="pt-sheet cruises-option-2-sheet">
          <div className="pt-sheet__landing" aria-labelledby="cruises-option-2-landing-title">
            <div className="hathor-container">
              <h2 id="cruises-option-2-landing-title" className="pt-sheet__landing-title">
                {title}
              </h2>
            </div>
          </div>
          {sheetBelowLanding ? (
            <div className="pt-sheet__filters">{sheetBelowLanding}</div>
          ) : null}
          <div className="pt-sheet__rise-cap" aria-hidden="true" />
          <div className="pt-sheet__content">{children}</div>
        </div>
      </div>
    </section>
  );
}
