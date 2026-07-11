"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCruisesOption4SpaEngine } from "@/hooks/useCruisesOption4SpaEngine";
import { useSiteImage } from "@/components/public/SiteImagesProvider";

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

type CruisesOption4SpaHeroProps = {
  heroTitle: string;
  breadcrumb: string;
  imageName: string;
};

/**
 * Option 4 — full-bleed hero + Venetian stripe wipe. No rising sheet, no dome.
 */
export function CruisesOption4SpaHero({
  heroTitle,
  breadcrumb,
  imageName,
}: CruisesOption4SpaHeroProps) {
  const image = useSiteImage(imageName);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const creamRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);

  useCruisesOption4SpaEngine({
    root: rootRef,
    stage: stageRef,
    mask: maskRef,
    cream: creamRef,
    heroCopy: heroCopyRef,
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-cruises-option-4-experience", "");
    return () => {
      document.documentElement.removeAttribute("data-cruises-option-4-experience");
    };
  }, []);

  return (
    <section ref={rootRef} data-cruises-option-4 className="co4-runway">
      <div ref={stageRef} className="co4-stage">
        <div className="co4-scene">
          <div className="co4-media">
            <img
              src={image.src}
              alt={image.alt}
              fetchPriority="high"
              decoding="async"
            />
            <div className="co4-media__shade" aria-hidden />
          </div>

          <div ref={creamRef} className="co4-cream" aria-hidden="true" />

          <div ref={maskRef} className="co4-mask" aria-hidden="true" />

          <div ref={heroCopyRef} className="co4-copy">
            <div className="co4-giant-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BACK_LOGO_SRC} alt="Hathor" />
            </div>
            <div className="co4-copy__inner hathor-container">
              <nav className="hathor-breadcrumb co4-breadcrumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span aria-hidden>/</span>
                <span aria-current="page">{breadcrumb}</span>
              </nav>
              <h1 className="co4-title">{heroTitle}</h1>
              <div className="hathor-gold-line co4-gold-line" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
