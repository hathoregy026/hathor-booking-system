"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type ChapterHeaderProps = {
  chapter?: string;
  title: string;
  subtitle?: string;
  intro?: string;
  discoverHref?: string;
  discoverLabel?: string;
  centered?: boolean;
  children?: ReactNode;
};

export function ChapterHeader({
  chapter,
  title,
  subtitle,
  intro,
  discoverHref,
  discoverLabel = "Discover",
  centered = true,
  children,
}: ChapterHeaderProps) {
  return (
    <ScrollReveal>
      <div
        className={`hathor-chapter-header ${centered ? "hathor-chapter-header--center" : ""}`}
      >
        <h2 className="hathor-chapter-title">{title}</h2>
        {chapter ? <p className="hathor-chapter-eyebrow">{chapter}</p> : null}
        {subtitle ? <p className="hathor-chapter-subtitle">{subtitle}</p> : null}
        <div className={`hathor-gold-line ${centered ? "" : "hathor-gold-line--left"}`} />
        {intro ? <p className="hathor-chapter-intro">{intro}</p> : null}
        {children}
        {discoverHref ? (
          <Link href={discoverHref} className="hathor-discover-link cursor-hover">
            <span>{discoverLabel}</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </ScrollReveal>
  );
}
