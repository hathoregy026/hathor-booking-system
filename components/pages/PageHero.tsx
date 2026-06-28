"use client";

import Link from "next/link";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { ParallaxHeroImage } from "@/components/ui/ParallaxHeroImage";

type PageHeroProps = {
  title: string;
  subtitle?: string;
  breadcrumb: string;
  imageName: string;
  imageAlt?: string;
};

export function PageHero({
  title,
  subtitle,
  breadcrumb,
  imageName,
  imageAlt,
}: PageHeroProps) {
  const image = useSiteImage(imageName);

  return (
    <section className="hathor-page-hero">
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
          <span>{breadcrumb}</span>
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
