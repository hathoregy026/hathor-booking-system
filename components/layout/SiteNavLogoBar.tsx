"use client";

import Link from "next/link";
import {
  HATHOR_BRAND_NAME,
  HATHOR_HERO_ICON_DARK_SRC,
  HATHOR_HERO_ICON_SRC,
} from "@/lib/branding";

/** Centered ring logo tier — part of unified PublicNavbar (no BOOK NOW pills). */
export function SiteNavLogoBar() {
  return (
    <div className="site-nav-bar" aria-label="Site logo">
      <Link href="/" className="site-nav-bar__logo" aria-label={HATHOR_BRAND_NAME}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HATHOR_HERO_ICON_SRC}
          alt=""
          className="site-nav-bar__logo-img site-nav-bar__logo-img--light"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HATHOR_HERO_ICON_DARK_SRC}
          alt=""
          className="site-nav-bar__logo-img site-nav-bar__logo-img--dark"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}
