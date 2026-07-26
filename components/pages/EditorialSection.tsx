"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { siteImageAnchorId } from "@/lib/site-image-preview";

export function DiscoverLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="btn btn-primary">
      {children}
    </Link>
  );
}

type EditorialSectionProps = {
  chapter?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body: string | string[];
  href?: string;
  hrefLabel?: string;
  imageName: string;
  imageAlt?: string;
  imageLeft?: boolean;
  dark?: boolean;
  fullBleed?: boolean;
  motionDelay?: number;
  motionViewportAmount?: number;
  motionViewportMargin?: string;
};

export function EditorialSection({
  chapter,
  eyebrow,
  title,
  subtitle,
  body,
  href,
  hrefLabel = "Discover",
  imageName,
  imageAlt,
  imageLeft = false,
  dark = true,
  fullBleed = false,
  motionDelay = 0,
  motionViewportAmount,
  motionViewportMargin,
}: EditorialSectionProps) {
  const paragraphs = Array.isArray(body) ? body : [body];
  const label = chapter ?? eyebrow;

  return (
    <section
      id={siteImageAnchorId(imageName)}
      data-site-image={imageName}
      className={`hathor-editorial ${dark ? "hathor-editorial--dark" : ""} ${fullBleed ? "hathor-editorial--bleed" : ""}`}
    >
      <div className={fullBleed ? "" : "page-container"}>
        <div
          className={`hathor-editorial__grid ${imageLeft ? "hathor-editorial__grid--reverse" : ""}`}
        >
          <ScrollReveal
            viewportAmount={motionViewportAmount}
            viewportMargin={motionViewportMargin}
          >
            <div className="hathor-editorial__image-wrap">
              <ManagedImage
                name={imageName}
                alt={imageAlt}
                fill
                previewAnchor={false}
                className="hathor-editorial__image object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal
            delay={motionDelay}
            viewportAmount={motionViewportAmount}
            viewportMargin={motionViewportMargin}
          >
            <div
              className={`hathor-editorial__content ${fullBleed ? "page-container py-16 lg:py-24" : ""}`}
            >
              {label ? (
                <p className="section-indication typo-page-subtitle">{label}</p>
              ) : null}
              <h2 className="section-title typo-page-title">{title}</h2>
              {subtitle ? (
                <p className="section-indication typo-page-subtitle">{subtitle}</p>
              ) : null}
              {paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="section-body typo-body-text"
                >
                  {paragraph}
                </p>
              ))}
              {href ? <DiscoverLink href={href}>{hrefLabel}</DiscoverLink> : null}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
