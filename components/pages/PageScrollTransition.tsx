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
      const sheet = sheetRef.current;
      const sheetTop = sheet?.getBoundingClientRect().top ?? vh;
      const pinProgress = Math.max(0, (scroll - top) / (vh * PIN_VH));

      const inHeroZone = pinProgress < 0.12;
      const hideMedia =
        !inHeroZone && (pinProgress > 0.48 || sheetTop <= vh * 0.35);
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

  useEffect(() => {
    const refresh = () => refreshPageScrollTransition();
    requestAnimationFrame(refresh);
    const t = window.setTimeout(refresh, 150);
    return () => window.clearTimeout(t);
  }, [children]);

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
            <div className="pt-sheet__body hathor-page-cream-floor page-layout">
              {children}
            </div>
            <div className="pt-sheet__rise-cap" aria-hidden="true" />
          </div>
        </div>
      </section>
    </>
  );
}
