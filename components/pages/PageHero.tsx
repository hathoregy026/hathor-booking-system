"use client";

import Link from "next/link";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { ParallaxHeroImage } from "@/components/ui/ParallaxHeroImage";

type PageHeroProps = {
  title: string;
  subtitle?: string;
  breadcrumb: string;
  parentBreadcrumb?: { label: string; href: string };
  imageName: string;
  imageAlt?: string;
  /** Larger hero with stronger title contrast — used on blog posts. */
  variant?: "default" | "blog";
};

export function PageHero({
  title,
  subtitle,
  breadcrumb,
  parentBreadcrumb,
  imageName,
  imageAlt,
  variant = "default",
}: PageHeroProps) {
  const image = useSiteImage(imageName);

  return (
    <section
      className={`hathor-page-hero${variant === "blog" ? " hathor-page-hero--blog" : ""}`}
    >
      <ParallaxHeroImage
        src={image.src}
        alt={imageAlt ?? image.alt}
        priority
        className="hathor-page-hero__bg"
      />
      <div className="hathor-page-hero__overlay" aria-hidden />
      <div className="hathor-container hathor-page-hero__content">
        <nav className="hathor-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden>/</span>
          {parentBreadcrumb ? (
            <>
              <Link href={parentBreadcrumb.href}>{parentBreadcrumb.label}</Link>
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
    </section>
  );
}
