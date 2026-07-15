"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCruisesGiantLogo } from "@/hooks/useCruisesGiantLogo";
import {
  refreshCruisesHeroStripes,
  useCruisesHeroStripes,
} from "@/hooks/useCruisesHeroStripes";
import { useSiteImage } from "@/components/public/SiteImagesProvider";

const GIANT_LOGO_SRC = "/branding/gold.svg";

type CruisesHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  breadcrumb: string;
  imageName: string;
  imageAlt?: string;
};

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
  const giantLogoRef = useRef<HTMLDivElement>(null);

  useCruisesHeroStripes({
    runway: runwayRef,
    stage: stageRef,
    mask: maskRef,
    headline: headlineRef,
  });

  useCruisesGiantLogo(runwayRef, giantLogoRef);

  useEffect(() => {
    document.documentElement.classList.add("cruises-scroll-ready");
    return () => {
      document.documentElement.classList.remove("cruises-scroll-ready");
    };
  }, []);

  return (
    <section ref={runwayRef} className="cruises-hero" data-cruises-hero>
      <div ref={stageRef} className="cruises-hero__stage">
        <div className="cruises-hero__media">
          <Image
            src={image.src}
            alt={imageAlt ?? image.alt}
            fill
            priority
            sizes="100vw"
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
            <p className="cruises-hero__eyebrow">{eyebrow}</p>
            <h1 className="cruises-hero__title">{title}</h1>
            {subtitle ? (
              <p className="cruises-hero__subtitle">{subtitle}</p>
            ) : null}
          </div>
        </div>

        <div ref={giantLogoRef} className="cruises-hero__giant-logo">
          <Image
            src={GIANT_LOGO_SRC}
            alt="Hathor"
            width={1600}
            height={560}
            sizes="100vw"
          />
        </div>
      </div>
    </section>
  );
}
