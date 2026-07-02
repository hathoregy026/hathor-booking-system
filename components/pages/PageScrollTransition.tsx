"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import {
  refreshPageScrollTransition,
  usePageScrollTransition,
} from "@/hooks/usePageScrollTransition";

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
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
          <div ref={sheetRef} className="pt-sheet" aria-hidden="true">
            <div className="pt-sheet__rise-cap" />
          </div>
        </div>
      </section>
      <div className="hathor-page-body">{children}</div>
    </>
  );
}
