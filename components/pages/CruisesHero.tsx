"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { HathorLogoSplit } from "@/components/public/HathorLogoSplit";
import {
  refreshCruisesHeroStripes,
  useCruisesHeroStripes,
} from "@/hooks/useCruisesHeroStripes";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { siteImageAnchorId } from "@/lib/site-image-preview";
import { isRemoteCmsImageUrl } from "@/lib/site-image-url";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";

type CruisesHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  breadcrumb: string;
  imageName: string;
  imageAlt?: string;
};

/** Legacy cruises hero (unused by live /cruises). Giant gold.svg removed. */
export function CruisesHero({
  eyebrow = "Ultra Luxury",
  title,
  subtitle,
  breadcrumb,
  imageName,
  imageAlt,
}: CruisesHeroProps) {
  const image = useSiteImage(imageName);
  const runwayRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);

  useCruisesHeroStripes({
    runway: runwayRef,
    stage: stageRef,
    mask: maskRef,
    headline: headlineRef,
  });

  useEffect(() => {
    document.documentElement.classList.add("cruises-scroll-ready");
    return () => {
      document.documentElement.classList.remove("cruises-scroll-ready");
    };
  }, []);

  return (
    <section
      ref={runwayRef}
      id={siteImageAnchorId(imageName)}
      data-site-image={imageName}
      className="cruises-hero"
      data-cruises-hero
    >
      <div ref={stageRef} className="cruises-hero__stage">
        <div className="cruises-hero__media">
          <Image
            src={image.src}
            alt={imageAlt ?? image.alt}
            fill
            priority
            sizes="100vw"
            quality={SITE_IMAGE_QUALITY}
            unoptimized={isRemoteCmsImageUrl(image.src)}
            className="object-cover"
            style={{ objectPosition: "center 58%" }}
            onLoad={() => refreshCruisesHeroStripes()}
          />
          <div className="cruises-hero__shade" aria-hidden />
        </div>

        <div ref={maskRef} className="cruises-hero__mask" aria-hidden="true" />

        <div ref={headlineRef} className="cruises-hero__headline">
          <div className="hathor-container cruises-hero__headline-inner">
            <nav className="cruises-hero__breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden>/</span>
              <span aria-current="page">{breadcrumb}</span>
            </nav>
            <h1 className="cruises-hero__title">{title}</h1>
            <p className="cruises-hero__eyebrow">{eyebrow}</p>
            {subtitle ? (
              <p className="cruises-hero__subtitle">{subtitle}</p>
            ) : null}
          </div>
        </div>

        <div className="cruises-hero__giant-logo" aria-hidden="true">
          <HathorLogoSplit />
        </div>
      </div>
    </section>
  );
}
