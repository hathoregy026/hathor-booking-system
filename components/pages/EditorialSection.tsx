"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function DiscoverLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="hathor-discover-link cursor-hover">
      <span>{children}</span>
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

type EditorialSectionProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body: string | string[];
  href?: string;
  hrefLabel?: string;
  imageSrc: string;
  imageAlt: string;
  imageLeft?: boolean;
  dark?: boolean;
};

export function EditorialSection({
  eyebrow,
  title,
  subtitle,
  body,
  href,
  hrefLabel = "Learn more",
  imageSrc,
  imageAlt,
  imageLeft = false,
  dark = false,
}: EditorialSectionProps) {
  const paragraphs = Array.isArray(body) ? body : [body];

  return (
    <section
      className={`hathor-editorial ${dark ? "hathor-editorial--dark" : ""}`}
    >
      <div className="hathor-container">
        <div
          className={`hathor-editorial__grid ${imageLeft ? "hathor-editorial__grid--reverse" : ""}`}
        >
          <ScrollReveal direction={imageLeft ? "right" : "left"}>
            <div className="hathor-editorial__image-wrap">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="hathor-editorial__image object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal direction={imageLeft ? "left" : "right"} delay={120}>
            <div className="hathor-editorial__content">
              {eyebrow ? (
                <p className="hathor-section-eyebrow">{eyebrow}</p>
              ) : null}
              <h2 className="hathor-section-title">{title}</h2>
              {subtitle ? (
                <p className="hathor-section-subtitle">{subtitle}</p>
              ) : null}
              <div className="hathor-gold-line hathor-gold-line--left" />
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="hathor-body-text">
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
