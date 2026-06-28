"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type FullBleedSplitProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  discoverHref: string;
  discoverLabel: string;
  imageLeft?: boolean;
  variant?: "dark" | "dark-2";
};

export function FullBleedSplit({
  eyebrow,
  title,
  subtitle,
  body,
  imageSrc,
  imageAlt,
  discoverHref,
  discoverLabel,
  imageLeft = false,
  variant = "dark-2",
}: FullBleedSplitProps) {
  return (
    <section className={`owo-split owo-split--${variant}`}>
      <div
        className={`owo-split__grid ${imageLeft ? "owo-split__grid--reverse" : ""}`}
      >
        <ScrollReveal direction={imageLeft ? "right" : "left"}>
          <div className="owo-split__image">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="owo-split__image-overlay" aria-hidden />
          </div>
        </ScrollReveal>

        <ScrollReveal direction={imageLeft ? "left" : "right"} delay={120}>
          <div className="owo-split__content">
            <p className="owo-eyebrow">{eyebrow}</p>
            <h2 className="owo-chapter__title">{title}</h2>
            {subtitle ? (
              <p className="owo-chapter__subtitle">{subtitle}</p>
            ) : null}
            <p className="owo-chapter__intro">{body}</p>
            <Link href={discoverHref} className="owo-discover cursor-hover">
              <span>{discoverLabel}</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
