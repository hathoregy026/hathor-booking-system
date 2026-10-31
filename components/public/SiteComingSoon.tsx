"use client";

import { usePathname } from "next/navigation";
import { HATHOR_ICON_GOLD_SRC } from "@/lib/branding";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import { freshMediaSrc } from "@/lib/fresh-media-src";
import { COMING_SOON_COPY } from "@/lib/i18n/system-pages-copy";
import { splitLocalePath } from "@/lib/i18n/locale";
import { DEFAULT_LIVE_SITE_BG_SRC } from "@/lib/live-site-settings-shared";

type SiteComingSoonProps = {
  backgroundImageUrl?: string;
};

/**
 * Full-viewport Coming Soon gate — navbar always visible; no page content.
 */
export function SiteComingSoon({
  backgroundImageUrl = DEFAULT_LIVE_SITE_BG_SRC,
}: SiteComingSoonProps) {
  const locale = splitLocalePath(usePathname()).locale;
  return (
    /* Every caller is outside the theme provider, which the navbar needs. */
    <PublicThemeProvider>
    <div className="public-site hathor-site site-coming-soon-shell">
      <PublicNavbar />
      <div className="site-coming-soon" role="status" aria-live="polite">
      <div
        className="site-coming-soon__bg"
        style={{ backgroundImage: `url(${freshMediaSrc(backgroundImageUrl)})` }}
        aria-hidden
      />
      <div className="site-coming-soon__content">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="site-coming-soon__logo"
          src={HATHOR_ICON_GOLD_SRC}
          alt="Hathor"
          width={220}
          height={220}
          decoding="async"
        />
        <p className="site-coming-soon__label" lang={locale}>{COMING_SOON_COPY[locale]}</p>
      </div>
    </div>
    </div>
    </PublicThemeProvider>
  );
}
