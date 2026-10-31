"use client";

import Image from "next/image";
import Link from "next/link";
import {
  HATHOR_BRAND_NAME,
  HATHOR_HERO_ICON_DARK_SRC,
  HATHOR_HERO_ICON_SRC,
} from "@/lib/branding";
import { usePublicRoute } from "@/hooks/usePublicLocale";
import { CHROME_COPY } from "@/lib/i18n/chrome-copy";
import { localizedHref } from "@/lib/i18n/locale";

/** Centered ring logo tier — part of unified PublicNavbar (no BOOK NOW pills). */
export function SiteNavLogoBar() {
  const { locale } = usePublicRoute();
  return (
    <div className="site-nav-bar" aria-label={CHROME_COPY[locale].header.siteLogo}>
      <Link
        href={localizedHref("/", locale)}
        prefetch={false}
        className="site-nav-bar__logo"
        aria-label={HATHOR_BRAND_NAME}
      >
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
