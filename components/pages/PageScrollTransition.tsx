"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import {
  destroyTransitionForPages,
  initTransitionForPages,
  refreshTransitionForPages,
} from "@/lib/transition-for-pages";

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

const PT_CREAM = "#ECE8DF";
const PT_GOLD = "#C9A96E";

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

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    document.body.classList.add("has-page-scroll-transition");
    document.documentElement.classList.add("has-page-scroll-transition");
    document.body.style.backgroundColor = PT_CREAM;

    let cancelled = false;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const boot = () => {
      if (cancelled) return;

      initTransitionForPages({
        root,
        colors: { gold: PT_GOLD, cream: PT_CREAM },
        nav: "___pt-nav-none___",
      });

      refreshTimer = setTimeout(() => {
        if (!cancelled) refreshTransitionForPages();
      }, 120);
    };

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(boot);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      if (refreshTimer) clearTimeout(refreshTimer);
      destroyTransitionForPages();
      document.body.classList.remove("has-page-scroll-transition");
      document.documentElement.classList.remove("has-page-scroll-transition");
      document.body.style.backgroundColor = "";
    };
  }, [imageName, title]);

  return (
    <>
      <section
        ref={rootRef}
        data-page-transition
        className={`hathor-page-scroll-transition hathor-page-hero${
          variant === "blog" ? " hathor-page-hero--blog" : ""
        }`}
      >
        <div className="pt-stage">
          <div className="pt-hero">
            <div className="pt-hero__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={imageAlt ?? image.alt}
                fetchPriority="high"
                decoding="async"
                onLoad={() => refreshTransitionForPages()}
              />
              <div className="pt-hero__overlay" aria-hidden />
            </div>
            <div className="pt-mask" aria-hidden="true" />
            <div className="pt-hero__copy">
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
          <div className="pt-sheet" aria-hidden="true">
            <div className="pt-sheet__rise-cap" />
          </div>
        </div>
      </section>
      <div className="hathor-page-body">{children}</div>
    </>
  );
}
