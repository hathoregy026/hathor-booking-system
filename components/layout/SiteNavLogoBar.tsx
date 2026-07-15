"use client";

import Image from "next/image";
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
        <Image
          src={HATHOR_HERO_ICON_SRC}
          alt=""
          width={46}
          height={46}
          sizes="46px"
          className="site-nav-bar__logo-img site-nav-bar__logo-img--light"
        />
        <Image
          src={HATHOR_HERO_ICON_DARK_SRC}
          alt=""
          width={46}
          height={46}
          sizes="46px"
          className="site-nav-bar__logo-img site-nav-bar__logo-img--dark"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}
