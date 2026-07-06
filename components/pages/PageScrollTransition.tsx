"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import {
  refreshPageScrollTransition,
  usePageScrollTransition,
} from "@/components/pages/pageScrollTransitionEngine";

const PIN_VH = 2.8;

export type PageScrollTransitionProps = {
  title: string;
  subtitle?: string;
  breadcrumb: string;
  parentBreadcrumb?: { label: string; href: string };
  imageName: string;
  imageAlt?: string;
  variant?: "default" | "blog";
  children: ReactNode;
};

export function PageScrollTransition({
  title,
  subtitle,
  breadcrumb,
  parentBreadcrumb,
  imageName,
  imageAlt,
  variant = "default",
  children,
}: PageScrollTransitionProps) {
  const image = useSiteImage(imageName);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const creamFloorRef = useRef<HTMLDivElement>(null);

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

    const alignCreamFloor = () => {
      const cream = creamFloorRef.current;
      const landing = sheetRef.current?.querySelector<HTMLElement>(".pt-sheet__landing");
      if (!cream || !landing) return;

      const gap = cream.getBoundingClientRect().top - landing.getBoundingClientRect().bottom;
      if (gap > 2) {
        const current = parseFloat(cream.style.marginTop) || 0;
        cream.style.marginTop = `${current - gap}px`;
      }
    };

    const resetCreamFloor = () => {
      const cream = creamFloorRef.current;
      if (!cream) return;
      cream.style.marginTop = "";
      cream.classList.remove("hathor-page-cream-floor--aligned");
      root.classList.remove("hathor-page-scroll--cream-aligned");
    };

    const syncMediaVisibility = () => {
      const vh = window.innerHeight;
      const top = root.getBoundingClientRect().top + window.scrollY;
      const scroll = window.scrollY;
      const sheet = sheetRef.current;
      const cream = creamFloorRef.current;
      const sheetTop = sheet?.getBoundingClientRect().top ?? vh;
      const pinProgress = Math.max(0, (scroll - top) / (vh * PIN_VH));

      const inHeroZone = pinProgress < 0.12;
      const hideMedia =
        !inHeroZone && (pinProgress > 0.48 || sheetTop <= vh * 0.35);
      const pastPin = pinProgress >= 0.92;
      const readyForContent = pinProgress >= 0.88;

      root.classList.toggle("hathor-page-scroll--media-gone", hideMedia);
      root.classList.toggle("hathor-page-scroll--past-pin", pastPin);

      // Close title → content gap once dome has landed (before pin fully ends).
      if (readyForContent && cream) {
        alignCreamFloor();
        cream.classList.add("hathor-page-cream-floor--aligned");
        root.classList.add("hathor-page-scroll--cream-aligned");
      } else if (pinProgress < 0.82) {
        resetCreamFloor();
      }
    };

    syncMediaVisibility();
    window.addEventListener("scroll", syncMediaVisibility, { passive: true });
    const onResize = () => {
      resetCreamFloor();
      syncMediaVisibility();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", syncMediaVisibility);
      window.removeEventListener("resize", onResize);
      resetCreamFloor();
    };
  }, []);

  return (
    <>
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
                <h1 className="hathor-page-hero__title">{title}</h1>
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
                <h2 id="page-landing-title" className="pt-sheet__landing-title">
                  {title}
                </h2>
              </div>
            </div>
            <div className="pt-sheet__rise-cap" aria-hidden="true" />
          </div>
        </div>
      </section>
      <div ref={creamFloorRef} className="hathor-page-cream-floor">
        {children}
      </div>
    </>
  );
}
