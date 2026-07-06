"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import {
  refreshCruisesScrollReveal,
  useCruisesScrollReveal,
} from "@/hooks/useCruisesScrollReveal";

export type CruisesScrollRevealProps = {
  title: string;
  subtitle?: string;
  breadcrumb: string;
  imageName: string;
  imageAlt?: string;
  /** Landing title + filters — stacked in the same grid cell as the hero. */
  revealContent: ReactNode;
  children: ReactNode;
};

export function CruisesScrollReveal({
  title,
  subtitle,
  breadcrumb,
  imageName,
  imageAlt,
  revealContent,
  children,
}: CruisesScrollRevealProps) {
  const image = useSiteImage(imageName);
  const triggerRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useCruisesScrollReveal({
    trigger: triggerRef,
    wrapper: wrapperRef,
    hero: heroRef,
    content: contentRef,
  });

  return (
    <section ref={triggerRef} data-cruises-scroll-reveal className="cruises-scroll-reveal">
      <div ref={wrapperRef} className="reveal-wrapper">
        <div className="reveal-stack">
          <div ref={heroRef} className="reveal-hero">
            <div className="reveal-hero__media">
              <img
                src={image.src}
                alt={imageAlt ?? image.alt}
                fetchPriority="high"
                decoding="async"
                onLoad={() => refreshCruisesScrollReveal()}
              />
              <div className="reveal-hero__overlay" aria-hidden />
            </div>
            <div className="reveal-hero__copy">
              <div className="hathor-container hathor-page-hero__content">
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
          </div>

          <div ref={contentRef} className="reveal-content">
            {revealContent}
          </div>
        </div>
      </div>

      <div className="cruises-scroll-reveal__floor">{children}</div>
    </section>
  );
}
