"use client";

import Link from "next/link";
import { HOMEPAGE_PARTNERS } from "@/lib/homepage-content";
import "@/app/partners-company-strip.css";

const DESKTOP_SRC = "/media/hathor/partners/partners-company-desktop.png";
const PHONE_SRC = "/media/hathor/partners/partners-company-phone.png";

type PartnersCompanyStripProps = {
  variant?: "teaser" | "intro";
};

export function PartnersCompanyStrip({
  variant = "teaser",
}: PartnersCompanyStripProps) {
  const Root = variant === "intro" ? "div" : "section";
  const ctaHref = variant === "intro" ? "#circle" : HOMEPAGE_PARTNERS.href;

  return (
    <Root
      className={`partners-company partners-company--${variant}`}
      aria-labelledby="partners-company-title"
    >
      <h2 className="partners-company__title" id="partners-company-title">
        {HOMEPAGE_PARTNERS.headline}
      </h2>

      <picture>
        <source media="(max-width: 480px)" srcSet={PHONE_SRC} />
        <img
          className="partners-company__image"
          src={DESKTOP_SRC}
          alt="Our Partners — In Distinguished Company. Easy Trav Tourism, Booking, Expedia, and X Luxury Hospitality."
          width={1600}
          height={420}
        />
      </picture>

      <div className="partners-company__cta">
        <Link href={ctaHref} className="pn-btn">
          <span>{HOMEPAGE_PARTNERS.hrefLabel}</span>
        </Link>
      </div>
    </Root>
  );
}
