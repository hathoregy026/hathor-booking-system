"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import {
  refreshPageScrollTransition,
  usePageScrollTransition,
} from "@/components/pages/pageScrollTransitionEngine";

const PIN_VH = 4.2;

export type PageScrollTransitionProps = {
  title: string;
  heroTitle?: string;
  subtitle?: string;
  breadcrumb: string;
  parentBreadcrumb?: { label: string; href: string };
  imageName: string;
  imageAlt?: string;
  variant?: "default" | "blog";
  /** Renders inside .pt-sheet below the landing title (e.g. cruises filters). */
  sheetBelowLanding?: ReactNode;
  children: ReactNode;
};

export function PageScrollTransition({
  title,
  heroTitle,
  subtitle,
  breadcrumb,
  parentBreadcrumb,
  imageName,
  imageAlt,
  variant = "default",
  sheetBelowLanding,
  children,
}: PageScrollTransitionProps) {
  const image = useSiteImage(imageName);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);

  usePageScrollTransition({
    root: rootRef,
    stage: stageRef,
    mask: maskRef,
    sheet: sheetRef,
    heroCopy: heroCopyRef,
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const syncMediaVisibility = () => {
      const vh = window.innerHeight;
      const top = root.getBoundingClientRect().top + window.scrollY;
      const scroll = window.scrollY;
      const pinProgress = Math.max(0, (scroll - top) / (vh * PIN_VH));

      const inHeroZone = pinProgress < 0.12;
      const hideMedia = !inHeroZone && pinProgress > 0.82;
      const pastPin = pinProgress >= 0.92;

      root.classList.toggle("hathor-page-scroll--media-gone", hideMedia);
      root.classList.toggle("hathor-page-scroll--past-pin", pastPin);
    };

    syncMediaVisibility();
    window.addEventListener("scroll", syncMediaVisibility, { passive: true });
    window.addEventListener("resize", syncMediaVisibility);

    return () => {
      window.removeEventListener("scroll", syncMediaVisibility);
      window.removeEventListener("resize", syncMediaVisibility);
    };
  }, []);

  return (
    <>
      <svg
        aria-hidden="true"
        focusable="false"
        width="0"
        height="0"
        className="hathor-text-filter-defs"
      >
        <filter
          id="hathor-title-inner-shadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feOffset in="SourceAlpha" dx="10" dy="0" result="offsetAlpha" />
          <feGaussianBlur in="offsetAlpha" stdDeviation="4" result="blurredOffset" />
          <feComposite
            in="blurredOffset"
            in2="SourceAlpha"
            operator="in"
            result="innerShadowAlpha"
          />
          <feFlood floodColor="#000000" floodOpacity="0.38" result="shadowColor" />
          <feComposite
            in="shadowColor"
            in2="innerShadowAlpha"
            operator="in"
            result="innerShadow"
          />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="innerShadow" />
          </feMerge>
        </filter>
      </svg>
      <section
        ref={rootRef}
        data-page-transition
        className={`hathor-page-scroll-transition hathor-page-hero${
          variant === "blog" ? " hathor-page-hero--blog" : ""
        }`}
      >
        <div ref={stageRef} className="pt-stage">
          <div className="pt-hero">
            <div className="pt-hero__media">
              <img
                src={image.src}
                alt={imageAlt ?? image.alt}
                fetchPriority="high"
                decoding="async"
                onLoad={() => refreshPageScrollTransition()}
              />
              <div className="pt-hero__overlay" aria-hidden />
            </div>
            <div ref={maskRef} className="pt-mask" aria-hidden="true" />
            <div ref={heroCopyRef} className="pt-hero__copy">
              <div className="hathor-container hathor-page-hero__content">
                <nav className="hathor-breadcrumb" aria-label="Breadcrumb">
                  <Link href="/">Home</Link>
                  <span aria-hidden>/</span>
                  {parentBreadcrumb ? (
                    <>
                      <Link href={parentBreadcrumb.href}>
                        {parentBreadcrumb.label}
                      </Link>
                      <span aria-hidden>/</span>
                    </>
                  ) : null}
                  <span aria-current="page">{breadcrumb}</span>
                </nav>
                <h1
                  className={`hathor-page-hero__title${
                    heroTitle ? " hathor-page-hero__title--feature" : ""
                  }`}
                >
                  {heroTitle ?? title}
                </h1>
                {subtitle ? (
                  <p className="hathor-page-hero__subtitle">{subtitle}</p>
                ) : null}
                <div className="hathor-gold-line" />
              </div>
            </div>
          </div>
          <div ref={sheetRef} className="pt-sheet">
            <div className="pt-sheet__landing" aria-labelledby="page-landing-title">
              <div className="hathor-container">
                <h2
                  id="page-landing-title"
                  className="pt-sheet__landing-title"
                >
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
    </>
  );
}
