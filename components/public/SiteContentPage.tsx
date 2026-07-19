"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTypographyInlineStyle } from "@/components/public/TypographySettingsProvider";

type SiteContentPageProps = {
  title: string;
  subtitle?: string | null;
  breadcrumb?: string;
  darkHero?: boolean;
  children: ReactNode;
};

export function SiteContentPage({
  title,
  subtitle,
  breadcrumb,
  darkHero = false,
  children,
}: SiteContentPageProps) {
  const titleStyle = useTypographyInlineStyle("page_title");
  const subtitleStyle = useTypographyInlineStyle("page_subtitle");

  return (
    <>
      <div
        className={`lux-page-hero ${darkHero ? "lux-page-hero--dark" : ""}`}
      >
        <div className="lux-page-hero__pattern" aria-hidden />
        <div className="lux-container relative">
          <nav className="lux-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>{breadcrumb ?? title}</span>
          </nav>
          {subtitle && (
            <p className="lux-section-eyebrow" style={subtitleStyle}>
              {subtitle}
            </p>
          )}
          <h1 className="lux-page-hero__title mt-2" style={titleStyle}>
            {title}
          </h1>
          <div className="lux-gold-line" />
        </div>
      </div>
      <div className="lux-section lux-section--beige">
        <div className="lux-container">{children}</div>
      </div>
    </>
  );
}
